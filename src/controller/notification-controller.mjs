import { getAllNotificationService, markNotificationRead,createNotificationService,getNotificationDetailsService } from "../services/notification-service.mjs";

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

export const getNotificationDetailsController = async (req, res) => {
    const { sub_user_id, notification_id, project_id } = req.query;
    const resp = await getNotificationDetailsService({ subUserId: sub_user_id, notificationId: notification_id, projectId: project_id });
    if (resp.status === 200) {
        return res.status(200).send({ status: 200, message: "Project details fetched", data: resp.data });
    }
    return res.status(resp.status || 500).send({ status: resp.status || 500, message: resp.message || "Error fetching details" });
}