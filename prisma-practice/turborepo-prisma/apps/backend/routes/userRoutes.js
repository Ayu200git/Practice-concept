import express from "express";
import { updateMe, deleteMe, getMe } from "../controllers/userController.js";
import { authenticateJWT } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticateJWT);

router.get("/me", getMe);
router.put("/me", updateMe);
router.delete("/me", deleteMe);

export default router;
