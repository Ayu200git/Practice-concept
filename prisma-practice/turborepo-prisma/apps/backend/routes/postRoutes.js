import express from "express";
import { prisma } from "../db.js";
import { authenticateJWT } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create-post", authenticateJWT, async (req, res) => {
    try {
        const { title, content } = req.body;
        console.log("req.user in create-post:", req.user);

        const userId = req.user.userId || req.user.id || req.user.sub;
        console.log("Resolved userId:", userId);

        if (!userId) {
            return res.status(400).json({ error: "User ID not found in token" });
        }

        const post = await prisma.post.create({
            data: {
                title,
                content,
                userId: parseInt(userId),
            }
        });
        res.json(post);
    } catch (err) {
        console.error("Post creation error:", err);
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

// Get all posts  
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

// Update a post (Admin or post owner)
router.put("/:id", authenticateJWT, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;
        const userId = req.user.userId || req.user.id || req.user.sub;

        // Check if user is admin or post owner
        const post = await prisma.post.findUnique({ where: { id: parseInt(id) } });
        if (!post) return res.status(404).json({ error: "Post not found" });

        if (req.user.role !== 'ADMIN' && post.userId !== parseInt(userId)) {
            return res.status(403).json({ error: "Not authorized to update this post" });
        }

        const updatedPost = await prisma.post.update({
            where: { id: parseInt(id) },
            data: { title, content },
            include: {
                user: {
                    select: { name: true, role: true }
                }
            }
        });
        res.json(updatedPost);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a post (Admin or post owner)
router.delete("/:id", authenticateJWT, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId || req.user.id || req.user.sub;

        // Check if user is admin or post owner
        const post = await prisma.post.findUnique({ where: { id: parseInt(id) } });
        if (!post) return res.status(404).json({ error: "Post not found" });

        if (req.user.role !== 'ADMIN' && post.userId !== parseInt(userId)) {
            return res.status(403).json({ error: "Not authorized to delete this post" });
        }

        await prisma.post.delete({ where: { id: parseInt(id) } });
        res.json({ message: "Post deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;