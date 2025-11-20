import db from "../../config/firebase-config.mjs"
import { v4 } from 'uuid'
import { scoreJob } from "../freelancer/freelancer_kpi_scorer.mjs";
import { generateAIProposal } from "../openai/proposalGenerator.mjs";
import { placeBid } from "./freelancer-service.mjs";
import { calculateBidAmount } from "../utils/calculate-bid-amount.mjs";
import { AUTOBID_PROPOSAL_TYPE } from "../constants/auto-bid-proposal-type.mjs";
import { AUTOBID_FOR_JOB_TYPE } from "../constants/auto-bid-for-job-type.mjs";
import { createNotificationService } from "./notification-service.mjs";
import { start } from "repl";
import { updateGeneralProposal } from "../utils/modify-general-proposal.mjs";

const bidCollection = db.collection('bids');
const subUserCollection = db.collection('sub-user');

const alreadyBiddedCache = [];


export const saveBidService = async (body) => {

    try {
        const scoredJobs = scoreJob(body);
        const generatedUUID = v4();
        await bidCollection.doc(generatedUUID)
            .set({
                scores: scoredJobs.scores,
                ...body,
            });

        const data = (await bidCollection.doc(generatedUUID).get()).data();
        return {
            status: 200,
            message: "Bid Saved Successfully",
            data: data
        }


    } catch (e) {
        console.log(e)
        return {
            status: 500,
            message: e.message
        }
    }
}

export const getSavedBidsService = async (query) => {
    const { page = 1, offset = 10, bid_id, bidder_type, bidder_id, type, date_from } = query;
    try {
        let snapshot = bidCollection;

        if (bid_id) {
            // get one saved bid via bid_id
            const doc = await snapshot.doc(bid_id).get();
            return {
                status: 200,
                message: "Bids fetched successfully",
                data: doc.exists ? doc.data() : null
            };
        }

        if (bidder_type) snapshot = snapshot.where('bidder_type', '==', bidder_type);

        if (bidder_id) {
            const bidderId = isNaN(bidder_id) ? bidder_id : Number(bidder_id);
            snapshot = snapshot.where('bidder_id', '==', bidderId);
        }

        if (type) snapshot = snapshot.where('type', '==', type);

        // if (date_from) {
        //     const now = new Date();
        //     let t = null;
        //     switch (date_from) {
        //         case "24 hours":
        //             t = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        //             break;
        //         case "3 days":
        //             t = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
        //             break;
        //         case "7 days":
        //             t = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        //             break;
        //         case "14 days":
        //             t = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        //             break;
        //         default:
        //             break;
        //     }
        //     snapshot = snapshot.where("date", ">=", t);
        // }

        const totalCount = ((await snapshot.count().get()).data().count)

        // Pagination logic
        const startIndex = (page - 1) * offset;
        snapshot = snapshot.offset(startIndex).limit(parseInt(offset));

        const querySnapshot = await snapshot.get();

        const data = [];
        querySnapshot.forEach((doc) => {
            data.push({ ...doc.data(), document_id: doc.id });
        });

        return {
            status: 200,
            message: "Bids fetched successfully",
            data,
            pagination: {
                page: Number(page),
                limit: Number(offset),
                count: data.length,
                is_next: totalCount - startIndex > offset ? true : false,
                total: totalCount
            }
        };
    } catch (e) {
        console.error(e);
        return {
            status: 500,
            message: e.message
        };
    }
};


export const toggleAutoBidService = async ({ bidder_id }) => {
    const snapshot = await subUserCollection.where("user_bid_id", "==", parseInt(bidder_id)).get();
    if (!snapshot.empty) {
        const updatePromises = snapshot.docs.map((doc) => {
            const current = doc.data().autobid_enabled;
            return doc.ref.update({ autobid_enabled: !current });
        });

        // Wait for all updates
        await Promise.all(updatePromises);

        return {
            status: 200,
            message: "Auto Bid Toggled!!",
            data: snapshot
        }
    }
    return {
        status: 404,
        message: "User Not found!",
    }
}



export const autoBidService = async ({ clients, sub_user_doc_id, projectsToBid, bidderId, token, bidderName, general_proposal, autobid_proposal_type, autobid_type }) => {
    for (const project of projectsToBid) {
        if ((autobid_type === AUTOBID_FOR_JOB_TYPE.ALL || (project.type === autobid_type)) && alreadyBiddedCache?.filter((val) => val.project_id === project?.id && val.sub_user_doc_id === sub_user_doc_id)?.length === 0) {
            try {
                const bidAmount = calculateBidAmount(project);
                // Skip projects that do not meet the criteria
                if (bidAmount === null) {
                    return {
                        status: 200,
                        message: `Skipping project ${project.id} due to bid criteria.`
                    }
                }

                const ownerId = project.owner_id || project.owner?.id || project.user_id || null;
                const clientName = clients[String(ownerId)]?.public_name;

                const proposalResponse = autobid_proposal_type === AUTOBID_PROPOSAL_TYPE.AI_GENERATED ?
                    await generateAIProposal(clientName, project?.title, project?.description, bidderName) : null;
                let proposal = null;

                if (!proposalResponse || proposalResponse?.status !== 200) {
                    proposal = updateGeneralProposal(clientName, general_proposal);
                } else {
                    if (proposalResponse?.status === 200) {
                        proposal = proposalResponse?.data;
                    } else {
                        return {
                            status: proposalResponse?.status,
                            message: proposalResponse?.message
                        }
                    }
                }

                console.log(`Proposal generated for project ${project.id}:`, proposal);
                console.log(`Placing bid for project ${project.id} with amount ${bidAmount}...`);

                let retryCount = 0;

                while (retryCount <= 1) {
                    const bidResponse = await placeBid({
                        bidderAccessToken: token,
                        bidAmount,
                        bidderId,
                        proposal,
                        projectTitle: project?.title,
                        projectId: project?.id,
                        bidderName,
                    });

                    if (bidResponse.status === 200) {
                        console.log(`Bid placed successfully for project ${project.id}`);

                        // Save bid history
                        await saveBidService({
                            bidder_type: "auto",
                            bidder_id: bidderId,
                            description: proposal,
                            projectTitle: project.title,
                            url: project.seo_url,
                            type: project.type,
                            project_id: project.id,
                            projectDescription: project.description,
                            budget: project?.budget,
                            amount: bidAmount,
                            period: 5,
                            date: Date.now()
                        });

                        await createNotificationService({
                            isSuccess: true,
                            subUserId: sub_user_doc_id,
                            projectId: project.id,
                            notificationTitle: `Auto Bid Done from ${bidderName}`,
                            notificationDescription: `Project #${project.id} - ${project.title} has been Auto-Bidded from ${bidderName}`
                        });
                        alreadyBiddedCache.push({
                            sub_user_doc_id,
                            project_id: project?.id
                        });
                        break;
                    } else if (bidResponse?.status === 409) {
                        break;
                    } else {
                        retryCount++;
                        await createNotificationService({
                            isSuccess: false,
                            subUserId: sub_user_doc_id,
                            projectId: project.id,
                            notificationTitle: `Auto Bid Failed from ${bidderName}`,
                            notificationDescription: `Project #${project.id} - ${project.title} has been Auto-Bid Failed due to ${bidResponse?.message}`
                        })
                    }
                }
            } catch (err) {
                console.error(`Error processing project ${project.id}:`, err);
            }
        }
    }
}

