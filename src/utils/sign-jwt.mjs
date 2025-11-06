import { sign } from 'jsonwebtoken'

export const createJwtToken = (payload) => {
    return sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRATION
    });
}