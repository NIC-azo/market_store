// README.md | [28]
import DashboardController from "@/controller/dashboard.controller.js";
import { authMiddleware } from "@/middleware/auth.middleware.js";
import { roleMiddleware } from "@/middleware/role.middleware.js";
import { Router } from "express";

class DashboardRoutes {
    public router: Router;
    constructor(){
        this.router = Router();
        this.configRoutes();
    }
    private configRoutes () : void {
        this.router.get('/health', () => console.log(`ruta de dashboard funcionando`));
        this.router.use(authMiddleware);
        this.router.get('/:limit', roleMiddleware("ADMIN"), DashboardController.getSellsByFilter);
        this.router.get('/stats', roleMiddleware("ADMIN"), DashboardController.getStatsDashboard);
    }
}

export default new DashboardRoutes().router;