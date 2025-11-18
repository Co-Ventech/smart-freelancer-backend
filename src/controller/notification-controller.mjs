import { getAllNotificationService, markNotificationRead } from "../services/notification-service.mjs";

export const getAllNotificationsController = async (req, res) => {
    const { sub_user_id, count  } = req.query;
    const data = await getAllNotificationService({ subUserId: sub_user_id, count });
    return res.status(200).send({
        status: 200,
        message: "Notifications fetched successfully",
        data
    });
}

export const markNotificationReadController = async(req, res) => {
    const { sub_user_id, is_read, notification_id } = req.query;
    const data = await markNotificationRead({ subUserId: sub_user_id, isRead: is_read, notificationId: notification_id });
    return res.status(200).send({
        status: 200,
        message: "Notifications marked successfully",
        data
    });
}