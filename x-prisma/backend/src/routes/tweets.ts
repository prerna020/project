import { PrismaClient } from "../../generated/prisma/client.js"
import { Router, type Request, type Response } from "express";
import dotenv from "dotenv";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

dotenv.config();


const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter })

const router = Router();


router.post("/", async (req: Request, res: Response) => {
    const { content, authorId } = req.body

    if (!content || !authorId) {
        return res.status(400).json({ error: "content and authorId are required" })
    }
    if (content.length > 280) {
        return res.status(400).json({ error: "Tweet exceeds 280 characters" })
    }

    try {
        const tweet = await prisma.tweet.create({
            data: { content, authorId },
        });
        return res.status(201).json(tweet);
    } catch (error: any) {
        // P2003 = foreign key constraint failed (authorId doesn't exist)
        if (error.code === "P2003") {
            return res.status(400).json({ error: "Author user not found" })
        }
        return res.status(500).json({ error: "Internal server error" })
    }
})

router.get("/", async (req: Request, res: Response) => {
    const { authorId, search } = req.query;

    const tweets = await prisma.tweet.findMany({
        where: {
            ...(authorId && { authorId: String(authorId) }),
            ...(search && {
                content: { contains: String(search), mode: "insensitive" },
            }),
        },
        orderBy: { createdAt: "desc" },
        take: 20,
    })
    return res.json(tweets);
})

router.get("/:id", async (req: Request, res: Response) => {
    const tweet = await prisma.tweet.findUnique({
        where: { id: req.params.id as string},
    })

    if (!tweet) return res.status(404).json({ error: "Tweet not found" })
    return res.json(tweet)
});

router.delete("/:id", async (req: Request, res: Response) => {
    try {
        await prisma.tweet.delete({ where: { id: req.params.id as string} });
        return res.status(204).send();
    } catch (error: any) {
        if (error.code === "P2025") {
            return res.status(404).json({ error: "Tweet not found" });
        }
        return res.status(500).json({ error: "Internal server error" });
    }
});



export default router;
