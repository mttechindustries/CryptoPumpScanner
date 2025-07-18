import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { dashboardDataSchema, type Token, type SolPrice } from "@shared/schema";

function confidenceScore(token: any): number {
  let score = 0;
  
  // High price change bonus (50% of score)
  if (token.price_change_percentage_24h > 50) score += 50;
  else if (token.price_change_percentage_24h > 20) score += 30;
  else if (token.price_change_percentage_24h > 10) score += 20;
  else if (token.price_change_percentage_24h > 5) score += 10;
  
  // Volume bonus (30% of score)
  if (token.total_volume > 50_000_000) score += 30;
  else if (token.total_volume > 10_000_000) score += 20;
  else if (token.total_volume > 1_000_000) score += 15;
  else if (token.total_volume > 100_000) score += 10;
  
  // Market cap sweet spot (20% of score)
  if (token.market_cap > 1_000_000 && token.market_cap < 100_000_000) score += 20;
  else if (token.market_cap > 100_000 && token.market_cap < 1_000_000) score += 15;
  else if (token.market_cap > 10_000 && token.market_cap < 100_000) score += 10;
  
  // Penalty for negative price change
  if (token.price_change_percentage_24h < 0) score -= 20;
  
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
      // Fetch market data from CoinGecko API - get top coins by 24h volume
      const tokensResponse = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=volume_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h");
      const tokensData = await tokensResponse.json();
      
      // Fetch SOL price from CoinGecko API
      const solPriceResponse = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd");
      const solPriceData = await solPriceResponse.json();
      
      // Calculate PKR rate (approximate conversion)
      const usdToPkrRate = 278.5; // This should ideally come from a currency API
      const solPriceUsd = solPriceData.solana?.usd || 0;
      const solPricePkr = solPriceUsd * usdToPkrRate;

      console.log("CoinGecko API Response:", {
        status: tokensResponse.status,
        hasData: !!tokensData,
        dataType: typeof tokensData,
        tokensCount: Array.isArray(tokensData) ? tokensData.length : 0,
      });

      // Handle API rate limiting and errors
      let filteredTokens: Token[] = [];
      
      if (tokensResponse.status === 429) {
        // Rate limited - return empty array with message
        console.log("CoinGecko API rate limited, returning empty results");
        filteredTokens = [];
      } else if (Array.isArray(tokensData)) {
        // Filter and process tokens - focus on coins with good pump potential
        filteredTokens = tokensData
          .filter((t: any) => {
          const hasValidData = t.price_change_percentage_24h != null && t.total_volume != null && t.market_cap != null;
          // Look for coins with positive price change and reasonable volume
          const meetsThresholds = t.price_change_percentage_24h > 0 && t.total_volume > 100000 && t.market_cap > 1000000;
          
          console.log("Token filter:", {
            symbol: t.symbol?.toUpperCase(),
            priceChange24h: t.price_change_percentage_24h,
            volume24h: t.total_volume,
            marketCap: t.market_cap,
            hasValidData,
            meetsThresholds,
          });
          
          return hasValidData && meetsThresholds;
        })
        .slice(0, 50) // Limit to 50 tokens for performance
        .map((t: any) => {
          const confidence = confidenceScore(t);
          return {
            pair: `${t.symbol?.toUpperCase()}/USD`,
            chain: "Multi-Chain", // CoinGecko doesn't specify chain in this endpoint
            priceChange24h: Number(t.price_change_percentage_24h) || 0,
            volume24h: Number(t.total_volume) || 0,
            liquidity: Number(t.market_cap) || 0, // Using market cap as liquidity proxy
            ageDays: 0, // CoinGecko doesn't provide creation date in this endpoint
            confidence,
            tradePlan: tradePlan(confidence),
            url: `https://coingecko.com/en/coins/${t.id}`,
          };
        }) || [];

      console.log("Filtered tokens count:", filteredTokens.length);

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
