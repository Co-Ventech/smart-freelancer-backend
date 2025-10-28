import axios from "axios";
import { getUnixTimestamp } from "../utils/date-utils.mjs";
import { buildQueryParams } from "../utils/build-query-params.mjs";
import { filterProjects } from "../utils/filter-projects.mjs";

export const fetchUserBidId = async (sub_user_access_token) => {
    const response = await axios.get('https://www.freelancer.com/api/users/0.1/self', {
        headers: {
            'Authorization': `Bearer ${sub_user_access_token}`,
        },
    });
    return response.data?.result?.id || null;
}

export const fetchProjectsOfUserService = async (skillIds) => {
    const from_time = getUnixTimestamp(300);
    try {
        const params = {
            'jobs[]': skillIds,
            from_time,
            full_description: true,
            user_details: true, // Include user details
            user_responsiveness: true, // Include user responsiveness
            user_portfolio_details: true, // Include user portfolio details
            user_reputation: true, // Include user reputation
            'languages[]': 'en',
            user_employer_reputation: true,
            user_status: true,
        };
        const queryString = buildQueryParams(params);
        const url = `https://www.freelancer.com/api/projects/0.1/projects/active?${queryString}`;
        const response = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                "Accept": "application/json",
            },
        });

        // return both projects and users map (some endpoints include users in result)
        const resProjects = response.data?.result?.projects || [];
        const resUsers = response.data?.result?.users || {};
        const filteredProjects = filterProjects(resProjects, resUsers);
        return { projects: filteredProjects, users: resUsers };
    } catch (err) {
        console.error('Error fetching projects by skills:', err);
        throw new Error('Failed to fetch projects by skills');
    }
}

export const fetchUserSkillsService = async (userId) => {
    const response = await axios.get(
        `https://www.freelancer.com/ajax-api/skills/top-skills.php?limit=9999&userId=${userId}&compact=true`
    );
    const skills = response.data?.result?.topSkills?.map((skill) => skill.id) || [];
    return (skills)
}

export const placeBid = async ({ projectId, bidderId, bidAmount, proposal, bidderAccessToken, bidderName, projectTitle}) => {
    const bidResponse = await axios.post(
        `https://www.freelancer.com/api/projects/0.1/bids/`,
        {
            project_id: projectId,
            bidder_id: bidderId,
            amount: bidAmount,
            period: 5,
            description: proposal,
            milestone_percentage: 100,
        },
        {
            headers: {
                'Authorization': `Bearer ${bidderAccessToken}`,
            },
        }
    );

    if(bidResponse.status===200){
        return {
            status: 200,
            message: `Auto Bid Done successfully for user ${bidderName} on Project: ${projectTitle}`,
            data: bidResponse?.data
        }
    }

    return {
        status: bidResponse.status,
        message: bidResponse?.message
    }

}