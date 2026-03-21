import { Router, type Response, type Request } from "express";

const router = Router();

const COINGECKO_IDS = "ethereum,usd-coin,tether,bitcoin,tron";

// GET /api/v1/prices
router.get("/", async (req: Request, res: Response) => {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${COINGECKO_IDS}&vs_currencies=usd`,
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("CoinGecko error:", error);
    res.status(500).json({ error: "Failed to fetch prices" });
  }
});

export default router;
