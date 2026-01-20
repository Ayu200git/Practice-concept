import { prisma } from "../db.js";
import bcrypt from "bcrypt";

export const getMe = async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id || req.user.sub;
        const user = await prisma.user.findUnique({
            where: { id: Number(userId) },
            include: { permissions: true }
        });
        if (!user) return res.status(404).json({ error: "User not found" });

        const { password, ...userData } = user;
        res.json(userData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateMe = async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id || req.user.sub;
        const { name, email, password } = req.body;

        const data = {};
        if (name) data.name = name;
        if (password) data.password = await bcrypt.hash(password, 10);

        const updatedUser = await prisma.user.update({
            where: { id: Number(userId) },
            data,
            include: { permissions: true }
        });

        const { password: _, ...userData } = updatedUser;
        res.json({ message: "Profile updated successfully", user: userData });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const deleteMe = async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id || req.user.sub;

        // Don't allow last admin to delete themselves? 
        const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
        if (user.role === 'ADMIN') {
            const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
            if (adminCount <= 1) {
                return res.status(403).json({ error: "Cannot delete the only administrator account." });
            }
        }

        await prisma.user.delete({
            where: { id: Number(userId) }
        });

        res.json({ message: "Account deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
