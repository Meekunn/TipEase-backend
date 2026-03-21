import "dotenv/config";
import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.js";
import usersRouter from "./routes/users.js";
import tipsRouter from "./routes/tips.js";
import withdrawalsRouter from "./routes/withdrawals.js";
import preferencesRouter from "./routes/preferences.js";
import pricesRouter from "./routes/prices.js";
import { globalLimiter } from "./middleware/rateLimiter.js";

const allowedOrigins = ["http://localhost:5173", process.env.FRONTEND_URL!];

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(globalLimiter);

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not set in .env");
}
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in .env");
}

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/tips", tipsRouter);
app.use("/api/v1/withdrawals", withdrawalsRouter);
app.use("/api/v1/preferences", preferencesRouter);
app.use("/api/v1/prices", pricesRouter);

app.get("/", (req, res) => {
  res.json({ message: "TipEase API is running" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
