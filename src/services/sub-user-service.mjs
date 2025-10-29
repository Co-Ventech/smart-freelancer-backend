import db from "../../config/firebase-config.mjs"
import { v4 } from "uuid";
import { fetchUserBidId } from "./freelancer-service.mjs";
import { decrypt, encrypt } from "../utils/crypto.mjs";
import admin from "firebase-admin";

const subUserCollection = db.collection('sub-user')

export const createSubUserService = async ({ uid, sub_user_access_token, sub_username, autobid_enabled }) => {
    const generatedUUID = v4();
    console.log(sub_user_access_token)
    const hashedToken = encrypt(sub_user_access_token);
    const userBidId = await fetchUserBidId(sub_user_access_token);
    await subUserCollection.doc(generatedUUID)
        .set({
            uid,
            sub_user_access_token: hashedToken,
            sub_username,
            autobid_enabled,
            user_bid_id: userBidId,
            created_at: admin.firestore.FieldValue.serverTimestamp(),
        });

    return {
        status: 200,
        message: "Your User has been created successfully"
    }
}

export const getSubUsersService = async ({ uid }) => {
    const snapshot = subUserCollection.where("uid", "==", uid);

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
