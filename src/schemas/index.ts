import { z } from "zod";

export const verifySchema = z.object({
  message: z.string(),
  signature: z.string(),
});

export const updateUserSchema = z.object({
  tagName: z.string().min(3).max(30).optional(),
  bio: z.string().max(160).optional(),
  avatarUrl: z.string().optional(),
  instagram: z.string().optional(),
  twitter: z.string().optional(),
  tiktok: z.string().optional(),
  showWalletAddress: z.boolean().optional(),
});

export const createTipSchema = z.object({
  txHash: z.string().startsWith("0x"),
  coin: z.string(),
  amount: z.string(),
  recipientAddress: z.string().startsWith("0x"),
  note: z.string().max(280).optional(),
  anonymous: z.boolean().optional(),
});

export const createWithdrawalSchema = z.object({
  txHash: z.string().startsWith("0x"),
  coin: z.string(),
  amount: z.string(),
  toAddress: z.string().startsWith("0x"),
});

export const updatePreferencesSchema = z.object({
  defaultCurrency: z.string().optional(),
  minTipAmount: z.string().optional(),
  defaultThankYouMessage: z.string().max(280).optional(),
  autoAcceptTips: z.boolean().optional(),
});
