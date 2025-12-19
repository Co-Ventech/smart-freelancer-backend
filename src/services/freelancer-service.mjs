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

export const fetchProjectsOfUserService = async (skillIds, allowedCountries, sub_user_access_token, excluded_countries, allowed_currencies = null,clientFilters = {}) => {
    const from_time = getUnixTimestamp(60);
    try {
        const params = {
            'jobs[]': skillIds,
            from_time,
            countries: allowedCountries,
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
        const filteredProjects = filterProjects(resProjects, resUsers, excluded_countries,allowed_currencies,clientFilters);
        return { projects: filteredProjects, users: resUsers };
    } catch (err) {
        console.error('Error fetching projects by skills:', err);
        throw new Error('Failed to fetch projects by skills');
    }
}

export const fetchUserSkillsService = async (userBidId) => {
    const response = await api.get(
        `/ajax-api/skills/top-skills.php?limit=9999&userId=${userBidId}&compact=true`

    );
    console.log("Skills Response: ", response.data?.result?.topSkills)
    return (response.data?.result?.topSkills)
}

export const placeBid = async ({ projectId, bidderId, bidAmount, proposal, bidderAccessToken, bidderName, projectTitle }) => {
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
                    Authorization: `Bearer ${bidderAccessToken}`,
                    'Content-Type': 'application/json'
                },
            }
        );

        return {
            status: 200,
            message: `Auto Bid Done successfully for user ${bidderName} on Project: ${projectTitle}`,
            data: bidResponse.data
        };
    } catch (e) {
        const code = e?.response?.status;

        if (code === 409) return { status: 409, message: "You already have bidded on this project" };
        if (code === 403) return { status: 403, message: "You must be a verified freelancer to bid on this project" };
        if (code === 400) return { status: 400, message: "You are bidding too fast" };

        return { status: 500, message: e.message };
    }
};


export async function checkExistingBidAPI(projectId, userId, token) {
    try {
        const res = await axios.get(
            `https://www.freelancer.com/api/projects/0.1/bids/?project_ids[]=${projectId}&user_id=${userId}`,
            {
                headers: { "Freelancer-Api-Key": token }
            }
        );

        return res.data.result?.bids?.length > 0;
    } catch {
        return false;
    }
}

