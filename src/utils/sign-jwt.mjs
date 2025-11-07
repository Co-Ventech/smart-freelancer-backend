import jwt from 'jsonwebtoken';
import { config } from 'dotenv';

config();

const {sign}= jwt;

export const createJwtToken = (payload) => {
    return sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRATION
    });
}