// README.md | [14]
import type { Request, Response } from "express";
import { errorHandler } from "@/middleware/errorHandler.js";
import usersModel from "@/model/users.model.js";
import authModel from "@/model/auth.model.js";
import bcrypt from 'bcrypt'
import "dotenv/config";
import type { CreateUser, UpdateUser } from "@/types/bd.types.js";

class UserController {
    static getAll = errorHandler(async(req: Request, res: Response) => {
        const users = await usersModel.getAll();
        if (users === undefined) {
            return res.status(500).json({error: true, message: "error interno al obtener los usuarios"})
        }
        return res.status(200).json({data: users})
    });
    static getUser = errorHandler(async(req: Request, res: Response) => {
        const {id_user} = req.params;
        if (!String(id_user)) {
            return res.status(400).json({error: true, message: "se requiere id del usuario"});
        }
        const userFound = await usersModel.findById(String(id_user));
        if (userFound === undefined) {
            return res.status(500).json({error: true, message: "error interno al obtener usuario"})
        }
        return res.status(200).json({data: userFound});
    });
    static createUser = errorHandler(async(req: Request, res: Response) => {
        const {...restOFBody} = req.body;
        if (!String(restOFBody.name)){
            return res.status(400).json({error: true, message: "se requiere el nombre del usuario para crearlo"});
        }
        if (!String(restOFBody.email)){
            return res.status(400).json({error: true, message: "se requiere el email del usuario para crearlo"});
        }
        if (String(restOFBody.email)){
            const verifyUser = await authModel.getUserByEmail(String(restOFBody.email));
            if (verifyUser) {
                return res.status(409).json({error: true, message: "ya existe un usuario con el mismo email"});
            }
        }
        const passwordHashed = await bcrypt.hash(restOFBody.password, Number(process.env.HASH_SALTS!));
        const userConverted: CreateUser = {
            ...restOFBody,
            password: passwordHashed
        };
        const userCreated = await usersModel.createUser(userConverted);
        if (!userCreated || userCreated === undefined){
            return res.status(500).json({error: true, message: "error interno al crear usuario"});
        }
        return res.status(200).json({message: "usuario creado correctamente"});
    });
    static updateUser = errorHandler(async(req: Request, res: Response) => {
        const {id_user} = req.params;
        const {password, ...restOfBody} = req.body;
        if (!String(id_user) || id_user === undefined) {
            return res.status(400).json({error: true, message: "se requiere identificacion del usuario"});
        }
        if (String(restOfBody.email!)){
            const checkUserExists = await authModel.getUserByEmail(String(restOfBody.email));
            if (checkUserExists && checkUserExists.id !== String(id_user)) {
                return res.status(409).json({error: true, message: "ya existe un usuario con el mismo email, intentalo denuevo"});
            }
        }
        const userConverted: UpdateUser = {
            ...restOfBody,
            ...(password && {
                password: await bcrypt.hash(String(password), Number(process.env.HASH_SALTS!))
            }),
        };
        const userUpdated = await usersModel.updateUser(String(id_user)!, userConverted);
        if (!userUpdated || userUpdated === undefined) {
            return res.status(500).json({error: true, message: "error interno al actualizar usuario"});
        }
        return res.status(200).json({message: "usuario actualizado correctamente"});
    });
}

export default UserController;