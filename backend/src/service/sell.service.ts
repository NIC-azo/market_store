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