import axios from "axios";

export const fetchUserBidId = async (sub_user_access_token) => {
    const response = await axios.get('https://www.freelancer.com/api/users/0.1/self', {
        headers: {
            'Authorization': `Bearer ${sub_user_access_token}`,
        },
    });
    return response.data?.result?.id || null;
}