import { createSubUserService, getSubUsersService } from "../services/sub-user-service.mjs";

export const createSubUser= async(req,res)=>{
    const {sub_user_access_token, uid, sub_username, autobid_enabled}= req?.body;
    const result= await createSubUserService({
        autobid_enabled,
        sub_username,
        uid,
        sub_user_access_token
    });

    res.status(result.status).send({
        ...result
    });
}

export const getSubUsers= async(req,res)=>{
    const result= await getSubUsersService({
        uid: req?.query?.uid
    });

    res.status(result.status).send({
        ...result
    });
}