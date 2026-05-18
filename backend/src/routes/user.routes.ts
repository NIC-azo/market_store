// README.md | [15]
import { authMiddleware } from "@/middleware/auth.middleware.js";
import { roleMiddleware } from "@/middleware/role.middleware.js";
import { Router } from "express";
import UserController from "@/controller/user.controller.js";

class UserRoutes {
    public router: Router;

    constructor() {
        this.router = Router();
        this.configRoutes();
    }
    private configRoutes() : void {
        this.router.get('/health', () => console.log(`user routes funcionando`));
        this.router.use(authMiddleware);
        this.router.use(roleMiddleware("ADMIN"));
        this.router.get('/', UserController.getAll);
        this.router.get('/:id_user', UserController.getUser);
        this.router.post('/user', UserController.createUser);
        this.router.post('/user/:id_user', UserController.updateUser);
    }
}

export default new UserRoutes().router;