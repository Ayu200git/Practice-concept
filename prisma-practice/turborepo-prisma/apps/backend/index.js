console.log("STARTING SERVER...");
import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import subAdminRoutes from "./routes/subAdminRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import userRoutes from "./routes/userRoutes.js";

import { prisma } from "./db.js";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true
  }
});

const port = 3000;

// Attach io to req
app.use((req, res, next) => {
  req.io = io;
  next();
});

// 1. CORS Configuration
const corsOptions = {
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

//Routes
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/sub-admin", subAdminRoutes);
app.use("/posts", postRoutes);
app.use("/users", userRoutes);

app.get("/", (req, res) => {
  res.send("Prisma-RBAC API is running with Socket.io");
});

app.use((req, res) => {
  console.log(`404 at ${req.url}`);
  res.status(404).json({ error: "Not Found" });
});


// Export for Vercel
export { app, httpServer, io };

// Only listen when running locally
if (process.env.NODE_ENV !== "production") {
  httpServer.listen(port, () => {
    console.log(`server running on ${port}`);
  });
}

export default app;
