import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import "dotenv/config"
import type { JwtPayload } from '@/types/bd.types.js';
import { errorHandler } from '@middleware/errorHandler.js';
// README.md | [4]
export const authMiddleware = errorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization!;
    if (!authHeader?.startsWith("Bearer ")) {
        res.status(401).json({ error: true, message: "se requiere token para iniciar sesion" })
    }
    const token = authHeader.split(" ")[1]!;
    console.log(`token: ${token}`)
    const payload = jwt.verify(
        token,
        process.env.SESSION_SECRET!,
    ) as unknown as JwtPayload;
    req.user = payload;
    next();
});