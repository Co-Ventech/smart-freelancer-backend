import { autoBidService } from "../services/bid-service.mjs";
import { fetchProjectsOfUserService, fetchUserSkillsService } from "../services/freelancer-service.mjs";
import { getAutoBidSubUsersService } from "../services/sub-user-service.mjs";
import { getAllowedCountries } from "../utils/get-owner-country.mjs";

export const scheduleAutoBidController = async () => {
    console.log("task executing.....");
    const autoBidEnabledUsers = getAutoBidSubUsersService();
    if (autoBidEnabledUsers?.status === 200 && autoBidEnabledUsers.data?.length > 0) {
        // fetch user's skills 
        await Promise.allSettled(autoBidEnabledUsers?.data?.map(async (user) => {
            // const skills = await fetchUserSkillsService(user?.user_bid_id);
            const userSkills = user?.skills?.map((skill) => skill?.id) || [];
            const excludedCountries = user?.project_filters?.excluded_countries;

            const allowedCountries = getAllowedCountries(excludedCountries);
            const projects = await fetchProjectsOfUserService(userSkills, allowedCountries, user?.sub_user_access_token, excludedCountries);
            const autoBidResponse = await autoBidService({
                clients: projects?.users,
                skills: user?.skills,
                sub_user_doc_id: user?.document_id,
                general_proposal: user?.templates,
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