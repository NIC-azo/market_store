// README.MD | [12]
import { router } from "@/routes/index.routes.js";
import express from 'express';
import cors from 'cors';
import "dotenv/config";

const app = express();

app.use(express.json());

const origin = process.env.NODE_ENV === "dev" ? process.env.LOCAL_FRONTEND_URL! : process.env.FRONTEND_URL!;

app.use(cors({
    methods: ['GET,HEAD,PUT,PATCH,POST,DELETE'],
    origin: origin,
    credentials: true,
}));

app.use('/api', router);

const PORT = process.env.NODE_ENV === "dev" ? process.env.PORT_LOCAL! : process.env.PORT!;

app.listen(PORT, () => {
    console.log(`🚀 Servidor listo en puerto: ${process.env.PORT}`);
});