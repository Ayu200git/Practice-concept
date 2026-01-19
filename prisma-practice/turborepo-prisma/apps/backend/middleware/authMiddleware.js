import jwt from "jsonwebtoken";
import { prisma } from "../db.js";



// Authenticate JWT 
export const authenticateJWT = (req, res, next) => {
    let token = req.headers.authorization;
    if (!token) return res.status(401).json({ error: "Unauthorized: No token provided" });

    if (token.startsWith("Bearer ")) {
        token = token.split(" ")[1];
    }

    const secret = process.env.JWT_SECRET_KEY;
    if (!secret) {
        console.error("CRITICAL ERROR: JWT_SECRET_KEY is not defined in .env");
        return res.status(500).json({ error: "Internal server error: Auth setup incomplete" });
    }

    try {
        const decoded = jwt.verify(token, secret);
        console.log("Decoded JWT:", decoded); // Debug log
        req.user = decoded;
        next();
    } catch (err) {
        console.log("JWT Verification Failed:", err.message);
        res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
    }
};

// Authorize Role 
export const authorizeRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: "Forbidden: Higher role required" });
        }
        next();
    };
};

// Dynamic Permission Checker 
export const hasPermission = (permissionName) => {
    return async (req, res, next) => {
        try {
            if (req.user.role === 'ADMIN') return next();

            const user = await prisma.user.findUnique({
                where: { id: req.user.userId },
                include: { permissions: true }
            });

            if (!user) return res.status(404).json({ error: "User not found" });

            const hasAccess = user.permissions.some(p => p.name === permissionName);

            if (hasAccess) {
                next();
            } else {
                res.status(403).json({ error: `Forbidden: Missing required permission [${permissionName}]` });
            }
        } catch (err) {
            res.status(500).json({ error: "Internal server error during permission check" });
        }
    };
};
