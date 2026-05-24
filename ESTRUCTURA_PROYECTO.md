# ESTRUCTURA DEL PROYECTO - DETALLADO

---

## ENTORNO RAÍZ

### Archivos en la Raíz

- **.gitignore**
- **market-store-2026-05-12-1223.excalidraw**
- **market-store-plan-backend-v1.png**
- **market-store-plan-backend-v2.png**
- **market-store-plan-backend-v3.png**
- **market-store-plan-backend-v4.png**
- **market_store_plan.txt**
- **package.json**
- **pnpm-lock.yaml**
- **README.md**
- **structure.txt**
- **User-Driven Sales Pipeline-2026-05-09-000443.pdf**
- **visily-multiscreens.pdf**

---

## ENTORNO BACKEND

### Archivos de Configuración Backend

- **backend/.env**
- **backend/.env.example**
- **backend/.gitignore**
- **backend/package.json**
- **backend/pnpm-lock.yaml**
- **backend/pnpm-workspace.yaml**
- **backend/prisma.config.ts**
- **backend/server.ts**
- **backend/tsconfig.json**

---

### Carpeta: backend/prisma/

#### Archivos de Configuración Prisma

- **backend/prisma/schema.prisma**

#### Archivo: backend/prisma/seed.ts

```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import "dotenv/config";

// README.md en 29 ln
const prisma = new PrismaClient();
interface user {
    name: string;
    email: string;
    password: string;
    typeUser: 'ADMIN' | 'VENDEDOR';
}

const main = async () => {
    const admin: user = {
        name: 'nicolas azo',
        email: 'nicnazo@test.com',
        password: await bcrypt.hash('ICKKCK1243FFF', Number(process.env.HASH_SALTS!)),
        typeUser: 'ADMIN',
    };

    const userCreated = await prisma.users.upsert({
        where: {
            email: admin.email,
        },
        update: {},
        create: {
            ...admin
        },
        select: {
            id: true,
        }
    });

    console.log(`usuario creado con id: ${userCreated.id}`);
}

main()
    .catch((e) => {
        console.error(`error al sembrar: ${e.message}`)
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
```

#### Subcarpeta: backend/prisma/migrations/

- **backend/prisma/migrations/20260514133701_first_migration/**
- **backend/prisma/migrations/migration_lock.toml**

---

### Carpeta: backend/src/

#### Subcarpeta: backend/src/controller/

**Archivo: backend/src/controller/auth.controller.ts**

```typescript
// README.md | [9]
import type { Request, Response } from "express";
import { errorHandler } from "@/middleware/errorHandler.js";
import authModel from "@/model/auth.model.js";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';
import "dotenv/config";

class AuthController {
    static login = errorHandler(async(req: Request, res: Response) => {
        const {email, password} = req.body;
        if (!email || String(email).length <= 0) {
            return res.status(403).json({error: true, message: "valor(es) no validos intentelo denuevo"});
        }
        if (!password || String(password).length <= 6) {
            return res.status(403).json({error: true, message: "valor(es) no validos intentelo denuevo"});
        }
        const userFound = await authModel.getUserByEmail(String(email));
        if (!userFound) {
            return res.status(403).json({error: true, message: "valor(es) no validos, intentelo en 1 minuto"});
        }
        const comparePassword = await bcrypt.compare(String(password), userFound.password);
        if (!comparePassword) {
            return res.status(403).json({error: true, message: "valor(es) no validos, intentelo en 1 minuto"});
        }
        const token = jwt.sign(
            {userId: userFound.id, rol: userFound.typeUser},
            process.env.SESSION_SECRET! as string,
            {expiresIn: '24h'},
        );
        return res.status(200).json({token: token, message: "sesion iniciada correctamente", user: {
            userId: userFound.id, name: userFound.name, rol: userFound.typeUser,
        }});
    });
}

export default AuthController;
```

**Archivo: backend/src/controller/client.controller.ts**

```typescript
// README.md | [17]
import clientsModel from "@/model/clients.model.js";
import { errorHandler } from "@/middleware/errorHandler.js";
import type { Request, Response } from "express";
import type { CreateClient, UpdateClient } from "@/types/bd.types.js";

class ClientsController {
    static getAll = errorHandler(async(req: Request, res: Response) => {
        const results = await clientsModel.getClients();
        if (results === undefined){
            return res.status(402).json({error: true, message: "error interno al obtener usuarios"});
        }
        return res.status(200).json({data: results});
    });
    static getOne = errorHandler(async(req: Request, res: Response) => {
        const {id_client} = req.params;
        if (!String(id_client) || id_client === undefined){
            return res.status(403).json({error: true, message: "se necesita identificacion del cliente"});
        }
        const results = await clientsModel.getClient(String(id_client!));
        if (results === undefined) {
            return res.status(402).json({error: true, message: "error interno al obtener cliente"});
        }
        return res.status(200).json({data: results});
    });
    static create = errorHandler(async(req: Request, res: Response) => {
        const {...restOfBody} = req.body;
        if (typeof restOfBody.name !== "string" || String(restOfBody.name!).length <= 3  || Object.keys(restOfBody).length < 1) {
            return res.status(403).json({error: true, message: "el nombre del cliente es invalido, intentelo denuevo"});
        }
        if (restOfBody.dni) {
            const clientExists = await clientsModel.getClientForValidation(String(restOfBody.dni!));
            if (clientExists.length > 0) {
                return res.status(422).json({error: true, message: "ya existe un cliente con el mismo DNI, intentelo denuevo"});
            }
        }
        if (restOfBody.ruc) {
            const clientExists = await clientsModel.getClientForValidation(String(restOfBody.ruc!));
            if (clientExists.length > 0) {
                return res.status(422).json({error: true, message: "ya existe un cliente con el mismo RUC, intentelo denuevo"});
            }
        }
        const clientConverted: CreateClient = {
            ...restOfBody,
        };
        const clientCreated = await clientsModel.createClient(clientConverted);
        if (!clientCreated || clientCreated === undefined) {
            return res.status(403).json({error: true, message: "error interno al crear cliente"});
        }
        return res.status(201).json({message: "cliente creado recientemente"});
    });
    static update = errorHandler(async(req: Request, res: Response) => {
        const {id_client} = req.params;
        const {...restOfBody} = req.body;
        if (typeof id_client !== "string" || !id_client) {
            return res.status(403).json({error: true, message: "identificacion del cliente no valido, intentelo denuevo"})
        }
        if (typeof String(restOfBody.name) !== "string" || !restOfBody || Object.keys(restOfBody).length < 1) {
            return res.status(402).json({error: true, message: "se esperaba por lo menos 1 dato, intentelo denuevo"});
        }
        const clientConverted: UpdateClient = {
            ...restOfBody,
        };
        const clientUpdated = await clientsModel.updateClient(String(id_client), clientConverted);
        if (!clientUpdated || clientUpdated === undefined) {
            return res.status(402).json({error: true, message: "error interno al actualizar cliente"});
        }
        return res.status(200).json({message: "cliente actualizado recientemente"});
    });
}

export default ClientsController;
```

**Archivo: backend/src/controller/dashboard.controller.ts**

```typescript
// README.md | [27]
import dashboardModel from "@/model/dashboard.model.js";
import { errorHandler } from "@/middleware/errorHandler.js";
import type { Request, Response } from "express";

class DashboardController {
    static getSellsByFilter = errorHandler(async(req: Request, res: Response) => {
        const {limit} = req.params;
        if (isNaN(Number(limit!))) {
            return res.status(402).json({error: true, message: "el limite no es valido, intentelo denuevo"});
        }
        const results = await dashboardModel.getSellsByFilter(Number(limit!));
        if (results === undefined) {
            return res.status(403).json({error: true, message: "error interno al obtener ventas por limite"})
        }
        return res.status(200).json({data: results});
    });
    static getStatsDashboard = errorHandler(async(req: Request, res: Response) => {
        const results = await dashboardModel.getDashboardStats();
        if (results === undefined) {
            return res.status(403).json({error: true, message: "error interno al obtener stats"});
        }
        return res.status(200).json({data: results});
    });
}

export default DashboardController;
```

**Archivo: backend/src/controller/product.controller.ts**

```typescript
// README.md | [20]
import productsModel from "@/model/products.model.js";
import type { Request, Response } from "express";
import { errorHandler } from "@/middleware/errorHandler.js";
import type { CreateProduct, UpdateProduct } from "@/types/bd.types.js";

class ProductsController {
    static getAll = errorHandler(async (req: Request, res: Response) => {
        const results = await productsModel.getProducts();
        if (results === undefined){
            return res.status(403).json({error: true, message: "error interno al obtener productos"})
        }
        return res.status(200).json({data: results});
    });
    static getOne = errorHandler(async (req: Request, res: Response) => {
        const {id_product} = req.params;
        if (!String(id_product!) || id_product === undefined) {
            return res.status(402).json({error: true, message: "se requiere identificacion del producto, intentelo denuevo"});
        }
        const results = await productsModel.getProduct(String(id_product!));
        if (results === undefined) {
            return res.status(402).json({error: true, message: "error interno al obtener producto"});
        }
        return res.status(200).json({data: results});
    });
    static create = errorHandler(async (req: Request, res: Response) => {
        const {expiration_date, production_date, ...restOfBody} = req.body;
        if (Object.keys(restOfBody).length <= 0) {
            return res.status(402).json({error: true, message: "no se encontraron datos, intentelo denuevo"});
        }
        if (restOfBody.bars_code) {
            const validateExists = await productsModel.getProducts(String(restOfBody.bars_code!));
            if (validateExists.length > 1) {
                return res.status(422).json({error: true, message: "ya existe un producto con el mismo codigo de barras, intentelo denuevo"});
            }
        }
        const productConverted: CreateProduct = {
            ...restOfBody,
            ...(expiration_date && {
                expiration_date: new Date(expiration_date)
            }),
            ...(production_date && {
                production_date: new Date(production_date)
            }),
        };
        const productCreated = await productsModel.createProduct(productConverted);
        if (productCreated === undefined) {
            return res.status(403).json({error: true, message: "error interno al crear producto"});
        }
        return res.status(200).json({message: "producto creado recientamente"});
    });
    static update = errorHandler(async (req: Request, res: Response) => {
        const {id_product} = req.params;
        const {expiration_date, production_date, ...restOfBody} = req.body;
        if (id_product === undefined || !String(id_product!)) {
            return res.status(402).json({error: true, message: "identificacion del producto no valido, intentelo denuevo"});
        }
        if (Object.keys(restOfBody).length <= 0 && ((expiration_date === undefined || !expiration_date) && (production_date === undefined || !production_date))){
            return res.status(402).json({error: true, message: "se necesita almenos 1 valor para actualizar, intentelo denuevo"});
        }
        const productConverted: UpdateProduct = {
            ...restOfBody,
            ...(expiration_date && {expiration_date: new Date(expiration_date)}),
            ...(production_date && {production_date: new Date(production_date)}),
        };
        const productUpdated = await productsModel.updateProduct(String(id_product!), productConverted);
        if (productUpdated === undefined) {
            return res.status(403).json({error: true, message: "error interno al actualizar producto"});
        }
        return res.status(200).json({message: "producto actualizado recientamente"});
    });
    static delete = errorHandler(async(req: Request, res: Response) => {
        const {id_product} = req.params;
        if (id_product === undefined || !String(id_product!)) {
            return res.status(402).json({error: true, message: "identificacion no valida del producto, intentelo denuevo"});
        }
        const productDeleted = await productsModel.deleteProduct(String(id_product!));
        if (productDeleted === undefined) {
            return res.status(403).json({error: true, message: "error interno al eliminar producto"});
        }
        return res.status(200).json({message: "producto eliminado correctamente"});
    });
    static getAllerts = errorHandler(async (req: Request, res: Response) => {
        const allerts = await productsModel.getAllertProductStock();
        const allertsExpiration = await productsModel.getExpirationProducts();
        if (allerts === undefined) {
            return res.status(403).json({error: true, message: "error interno al obtener alertas"});
        }
        if (allertsExpiration === undefined) {
            return res.status(403).json({error: true, message: "error interno al obtener alertas de expiracion"});
        }
        return res.status(200).json({data: {
            allerts,
            allertsExpiration,
        }});
    });
}

export default ProductsController;
```

**Archivo: backend/src/controller/sells.controller.ts**

```typescript
// README.md | [24]
import sellService from "@/service/sell.service.js";
import sellsModel from "@/model/sells.model.js";
import { errorHandler } from "@/middleware/errorHandler.js";
import type { Request, Response } from "express";
import type { SaleRequest } from "@/types/bd.types.js";

class SellsController {
    static getAll = errorHandler(async(req: Request, res: Response) => {
        const results = await sellsModel.getSells();
        if (results === undefined) {
            return res.status(402).json({error: true, message: "error interno al obtener ventas"});
        }
        return res.status(200).json({data: results});
    });
    static get = errorHandler(async(req: Request, res: Response) => {
        const {id_sell} = req.params;
        if (!String(id_sell!) || id_sell === undefined){
            return res.status(402).json({error: true, message: "identificacion de la venta no valido, intentelo denuevo"});
        }
        const results = await sellsModel.getSellById(String(id_sell!));
        if (results === undefined) {
            return res.status(403).json({error: true, message: "error interno al obtener venta"});
        }
        return res.status(200).json({data: results});
    });
    static process = errorHandler(async(req: Request, res: Response) => {
        const {...restOfBody} = req.body;
        const {userId} = req.user!;
        if (userId === undefined || !String(userId)) {
            return res.status(422).json({error: true, message: "no se encontro identificacion del usuario, logeese primero"});
        }
        if (restOfBody.id_client === undefined || !String(restOfBody.id_client)) {
            return res.status(402).json({error: true, message: "se requiere identificacion del cliente, intentelo denuevo"});
        }
        if (Object.keys(restOfBody).length <= 0) {
            return res.status(403).json({error: true, message: "se necesitan datos para procesar venta"});
        }
        const requestConverted: SaleRequest = {
            ...restOfBody,
        };
        const result = await sellService.processRequest(String(userId!), requestConverted);
        if (result.error){
            return res.status(402).json({error: true, message: result.errors.join(' | '),});
        }
        return res.status(200).json({message: "venta realizada con exito"});
    });
    static cancelSell = errorHandler(async(req: Request, res: Response) => {
        const {id_sell} = req.params;
        if (!String(id_sell!) || id_sell === undefined) {
            return res.status(403).json({error: true, message: "se necesita identificacion de la venta"});
        }
        const sellCancell = await sellService.cancelSell(String(id_sell!));
        if (sellCancell === undefined) {
            return res.status(402).json({error: true, message: "error al cancelar venta"});
        }
        return res.status(200).json({message: "venta anulada con exito"});
    });
    static complete = errorHandler(async (req: Request, res: Response) => {
        const {id_sell} = req.params;
        if (!String(id_sell!) || id_sell === undefined) {
            return res.status(403).json({error: true, message: "se necesita identificacion de la venta"});
        }
        const sellCompleted = await sellService.completeSell(String(id_sell!));
        if (sellCompleted === undefined) {
            return res.status(402).json({error: true, message: "error al completar venta"});
        }
        return res.status(200).json({message: "venta completada correctamente"});
    });
}

export default SellsController;
```

**Archivo: backend/src/controller/user.controller.ts**

```typescript
// README.md | [14]
import type { Request, Response } from "express";
import { errorHandler } from "@/middleware/errorHandler.js";
import usersModel from "@/model/users.model.js";
import authModel from "@/model/auth.model.js";
import bcrypt from 'bcrypt'
import "dotenv/config";
import type { CreateUser, UpdateUser } from "@/types/bd.types.js";

class UserController {
    static getAll = errorHandler(async(req: Request, res: Response) => {
        const users = await usersModel.getAll();
        if (users === undefined) {
            return res.status(400).json({error: true, message: "error interno al obtener los usuarios"})
        }
        return res.status(200).json({data: users})
    });
    static getUser = errorHandler(async(req: Request, res: Response) => {
        const {id_user} = req.params;
        if (!String(id_user)) {
            return res.status(400).json({error: true, message: "se requiere id del usuario"});
        }
        const userFound = await usersModel.findById(String(id_user));
        if (userFound === undefined) {
            return res.status(400).json({error: true, message: "error interno al obtener usuario"})
        }
        return res.status(200).json({data: userFound});
    });
    static createUser = errorHandler(async(req: Request, res: Response) => {
        const {...restOFBody} = req.body;
        if (!String(restOFBody.name)){
            return res.status(400).json({error: true, message: "se requiere el nombre del usuario para crearlo"});
        }
        if (!String(restOFBody.email)){
            return res.status(400).json({error: true, message: "se requiere el email del usuario para crearlo"});
        }
        if (String(restOFBody.email)){
            const verifyUser = await authModel.getUserByEmail(String(restOFBody.email));
            if (verifyUser) {
                return res.status(402).json({error: true, message: "ya existe un usuario con el mismo email"});
            }
        }
        const passwordHashed = await bcrypt.hash(restOFBody.password, Number(process.env.HASH_SALTS!));
        const userConverted: CreateUser = {
            ...restOFBody,
            password: passwordHashed
        };
        const userCreated = await usersModel.createUser(userConverted);
        if (!userCreated || userCreated === undefined){
            return res.status(402).json({error: true, message: "error interno al crear usuario"});
        }
        return res.status(200).json({message: "usuario creado correctamente"});
    });
    static updateUser = errorHandler(async(req: Request, res: Response) => {
        const {id_user} = req.params;
        const {password, ...restOfBody} = req.body;
        if (!String(id_user) || id_user === undefined) {
            return res.status(403).json({error: true, message: "se requiere identificacion del usuario"});
        }
        if (!String(restOfBody.email)){
            const checkUserExists = await authModel.getUserByEmail(String(restOfBody.email));
            if (checkUserExists && checkUserExists.id !== String(id_user)) {
                return res.status(403).json({error: true, message: "ya existe un usuario con el mismo email, intentalo denuevo"});
            }
        }
        const userConverted: UpdateUser = {
            ...restOfBody,
            ...(password && {
                password: await bcrypt.hash(String(password), Number(process.env.HASH_SALTS!))
            }),
        };
        const userUpdated = await usersModel.updateUser(String(id_user)!, userConverted);
        if (!userUpdated || userUpdated === undefined) {
            return res.status(403).json({error: true, message: "error interno al actualizar usuario"});
        }
        return res.status(200).json({message: "usuario actualizado correctamente"});
    });
}

export default UserController;
```

---

#### Subcarpeta: backend/src/lib/

**Archivo: backend/src/lib/connection.ts**

```typescript
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config'

// ver README.MD 10 - 30
const prismaGlobalVariable = globalThis as unknown as {
    prisma: PrismaClient | undefined;
    pool: Pool | undefined;
}

const connection_str = process.env.NODE_ENV === "dev"
    ? process.env.LOCAL_DATABASE_URL! : process.env.DATABASE_URL!;

const connectionPool = prismaGlobalVariable.pool ?? new Pool({
    connectionString: connection_str,
    ssl: process.env.NODE_ENV === "dev" ? { rejectUnauthorized: false } : true
});

const adapter = new PrismaPg(connectionPool);

const prismaInstance = prismaGlobalVariable.prisma ?? new PrismaClient({
    adapter: adapter,
    log: ['query', 'info', 'warn', 'error'],
});

if (process.env.NODE_ENV === "dev") {
    prismaGlobalVariable.pool = connectionPool;
    prismaGlobalVariable.prisma = prismaInstance;
}

export default prismaInstance;
```

---

#### Subcarpeta: backend/src/middleware/

**Archivo: backend/src/middleware/auth.middleware.ts**

```typescript
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import "dotenv/config"
import type { JwtPayload } from '@/types/bd.types.js';
import { errorHandler } from '@middleware/errorHandler.js';
// README.md | [4]
export const authMiddleware = errorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization!;
    if (!authHeader?.startsWith("Bearer ")) {
        res.status(401).json({ error: true, message: "se requiere token para iniciar sesion" })
    }
    const token = authHeader.split(" ")[1]!;
    console.log(`token: ${token}`)
    const payload = jwt.verify(
        token,
        process.env.SESSION_SECRET!,
    ) as unknown as JwtPayload;
    req.user = payload;
    next();
});
```

**Archivo: backend/src/middleware/errorHandler.ts**

```typescript
import type { Request, Response, NextFunction } from "express";
// README.md | [6]
export const errorHandler = (fn: Function) => (
    req: Request, res: Response, next: NextFunction
) => {
    Promise.resolve(fn(req, res, next)).catch(next);
}
```

**Archivo: backend/src/middleware/role.middleware.ts**

```typescript
// README.md | [5]
import type { Request, Response, NextFunction } from "express";
import type { Rol } from "@/types/bd.types.js";

export const roleMiddleware = (...roles: Rol[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const userRol = req.user?.rol;
        if (!userRol || !roles.includes(userRol)) {
            return res.status(401).json({error: true, message: "no tienes permisos para realizar esta accion"})
        }
        next();
    }
}
```

---

#### Subcarpeta: backend/src/model/

**Archivo: backend/src/model/auth.model.ts**

```typescript
import prismaInstance from "@/lib/connection.js";

// README.md | [8]

class AuthModel {
    getUserByEmail = async (email: string) => {
        return await prismaInstance.users.findUnique({
            where: {
                email: email,
            },
            select: {
                id: true,
                name: true,
                email: true,
                typeUser: true,
                password: true,
            }
        });
    };
}

export default new AuthModel();
```

**Archivo: backend/src/model/clients.model.ts**

```typescript
// README.md | [16]
import prismaInstance from "@/lib/connection.js";
import type { CreateClient, UpdateClient } from "@/types/bd.types.js";

class ClientsModel {
    getClients = async () => {
        return await prismaInstance.clients.findMany({
            orderBy:{
                createdAt: 'asc',
            },
        });
    };
    getClient = async (id: string) => {
        return await prismaInstance.clients.findFirst({
            where: {
                id: id,
            },
            orderBy: {
                createdAt: 'asc'
            },
        });
    };
    createClient = async (client: CreateClient) => {
        return await prismaInstance.clients.create({
            data: client,
            select:{ 
                id: true,
            },
        });
    };
    updateClient = async (id: string, client: UpdateClient) => {
        return await prismaInstance.clients.update({
            where: {
                id: id,
            },
            data: client,
            select: {
                id: true,
            },
        });
    };
    getClientForValidation = async (term: string) => {
        return prismaInstance.clients.findMany({
            where: {
                OR: [
                    {email: {contains: term, mode: 'insensitive'}},
                    {dni: {contains: term, mode: 'insensitive'}},
                    {ruc: {contains: term, mode: 'insensitive'}},
                ],
            },
            select: {
                id: true,
            },
        });
    };
}

export default new ClientsModel();
```

**Archivo: backend/src/model/dashboard.model.ts**

```typescript
// README.md | [26]
import prismaInstance from "@/lib/connection.js";

class DashboardModel {
    getSellsByFilter = async (limit: number = 5) => {
        return await prismaInstance.sells.findMany({
            where: {
                sellStatus: "CANCELADO",
            },
            orderBy: {
                createdAt: "asc",
            },
            take: limit,
            include:{
                client: {
                    select: {name: true, dni: true,},
                },
                sellDetails: true,
            },
        });
    };
    getDashboardStats = async () => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const startOfYear = new Date(`${currentYear}-01-01T00:00:00.000Z`);
        const sellsOfThisYear = await prismaInstance.sells.findMany({
            where: {
                sellStatus: 'CANCELADO',
                createdAt: {
                    gte: startOfYear,
                },
            },
            select: {
                total: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: "asc",
            },
        });
        const startOfToday = new Date(now.setHours(0, 0, 0, 0));
        const startWeek = new Date(now);
        const day = startWeek.getDay();
        const diff = startWeek.getDate() - day + (day === 0 ? -6 : 1);
        startWeek.setDate(diff);
        startWeek.setHours(0, 0, 0, 0);

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        let totalToday = 0;
        let totalWeek = 0;
        let totalMonth = 0;
        
        sellsOfThisYear.forEach(sale => {
            const saleDate = new Date(sale.createdAt);
            const saleTotal = Number(sale.total);

            if (saleDate >= startOfToday) totalToday += saleTotal;
            if (saleDate >= startWeek) totalWeek += saleTotal;
            if (saleDate >= startOfMonth) totalMonth += saleTotal;
        });
        const monthlyGraphData = Array.from({length: 12}, (_, i) => ({
            name: new Date(currentYear, i).toLocaleString('es-ES', {month: 'short'}),
            ganancias: 0,
        }));
        sellsOfThisYear.forEach(sale => {
            const monthIndex = new Date(sale.createdAt).getMonth();
            monthlyGraphData[monthIndex]!.ganancias += Number(sale.total);
        });

        return {
            cards: {
                today: totalToday,
                week: totalWeek,
                month: totalMonth,
                year: sellsOfThisYear.reduce((acc, si) => acc + Number(si.total), 0),
            },
            chart: monthlyGraphData,
        };
    };
}

export default new DashboardModel();
```

**Archivo: backend/src/model/products.model.ts**

```typescript
// README.md | [19]
import prismaInstance from "@/lib/connection.js";
import type { CreateProduct, UpdateProduct } from "@/types/bd.types.js";

class ProductsModel {
    getProducts = async (term?: string) => { 
        return await prismaInstance.products.findMany({
            where: {
                active: true,
                ...(term && {
                    OR: [
                        {bars_code: {contains: term, mode: 'insensitive'}},
                        {lote: {contains: term, mode: 'insensitive'}},
                    ]
                }),
            },
            orderBy: {
                createdAt: 'asc',
            },
        })
    };
    getProduct = async (id: string) => {
        return await prismaInstance.products.findFirst({
            where: {
                id: id,
            },
            orderBy: {
                createdAt: 'asc',
            },
        });
    };
    createProduct = async (product: CreateProduct) => {
        return await prismaInstance.products.create({
            data: product,
            select: {
                id: true,
            },
        });
    };
    updateProduct = async (id: string, product: UpdateProduct) => {
        return await prismaInstance.products.update({
            where: {
                id: id,
            },
            data: product,
            select: {
                id: true,
            },
        });
    };
    deleteProduct = async (id: string) => {
        return await prismaInstance.products.update({
            where: {
                id: id,
            },
            data: {
                active: false,
            },
            select: {
                id: true,
            },
        });
    };
    getAllertProductStock = async () => {
        const results = await prismaInstance.products.findMany({
            where: {
                active: true,
            },
            select: {
                id: true,
                name: true,
                current_stock: true,
                alert_stock: true,
            },
            orderBy: {
                id: 'asc',
            },
        });
        return results.filter((p) => p.alert_stock >= p.current_stock);
    };
    getExpirationProducts = async () => {
        const results = await prismaInstance.products.findMany({
            where: {
                active: true,
            },
            select: {
                id: true,
                name: true,
                expiration_date: true,
                production_date: true,
            },
            orderBy: {
                id: 'asc',
            },
        });
        return results.filter((p) => p.expiration_date! >= p.production_date!)
    }
}

export default new ProductsModel();
```

**Archivo: backend/src/model/sells.model.ts**

```typescript
// README.md | [23]
import prismaInstance from "@/lib/connection.js";

class SellsModel {
    getSells = async () => {
        return await prismaInstance.sells.findMany({
            orderBy: {
                createdAt: 'asc',
            },
            include: {
                user: {
                    select: {name: true, email: true,},
                },
                client: {
                    select: {name: true, dni: true, ruc: true,}
                },
                voucherType: true,
                sellDetails:{
                    select: {
                        product: {select: {name: true, bars_code: true,}}
                    },
                },
            },
        });
    };
    getSellById = async (id: string) => {
        return await prismaInstance.sells.findFirst({
            where: {
                id: id,
            },
            include: {
                user: {
                    select: {name: true, email: true,},
                },
                client: {
                    select: {name: true, dni: true, ruc: true,}
                },
                voucherType: true,
                sellDetails:{
                    select: {
                        product: {select: {name: true, bars_code: true,}}
                    },
                },
            },
        });
    };
}

export default new SellsModel();
```

**Archivo: backend/src/model/users.model.ts**

```typescript
// README.md | [13]
import prismaInstance from "@/lib/connection.js";
import type { CreateUser, UpdateUser } from "@/types/bd.types.js";

class UserModel {
    getAll = async () => {
        return await prismaInstance.users.findMany({
            orderBy: {
                createdAt: 'asc',
            },
            select: {
                id: true,
                name: true,
                email: true,
                typeUser: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    };
    findById = async (id: string) => {
        return await prismaInstance.users.findFirst({
            where: {
                id: id,
            },
            orderBy: {
                createdAt: 'asc',
            },
            select: {
                id: true,
                name: true,
                email: true,
                typeUser: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    };
    createUser = async (user: CreateUser) => {
        return await prismaInstance.users.create({
            data: user,
            select: {
                id: true,
            },
        });
    };
    updateUser = async (id: string, user: UpdateUser) => {
        return await prismaInstance.users.update({
            where: {
                id: id,
            },
            data: user,
            select: {
                id: true,
            },
        });
    };

}

export default new UserModel();
```

---

#### Subcarpeta: backend/src/routes/

**Archivo: backend/src/routes/auth.routes.ts**

```typescript
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
```

**Archivo: backend/src/routes/client.routes.ts**

```typescript
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
```

**Archivo: backend/src/routes/dashboard.routes.ts**

```typescript
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
```

**Archivo: backend/src/routes/index.routes.ts**

```typescript
// README.MD | [11]
import { Router } from "express";
import authRoutes from "@routes/auth.routes.js";
import userRoutes from "@routes/user.routes.js";
import clientRoutes from "@routes/client.routes.js";
import productRoutes from "@routes/product.routes.js";
import sellsRoutes from "@routes/sells.routes.js";
import dashboardRoutes from "@routes/dashboard.routes.js";

const router: Router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/clients', clientRoutes);
router.use('/products', productRoutes);
router.use('/sells', sellsRoutes);
router.use('/dashboard', dashboardRoutes);

export {router};
```

**Archivo: backend/src/routes/product.routes.ts**

```typescript
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
```

**Archivo: backend/src/routes/sells.routes.ts**

```typescript
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
```

**Archivo: backend/src/routes/user.routes.ts**

```typescript
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
        this.router.get('/', roleMiddleware("ADMIN"), UserController.getAll);
        this.router.get('/:id_user', roleMiddleware("ADMIN"), UserController.getUser);
        this.router.post('/user', roleMiddleware("ADMIN"), UserController.createUser);
        this.router.post('/user/:id_user', roleMiddleware("ADMIN"), UserController.updateUser);
    }
}

export default new UserRoutes().router;
```

---

#### Subcarpeta: backend/src/service/

**Archivo: backend/src/service/sell.service.ts**

```typescript
// README.md | [22]
import prismaInstance from "@/lib/connection.js";
import type { SaleRequest } from "@/types/bd.types.js";

class SellService {
    processRequest = async (userId: string, request: SaleRequest) => {
        let errors:string[] = [];
        const { id_client, voucherType, products} = request;
        const productsId = products.map((p) => p.id_product);
        const productsDB = await prismaInstance.products.findMany({
            where: {
                id: {
                    in: productsId,
                },
                active: true,
            },
        });
        if (productsDB.length < products.length) {
            errors.push("uno o mas productos no han sido encontrados o no existen");
        }
        let grandTotal = 0;
        const detailsToCreate = products.map((p) => {
            const product = productsDB.find((pt) => pt.id === p.id_product);
            if (!product) {
                errors.push(`El producto con ID ${p.id_product} no existe en la base de datos.`);
                return null;
            }
            if (product.current_stock < p.quantity) {
                errors.push(`Stock insuficiente para ${product.name}. Disponible: ${product.current_stock}, Solicitado: ${p.quantity}`);
            }
            const minor_or_wholesale = p.quantity >= product.limit_minor_adquirition 
                ? product.wholesale_price : product.minor_price;
            const subTotal = Number(minor_or_wholesale) * p.quantity;
            grandTotal += subTotal;

            return {
                total: p.quantity,
                sub_total: subTotal,
                original_price: Number(minor_or_wholesale),
                product: { connect: { id: p.id_product } }
            };
        });
        if (errors.length > 0) {
            return {error: true, errors};
        }
        const creatingDetails = await prismaInstance.$transaction(async(tx) => {
            const newSale = await tx.sells.create({
                data: {
                    id_user: userId,
                    id_client: id_client,
                    voucherType: voucherType,
                    total: grandTotal,
                    sellDetails: {
                        create: detailsToCreate.filter(Boolean) as any,
                    },
                },
                include: {
                    sellDetails: true,
                },
            });
            for (const item of products){
                await tx.products.update({
                    where: {
                        id: item.id_product,
                    },
                    data: {
                        current_stock: {
                            decrement: item.quantity,
                        },
                    },
                });
            };
            return newSale;
        });
        return {data: creatingDetails};
    };
    cancelSell = async (id: string) => {
        let errors: string[] = [];
        const gettingSellsAndDetails = await prismaInstance.sells.findFirst({
            where: {
                id: id,
            },
            include: {
                sellDetails: true,
            }
        });
        if (gettingSellsAndDetails === undefined || !gettingSellsAndDetails){
            errors.push(`error al encontrar venta N°${id}`);
            return null;
        }
        if (gettingSellsAndDetails.sellStatus === "ANULADO") {
            errors.push(`la venta N°${id} se encuentró anulada`);
        }
        if (errors.length > 0) {
            return {error: true, errors};
        }
        const resulsts = await prismaInstance.$transaction(async (tx) => {
            const updatedSale = await tx.sells.update({
                where: {
                    id: id,
                },
                data: {sellStatus: "ANULADO"},
            });
            for (const item of gettingSellsAndDetails.sellDetails){
                await tx.products.update({
                    where: { id: item.id_product, },
                    data: {
                        current_stock: {
                            increment: item.total,
                        },
                    },
                });
            }
            return updatedSale;
        });
        return {data: resulsts};
    };
    completeSell = async (id: string) => {
        let errors: string[] = [];
        const gettingSellsAndDetails = await prismaInstance.sells.findFirst({
            where: {
                id: id,
            },
            include: {
                sellDetails: true,
            }
        });
        if (gettingSellsAndDetails === undefined || !gettingSellsAndDetails){
            errors.push(`error al encontrar venta N°${id}`);
            return null;
        }
        if (gettingSellsAndDetails.sellStatus === "CANCELADO") {
            errors.push(`la venta N°${id} ya habia sido cancelada`);
        }
        if (errors.length > 0) {
            return {error: true, errors};
        }
        const updated = await prismaInstance.sells.update({
            where: {
                id: id,
                // 💡 CLAVE: Solo se actualizará si NO estaba cancelada ni anulada previamente (para README)
                NOT: {
                    sellStatus: { in: ["CANCELADO", "ANULADO"] }
                }
            },
            data: { sellStatus: "CANCELADO" },
        });
        return {data: updated};
    };
}

export default new SellService();
```

---

#### Subcarpeta: backend/src/types/

**Archivo: backend/src/types/bd.types.ts**

```typescript
// README.MD | [3]
export interface JwtPayload {
    userId: string;
    rol: 'ADMIN' | 'VENDEDOR';
}
export type Rol = 'ADMIN' | 'VENDEDOR';
export interface CreateUser {
    name: string;
    email: string;
    password: string;
    typeUser: Rol;
}

export interface UpdateUser {
    name?: string;
    email?: string;
    password?: string;
    typeUser?: Rol;
}

export interface CreateClient {
    name: string;
    email: string;
    dni: string;
    ruc: string;
}

export interface UpdateClient {
    name?: string;
    email?: string;
    dni?: string;
    ruc?: string;
}

export interface CreateProduct {
    name: string;
    bars_code?: string;
    lote?: string;
    category: 'ABARROTES' | 'PERECEDEROS' 
    | 'LACTEOS' | 'LIMPIEZA' 
    | 'CUIDADO_PERSONAL' 
    | 'BEBIDAS';
    price_adquired: number;
    minor_price: number;
    wholesale_price: number;
    limit_minor_adquirition: number;
    revenue_margin: number;
    current_stock: number;
    alert_stock: number;
    expiration_date?: Date;
    production_date?: Date;
}

export interface UpdateProduct {
    name?: string;
    bars_code?: string;
    lote?: string;
    category?: 'ABARROTES' | 'PERECEDEROS' 
    | 'LACTEOS' | 'LIMPIEZA' 
    | 'CUIDADO_PERSONAL' 
    | 'BEBIDAS';
    price_adquired?: number;
    minor_price?: number;
    wholesale_price?: number;
    limit_minor_adquirition?: number;
    revenue_margin?: number;
    current_stock?: number;
    alert_stock?: number;
    expiration_date?: Date;
    production_date?: Date;
}

export interface SaleRequest {
    id_client: string;
    voucherType: 'BOLETA' | 'FACTURA';
    products: Array<{
        id_product: string;
        quantity: number;
    }> 
}
```

**Archivo: backend/src/types/express.d.ts**

```typescript
// README.MD | [7]
import type { JwtPayload } from "@types/bd.types.ts";

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}
```

---

## ENTORNO FRONTEND

### Archivos de Configuración Frontend

- **frontend/.env**
- **frontend/.env.example**
- **frontend/eslint.config.js**
- **frontend/index.html**
- **frontend/package.json**
- **frontend/pnpm-lock.yaml**
- **frontend/README.md**
- **frontend/tsconfig.app.json**
- **frontend/tsconfig.json**
- **frontend/tsconfig.node.json**
- **frontend/vite.config.ts**

### Carpeta: frontend/src/

#### Estructura de frontend/src/

- **frontend/src/api/** (Contiene)
  - api.axios.ts
- **frontend/src/app/** (Contiene)
  - components/
  - layout/
  - pages/
  - routes/
- **frontend/src/assets/** (Carpeta)
- **frontend/src/context/** (Carpeta)
- **frontend/src/store/** (Carpeta)
- **frontend/src/types/** (Carpeta)
- **frontend/src/App.tsx** (Archivo)
- **frontend/src/index.css** (Archivo)
- **frontend/src/main.tsx** (Archivo)

### Carpeta: frontend/public/

- *(Carpeta vacía o sin contenido listado)*

---

## NOTA: node_modules

- **Carpeta:** `node_modules/`
- **Contenido:** No listado (contiene dependencias de npm/pnpm)
