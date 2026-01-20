import express from "express";
import { createSubAdmin, adminCreateUser, toggleSubAdminPermission, listUsers, getStats, removeSubAdmin, updateUser, deleteUser } from "../controllers/adminController.js";
import { authenticateJWT, authorizeRole, hasPermission } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticateJWT);

// GET /admin/users 
router.get("/users", authorizeRole(['ADMIN', 'SUB_ADMIN']), listUsers);

router.get("/stats", authorizeRole(['ADMIN', 'SUB_ADMIN']), getStats);

// POST /admin/create-sub-admin 
router.post("/create-sub-admin", authorizeRole(['ADMIN']), createSubAdmin);

// POST /admin/create-user 
router.post("/create-user", hasPermission('CREATE_USER'), adminCreateUser);

// PUT /admin/users/:userId 
router.put("/users/:userId", hasPermission('UPDATE_USER'), updateUser);

// DELETE /admin/users/:userId  
router.delete("/users/:userId", hasPermission('DELETE_USER'), deleteUser);

// DELETE /admin/remove-sub-admin 
router.delete("/remove-sub-admin", authorizeRole(['ADMIN']), removeSubAdmin);

// PATCH /admin/allow-subadmin-user-creation  
router.patch("/allow-subadmin-user-creation", authorizeRole(['ADMIN']), toggleSubAdminPermission);

export default router;
