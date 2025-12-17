import { createSubUserService, deleteSubUserService, getSubUsersService, updateSubUserService } from "../services/sub-user-service.mjs";

export const createSubUser = async (req, res) => {
    const { sub_user_access_token,
        parent_uid,
        sub_username,
        autobid_enabled,
        general_proposal,
        autobid_enabled_for_job_type,
        autobid_proposal_type } = req?.body;
    const result = await createSubUserService({
        autobid_enabled,
        sub_username,
        parent_uid,
        sub_user_access_token,
        general_proposal,
        autobid_enabled_for_job_type,
        autobid_proposal_type
    });

    res.status(result.status).send({
        ...result
    });
}

export const getSubUsers = async (req, res) => {
    const result = await getSubUsersService({
        uid: req?.query?.parent_uid
    });

    res.status(result.status).send({
        ...result
    });
}

export const updateSubUserController = async (req, res) => {
    const sub_user_id = req?.query?.sub_user_id;
    const body = req?.body;
    const result = await updateSubUserService(sub_user_id, body);

    res.status(result.status).send({
        ...result
    });
}

export const deleteSubuserController = async (req, res) => {
    const { sub_user_id, parent_uid } = req?.query;
    const result = await deleteSubUserService(sub_user_id, parent_uid)
    res.status(result.status).send({
        ...result
    });
}