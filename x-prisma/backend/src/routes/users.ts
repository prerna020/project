import { PrismaClient } from "@prisma/client";

import { Router, type Request, type Response } from "express";
import dotenv from "dotenv";
dotenv.config();
const prisma = new PrismaClient()
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

// GET /users/:username — get a user by username
router.get("/:username", async (req: Request, res: Response) => {
    const { username } = req.params;

    const user = await prisma.user.findUnique({
        where: { username: username as string },
    });

    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    return res.json(user);
});

// PATCH /users/:id — update bio
router.patch("/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    const { bio, name } = req.body;
    const data:any ={}
    if (bio !== undefined) {
        data.bio = bio;
    }

    if (name !== undefined) {
        data.name = name;
    }
    try {
        const user = await prisma.user.update({
            where: { id : id as string },
            data
            // data: {
            //     ...(bio !== undefined && { bio }),
            //     ...(name !== undefined && { name }),
            // },
            
        });
        return res.json(user);
    } catch (error: any) {
        // P2025 = record not found
        if (error.code === "P2025") {
            return res.status(404).json({ error: "User not found" });
        }
        return res.status(500).json({ error: "Internal server error" });
    }
});

// DELETE /users/:id — delete a user (cascades to tweets/likes)
router.delete("/:id", async (req: Request, res: Response) => {
    try {
        await prisma.user.delete({ where: { id: req.params.id as string } });
        return res.status(204).send();
    } catch (error: any) {
        if (error.code === "P2025") {
            return res.status(404).json({ error: "User not found" });
        }
        return res.status(500).json({ error: "Internal server error" });
    }
});

export default router;
