import db from "../../config/firebase-config.mjs"
import { createJwtToken } from "../utils/sign-jwt.mjs";

const subUserCollection = db.collection('sub-user');
const userCollection= db.collection('users');

export const createAccessToken = async ({ uid, parentToken }) => {
    const snapshot = subUserCollection.where("parent_uid", "==", uid);
    const role= (await userCollection?.doc(uid).get()).data()['role'];
    const querySnapshot = await snapshot.get();
    const data = {
        'main': parentToken,
        'sub_users': {},
        "role": role
    }
    let index = 0;
    querySnapshot?.forEach(doc => {
        data['sub_users'][`sub_${index}`] = doc?.data()["sub_user_access_token"];
        index++;
    });
    console.log(data);
    const token = createJwtToken(data);
    return token;
}