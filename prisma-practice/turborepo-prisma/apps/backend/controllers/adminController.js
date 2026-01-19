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

// Toggle permission (Industry Grade: Dynamic Link/Unlink)
export const toggleSubAdminPermission = async (req, res) => {
    try {
        const { subAdminId, permissionName, isEnabled } = req.body;

        // 1. Ensure the permission name exists in the database
        const permission = await prisma.permission.upsert({
            where: { name: permissionName },
            update: {},
            create: { name: permissionName }
        });

        // 2. Link or Unlink based on isEnabled
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
