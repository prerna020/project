import { PrismaClient } from "../../generated/prisma/client.js"

import { Router, type Request, type Response } from "express";
import dotenv from "dotenv";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const router = Router();

router.post("/", async (req: Request, res: Response) => {
    const { email, username, name, bio } = req.body;
    if (!email || !username) {
        return res.status(400).json({ error: "email and username are required" });
    }

    try {
        const user = await prisma.user.create({
            data: {
                email,
                username,
                name,
                bio,
            },
        });
        return res.status(201).json(user);
    } catch (error: any) {
        // P2002 = unique constraint violation (email or username already exists)
        if (error.code === "P2002") {
            return res.status(409).json({
                error: `${error.meta?.target} already taken`,
            });
        }
        return res.status(500).json({ error: "Internal server error" });
    }
});
