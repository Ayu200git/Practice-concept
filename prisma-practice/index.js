console.log("STARTING SERVER...");
import "dotenv/config";
import express from "express";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import subAdminRoutes from "./routes/subAdminRoutes.js";

import { prisma } from "./db.js";
const app = express();

const port = 3000;

app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// RBAC Routes
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/sub-admin", subAdminRoutes);

app.use("/", authRoutes);

app.get("/", (req, res) => {
  res.send("Prisma working");
});

app.use((req, res) => {
  console.log(`404 at ${req.url}`);
  res.status(404).send("Not Found");
});


app.listen(port, () => {
  console.log(`server running on ${port}`);
});
