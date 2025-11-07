import db from "../../config/firebase-config.mjs"
import { createJwtToken } from "../utils/sign-jwt.mjs";

const subUserCollection = db.collection('sub-user');


export const createAccessToken = async ({ uid, parentToken }) => {
    const snapshot = subUserCollection.where("parent_uid", "==", uid);
    const querySnapshot = await snapshot.get();
    const data = {
        'main': parentToken,
        'sub_users':{}
    }
    let index = 0;
    querySnapshot?.forEach(doc => {
        console.log(doc?.data()["sub_user_access_token"]);
        data['sub_users'][`sub_${index}`] = doc?.data()["sub_user_access_token"];
        index++;
    });
    console.log(data);
    const token = createJwtToken(data);
    return token;
}