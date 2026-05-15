// README.md | [5]
import type { Request, Response, NextFunction } from "express";
import type { Rol } from "@/types/bd.types.js";

export const roleMiddleware = (...roles: Rol[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const userRol = req.user?.rol;
        if (!userRol || !roles.includes(userRol)) {
            return res.status(401).json({error: true, message: "no tienes permisos para realizar esta accion"})
        }
        next();
    }
}