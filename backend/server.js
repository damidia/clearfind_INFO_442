import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import healthRouter from "./src/routes/health.js";
import scanRouter from "./src/routes/scan.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// connect to MongoDB only if MONGO_URI is set
await connectDB();

// routes
app.use("/api/health", healthRouter);
app.use("/api/scan", scanRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
