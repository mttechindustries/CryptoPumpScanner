import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { dashboardDataSchema, type Token, type SolPrice } from "@shared/schema";

function confidenceScore(token: any): number {
  let score = 0;
  if (token.priceChange24h > 100) score += 40;
  if (token.volume24h > 1_000_000) score += 30;
  if (token.liquidity > 5000 && token.liquidity < 50000) score += 20;
  if (token.ageDays < 7) score += 10;
  if (token.priceChange24h < 0) score -= 20;
  return Math.min(Math.max(score, 0), 100);
}

function tradePlan(score: number): "Consider entry" | "Watch closely" | "Avoid" {
  if (score >= 70) return "Consider entry";
  if (score >= 40) return "Watch closely";
  return "Avoid";
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Get dashboard data with tokens and SOL price
  app.get("/api/dashboard", async (req, res) => {
    try {
      // Fetch tokens from DexScreener API
      const tokensResponse = await fetch("https://api.dexscreener.com/latest/dex/search?q=");
      const tokensData = await tokensResponse.json();
      
      // Fetch SOL price from CoinGecko API
      const solPriceResponse = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd");
      const solPriceData = await solPriceResponse.json();
      
      // Calculate PKR rate (approximate conversion)
      const usdToPkrRate = 278.5; // This should ideally come from a currency API
      const solPriceUsd = solPriceData.solana?.usd || 0;
      const solPricePkr = solPriceUsd * usdToPkrRate;

      // Filter and process tokens
      const filteredTokens: Token[] = tokensData.pairs
        ?.filter((t: any) => 
          t.priceChange24h > 5 && 
          t.volume24h > 10000 && 
          t.liquidity > 5000 && 
          t.liquidity < 50000
        )
        .slice(0, 50) // Limit to 50 tokens for performance
        .map((t: any) => {
          const confidence = confidenceScore(t);
          return {
            pair: t.baseToken?.symbol && t.quoteToken?.symbol 
              ? `${t.baseToken.symbol}/${t.quoteToken.symbol}`
              : t.pairAddress?.substring(0, 8) + "..." || "Unknown",
            chain: t.chainId === "solana" ? "Solana" : 
                   t.chainId === "ethereum" ? "Ethereum" : 
                   t.chainId === "bsc" ? "BSC" : t.chainId || "Unknown",
            priceChange24h: Number(t.priceChange24h) || 0,
            volume24h: Number(t.volume24h) || 0,
            liquidity: Number(t.liquidity) || 0,
            ageDays: t.pairCreatedAt ? Math.floor((Date.now() - new Date(t.pairCreatedAt).getTime()) / (1000 * 60 * 60 * 24)) : 0,
            confidence,
            tradePlan: tradePlan(confidence),
            url: t.url || `https://dexscreener.com/solana/${t.pairAddress}`,
          };
        }) || [];

      const dashboardData = {
        tokens: filteredTokens,
        solPrice: {
          usd: solPriceUsd,
          pkr: solPricePkr,
        },
        lastUpdate: new Date().toISOString(),
      };

      // Validate the response data
      const validatedData = dashboardDataSchema.parse(dashboardData);
      res.json(validatedData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      res.status(500).json({ 
        error: "Failed to fetch dashboard data", 
        message: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
