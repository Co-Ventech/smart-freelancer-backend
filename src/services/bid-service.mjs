import db from "../../config/firebase-config.mjs"
import { v4 } from 'uuid'
import { scoreJob } from "../freelancer/freelancer_kpi_scorer.mjs";
import { generateAIProposal } from "../openai/proposalGenerator.mjs";
import { checkExistingBidAPI, placeBid } from "./freelancer-service.mjs";
import { calculateBidAmount } from "../utils/calculate-bid-amount.mjs";
import { AUTOBID_PROPOSAL_TYPE } from "../constants/auto-bid-proposal-type.mjs";
import { AUTOBID_FOR_JOB_TYPE } from "../constants/auto-bid-for-job-type.mjs";
import { createNotificationService } from "./notification-service.mjs";
import { start } from "repl";
import { updateGeneralProposal } from "../utils/modify-general-proposal.mjs";
import dayjs from "dayjs";

const bidCollection = db.collection('bids');
const subUserCollection = db.collection('sub-user');

const alreadyBiddedCache = [];

const TIMEOUT_FOR_BIDDING = 10000;

async function delayedBid(delay, token, bidAmount, bidderId, proposal, project, bidderName) {
    await new Promise(r => setTimeout(r, delay));
    return placeBid({
        bidderAccessToken: token,
        bidAmount,
        bidderId,
        proposal,
        projectTitle: project.title,
        projectId: project.id,
        bidderName,
    });
}


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

        if (date_from) {
            let t = null;

            switch (date_from) {
                case "24 hours":
                    t = dayjs().subtract(24, "hour").valueOf();
                    break;
                case "3 days":
                    t = dayjs().subtract(3, "day").valueOf();
                    break;
                case "7 days":
                    t = dayjs().subtract(7, "day").valueOf();
                    break;
                case "14 days":
                    t = dayjs().subtract(14, "day").valueOf();
                    break;
            }

            if (t) snapshot = snapshot.where("date", ">=", t);
        }

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



export const autoBidService = async ({ clients, skills, sub_user_doc_id, projectsToBid, bidderId, token, bidderName, general_proposal, autobid_proposal_type, autobid_type, ai_templates,projectBudgetConfig = {} }) => {

    for (const project of projectsToBid) {

        const isAlreadyCached = alreadyBiddedCache.some(
            (val) => val.project_id === project.id && val.sub_user_doc_id === sub_user_doc_id
        );

        if (
            (autobid_type === AUTOBID_FOR_JOB_TYPE.ALL || project.type === autobid_type) &&
            !isAlreadyCached
        ) {
            try {
                 console.log('saveBidService: saving bid', { project_id: project.id, bidder_id: bidderId });
                const bidAmount = calculateBidAmount(project,projectBudgetConfig);
                if (bidAmount === null) {
                    continue;
                }

                // -------------------------------
                // CHECK FROM FREELANCER API
                // -------------------------------
                const existingBidded = await checkExistingBidAPI(project.id, bidderId, token);
                if (existingBidded === true) {
                    console.log(`Already bidded from Freelancer API. Skipping project ${project.id}`);
                    alreadyBiddedCache.push({ sub_user_doc_id, project_id: project.id });
                    continue;
                }
                const ownerId = project.owner_id || project.owner?.id || project.user_id || null;
                const clientName = clients[String(ownerId)]?.public_name;

                const proposalResponse =
                    autobid_proposal_type === AUTOBID_PROPOSAL_TYPE.AI_GENERATED && ai_templates.length > 0
                        ? await generateAIProposal(clientName, project.title, project.description, bidderName, ai_templates)
                        : null;

                const proposal =
                    !proposalResponse || proposalResponse.status !== 200
                        ? updateGeneralProposal(clientName, skills, project.title, project.description, general_proposal, bidderName)
                        : proposalResponse.data;

                console.log(`Placing bid for project ${project.id} from ${bidderName}`);
                // ------------------------------------
                // BIDDING LOOP (Safe - Max 1 retry)
                // ------------------------------------
                // let retryCount = 0;
                // let hasAlreadyBidded = false;

                // while (!hasAlreadyBidded);
                const bidResponse = await delayedBid(TIMEOUT_FOR_BIDDING, token, bidAmount, bidderId, proposal, project, bidderName);
                console.log(bidResponse.status);

                // SUCCESS → Save + Exit
                if (bidResponse.status === 200) {
                    console.log(`Bid placed successfully for ${project.id}`);

                     console.log('saveBidService: saving bid', { project_id: project.id, bidder_id: bidderId });

                    await saveBidService({
                        bidder_type: "auto",
                        bidder_id: bidderId,
                        description: proposal,
                        projectTitle: project.title,
                        url: project.seo_url,
                        type: project.type,
                        project_id: project.id,
                        projectDescription: project.description,
                        budget: project.budget,
                        amount: bidAmount,
                        period: 5,
                        date: Date.now(),
                    });

                    await createNotificationService({
                        isSuccess: true,
                        subUserId: sub_user_doc_id,
                        projectId: project.id,
                        notificationTitle: `Auto Bid Done from ${bidderName}`,
                        notificationDescription: `Project #${project.id} - ${project.title} has been Auto-Bidded from ${bidderName}`,
                    });

                    alreadyBiddedCache.push({ sub_user_doc_id, project_id: project.id });
                    // hasAlreadyBidded = true;
                    break;
                } else {

                    if (bidResponse.status === 409) {
                        console.log(`Duplicate bid detected (409): ${project.id}`);
                        // hasAlreadyBidded = true;
                        alreadyBiddedCache.push({ sub_user_doc_id, project_id: project.id });
                        // break;
                    }

                    if (bidResponse.status === 403) {
                        console.log(`You must be a verified freelancer: ${project.id}`);
                        // hasAlreadyBidded = true;
                        alreadyBiddedCache.push({ sub_user_doc_id, project_id: project.id });
                        // break;
                    }

                    await createNotificationService({
                        isSuccess: false,
                        subUserId: sub_user_doc_id,
                        projectId: project.id,
                        notificationTitle: `Auto Bid Failed from ${bidderName}`,
                        notificationDescription: `Auto-Bid failed because: ${bidResponse.message}`,
                    });

                }

                // DUPLICATE BID (409) → NO CREDIT USED

                // OTHER ERRORS → Retry only ONCE
                // retryCount++;
                // if (retryCount > 1) {
                // console.log(`Stopping retries for project ${project.id}`);
                // hasAlreadyBidded = true; // Prevent infinite loop
                // break;
                // }
                // }
            } catch (err) {
                console.error(`Error processing project ${project.id}:`, err);
            }
        }
    }
};
