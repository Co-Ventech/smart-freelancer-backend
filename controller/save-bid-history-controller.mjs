import { saveBidService } from "../services/save-bid-history-service.mjs"

export const saveBidHistory = async (req, res) => {
    const result = saveBidService(req.body);
    return res.status(result.status).send({
        status: result.status,
        message: result.message
    })
}