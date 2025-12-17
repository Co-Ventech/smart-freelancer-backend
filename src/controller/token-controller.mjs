import * as tokenService from '../services/token-service.mjs'

// export const createAccessTokenController = async (req, res) => {
//     const { parent_token, uid } = req.user;
//     try {
//         if (uid && parent_token) {
//             const token = await tokenService.createAccessToken({
//                 uid,
//                 parentToken: parent_token
//             });

//             res.status(200).send({
//                 status: 200,
//                 message: "Token created",
//                 data: {
//                     accessToken: token
//                 }
//             });
//         }

//         res.status(401).send({
//             status: 401,
//             message: "Invalid token"
//         })
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: err.message });
//     }
// }

export const createAccessTokenController = async (req, res) => {
    const { parent_token, uid } = req.user;

    try {
        if (uid && parent_token) {
            const token = await tokenService.createAccessToken({
                uid,
                parentToken: parent_token
            });

            return res.status(200).send({
                status: 200,
                message: "Token created",
                data: {
                    accessToken: token
                }
            });  // ✅ return added
        }

        return res.status(401).send({
            status: 401,
            message: "Invalid token"
        }); // ✅ return added
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message });
    }
};
