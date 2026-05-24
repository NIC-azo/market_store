// README.md | [17]
import clientsModel from "@/model/clients.model.js";
import { errorHandler } from "@/middleware/errorHandler.js";
import type { Request, Response } from "express";
import type { CreateClient, UpdateClient } from "@/types/bd.types.js";

class ClientsController {
    static getAll = errorHandler(async(req: Request, res: Response) => {
        const results = await clientsModel.getClients();
        if (results === undefined){
            return res.status(500).json({error: true, message: "error interno al obtener usuarios"});
        }
        return res.status(200).json({data: results});
    });
    static getOne = errorHandler(async(req: Request, res: Response) => {
        const {id_client} = req.params;
        if (!String(id_client) || id_client === undefined){
            return res.status(400).json({error: true, message: "se necesita identificacion del cliente"});
        }
        const results = await clientsModel.getClient(String(id_client!));
        if (results === undefined) {
            return res.status(500).json({error: true, message: "error interno al obtener cliente"});
        }
        return res.status(200).json({data: results});
    });
    static create = errorHandler(async(req: Request, res: Response) => {
        const {...restOfBody} = req.body;
        if (typeof restOfBody.name !== "string" || String(restOfBody.name!).length <= 3  || Object.keys(restOfBody).length < 1) {
            return res.status(400).json({error: true, message: "el nombre del cliente es invalido, intentelo denuevo"});
        }
        if (restOfBody.dni) {
            const clientExists = await clientsModel.getClientForValidation(String(restOfBody.dni!));
            if (clientExists.length > 0) {
                return res.status(409).json({error: true, message: "ya existe un cliente con el mismo DNI, intentelo denuevo"});
            }
        }
        if (restOfBody.ruc) {
            const clientExists = await clientsModel.getClientForValidation(String(restOfBody.ruc!));
            if (clientExists.length > 0) {
                return res.status(409).json({error: true, message: "ya existe un cliente con el mismo RUC, intentelo denuevo"});
            }
        }
        const clientConverted: CreateClient = {
            ...restOfBody,
        };
        const clientCreated = await clientsModel.createClient(clientConverted);
        if (!clientCreated || clientCreated === undefined) {
            return res.status(500).json({error: true, message: "error interno al crear cliente"});
        }
        return res.status(201).json({message: "cliente creado recientemente"});
    });
    static update = errorHandler(async(req: Request, res: Response) => {
        const {id_client} = req.params;
        const {...restOfBody} = req.body;
        if (typeof id_client !== "string" || !id_client) {
            return res.status(400).json({error: true, message: "identificacion del cliente no valido, intentelo denuevo"})
        }
        if (typeof String(restOfBody.name) !== "string" || !restOfBody || Object.keys(restOfBody).length < 1) {
            return res.status(400).json({error: true, message: "se esperaba por lo menos 1 dato, intentelo denuevo"});
        }
        if (restOfBody.dni) {
            const clientExists = await clientsModel.getClientForValidation(String(restOfBody.dni!));
            if (clientExists.length > 0 && clientExists.some(e => e.id !== String(id_client))) {
                return res.status(409).json({error: true, message: "ya existe un cliente con el mismo DNI, intentelo denuevo"});
            }
        }
        if (restOfBody.ruc) {
            const clientExists = await clientsModel.getClientForValidation(String(restOfBody.ruc!));
            if (clientExists.length > 0 && clientExists.some(e => e.id !== String(id_client))) {
                return res.status(409).json({error: true, message: "ya existe un cliente con el mismo RUC, intentelo denuevo"});
            }
        }
        const clientConverted: UpdateClient = {
            ...restOfBody,
        };
        const clientUpdated = await clientsModel.updateClient(String(id_client), clientConverted);
        if (!clientUpdated || clientUpdated === undefined) {
            return res.status(500).json({error: true, message: "error interno al actualizar cliente"});
        }
        return res.status(200).json({message: "cliente actualizado recientemente"});
    });
}

export default ClientsController;