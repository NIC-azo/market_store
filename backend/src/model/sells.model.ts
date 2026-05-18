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