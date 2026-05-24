// README.md | [24]
import sellService from "@/service/sell.service.js";
import sellsModel from "@/model/sells.model.js";
import { errorHandler } from "@/middleware/errorHandler.js";
import type { Request, Response } from "express";
import type { SaleRequest } from "@/types/bd.types.js";

class SellsController {
    static getAll = errorHandler(async(req: Request, res: Response) => {
        const results = await sellsModel.getSells();
        if (results === undefined) {
            return res.status(500).json({error: true, message: "error interno al obtener ventas"});
        }
        return res.status(200).json({data: results});
    });
    static get = errorHandler(async(req: Request, res: Response) => {
        const {id_sell} = req.params;
        if (!String(id_sell!) || id_sell === undefined){
            return res.status(400).json({error: true, message: "identificacion de la venta no valido, intentelo denuevo"});
        }
        const results = await sellsModel.getSellById(String(id_sell!));
        if (results === undefined) {
            return res.status(500).json({error: true, message: "error interno al obtener venta"});
        }
        return res.status(200).json({data: results});
    });
    static process = errorHandler(async(req: Request, res: Response) => {
        const {...restOfBody} = req.body;
        const {userId} = req.user!;
        if (userId === undefined || !String(userId)) {
            return res.status(400).json({error: true, message: "no se encontro identificacion del usuario, logeese primero"});
        }
        if (restOfBody.id_client === undefined || !String(restOfBody.id_client)) {
            return res.status(400).json({error: true, message: "se requiere identificacion del cliente, intentelo denuevo"});
        }
        if (Object.keys(restOfBody).length <= 0) {
            return res.status(400).json({error: true, message: "se necesitan datos para procesar venta"});
        }
        const requestConverted: SaleRequest = {
            ...restOfBody,
        };
        const result = await sellService.processRequest(String(userId!), requestConverted);
        if (result.error){
            return res.status(402).json({error: true, message: result.errors.join(' | '),});
        }
        return res.status(200).json({message: "venta realizada con exito"});
    });
    static cancelSell = errorHandler(async(req: Request, res: Response) => {
        const {id_sell} = req.params;
        if (!String(id_sell!) || id_sell === undefined) {
            return res.status(400).json({error: true, message: "se necesita identificacion de la venta"});
        }
        const sellCancell = await sellService.cancelSell(String(id_sell!));
        if (sellCancell === undefined) {
            return res.status(500).json({error: true, message: "error al cancelar venta"});
        }
        return res.status(200).json({message: "venta anulada con exito"});
    });
    static complete = errorHandler(async (req: Request, res: Response) => {
        const {id_sell} = req.params;
        if (!String(id_sell!) || id_sell === undefined) {
            return res.status(400).json({error: true, message: "se necesita identificacion de la venta"});
        }
        const sellCompleted = await sellService.completeSell(String(id_sell!));
        if (sellCompleted === undefined) {
            return res.status(500).json({error: true, message: "error al completar venta"});
        }
        return res.status(200).json({message: "venta completada correctamente"});
    });
}

export default SellsController;