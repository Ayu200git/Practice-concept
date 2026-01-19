import express from "express";
import { createSubAdmin, adminCreateUser, toggleSubAdminPermission, listUsers, getStats } from "../controllers/adminController.js";
import { authenticateJWT, authorizeRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticateJWT, authorizeRole(['ADMIN', 'SUB_ADMIN']));

router.get("/users", listUsers);
router.get("/stats", getStats);

router.post("/create-sub-admin", authorizeRole(['ADMIN']), createSubAdmin);
router.post("/create-user", adminCreateUser);
router.patch("/allow-subadmin-user-creation", authorizeRole(['ADMIN']), toggleSubAdminPermission);

export default router;
