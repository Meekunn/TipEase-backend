import { Router, type Response } from "express";
import prisma from "../lib/prisma.js";
import authenticate, { type AuthRequest } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { createTipSchema } from "../schemas/index.js";

const router = Router();

// POST /api/v1/tips
router.post(
  "/",
  authenticate,
  validate(createTipSchema),
  async (req: AuthRequest, res: Response) => {
    try {
      const { txHash, coin, amount, recipientAddress, note, anonymous } =
        req.body;

      const tip = await prisma.tip.create({
        data: {
          txHash,
          coin,
          amount,
          senderAddress: req.user!.walletAddress,
          recipientAddress,
          note,
          anonymous: anonymous ?? false,
          status: "confirmed",
        },
      });

      res.status(201).json({ tip });
    } catch (error) {
      console.error("Create tip error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// GET /api/v1/tips/sent
router.get("/sent", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const tips = await prisma.tip.findMany({
      where: { senderAddress: req.user!.walletAddress },
      orderBy: { createdAt: "desc" },
    });

    res.json({ tips });
  } catch (error) {
    console.error("Get sent tips error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/v1/tips/received
router.get(
  "/received",
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      const tips = await prisma.tip.findMany({
        where: { recipientAddress: req.user!.walletAddress },
        orderBy: { createdAt: "desc" },
      });

      res.json({ tips });
    } catch (error) {
      console.error("Get received tips error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// GET /api/v1/tips/:id
router.get("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    const tip = await prisma.tip.findUnique({
      where: { id },
    });

    if (!tip) {
      res.status(404).json({ error: "Tip not found" });
      return;
    }

    res.json({ tip });
  } catch (error) {
    console.error("Get tip error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
