/**
 * Predictive Market Intelligence Component
 * AI-powered market analysis, predictions, and investment insights
 */

import { useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Target,
  Zap,
  AlertCircle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  LineChart,
  PieChart,
  Brain,
  Sparkles,
  MapPin,
  Home,
  Users,
} from "lucide-react";

interface MarketTrend {
  period: string;
  value: number;
  prediction: number;
}

interface MarketInsight {
  type: "opportunity" | "risk" | "neutral";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
}

const PredictiveMarketIntelligence = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<"1M" | "3M" | "6M" | "1Y" | "3Y">(
    "1Y"
  );

  // Mock data - replace with actual AI predictions
  const marketData = {
    currentValue: 425000,
    predictedValue: {
      "1M": 428000,
      "3M": 435000,
      "6M": 448000,
      "1Y": 465000,
      "3Y": 520000,
    },
    confidence: 87,
    trend: "up" as const,
    changePercent: 9.4,
  };

  const insights: MarketInsight[] = [
    {
      type: "opportunity",
      title: "Prime Buying Window",
      description: "AI predicts property values will increase 8-12% in next 6 months",
      impact: "high",
    },
    {
      type: "opportunity",
      title: "Development Boom",
      description: "3 major infrastructure projects announced within 2 miles",
      impact: "high",
    },
    {
      type: "neutral",
      title: "Interest Rate Stability",
      description: "Rates predicted to remain stable for next 90 days",
      impact: "medium",
    },
    {
      type: "risk",
      title: "Supply Increase",
      description: "15% more listings expected in this area next quarter",
      impact: "low",
    },
  ];

  const priceHistory: MarketTrend[] = [
    { period: "Jan", value: 385000, prediction: 385000 },
    { period: "Feb", value: 390000, prediction: 390000 },
    { period: "Mar", value: 395000, prediction: 395000 },
    { period: "Apr", value: 405000, prediction: 405000 },
    { period: "May", value: 415000, prediction: 415000 },
    { period: "Jun", value: 425000, prediction: 425000 },
    { period: "Jul", value: 0, prediction: 435000 },
    { period: "Aug", value: 0, prediction: 445000 },
    { period: "Sep", value: 0, prediction: 455000 },
    { period: "Oct", value: 0, prediction: 465000 },
  ];

  const marketMetrics = [
    {
      icon: TrendingUp,
      label: "Price Growth",
      value: "+9.4%",
      subtext: "vs last year",
      color: "green",
      trend: "up",
    },
    {
      icon: Calendar,
      label: "Days on Market",
      value: "28",
      subtext: "-12% from avg",
      color: "blue",
      trend: "down",
    },
    {
      icon: Users,
      label: "Demand Index",
      value: "High",
      subtext: "87/100",
      color: "purple",
      trend: "up",
    },
    {
      icon: Home,
      label: "Inventory",
      value: "Low",
      subtext: "Seller's market",
      color: "orange",
      trend: "down",
    },
  ];

  const getInsightIcon = (type: MarketInsight["type"]) => {
    switch (type) {
      case "opportunity":
        return CheckCircle;
      case "risk":
        return AlertCircle;
      default:
        return Zap;
    }
  };

  const getInsightColor = (type: MarketInsight["type"]) => {
    switch (type) {
      case "opportunity":
        return "from-green-500 to-emerald-600";
      case "risk":
        return "from-red-500 to-orange-600";
      default:
        return "from-blue-500 to-cyan-600";
    }
  };

  const getImpactBadge = (impact: MarketInsight["impact"]) => {
    const colors = {
      high: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      low: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    };
    return colors[impact];
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white overflow-hidden"
      >
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Brain className="w-9 h-9 animate-pulse" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-1">Predictive Market Intelligence</h1>
              <p className="text-purple-100">
                AI-powered insights and forecasts for smarter decisions
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="text-sm text-purple-100 mb-1">Current Market Value</div>
              <div className="text-3xl font-bold">${marketData.currentValue.toLocaleString()}</div>
              <div className="flex items-center gap-2 mt-2 text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>+{marketData.changePercent}% YoY</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="text-sm text-purple-100 mb-1">
                Predicted Value ({selectedTimeframe})
              </div>
              <div className="text-3xl font-bold">
                ${marketData.predictedValue[selectedTimeframe].toLocaleString()}
              </div>
              <div className="flex items-center gap-2 mt-2 text-sm">
                <Sparkles className="w-4 h-4" />
                <span>{marketData.confidence}% AI Confidence</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="text-sm text-purple-100 mb-1">Investment Score</div>
              <div className="text-3xl font-bold">8.7/10</div>
              <div className="flex items-center gap-2 mt-2 text-sm">
                <Target className="w-4 h-4" />
                <span>Excellent Opportunity</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Market Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {marketMetrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-800 hover:shadow-xl transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`w-12 h-12 bg-${metric.color}-100 dark:bg-${metric.color}-900/30 rounded-xl flex items-center justify-center`}
              >
                <metric.icon className={`w-6 h-6 text-${metric.color}-600`} />
              </div>
              {metric.trend === "up" ? (
                <ArrowUpRight className="w-5 h-5 text-green-500" />
              ) : (
                <ArrowDownRight className="w-5 h-5 text-red-500" />
              )}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{metric.label}</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {metric.value}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500">{metric.subtext}</div>
          </motion.div>
        ))}
      </div>

      {/* Price Trend Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-800"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Price Forecast</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Historical data vs AI predictions
            </p>
          </div>

          {/* Timeframe Selector */}
          <div className="flex gap-2">
            {(["1M", "3M", "6M", "1Y", "3Y"] as const).map((timeframe) => (
              <button
                key={timeframe}
                onClick={() => setSelectedTimeframe(timeframe)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  selectedTimeframe === timeframe
                    ? "bg-purple-600 text-white shadow-lg"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {timeframe}
              </button>
            ))}
          </div>
        </div>

        {/* Simplified Chart Visualization */}
        <div className="relative h-64 flex items-end gap-2">
          {priceHistory.map((data, index) => {
            const maxValue = Math.max(...priceHistory.map((d) => Math.max(d.value, d.prediction)));
            const actualHeight = (data.value / maxValue) * 100;
            const predictedHeight = (data.prediction / maxValue) * 100;
            const isPrediction = data.value === 0;

            return (
              <div key={data.period} className="flex-1 flex flex-col items-center gap-2">
                {/* Bar */}
                <div className="w-full relative" style={{ height: "200px" }}>
                  <div className="absolute bottom-0 w-full flex justify-center gap-1">
                    {/* Actual Value Bar */}
                    {!isPrediction && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${actualHeight}%` }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        className="w-full bg-gradient-to-t from-blue-600 to-cyan-500 rounded-t-lg hover:opacity-80 transition-opacity cursor-pointer relative group"
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          ${(data.value / 1000).toFixed(0)}K
                        </div>
                      </motion.div>
                    )}

                    {/* Predicted Value Bar */}
                    {isPrediction && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${predictedHeight}%` }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        className="w-full bg-gradient-to-t from-purple-600/50 to-pink-500/50 rounded-t-lg border-2 border-dashed border-purple-400 hover:opacity-80 transition-opacity cursor-pointer relative group"
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-purple-900 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          ${(data.prediction / 1000).toFixed(0)}K (predicted)
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Period Label */}
                <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {data.period}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-r from-blue-600 to-cyan-500 rounded" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Actual Price</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-r from-purple-600/50 to-pink-500/50 rounded border-2 border-dashed border-purple-400" />
            <span className="text-sm text-gray-700 dark:text-gray-300">AI Prediction</span>
          </div>
        </div>
      </motion.div>

      {/* Market Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-800"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">AI Market Insights</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Real-time analysis of market conditions
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((insight, index) => {
            const Icon = getInsightIcon(insight.type);
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 hover:shadow-md transition-all border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 bg-gradient-to-br ${getInsightColor(
                      insight.type
                    )} rounded-lg flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {insight.title}
                      </h4>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getImpactBadge(
                          insight.impact
                        )}`}
                      >
                        {insight.impact}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {insight.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Investment Recommendation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white text-center"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <CheckCircle className="w-8 h-8" />
          <h3 className="text-2xl font-bold">AI Recommendation: BUY NOW</h3>
        </div>
        <p className="text-green-100 text-lg mb-6 max-w-2xl mx-auto">
          Based on 47 data points and predictive modeling, this is an optimal time to invest.
          Expected ROI: 18-22% over 3 years.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-8 py-4 bg-white text-green-600 rounded-xl font-semibold hover:bg-gray-100 transition-all">
            Get Detailed Investment Report
          </button>
          <button className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/30 transition-all border border-white/30">
            Schedule Consultation
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PredictiveMarketIntelligence;
