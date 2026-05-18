// README.MD | [11]
import { Router } from "express";
import authRoutes from "@routes/auth.routes.js";
import userRoutes from "@routes/user.routes.js";
import clientRoutes from "@routes/client.routes.js";
import productRoutes from "@routes/product.routes.js";
import sellsRoutes from "@routes/sells.routes.js";

const router: Router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/clients', clientRoutes);
router.use('/products', productRoutes);
router.use('/sells', sellsRoutes);

export {router};