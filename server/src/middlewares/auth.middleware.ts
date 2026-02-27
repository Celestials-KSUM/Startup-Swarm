import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

export interface AuthRequest extends Request {
    user?: any;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(); // Continue without user if no token (optional, depending on requirements)
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (decoded) {
        req.user = decoded;
    }

    next();
};

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    next();
};
