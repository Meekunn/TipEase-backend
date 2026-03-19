import { Router, type Response } from "express";
import prisma from "../lib/prisma.js";
import authenticate, { type AuthRequest } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { updateUserSchema } from "../schemas/index.js";
import upload from "../middleware/upload.js";
import cloudinary from "../lib/cloudinary.js";

const router = Router();

// GET /api/v1/users/me
router.get("/me", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: { preference: true },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({ user });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/v1/users/me
router.put(
  "/me",
  authenticate,
  upload.single("avatar"),
  validate(updateUserSchema),
  async (req: AuthRequest, res: Response) => {
    try {
      const { tagName, bio, instagram, twitter, tiktok, showWalletAddress } =
        req.body;

      let avatarUrl: string | undefined;

      if (req.file) {
        const result = await new Promise<{ secure_url: string }>(
          (resolve, reject) => {
            cloudinary.uploader
              .upload_stream(
                {
                  folder: "tipease/avatars",
                  transformation: [{ width: 200, height: 200, crop: "fill" }],
                },
                (error, result) => {
                  if (error || !result) reject(error);
                  else resolve(result);
                },
              )
              .end(req.file!.buffer);
          },
        );

        avatarUrl = result.secure_url;
      }

      const user = await prisma.user.update({
        where: { id: req.user!.userId },
        data: {
          ...(tagName !== undefined && { tagName }),
          ...(bio !== undefined && { bio }),
          ...(avatarUrl !== undefined && { avatarUrl }),
          ...(instagram !== undefined && { instagram }),
          ...(twitter !== undefined && { twitter }),
          ...(tiktok !== undefined && { tiktok }),
          ...(showWalletAddress !== undefined && { showWalletAddress }),
        },
      });

      res.json({ user });
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// GET /api/v1/users/:address
router.get("/:address", async (req: AuthRequest, res: Response) => {
  try {
    const { address } = req.params;

    const user = await prisma.user.findUnique({
      where: { walletAddress: address as string },
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
    console.error("Get user by address error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
