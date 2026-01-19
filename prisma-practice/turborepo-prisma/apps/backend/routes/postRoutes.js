import express from "express";
import { prisma } from "../db.js";
import { authenticateJWT } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create-post", authenticateJWT, async (req, res) => {
    try {
        const { title, content } = req.body;
        console.log("req.user in create-post:", req.user); // Debug log

        // Handle different possible JWT structures
        const userId = req.user.userId || req.user.id || req.user.sub;
        console.log("Resolved userId:", userId); // Debug log

        if (!userId) {
            return res.status(400).json({ error: "User ID not found in token" });
        }

        const post = await prisma.post.create({
            data: {
                title,
                content,
                userId: parseInt(userId), // Ensure it's a number
            }
        });
        res.json(post);
    } catch (err) {
        console.error("Post creation error:", err); // Better error logging
        res.status(500).json({
            error: err.message
        });
    }
});



router.get("/", authenticateJWT, async (req, res) => {
    try {
        const posts = await prisma.post.findMany({
            where: {
                userId: req.user.userId,
            },
            include: {
                user: {
                    select: { name: true, role: true }
                }
            }
        });
        res.json(posts);
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

// Get all posts for the "All Posts" feed
router.get("/all", authenticateJWT, async (req, res) => {
    try {
        const posts = await prisma.post.findMany({
            include: {
                user: {
                    select: { name: true, role: true }
                }
            },
            orderBy: {
                id: 'desc'
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