import { getSavedBidsService, saveBidService, toggleAutoBidService } from "../services/bid-service.mjs"
import { placeBid } from "../services/freelancer-service.mjs";
import { decrypt } from "../utils/crypto.mjs";

export const saveBidHistoryController = async (req, res) => {
    const result = await saveBidService(req.body);
    res.status(result.status).send({
        status: result.status,
        message: result.message,
        data: result.data
    })
}

export const toggleAutoBidController = async (req, res) => {
    const { user_bidder_id } = req?.query;
    const result = await toggleAutoBidService({ bidder_id: user_bidder_id });
    res.status(result.status).send({ ...result })
}

export const getSavedBidController = async (req, res) => {
    const result = await getSavedBidsService(req?.query);
    res.status(result.status).send({ ...result })
}

export const placeBidController = async (req, res) => {
    // res.json(req?.user)
    const { bid_via, projectId, seo_url, projectType, bidderId, bidAmount, proposal, bidderName, projectTitle, projectDescription, budget } = req?.body;
    const { sub_users } = req?.user;
    const access_token= decrypt(sub_users[`${bid_via}`]);
    const result = await placeBid({
        bidderAccessToken: access_token,
        bidAmount,
        bidderId,
        proposal,
        projectTitle,
        projectId,
        bidderName,
    });
    if (result.status == 200) {

        // Save bid history
        const savedBid = await saveBidService({
            bidder_type: "manual",
            bidder_id: bidderId,
            description: proposal,
            projectTitle,
            url: seo_url,
            type: projectType,
            project_id: projectId,
            projectDescription: projectDescription,
            budget: budget,
            amount: bidAmount,
            period: 5,
            date: Date.now()
        });

        res.status(savedBid?.status).send({...savedBid})

        // await createNotificationService({
        //     isSuccess: true,
        //     subUserId: sub_user_doc_id,
        //     projectId,
        //     notificationTitle: `Auto Bid Done from ${bidderName}`,
        //     notificationDescription: `Project #${projectId} - ${projectTitle} has been Auto-Bidded from ${bidderName}`
        // });
    }

}