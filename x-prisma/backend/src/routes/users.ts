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

router.get("/:id/feed", async (req: Request, res: Response) => {
    const { id } = req.params;

    // Step 1: find who this user follows
    // Step 2: fetch recent tweets from those users
    // Prisma lets us do this in ONE query using nested where

    const feed = await prisma.tweet.findMany({
        where: {
            author: {
                followers: {
                    some: {
                        followerId: id as string,
                    },
                },
            },
        },
        include: {
            author: {
                select: { username: true, name: true },
            },
            _count: {
                select: { likes: true },
            },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
    });

    return res.json(feed);
});


router.post("/:id/follow", async (req: Request, res: Response) => {
    const { followerId } = req.body;
    const followingId = req.params.id as string;

    if (followerId === followingId) {
        return res.status(400).json({ error: "Cannot follow yourself" });
    }

    try {
        const follow = await prisma.follow.create({
            data: { followerId, followingId },
        });
        return res.status(201).json(follow);
    } catch (error: any) {
        if (error.code === "P2002") {
            return res.status(409).json({ error: "Already following" });
        }
        if (error.code === "P2003") {
            return res.status(404).json({ error: "User not found" });
        }
        return res.status(500).json({ error: "Internal server error" });
    }
});

// DELETE /users/:id/follow — unfollow
router.delete("/:id/follow", async (req: Request, res: Response) => {
    const { followerId } = req.body;
    const followingId = req.params.id as string;

    try {
        await prisma.follow.delete({
            where: {
                followerId_followingId: { followerId, followingId },
            },
        });
        return res.status(204).send();
    } catch (error: any) {
        if (error.code === "P2025") {
            return res.status(404).json({ error: "Not following this user" });
        }
        return res.status(500).json({ error: "Internal server error" });
    }
});

// GET /users/:id/profile — user + follower counts + recent tweets
router.get("/:id/profile", async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({
        where: { id: req.params.id as string },
        include: {
            _count: {
                select: {
                    tweets: true,
                    followers: true,
                    following: true,
                    likes: true,
                },
            },
            tweets: {
                orderBy: { createdAt: "desc" },
                take: 5,
                include: {
                    _count: { select: { likes: true } },
                    hashtags: true,
                },
            },
        },
    });

    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json(user);
});




export default router;
