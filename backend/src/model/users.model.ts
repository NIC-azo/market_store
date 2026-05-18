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