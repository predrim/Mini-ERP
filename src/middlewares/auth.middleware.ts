import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const auth = req.headers.authorization; 
    
    if (!auth) {
        res.status(401).json("This request demands authorization");
        return;
    };
    
    try {
        if (auth && auth.startsWith('Bearer ')) {
            const token: string = auth.split(' ')[1];
            jwt.verify(token, process.env.JWT_SECRET as string);
        }
        else {
            throw new Error("Not found, expired or invalid token");
        };
        
        next();
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(401).json({ error: error.message });
        } else {
            res.status(400).json({ error: "Authorization failed" });
        };
    }
};