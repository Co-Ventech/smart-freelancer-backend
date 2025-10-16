import { getSavedBidsService, saveBidService } from "../services/bid-service.mjs"

export const saveBidHistoryController = async (req, res) => {
    const result = saveBidService(req.body);
    return res.status(result.status).send({
        status: result.status,
        message: result.message
    })
}

export const getSavedBidController = async (req, res) => {
    const result = await getSavedBidsService(req?.query);
    return res.status(result.status).send({ ...result })
}