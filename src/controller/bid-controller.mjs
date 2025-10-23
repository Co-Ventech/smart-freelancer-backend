import { getSavedBidsService, saveBidService, toggleAutoBidService } from "../services/bid-service.mjs"

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

export const createAutoBid = async () => {

}

export const getSavedBidController = async (req, res) => {
    const result = await getSavedBidsService(req?.query);
    res.status(result.status).send({ ...result })
}