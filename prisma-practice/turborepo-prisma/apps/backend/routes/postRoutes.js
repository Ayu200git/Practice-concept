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
                userId: Number(userId),
            },
            include: {
                user: {
                    select: { name: true, role: true }
                }
            }
        });

        // Broadcast real-time update
        req.io.emit('postCreated', post);

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
        const userId = req.user.userId || req.user.id || req.user.sub;
        const posts = await prisma.post.findMany({
            where: {
                userId: Number(userId),
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

// Update a post 
router.put("/:id", authenticateJWT, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;
        const userId = req.user.userId || req.user.id || req.user.sub;
        console.log(`[PostUpdateAuthorization] PostID: ${id}, ReqUser:`, req.user);

        const post = await prisma.post.findUnique({ where: { id: Number(id) } });
        if (!post) return res.status(404).json({ error: "Post not found" });

        let isAuthorized = false;
        if (req.user.role === 'ADMIN') {
            isAuthorized = true;
        } else if (Number(post.userId) === Number(userId)) {
            console.log(`[PostUpdateAuthorization] User is owner`);
            isAuthorized = true;
        } else if (req.user.role === 'SUB_ADMIN') {
            const subAdmin = await prisma.user.findUnique({
                where: { id: Number(userId) },
                include: { permissions: true }
            });
            const hasPerm = subAdmin?.permissions.some(p => p.name === 'UPDATE_POST');
            console.log(`[PostUpdateAuthorization] SubAdmin permissions:`, subAdmin?.permissions.map(p => p.name));
            if (hasPerm) {
                isAuthorized = true;
            }
        }

        console.log(`[PostUpdateAuthorization] Status: ${isAuthorized ? 'AUTHORIZED' : 'FORBIDDEN'}`);
        if (!isAuthorized) {
            return res.status(403).json({ error: "Not authorized to update this post" });
        }

        const updatedPost = await prisma.post.update({
            where: { id: Number(id) },
            data: { title, content },
            include: {
                user: {
                    select: { name: true, role: true }
                }
            }
        });

        // Broadcast real-time update
        req.io.emit('postUpdated', updatedPost);

        res.json(updatedPost);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a post  
router.delete("/:id", authenticateJWT, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId || req.user.id || req.user.sub;
        console.log(`[PostDeleteAuthorization] PostID: ${id}, ReqUser:`, req.user);

        const post = await prisma.post.findUnique({ where: { id: Number(id) } });
        if (!post) return res.status(404).json({ error: "Post not found" });

        let isAuthorized = false;
        if (req.user.role === 'ADMIN') {
            isAuthorized = true;
        } else if (Number(post.userId) === Number(userId)) {
            console.log(`[PostDeleteAuthorization] User is owner`);
            isAuthorized = true;
        } else if (req.user.role === 'SUB_ADMIN') {
            const subAdmin = await prisma.user.findUnique({
                where: { id: Number(userId) },
                include: { permissions: true }
            });
            const hasPerm = subAdmin?.permissions.some(p => p.name === 'DELETE_POST');
            console.log(`[PostDeleteAuthorization] SubAdmin permissions:`, subAdmin?.permissions.map(p => p.name));
            if (hasPerm) {
                isAuthorized = true;
            }
        }

        console.log(`[PostDeleteAuthorization] Status: ${isAuthorized ? 'AUTHORIZED' : 'FORBIDDEN'}`);
        if (!isAuthorized) {
            return res.status(403).json({ error: "Not authorized to delete this post" });
        }

        await prisma.post.delete({ where: { id: Number(id) } });

        // Broadcast real-time update
        req.io.emit('postDeleted', id);

        res.json({ message: "Post deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;