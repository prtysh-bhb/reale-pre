/**
 * AI Hub - Central page for all AI-powered features
 * Showcases Property DNA Matching, Market Intelligence, and Conversational Discovery
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dna,
  MessageSquare,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Zap,
  Target,
  Globe,
  Shield,
  Award,
  ChevronRight,
} from "lucide-react";
import PropertyDNAMatching from "@/components/ai/PropertyDNAMatching";
import PredictiveMarketIntelligence from "@/components/ai/PredictiveMarketIntelligence";
import ConversationalPropertyDiscovery from "@/components/ai/ConversationalPropertyDiscovery";

type AIFeature = "dna" | "market" | "chat" | null;

const AIHub = () => {
  const [activeFeature, setActiveFeature] = useState<AIFeature>(null);
  const [, setIsAnimating] = useState(false);

  const features = [
    {
      id: "dna" as const,
      icon: Dna,
      title: "Property DNA Matching",
      subtitle: "Hyper-Personalized Matching",
      description:
        "Our AI analyzes 50+ data points about your preferences, lifestyle, and goals to find properties that truly match your unique needs.",
      gradient: "from-purple-600 via-pink-600 to-red-600",
      stats: [
        { label: "Match Accuracy", value: "95%" },
        { label: "Data Points", value: "50+" },
        { label: "Avg. Score", value: "87/100" },
      ],
      benefits: [
        "Personality-based matching",
        "Lifestyle compatibility analysis",
        "Long-term goal alignment",
        "Feature prioritization",
      ],
    },
    {
      id: "market" as const,
      icon: TrendingUp,
      title: "Predictive Market Intelligence",
      subtitle: "AI-Powered Forecasting",
      description:
        "Advanced machine learning models predict market trends, property values, and investment opportunities with 87% accuracy.",
      gradient: "from-blue-600 via-cyan-600 to-teal-600",
      stats: [
        { label: "Prediction Accuracy", value: "87%" },
        { label: "Market Coverage", value: "100%" },
        { label: "Daily Updates", value: "24/7" },
      ],
      benefits: [
        "Future price predictions",
        "Investment ROI forecasts",
        "Market trend analysis",
        "Risk assessment",
      ],
    },
    {
      id: "chat" as const,
      icon: MessageSquare,
      title: "Conversational Discovery",
      subtitle: "Natural Language Search",
      description:
        "Just describe what you're looking for in plain English. Our AI understands context, preferences, and nuances to find exactly what you need.",
      gradient: "from-emerald-600 via-green-600 to-lime-600",
      stats: [
        { label: "Response Time", value: "<2s" },
        { label: "Accuracy", value: "92%" },
        { label: "Languages", value: "12+" },
      ],
      benefits: [
        "Natural language queries",
        "Context-aware responses",
        "Voice input support",
        "Instant property matching",
      ],
    },
  ];

  const handleFeatureClick = (featureId: AIFeature) => {
    setIsAnimating(true);
    setTimeout(() => {
      setActiveFeature(featureId);
      setIsAnimating(false);
    }, 300);
  };

  if (activeFeature) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900/20 p-6">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => setActiveFeature(null)}
          className="mb-6 px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2 border border-gray-200 dark:border-gray-700"
        >
          ← Back to AI Hub
        </motion.button>

        {/* Render Active Component */}
        <AnimatePresence mode="wait">
          {activeFeature === "dna" && (
            <motion.div
              key="dna"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <PropertyDNAMatching
                propertyId={1}
                propertyTitle="Modern Family Home in Sunset District"
              />
            </motion.div>
          )}
          {activeFeature === "market" && (
            <motion.div
              key="market"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <PredictiveMarketIntelligence />
            </motion.div>
          )}
          {activeFeature === "chat" && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ConversationalPropertyDiscovery />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
          <div
            className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-500 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "2s" }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full mb-6 border border-purple-200 dark:border-purple-800"
            >
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Powered by Advanced AI
              </span>
              <span className="px-2 py-0.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs rounded-full">
                NEW
              </span>
            </motion.div>

            {/* Heading */}
            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-22 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
              AI-Powered Property Intelligence
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
              Experience the future of real estate with our cutting-edge AI features.
              <br />
              Find your perfect property faster, smarter, and with confidence.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 mb-12">
              {[
                { icon: Target, label: "95% Match Accuracy", color: "purple" },
                { icon: Zap, label: "2s Response Time", color: "blue" },
                { icon: Globe, label: "100% Market Coverage", color: "cyan" },
                { icon: Shield, label: "87% Prediction Accuracy", color: "green" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div
                    className={`w-12 h-12 bg-${stat.color}-100 dark:bg-${stat.color}-900/30 rounded-xl flex items-center justify-center`}
                  >
                    <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                  <div className="text-left">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.label.split(" ")[0]}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {stat.label.split(" ").slice(1).join(" ")}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => handleFeatureClick("chat")}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl font-semibold text-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
              >
                Start AI Chat
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl font-semibold text-lg hover:shadow-xl transition-all border-2 border-gray-200 dark:border-gray-700">
                Watch Demo
              </button>
            </div>
          </motion.div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {features.map((feature, index) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                onClick={() => handleFeatureClick(feature.id)}
                className="group relative bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all cursor-pointer border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                {/* Gradient Background on Hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity`}
                />

                {/* Icon */}
                <div className="relative z-10">
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                  >
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 font-semibold">
                    {feature.subtitle}
                  </p>

                  {/* Description */}
                  <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-6">
                    {feature.stats.map((stat) => (
                      <div
                        key={stat.label}
                        className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                      >
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          {stat.value}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Benefits */}
                  <div className="space-y-2 mb-6">
                    {feature.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <button
                    className={`w-full py-3 bg-gradient-to-r ${feature.gradient} text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 group-hover:gap-3`}
                  >
                    Try {feature.title.split(" ")[0]}
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-200 dark:border-gray-700"
          >
            <div className="text-center mb-8">
              <Award className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Trusted by Thousands
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Our AI has helped over 10,000+ people find their dream homes
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: "Properties Analyzed", value: "50,000+" },
                { label: "Successful Matches", value: "12,400+" },
                { label: "Market Predictions", value: "1M+" },
                { label: "User Satisfaction", value: "98%" },
              ].map((metric) => (
                <div key={metric.label} className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-1">
                    {metric.value}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{metric.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AIHub;
