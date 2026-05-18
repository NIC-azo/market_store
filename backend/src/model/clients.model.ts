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