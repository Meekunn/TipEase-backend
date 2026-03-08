import "dotenv/config";
import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.js";
import usersRouter from "./routes/users.js";
import tipsRouter from "./routes/tips.js";
import withdrawalsRouter from "./routes/withdrawals.js";
import preferencesRouter from "./routes/preferences.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

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

app.get("/", (req, res) => {
  res.json({ message: "TipEase API is running" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
