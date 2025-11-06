import { autoBidService } from "../services/bid-service.mjs";
import { fetchProjectsOfUserService, fetchUserSkillsService } from "../services/freelancer-service.mjs";
import { getAutoBidSubUsersService } from "../services/sub-user-service.mjs";

export const scheduleAutoBidController = async () => {
    console.log("task executing.....");
    const autoBidEnabledUsers = await getAutoBidSubUsersService();
    if (autoBidEnabledUsers.status === 200 && autoBidEnabledUsers.data?.length > 0) {
        // fetch user's skills 
        await Promise.allSettled(autoBidEnabledUsers?.data?.map(async (user) => {
            console.log(user)
            const skills = await fetchUserSkillsService(user?.user_bid_id);
            const projects = await fetchProjectsOfUserService(skills, user?.sub_user_access_token);
            console.log(projects.projects)
            const autoBidResponse = await autoBidService({
                sub_user_doc_id: user?.document_id,
                general_proposal: user?.general_proposal,
                autobid_enabled_for_job_type: user?.autobid_enabled_for_job_type,
                autobid_proposal_type: user?.autobid_proposal_type,
                projectsToBid: projects.projects,
                bidderId: user?.user_bid_id,
                bidderName: user?.sub_username,
                token: user?.sub_user_access_token,
                autobid_type: user?.autobid_enabled_for_job_type
            });
            console.log(autoBidResponse);
        }))
    }
}