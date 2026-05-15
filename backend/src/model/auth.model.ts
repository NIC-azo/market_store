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
                password: true,
            }
        });
    };
}