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