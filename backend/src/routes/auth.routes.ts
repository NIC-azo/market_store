// README.md | [10]
import { Router } from "express";
import AuthController from "@/controller/auth.controller.js";

class AuthRoutes {
    public router: Router;

    constructor(){
        this.router = Router();
        this.configRoutes();
    }
    private configRoutes(): void {
        this.router.get('/health', () => console.log(`auth routes funcionando`));
        this.router.post('/login', AuthController.login);
    }
}

export default new AuthRoutes().router;