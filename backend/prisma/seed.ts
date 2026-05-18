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
