import { Router, type Request, type Response } from "express";
import { generateNonce, SiweMessage } from "siwe";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import authenticate, { type AuthRequest } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import { verifySchema } from "../schemas/index.js";

const router = Router();

const nonceStore = new Map<string, string>();

// GET /api/v1/auth/nonce
router.get("/nonce", authLimiter, (req: Request, res: Response) => {
  const nonce = generateNonce();
  nonceStore.set(nonce, nonce);
  res.json({ nonce });
});

// POST /api/v1/auth/verify
router.post(
  "/verify",
  authLimiter,
  validate(verifySchema),
  async (req: Request, res: Response) => {
    try {
      const { message, signature } = req.body;

      const siweMessage = new SiweMessage(message);

      const { data: fields } = await siweMessage.verify({ signature });

      if (!nonceStore.has(fields.nonce)) {
        res.status(401).json({ error: "Invalid nonce" });
        return;
      }

      nonceStore.delete(fields.nonce);

      const user = await prisma.user.upsert({
        where: { walletAddress: fields.address },
        update: {},
        create: {
          walletAddress: fields.address,
          tagName: `user_${fields.address.slice(2, 8)}`,
        },
      });

      const token = jwt.sign(
        { userId: user.id, walletAddress: user.walletAddress },
        process.env.JWT_SECRET!,
        { expiresIn: "7d" },
      );

      res.json({ token, user });
    } catch (error) {
      console.error("SIWE verify error:", error);
      res.status(400).json({ error: "Verification failed" });
    }
  },
);

// GET /api/v1/auth/me
router.get("/me", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        walletAddress: true,
        tagName: true,
        bio: true,
        avatarUrl: true,
        instagram: true,
        twitter: true,
        tiktok: true,
        showWalletAddress: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({ user });
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
export { nonceStore };
