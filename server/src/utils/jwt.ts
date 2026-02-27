import jwt from 'jsonwebtoken';
import config from '../config/env';

const JWT_SECRET = config.JWT_SECRET;
const JWT_EXPIRES_IN = config.JWT_EXPIRES_IN;


export const generateToken = (payload: object): string => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });
};

export const verifyToken = (token: string): any => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};
