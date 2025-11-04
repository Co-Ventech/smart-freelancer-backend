import db from "../../config/firebase-config.mjs"
import { v4 } from "uuid";
import { fetchUserBidId } from "./freelancer-service.mjs";
import { decrypt, encrypt } from "../utils/crypto.mjs";
import admin from "firebase-admin";
import { AUTOBID_FOR_JOB_TYPE } from "../constants/auto-bid-for-job-type.mjs";
import { AUTOBID_PROPOSAL_TYPE } from "../constants/auto-bid-proposal-type.mjs";

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

    return {
        status: 200,
        message: "Your User has been created successfully"
    }
}

export const getSubUsersService = async ({ uid }) => {
    const snapshot = subUserCollection.where("parent_uid", "==", uid);

    const querySnapshot = await snapshot.get();
    const data = []
    querySnapshot.forEach((doc) => {
        console.log(doc.id, " => ", doc.data());
        data.push({ ...doc.data(), document_id: doc.id, sub_user_access_token: decrypt(doc.data()["sub_user_access_token"]) });
    });

    return {
        status: 200,
        message: "Sub Users fetched successfully",
        data: data
    }

}

export const getAutoBidSubUsersService = async () => {
    const snapshot = subUserCollection.where("autobid_enabled", "==", true);
    const querySnapshot = await snapshot.get();
    const data = []
    querySnapshot?.forEach((doc) => {
        data.push({ ...doc.data(), document_id: doc.id, sub_user_access_token: decrypt(doc.data()["sub_user_access_token"]) });
    });

    return {
        status: 200,
        message: "Sub Users fetched successfully",
        data: data
    }
}

export const updateSubUserService = async (sub_user_id,body) => {
    try{
        console.log(body)
        await subUserCollection
            .doc(sub_user_id)
            .update({
                ...body
            });

        return {
            status: 200,
            message:"Sub User Updated Successfully"
        }
    }catch(e){
        console.log(e);
        return {
            status: 500,
            message:"Error: "+ e.message
        }
    }
}
