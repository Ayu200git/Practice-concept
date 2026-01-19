import express from "express";
import { subAdminCreateUser } from "../controllers/adminController.js";
import { authenticateJWT, authorizeRole, hasPermission } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create-user",
    authenticateJWT,
    authorizeRole(['SUB_ADMIN']),
    hasPermission('CREATE_USER'),
    subAdminCreateUser
);

export default router;
