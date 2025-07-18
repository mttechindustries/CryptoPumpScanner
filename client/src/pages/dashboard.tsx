import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, TrendingUp, DollarSign, List, ThumbsUp, Clock, ExternalLink, CheckCircle, Eye, XCircle } from "lucide-react";
import { useEffect } from "react";
import { queryClient } from "@/lib/queryClient";
import type { DashboardData, Token } from "@shared/schema";

export default function Dashboard() {
  const { toast } = useToast();
  
  const { data, isLoading, error, refetch } = useQuery<DashboardData>({
    queryKey: ["/api/dashboard"],
    refetchInterval: 60000, // Refresh every 60 seconds
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Error fetching data",
        description: error instanceof Error ? error.message : "Failed to load dashboard data",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handleRefresh = async () => {
    try {
      await refetch();
      toast({
        title: "Data refreshed",
        description: "Dashboard data has been updated successfully",
      });
    } catch (err) {
      toast({
        title: "Refresh failed",
        description: "Unable to refresh data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getTradeRecommendationColor = (tradePlan: string) => {
    switch (tradePlan) {
      case "Consider entry":
        return "bg-green-100 text-green-800 border-green-200";
      case "Watch closely":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Avoid":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTradeRecommendationIcon = (tradePlan: string) => {
    switch (tradePlan) {
      case "Consider entry":
        return <CheckCircle className="w-3 h-3 mr-1" />;
      case "Watch closely":
        return <Eye className="w-3 h-3 mr-1" />;
      case "Avoid":
        return <XCircle className="w-3 h-3 mr-1" />;
      default:
        return null;
    }
  };

  const getRowBorderColor = (tradePlan: string) => {
    switch (tradePlan) {
      case "Consider entry":
        return "border-l-4 border-l-green-500";
      case "Watch closely":
        return "border-l-4 border-l-yellow-500";
      case "Avoid":
        return "border-l-4 border-l-red-500";
      default:
        return "border-l-4 border-l-gray-300";
    }
  };

  const highConfidenceTokens = data?.tokens.filter(token => token.confidence >= 70).length || 0;
  const lastUpdateTime = data?.lastUpdate ? new Date(data.lastUpdate).toLocaleTimeString() : "";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="text-primary text-2xl" />
                <h1 className="text-xl font-bold text-gray-900">Crypto Pump Radar V3</h1>
              </div>
              <Badge variant="default" className="bg-primary text-white">
                LIVE
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600 flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                <span>Last updated: {lastUpdateTime || "Never"}</span>
              </div>
              <Button 
                onClick={handleRefresh}
                disabled={isLoading}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh Now
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* SOL Price USD */}
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">SOL Price (USD)</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-24 mt-1" />
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">
                      ${data?.solPrice.usd.toFixed(2) || "0.00"}
                    </p>
                  )}
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SOL Price PKR */}
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">SOL Price (PKR)</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-24 mt-1" />
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">
                      ₨{data?.solPrice.pkr.toFixed(0) || "0"}
                    </p>
                  )}
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Tokens */}
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Tokens</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">
                      {data?.tokens.length || 0}
                    </p>
                  )}
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <List className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className="text-sm text-primary font-medium">Filtered</span>
                <span className="text-sm text-gray-500 ml-2">High potential</span>
              </div>
            </CardContent>
          </Card>

          {/* High Confidence */}
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">High Confidence</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">
                      {highConfidenceTokens}
                    </p>
                  )}
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <ThumbsUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className="text-sm text-green-600 font-medium">≥70% Score</span>
                <span className="text-sm text-gray-500 ml-2">Consider entry</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tokens Table */}
        <Card className="bg-white shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Token Analysis</h2>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Consider Entry</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Watch Closely</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Avoid</span>
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="p-8 text-center">
              <div className="inline-flex items-center space-x-2">
                <RefreshCw className="animate-spin h-6 w-6 text-primary" />
                <span className="text-gray-600">Loading latest data...</span>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-8 text-center">
              <div className="text-red-600 mb-4">
                <p className="font-medium">Failed to load data</p>
                <p className="text-sm mt-1">{error instanceof Error ? error.message : "Unknown error occurred"}</p>
              </div>
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          )}

          {/* Table */}
          {!isLoading && !error && data && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Token Pair
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Chain
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      24h Change
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      24h Volume
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Liquidity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Age
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Confidence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trade Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.tokens.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <TrendingUp className="w-12 h-12 text-gray-400 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No tokens found</h3>
                          <p className="text-gray-600 mb-4">No tokens match the current filtering criteria.</p>
                          <Button onClick={handleRefresh} variant="outline">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Refresh Data
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    data.tokens.map((token, index) => (
                      <tr key={`${token.pair}-${index}`} className={`hover:bg-gray-50 transition-colors ${getRowBorderColor(token.tradePlan)}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-xs">
                                {token.pair.split('/')[0]?.substring(0, 2) || 'TK'}
                              </span>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{token.pair}</div>
                              <div className="text-xs text-gray-500">{token.chain}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="secondary" className="text-xs">
                            {token.chain}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <TrendingUp className="w-4 h-4 text-green-600 mr-2" />
                            <span className="text-sm font-semibold text-green-600">
                              +{token.priceChange24h.toFixed(2)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${token.volume24h.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${token.liquidity.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="outline" className="text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            {token.ageDays} days
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-1 mr-2">
                              <Progress value={token.confidence} className="h-2" />
                            </div>
                            <span className="text-sm font-semibold text-gray-900">
                              {token.confidence}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={`text-xs ${getTradeRecommendationColor(token.tradePlan)}`}>
                            {getTradeRecommendationIcon(token.tradePlan)}
                            {token.tradePlan}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <a 
                            href={token.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80 transition-colors inline-flex items-center"
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            View Details
                          </a>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-gray-500">
          <div className="flex items-center justify-center space-x-4">
            <span>Data provided by DexScreener API</span>
            <span>•</span>
            <span>Auto-refresh every 60 seconds</span>
            <span>•</span>
            <span>Last update: {lastUpdateTime || "Never"}</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
