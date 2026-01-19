import express from "express";
import { createSubAdmin, adminCreateUser, toggleSubAdminPermission } from "../controllers/adminController.js";
import { authenticateJWT, authorizeRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes here require ADMIN role
router.use(authenticateJWT, authorizeRole(['ADMIN']));

router.post("/create-sub-admin", createSubAdmin);
router.post("/create-user", adminCreateUser);
router.patch("/allow-subadmin-user-creation", toggleSubAdminPermission);

export default router;
