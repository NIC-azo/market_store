// README.md | [21]
import ProductsController from "@/controller/product.controller.js";
import { authMiddleware } from "@/middleware/auth.middleware.js";
import { roleMiddleware } from "@/middleware/role.middleware.js";
import { Router } from "express";

class ProductRoutes {
    public router: Router;
    constructor() {
        this.router = Router();
        this.configRouter();
    }
    private configRouter(): void {
        this.router.get('/health', () => console.log(`rutas de productos funcionando`));
        this.router.use(authMiddleware);
        this.router.use(roleMiddleware("ADMIN"));
        this.router.get('/', ProductsController.getAll);
        this.router.get('/:id_product', ProductsController.getOne);
        this.router.post('/product', ProductsController.create);
        this.router.put('/product/:id_product', ProductsController.update);
        this.router.delete('/:id_product', ProductsController.delete);
        this.router.get('/allerts', ProductsController.getAllerts);
    }
}

export default new ProductRoutes().router;