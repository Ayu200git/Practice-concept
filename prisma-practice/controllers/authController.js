import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../db.js";



// Signup  
export const signup = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (role === 'ADMIN') {
            const adminExists = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
            if (adminExists) {
                return res.status(400).json({ error: "An Admin already exists. Only one Admin is allowed." });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || 'USER',
            }
        });

        res.status(201).json({ message: "User created successfully", user: { id: user.id, name: user.name, role: user.role } });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(400).json({ error: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

        const secret = process.env.JWT_SECRET_KEY;
        if (!secret) {
            console.error("CRITICAL ERROR: JWT_SECRET_KEY is missing in .env");
            return res.status(500).json({ error: "Server error: Secret not configured" });
        }

        const token = jwt.sign(
            {
                userId: user.id,
                role: user.role
            },
            secret,
            { expiresIn: '1d' }
        );

        res.json({ message: "Login successful", token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
