import db from "../../config/firebase-config.mjs"
import { v4 } from "uuid";
import { fetchUserBidId } from "./freelancer-service.mjs";
import { decrypt, encrypt } from "../utils/crypto.mjs";
import admin from "firebase-admin";
import { AUTOBID_FOR_JOB_TYPE } from "../constants/auto-bid-for-job-type.mjs";
import { AUTOBID_PROPOSAL_TYPE } from "../constants/auto-bid-proposal-type.mjs";
import { deleteAutoBidUserCache, getAllAutoBidUsersCache, insertAutoBidCache } from "../cache/auto-bid-users.mjs";

const subUserCollection = db.collection('sub-user')

export const createSubUserService = async ({ parent_uid, sub_user_access_token, sub_username, autobid_enabled = false, general_proposal = AUTOBID_PROPOSAL_TYPE.GENERAL, autobid_enabled_for_job_type = AUTOBID_FOR_JOB_TYPE.ALL }) => {
    const generatedUUID = v4();
    const hashedToken = encrypt(sub_user_access_token);
    const userBidId = await fetchUserBidId(sub_user_access_token);
    await subUserCollection.doc(generatedUUID)
        .set({
            parent_uid,
            sub_user_access_token: hashedToken,
            sub_username,
            autobid_enabled,
            user_bid_id: userBidId,
            general_proposal,
            autobid_enabled_for_job_type,
            created_at: admin.firestore.FieldValue.serverTimestamp(),
        });

    if (autobid_enabled) {
        insertAutoBidCache({
            sub_user_access_token: hashedToken,
            sub_username,
            autobid_enabled,
            user_bid_id: userBidId,
            general_proposal,
            autobid_enabled_for_job_type,
            document_id: generatedUUID
        })
    }

    return {
        status: 200,
        message: "Your User has been created successfully"
    }
}

export const getSubUsersService = async ({ uid }) => {
    const snapshot = subUserCollection.where("parent_uid", "==", uid);

    const querySnapshot = await snapshot.get();
    const data = [];
    let index = 0;
    querySnapshot.forEach((doc) => {
        const docData = doc.data();
        delete docData["sub_user_access_token"];
        data.push({ ...docData, document_id: doc.id, sub_user: `sub_${index}` });
        index++;
    });

    return {
        status: 200,
        message: "Sub Users fetched successfully",
        data: data
    }

}

export const getAutoBidSubUsersService = async () => {
    const autoBidSubUsers = getAllAutoBidUsersCache();
    const data = []
    for (const user of autoBidSubUsers) {
        if (user?.autobid_enabled === true) {
            data.push({
                ...user,
                document_id: user?.document_id,
                sub_user_access_token: decrypt(user["sub_user_access_token"])
            });
        }
    }
    // const snapshot = subUserCollection.where("autobid_enabled", "==", true);
    // const querySnapshot = await snapshot.get();
    // querySnapshot?.forEach((doc) => {
    //     data.push({
    //         ...doc.data(),
    //         document_id: doc.id,
    //         sub_user_access_token: decrypt(doc.data()["sub_user_access_token"])
    //     });
    // });

    return {
        status: 200,
        message: "Sub Users fetched successfully",
        data: data
    }
}

export const updateSubUserService = async (sub_user_id, body) => {
    try {
        await subUserCollection
            .doc(sub_user_id)
            .update({
                ...body
            });

        if (body?.autobid_enabled === false) {
            deleteAutoBidUserCache(sub_user_id)
        } else {
            const updatedDoc = await subUserCollection.doc(sub_user_id).get();
            const updatedData = { sub_user_id, ...updatedDoc.data(), document_id: sub_user_id };

            // now update your cache
            insertAutoBidCache(updatedData);
        }
        return {
            status: 200,
            message: "Sub User Updated Successfully"
        }
    } catch (e) {
        console.log(e);
        return {
            status: 500,
            message: "Error: " + e.message
        }
    }
}

export const deleteSubUserService = async (sub_user_id, parent_uid) => {
    try {
        const snapshot = await subUserCollection.where("parent_uid", "==", parent_uid).where("sub_user_id", "==", sub_user_id).get();
        if (snapshot.empty) {
            console.log("No matching documents.");
            return {
                status: 404,
                message: "No Sub User found"
            }
        }
        // delete all matching docs
        const batch = db.batch();
        snapshot.forEach((doc) => {
            batch.delete(doc.ref);
        });
        deleteAutoBidUserCache(sub_user_id)
        await batch.commit();

        return {
            status: 200,
            message: "Sub User Updated Successfully"
        }
    } catch (e) {
        console.log(e);
        return {
            status: 500,
            message: "Error: " + e.message
        }
    }
}
