import { Router, type Response } from "express";
import prisma from "../lib/prisma.js";
import authenticate, { type AuthRequest } from "../middleware/auth.js";

const router = Router();

// POST /api/v1/withdrawals
router.post("/", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { txHash, coin, amount, toAddress } = req.body;

    const withdrawal = await prisma.withdrawal.create({
      data: {
        txHash,
        coin,
        amount,
        fromAddress: req.user!.walletAddress,
        toAddress,
        status: "pending",
      },
    });

    res.status(201).json({ withdrawal });
  } catch (error) {
    console.error("Create withdrawal error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/v1/withdrawals/history
router.get(
  "/history",
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      const withdrawals = await prisma.withdrawal.findMany({
        where: { fromAddress: req.user!.walletAddress },
        orderBy: { createdAt: "desc" },
      });

      res.json({ withdrawals });
    } catch (error) {
      console.error("Get withdrawals history error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// GET /api/v1/withdrawals/:id
router.get("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id },
    });

    if (!withdrawal) {
      res.status(404).json({ error: "Withdrawal not found" });
      return;
    }

    res.json({ withdrawal });
  } catch (error) {
    console.error("Get withdrawal error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
