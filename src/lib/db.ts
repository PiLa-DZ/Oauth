import env from "./env.schema.js";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client.js";

const adapter = new PrismaMariaDb(env.DATABASE_URL);

const db = new PrismaClient({ adapter });

export default db;
