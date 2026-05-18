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
        this.router.use(roleMiddleware("ADMIN", "VENDEDOR"));
        this.router.get('/', ClientsController.getAll);
        this.router.get('/:id_client', ClientsController.getOne);
        this.router.post('/client', ClientsController.create);
        this.router.put('/client/:id_client', ClientsController.update);
    }
}

export default new ClientRoutes().router;