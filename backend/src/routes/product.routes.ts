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
        this.router.get('/', roleMiddleware("ADMIN"), ProductsController.getAll);
        this.router.get('/:id_product', roleMiddleware("ADMIN"), ProductsController.getOne);
        this.router.post('/product', roleMiddleware("ADMIN"), ProductsController.create);
        this.router.put('/product/:id_product', roleMiddleware("ADMIN"), ProductsController.update);
        this.router.delete('/:id_product', roleMiddleware("ADMIN"), ProductsController.delete);
        this.router.get('/allerts', roleMiddleware("ADMIN"), ProductsController.getAllerts);
    }
}

export default new ProductRoutes().router;