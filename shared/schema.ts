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
  // Advanced pump detection fields
  pumpRisk: z.enum(["SAFE", "MODERATE", "HIGH", "EXTREME"]),
  volumePattern: z.object({
    volumeSpike: z.number(), // Volume multiplier vs average
    volumeTrend: z.array(z.number()), // Last 6 periods
    divergence: z.boolean() // Price up, volume down
  }),
  socialMetrics: z.object({
    mentions: z.number(),
    mentionSpike: z.number(), // % increase
    sentiment: z.number(), // -1 to 1
    sources: z.array(z.string())
  }),
  technicalSignals: z.object({
    rsi: z.number(),
    macd: z.number(),
    volumeProfile: z.string(),
    supportLevel: z.number(),
    resistanceLevel: z.number()
  }),
  pumpIndicators: z.object({
    vanityTicker: z.boolean(), // Has digit pattern
    liquidityLocked: z.boolean(),
    whaleActivity: z.boolean(),
    timeWindow: z.string(), // Peak pump window
    exitSignal: z.boolean() // Should exit now
  }),
  tradeStrategy: z.object({
    entryPrice: z.number(),
    exitLevels: z.array(z.object({
      price: z.number(),
      percentage: z.number() // % of position to sell
    })),
    stopLoss: z.number(),
    riskReward: z.number()
  }),
  // Real-time alerts and automation
  alerts: z.object({
    pumpDetected: z.boolean(),
    entrySignal: z.boolean(),
    exitSignal: z.boolean(),
    shortSignal: z.boolean(),
    alertMessage: z.string()
  }),
  forensicData: z.object({
    catalyst: z.string(), // What triggered the pump
    whaleWallets: z.array(z.string()),
    liquidityStatus: z.string(),
    exchangeListings: z.array(z.string()),
    socialSources: z.array(z.string())
  })
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
