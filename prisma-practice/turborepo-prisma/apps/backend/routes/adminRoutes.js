import express from "express";
import { createSubAdmin, adminCreateUser, toggleSubAdminPermission, listUsers, getStats, removeSubAdmin, updateUser, deleteUser } from "../controllers/adminController.js";
import { authenticateJWT, authorizeRole, hasPermission } from "../middleware/authMiddleware.js";

const router = express.Router();

// All admin routes require authentication
router.use(authenticateJWT);

// GET /admin/users - List all users (ADMIN and SUB_ADMIN can access)
router.get("/users", authorizeRole(['ADMIN', 'SUB_ADMIN']), listUsers);

// GET /admin/stats - Get system stats (ADMIN and SUB_ADMIN can access)
router.get("/stats", authorizeRole(['ADMIN', 'SUB_ADMIN']), getStats);

// POST /admin/create-sub-admin - Create a sub-admin (ADMIN only)
router.post("/create-sub-admin", authorizeRole(['ADMIN']), createSubAdmin);

// POST /admin/create-user - Create a regular user (requires CREATE_USER permission for SUB_ADMIN)
router.post("/create-user", hasPermission('CREATE_USER'), adminCreateUser);

// PUT /admin/users/:userId - Update a user (ADMIN only)
router.put("/users/:userId", authorizeRole(['ADMIN']), updateUser);

// DELETE /admin/users/:userId - Delete a user (ADMIN only)
router.delete("/users/:userId", authorizeRole(['ADMIN']), deleteUser);

// DELETE /admin/remove-sub-admin - Remove or demote a sub-admin (ADMIN only)
router.delete("/remove-sub-admin", authorizeRole(['ADMIN']), removeSubAdmin);

// PATCH /admin/allow-subadmin-user-creation - Toggle sub-admin permissions (ADMIN only)
router.patch("/allow-subadmin-user-creation", authorizeRole(['ADMIN']), toggleSubAdminPermission);

export default router;
