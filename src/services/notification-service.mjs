import db from "../../config/firebase-config.mjs"
import { v4 } from 'uuid'
import * as admin from 'firebase-admin'

const subUserCollection = db.collection('sub-user')

export const markNotificationRead = async ({ subUserId, notificationId }) => {
    const collection = await subUserCollection
        .doc(subUserId)
        .collection("notifications")
        .doc(notificationId);
        
    collection.update({ is_read });

    console.log(`✅ Notification ${notificationId} marked as read`);
};

export const getAllNotificationService = async ({ subUserId, onlyUnread = false }) => {
    let query = subUserCollection.doc(subUserId).collection("notifications");
    if (onlyUnread) query = query.where("is_read", "==", false);
    const snapshot = await query.orderBy("created_at", "desc").get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createNotificationService = async ({ isSuccess, subUserId, notificationTitle, notificationDescription, projectId }) => {
    try {
        const generatedUUID = v4();
        const notifRef = subUserCollection.doc(subUserId).collection("notifications")
            .doc(generatedUUID);

        await notifRef.set({
            isSuccess,
            title: notificationTitle,
            description: notificationDescription,
            project_id: projectId,
            is_read: false,
            created_at: admin.firestore.FieldValue.serverTimestamp(),
        });

        return {
            status: 200,
            message: "Notification Updated Successfully",
        }
    } catch (e) {
        console.log(e)
        return {
            status: 500,
            message: e.message
        }
    }
}