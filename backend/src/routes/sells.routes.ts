// README.md | [25]
import SellsController from "@/controller/sells.controller.js";
import { Router } from "express";
import { authMiddleware } from "@/middleware/auth.middleware.js";
import { roleMiddleware } from "@/middleware/role.middleware.js";

class SellRoutes {
    public router: Router;

    constructor() {
        this.router = Router();
        this.configRoutes();
    }
    private configRoutes() :void{
        this.router.get('/health', () => console.log(`ruta ventas funcionando`));
        this.router.use(authMiddleware);
        this.router.get('/historial', roleMiddleware('ADMIN', 'VENDEDOR'), SellsController.getAll);
        this.router.get('/historial/:id_sell', roleMiddleware('ADMIN', 'VENDEDOR'), SellsController.get);
        this.router.post('/create', roleMiddleware('ADMIN', 'VENDEDOR'), SellsController.process);
        this.router.put('/complete/:id_sell', roleMiddleware('ADMIN', 'VENDEDOR'), SellsController.complete);
        this.router.put('/cancel/:id_sell', roleMiddleware('ADMIN', 'VENDEDOR'), SellsController.cancelSell);
    }
}

export default new SellRoutes().router;