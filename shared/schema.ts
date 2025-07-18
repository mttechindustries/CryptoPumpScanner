import { z } from "zod";

export const tokenSchema = z.object({
  pair: z.string(),
  chain: z.string(),
  priceChange24h: z.number(),
  volume24h: z.number(),
  liquidity: z.number(),
  ageDays: z.number(),
  confidence: z.number(),
  tradePlan: z.enum(["Consider entry", "Watch closely", "Avoid"]),
  url: z.string(),
});

export const solPriceSchema = z.object({
  usd: z.number(),
  pkr: z.number(),
});

export const dashboardDataSchema = z.object({
  tokens: z.array(tokenSchema),
  solPrice: solPriceSchema,
  lastUpdate: z.string(),
});

export type Token = z.infer<typeof tokenSchema>;
export type SolPrice = z.infer<typeof solPriceSchema>;
export type DashboardData = z.infer<typeof dashboardDataSchema>;
