import axios from "axios";
import { getUnixTimestamp } from "../utils/date-utils.mjs";
import { buildQueryParams } from "../utils/build-query-params.mjs";
import { filterProjects } from "../utils/filter-projects.mjs";

const api = axios.create({
    baseURL: "https://www.freelancer.com",
});

export const fetchUserBidId = async (sub_user_access_token) => {
    const response = await api.get('/api/users/0.1/self', {
        headers: {
            'Authorization': `Bearer ${sub_user_access_token}`,
        },
    });
    return response.data?.result?.id || null;
}

export const fetchProjectsOfUserService = async (skillIds, sub_user_access_token) => {
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
        const url = `/api/projects/0.1/projects/active?${queryString}`;
        const response = await api.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                "Accept": "application/json",
                'Authorization': `Bearer ${sub_user_access_token}`,
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
    const response = await api.get(
        `/ajax-api/skills/top-skills.php?limit=9999&userId=${userId}&compact=true`
    );
    const skills = response.data?.result?.topSkills?.map((skill) => skill.id) || [];
    return (skills)
}

export const placeBid = async ({ projectId, bidderId, bidAmount, proposal, bidderAccessToken, bidderName, projectTitle }) => {
    console.log(projectId, bidderId, bidAmount, proposal, bidderAccessToken, bidderName, projectTitle);
    try {

        const bidResponse = await api.post(
            `/api/projects/0.1/bids/`,
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
                    'Content-Type': 'application/json'
                },
            }
        );

        if (bidResponse.status === 200) {
            return {
                status: 200,
                message: `Auto Bid Done successfully for user ${bidderName} on Project: ${projectTitle}`,
                data: bidResponse?.data
            }
        }

        if (bidResponse?.message === "Request failed with status code 409") {
            return {
                status: 409,
                message: "You already have bidded on this project"
            }
        }

        if (bidResponse?.message === "Request failed with status code 403") {
            return {
                status: 409,
                message: "You must be a verified freelancer to bid on this project"
            }
        }

        return {
            status: bidResponse.status,
            message: bidResponse?.message
        }
    } catch (e) {
        return {
            status: 500,
            message: e.message
        }
    }

}