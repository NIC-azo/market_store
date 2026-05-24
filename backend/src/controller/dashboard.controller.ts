// README.md | [27]
import dashboardModel from "@/model/dashboard.model.js";
import { errorHandler } from "@/middleware/errorHandler.js";
import type { Request, Response } from "express";

class DashboardController {
    static getSellsByFilter = errorHandler(async(req: Request, res: Response) => {
        const {limit} = req.params;
        if (isNaN(Number(limit!))) {
            return res.status(400).json({error: true, message: "el limite no es valido, intentelo denuevo"});
        }
        const results = await dashboardModel.getSellsByFilter(Number(limit!));
        if (results === undefined) {
            return res.status(500).json({error: true, message: "error interno al obtener ventas por limite"})
        }
        return res.status(200).json({data: results});
    });
    static getStatsDashboard = errorHandler(async(req: Request, res: Response) => {
        const results = await dashboardModel.getDashboardStats();
        if (results === undefined) {
            return res.status(500).json({error: true, message: "error interno al obtener stats"});
        }
        return res.status(200).json({data: results});
    });
}

export default DashboardController;