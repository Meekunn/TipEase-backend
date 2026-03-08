import { Router, type Response } from "express";
import prisma from "../lib/prisma.js";
import authenticate, { type AuthRequest } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { updatePreferencesSchema } from "../schemas/index.js";

const router = Router();

// GET /api/v1/preferences
router.get("/", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const preference = await prisma.preference.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!preference) {
      res.status(404).json({ error: "Preferences not found" });
      return;
    }

    res.json({ preference });
  } catch (error) {
    console.error("Get preferences error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/v1/preferences
router.put(
  "/",
  authenticate,
  validate(updatePreferencesSchema),
  async (req: AuthRequest, res: Response) => {
    try {
      const {
        defaultCurrency,
        minTipAmount,
        defaultThankYouMessage,
        autoAcceptTips,
      } = req.body;

      const preference = await prisma.preference.upsert({
        where: { userId: req.user!.userId },
        update: {
          ...(defaultCurrency !== undefined && { defaultCurrency }),
          ...(minTipAmount !== undefined && { minTipAmount }),
          ...(defaultThankYouMessage !== undefined && {
            defaultThankYouMessage,
          }),
          ...(autoAcceptTips !== undefined && { autoAcceptTips }),
        },
        create: {
          userId: req.user!.userId,
          defaultCurrency: defaultCurrency ?? "USD",
          minTipAmount: minTipAmount ?? "0",
          defaultThankYouMessage: defaultThankYouMessage ?? null,
          autoAcceptTips: autoAcceptTips ?? true,
        },
      });

      res.json({ preference });
    } catch (error) {
      console.error("Update preferences error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

export default router;
