/**
 * Hyper-Personalized Property DNA Matching Component
 * Shows detailed matching analysis between user preferences and properties
 */

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Dna,
  TrendingUp,
  Heart,
  MapPin,
  DollarSign,
  Home,
  Zap,
  Star,
  ArrowRight,
  Building2,
  TreePine,
  GraduationCap,
  ShoppingBag,
  Wifi,
  Car,
  Shield,
  Info,
} from "lucide-react";

interface DNAMatchData {
  overallScore: number;
  categories: {
    location: number;
    price: number;
    amenities: number;
    lifestyle: number;
    investment: number;
    community: number;
  };
  strengths: string[];
  weaknesses: string[];
  personalityMatch: {
    type: string;
    description: string;
    color: string;
  };
}

interface PropertyDNAMatchingProps {
  propertyId: number;
  propertyTitle: string;
}

const PropertyDNAMatching = ({ propertyId, propertyTitle }: PropertyDNAMatchingProps) => {
  // Mock DNA data - replace with actual AI analysis
  const [dnaData] = useState<DNAMatchData>({
    overallScore: 92,
    categories: {
      location: 95,
      price: 88,
      amenities: 90,
      lifestyle: 94,
      investment: 85,
      community: 92,
    },
    strengths: [
      "Perfect location match for your commute",
      "Amenities align with your active lifestyle",
      "Excellent schools in the area (matches family priorities)",
      "Strong community fit based on your social preferences",
    ],
    weaknesses: [
      "Slightly above your optimal price range",
      "Limited parking (noted in your must-haves)",
    ],
    personalityMatch: {
      type: "Urban Professional",
      description:
        "This property matches your preference for modern, convenient living with access to city amenities",
      color: "from-blue-600 to-purple-600",
    },
  });

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, any> = {
      location: MapPin,
      price: DollarSign,
      amenities: Star,
      lifestyle: Heart,
      investment: TrendingUp,
      community: Building2,
    };
    return icons[category] || Home;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "from-green-500 to-emerald-600";
    if (score >= 75) return "from-blue-500 to-cyan-600";
    if (score >= 60) return "from-yellow-500 to-orange-600";
    return "from-red-500 to-pink-600";
  };

  const getScoreGrade = (score: number) => {
    if (score >= 90) return "Excellent Match";
    if (score >= 75) return "Great Match";
    if (score >= 60) return "Good Match";
    return "Fair Match";
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-purple-600 via-blue-600 to-pink-600 rounded-3xl p-8 text-white overflow-hidden"
      >
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        {/* DNA Animation */}
        <div className="absolute right-0 top-0 bottom-0 w-64 opacity-10">
          <Dna className="w-64 h-64 animate-spin-slow" />
        </div>

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Dna className="w-8 h-8 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-1">Property DNA Match</h2>
                  <p className="text-purple-100 text-sm">AI-Powered Hyper-Personalized Analysis</p>
                </div>
              </div>
              <p className="text-lg text-white/90 max-w-2xl">
                Analyzing how "{propertyTitle}" matches your unique preferences, lifestyle, and
                long-term goals
              </p>
            </div>

            {/* Overall Score */}
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 text-center min-w-[180px]">
              <div className="text-6xl font-bold mb-2">{dnaData.overallScore}</div>
              <div className="text-sm font-semibold uppercase tracking-wide">DNA Match Score</div>
              <div className="text-xs text-purple-100 mt-1">
                {getScoreGrade(dnaData.overallScore)}
              </div>
            </div>
          </div>

          {/* Personality Match */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <div className="font-bold text-lg">{dnaData.personalityMatch.type}</div>
                <p className="text-purple-100 text-sm">{dnaData.personalityMatch.description}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* DNA Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(dnaData.categories).map(([category, score], index) => {
          const Icon = getCategoryIcon(category);
          return (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-200 dark:border-gray-800 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${getScoreColor(
                      score
                    )} rounded-xl flex items-center justify-center`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white capitalize">
                      {category}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {getScoreGrade(score)}
                    </p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{score}</div>
              </div>

              {/* Progress Bar */}
              <div className="relative h-3 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  transition={{ delay: index * 0.1 + 0.3, duration: 1, ease: "easeOut" }}
                  className={`absolute top-0 left-0 h-full bg-gradient-to-r ${getScoreColor(
                    score
                  )} rounded-full`}
                />
              </div>

              {/* Score Indicator */}
              <div className="mt-3 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>0</span>
                <span>50</span>
                <span>100</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strengths */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border-2 border-green-200 dark:border-green-800"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-xl text-gray-900 dark:text-white">
                Why This Matches You
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Top strengths</p>
            </div>
          </div>

          <div className="space-y-3">
            {dnaData.strengths.map((strength, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-3 rounded-xl"
              >
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {strength}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Considerations */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-6 border-2 border-amber-200 dark:border-amber-800"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Info className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-xl text-gray-900 dark:text-white">
                Things to Consider
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Points to note</p>
            </div>
          </div>

          <div className="space-y-3">
            {dnaData.weaknesses.map((weakness, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-3 rounded-xl"
              >
                <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {weakness}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Feature Matching Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-800"
      >
        <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-6">
          Feature Match Analysis
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: GraduationCap, label: "Schools", match: 95, color: "blue" },
            { icon: ShoppingBag, label: "Shopping", match: 88, color: "purple" },
            { icon: TreePine, label: "Green Space", match: 92, color: "green" },
            { icon: Car, label: "Transport", match: 87, color: "orange" },
            { icon: Wifi, label: "Connectivity", match: 94, color: "cyan" },
            { icon: Shield, label: "Safety", match: 96, color: "emerald" },
            { icon: Building2, label: "Community", match: 91, color: "pink" },
            { icon: Star, label: "Lifestyle", match: 93, color: "yellow" },
          ].map((feature, index) => (
            <motion.div
              key={feature.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center hover:shadow-md transition-all"
            >
              <div
                className={`w-12 h-12 bg-${feature.color}-100 dark:bg-${feature.color}-900/30 rounded-xl flex items-center justify-center mx-auto mb-3`}
              >
                <feature.icon className={`w-6 h-6 text-${feature.color}-600`} />
              </div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                {feature.label}
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {feature.match}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">% match</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 text-white text-center"
      >
        <h3 className="font-bold text-2xl mb-2">Ready to Explore This Match?</h3>
        <p className="text-purple-100 mb-6">
          Schedule a viewing or get more detailed insights about this property
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-8 py-4 bg-white text-purple-600 rounded-xl font-semibold hover:bg-gray-100 transition-all flex items-center justify-center gap-2 group">
            Schedule Viewing
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/30 transition-all border border-white/30">
            Get Full DNA Report
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PropertyDNAMatching;
