// README.md | [9]
import type { Request, Response } from "express";
import { errorHandler } from "@/middleware/errorHandler.js";
import authModel from "@/model/auth.model.js";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';
import "dotenv/config";

class AuthController {
    static login = errorHandler(async(req: Request, res: Response) => {
        const {email, password} = req.body;
        if (!email || String(email).length <= 0) {
            return res.status(403).json({error: true, message: "valor(es) no validos intentelo denuevo"});
        }
        if (!password || String(password).length <= 6) {
            return res.status(403).json({error: true, message: "valor(es) no validos intentelo denuevo"});
        }
        const userFound = await authModel.getUserByEmail(String(email));
        if (!userFound) {
            return res.status(403).json({error: true, message: "valor(es) no validos, intentelo en 1 minuto"});
        }
        const comparePassword = await bcrypt.compare(String(password), userFound.password);
        if (!comparePassword) {
            return res.status(403).json({error: true, message: "valor(es) no validos, intentelo en 1 minuto"});
        }
        const token = jwt.sign(
            {userId: userFound.id, rol: userFound.typeUser},
            process.env.SESSION_SECRET! as string,
            {expiresIn: '24h'},
        );
        return res.status(200).json({token: token, message: "sesion iniciada correctamente", user: {
            userId: userFound.id, name: userFound.name, rol: userFound.typeUser,
        }});
    });
}

export default AuthController;