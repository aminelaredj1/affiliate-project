import { PrismaClient } from "@prisma/client";
console.log(Object.keys(new PrismaClient({ adapter: null })));
