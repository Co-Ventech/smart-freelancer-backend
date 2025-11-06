import * as jwt from 'jsonwebtoken';
import {config} from 'dotenv';

config();

export const createJwtToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRATION
    });
}