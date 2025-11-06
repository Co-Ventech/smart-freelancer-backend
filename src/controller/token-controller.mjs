import * as tokenService from '../services/token-service.mjs'

export const createAccessTokenController = async (req, res) => {
    const idToken = req.user;
    try {
        const decoded = await admin.auth().verifyIdToken(idToken);
        if (decoded.uid) {
            const token = await tokenService.createAccessToken({
                uid: decoded.uid,
                parentToken: idToken
            });

            res.status(200).send({
                status: 200,
                message: "Token created",
                data: {
                    accessToken: token
                }
            });
        }
    } catch (err) {
        console.error(err);
        res.status(401).json({ message: 'Invalid token' });
    }
}