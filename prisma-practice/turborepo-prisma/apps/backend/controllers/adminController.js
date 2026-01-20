import bcrypt from "bcrypt";
import { prisma } from "../db.js";

// Admin
export const createSubAdmin = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const subAdmin = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: 'SUB_ADMIN'
            }
        });

        res.status(201).json({ message: "Sub-Admin created by Admin", subAdmin: { id: subAdmin.id, email: subAdmin.email } });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Toggle permission
export const toggleSubAdminPermission = async (req, res) => {
    try {
        const { subAdminId, permissionName, isEnabled } = req.body;

        const permission = await prisma.permission.upsert({
            where: { name: permissionName },
            update: {},
            create: { name: permissionName }
        });

        const updatedUser = await prisma.user.update({
            where: { id: Number(subAdminId) },
            data: {
                permissions: isEnabled
                    ? { connect: { id: permission.id } }
                    : { disconnect: { id: permission.id } }
            },
            include: { permissions: true }
        });

        res.json({
            message: `Permission [${permissionName}] ${isEnabled ? 'granted to' : 'revoked from'} Sub-Admin ID ${subAdminId}`,
            currentPermissions: updatedUser.permissions.map(p => p.name)
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

//create user
export const adminCreateUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: 'USER'
            }
        });

        res.status(201).json({ message: "User created by Admin", user: { id: user.id, email: user.email } });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const subAdminCreateUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: 'USER'
            }
        });

        res.status(201).json({ message: "User created by Sub-Admin", user: { id: user.id, email: user.email } });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const listUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            include: {
                permissions: true
            }
        });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getStats = async (req, res) => {
    try {
        const [userCount, postCount] = await Promise.all([
            prisma.user.count(),
            prisma.post.count()
        ]);
        res.json({
            totalUsers: userCount,
            totalPosts: postCount
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const removeSubAdmin = async (req, res) => {
    try {
        const { subAdminId } = req.body;

        const subAdmin = await prisma.user.findUnique({
            where: { id: subAdminId },
            include: { posts: true }
        });

        if (!subAdmin) return res.status(404).json({ error: 'Sub-admin not found' });
        if (subAdmin.role !== 'SUB_ADMIN') return res.status(400).json({ error: 'User is not a sub-admin' });

        if (subAdmin.posts.length > 0) {
            await prisma.user.update({
                where: { id: subAdminId },
                data: { role: 'USER', permissions: { set: [] } }
            });
            res.json({ message: 'Sub-admin demoted to user', action: 'demoted' });
        } else {
            await prisma.user.delete({ where: { id: subAdminId } });
            res.json({ message: 'Sub-admin removed', action: 'deleted' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { name, email, role } = req.body;

        const updatedUser = await prisma.user.update({
            where: { id: Number(userId) },
            data: {
                ...(name && { name }),
                ...(email && { email }),
                ...(role && { role })
            },
            include: { permissions: true }
        });

        res.json({
            message: 'User updated successfully',
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                permissions: updatedUser.permissions.map(p => p.name)
            }
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        // Check if user exists and get their posts
        const user = await prisma.user.findUnique({
            where: { id: Number(userId) },
            include: { posts: true }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Prevent deleting ADMIN users
        if (user.role === 'ADMIN') {
            return res.status(403).json({ error: 'Cannot delete admin users' });
        }

        // Delete user (cascade will handle related data based on schema)
        await prisma.user.delete({
            where: { id: Number(userId) }
        });

        res.json({
            message: 'User deleted successfully',
            deletedUser: {
                id: user.id,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
