import db from "../../config/firebase-config.mjs"
import { v4 } from 'uuid'
import { FieldValue } from "firebase-admin/firestore";

const subUserCollection = db.collection('sub-user')

export const markNotificationRead = async ({ subUserId, notificationId, isRead }) => {
    const collection = subUserCollection
        .doc(subUserId)
        .collection("notifications")
        .doc(notificationId);
        
    await collection.update({ is_read: isRead });

    console.log(`✅ Notification ${notificationId} marked as read`);
};

export const getAllNotificationService = async ({ subUserId, onlyUnread = false, count=10 }) => {
    try{
        let query = subUserCollection.doc(subUserId).collection("notifications").limit(count);
        if (onlyUnread) query = query.where("is_read", "==", false);
        const snapshot = await query.orderBy("created_at", "desc").get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }catch(e){
        console.log(e);
        return e.message
    }
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
            created_at: FieldValue.serverTimestamp(),
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

export const getNotificationDetailsService = async ({ subUserId, notificationId, projectId }) => {
    try {
        // Try to read the notification doc first (may contain project_details)
        if (notificationId) {
            const notifDoc = await subUserCollection.doc(subUserId).collection("notifications").doc(notificationId).get();
            if (notifDoc.exists) {
                const data = notifDoc.data();
                if (data.project_details) {
                    return { status: 200, data: data.project_details };
                }
                if (data.project_id) projectId = data.project_id;
            }
        }

        // If we have a projectId, try to find saved details in common collections
        if (projectId) {
            // Prefer project details collections first, then fallback to bids/bid_history
            const collectionsToSearch = ['project_details', 'projects', 'bids', 'bid_history'];
            for (const col of collectionsToSearch) {
                const q = db.collection(col).where('project_id', '==', Number(projectId)).limit(1);
                const snap = await q.get();
                if (!snap.empty) {
                    const doc = snap.docs[0].data();

                    // Title extraction (prefer project-specific fields)
                    const title =
                        doc.project_title ||
                        doc.title ||
                        doc.name ||
                        (doc.project && (doc.project.title || doc.project.name)) ||
                        null;

                    // Description extraction: prefer actual project description fields (project_details, project_description, details)
                    const description =
                        (doc.project_details && (doc.project_details.description || doc.project_details.details)) ||
                        doc.project_description ||
                        doc.description || // fallback (may be proposal in bids)
                        doc.details ||
                        (doc.project && (doc.project.description || doc.project.details)) ||
                        null;

                    const bid_amount = doc.bid_amount || doc.amount || doc.bidValue || null;
                    const seo_url = doc.seo_url || doc.seo || doc.url || null;

                    return {
                        status: 200,
                        data: {
                            project_id: doc.project_id || Number(projectId),
                            title,
                            bid_amount,
                            description,
                            seo_url,
                        },
                    };
                }
            }
        }

        return { status: 404, message: 'Project details not found' };
    } catch (e) {
        console.log(e);
        return { status: 500, message: e.message };
    }
}



// export const getNotificationDetailsService = async ({ subUserId, notificationId, projectId }) => {
//     try {
//         // Try to read the notification doc first (may contain project_details)
//         if (notificationId) {
//             const notifDoc = await subUserCollection.doc(subUserId).collection("notifications").doc(notificationId).get();
//             if (notifDoc.exists) {
//                 const data = notifDoc.data();
//                 if (data.project_details) {
//                     return { status: 200, data: data.project_details };
//                 }
//                 if (data.project_id) projectId = data.project_id;
//             }
//         }

//         // If we have a projectId, try to find saved details in common collections
//         if (projectId) {
//             const collectionsToSearch = ['bids', 'bid_history', 'projects', 'project_details'];
//             for (const col of collectionsToSearch) {
//                 const q = db.collection(col).where('project_id', '==', Number(projectId)).limit(1);
//                 const snap = await q.get();
//                 if (!snap.empty) {
//                     const doc = snap.docs[0].data();
//                     const details = {
//                         project_id: doc.project_id || projectId,
//                         title: doc.title || doc.project_title || doc.name || null,
//                         bid_amount: doc.bid_amount || doc.amount || doc.bidValue || null,
//                         description: doc.description || doc.project_description || doc.details || null,
//                         seo_url: doc.seo_url || doc.seo || doc.url || null,
//                     };
//                     return { status: 200, data: details };
//                 }
//             }
//         }

//         return { status: 404, message: 'Project details not found' };
//     } catch (e) {
//         console.log(e);
//         return { status: 500, message: e.message };
//     }
// }