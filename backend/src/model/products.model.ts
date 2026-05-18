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