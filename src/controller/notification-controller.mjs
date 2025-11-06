import { getAllNotificationService, markNotificationRead } from "../services/notification-service.mjs";

export const getAllNotificationsController = async(req, res) => {
    const { sub_user_id } = req.query;
    const data = await getAllNotificationService({ subUserId: sub_user_id });
    return res.status(200).send({
        status: 200,
        message: "Notifications fetched successfully",
        data
    });
}

export const markNotificationReadController = (req, res) => {
    const { sub_user_id, is_read } = req.query;
    const data = markNotificationRead({ subUserId: sub_user_id, is_read });
    return res.status(200).send({
        status: 200,
        message: "Notifications marked successfully",
        data
    });
}