import express from "express";
import { prisma } from "../db.js";
import { authMiddleware } from "../authMiddleware.js";

const router = express.Router();

router.post("/create-post", authMiddleware, async (req, res) => {
    try {
        const { title, content } = req.body;
        const post = await prisma.post.create({
            data: {
                title,
                content,
                userId: req.userId,
            }
        });
        res.json(post);
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});


router.get("/posts", authMiddleware, async (req, res) => {
    try {
        const posts = await prisma.post.findMany({
            where: {
                userId: req.userId,
            }
        });
        res.json(posts);
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

export default router;