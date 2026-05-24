// README.md | [18]
import ClientsController from "@/controller/client.controller.js";
import { authMiddleware } from "@/middleware/auth.middleware.js";
import { roleMiddleware } from "@/middleware/role.middleware.js";
import { Router } from "express";

class ClientRoutes {
    public router: Router;

    constructor(){
        this.router = Router();
        this.configRoutes();
    }
    private configRoutes() : void {
        this.router.get('/health', () => console.log(`user routes funcionando`));
        this.router.use(authMiddleware);
        this.router.get('/', roleMiddleware("ADMIN", "VENDEDOR"), ClientsController.getAll);
        this.router.get('/:id_client', roleMiddleware("ADMIN", "VENDEDOR"), ClientsController.getOne);
        this.router.post('/client', roleMiddleware("ADMIN", "VENDEDOR"), ClientsController.create);
        this.router.put('/client/:id_client', roleMiddleware("ADMIN", "VENDEDOR"), ClientsController.update);
    }
}

export default new ClientRoutes().router;