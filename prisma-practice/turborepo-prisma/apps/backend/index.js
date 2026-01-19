console.log("STARTING SERVER...");
import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import subAdminRoutes from "./routes/subAdminRoutes.js";
import postRoutes from "./routes/postRoutes.js";

import { prisma } from "./db.js";
const app = express();

const port = 3000;

// 1. CORS Configuration
const corsOptions = {
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
// Remove app.options("*", ...) as it causes crash in Express 5 and is handled by the middleware above

app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// RBAC Routes - Mounted under /auth, /admin, etc.
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/sub-admin", subAdminRoutes);
app.use("/posts", postRoutes);

app.get("/", (req, res) => {
  res.send("Prisma-RBAC API is running");
});

app.use((req, res) => {
  console.log(`404 at ${req.url}`);
  res.status(404).json({ error: "Not Found" });
});


app.listen(port, () => {
  console.log(`server running on ${port}`);
});
