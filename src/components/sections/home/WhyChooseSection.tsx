/**
 * Why Choose Section - Premium Design
 * Highlights key benefits and unique value propositions
 */

import { motion } from "framer-motion";
import { Star, Zap, Shield, Users, TrendingUp, Award, Check } from "lucide-react";

const WhyChooseSection = () => {
  const features = [
    {
      icon: Star,
      title: "Premium Listings",
      description: "Access exclusive properties from verified agents and developers",
      stats: "10,000+",
      statsLabel: "Properties",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Find your dream home in minutes with our advanced search technology",
      stats: "< 5 min",
      statsLabel: "Avg. Search Time",
    },
    {
      icon: Shield,
      title: "100% Secure",
      description: "Bank-level encryption and verified transactions for complete safety",
      stats: "100%",
      statsLabel: "Secure",
    },
    {
      icon: Users,
      title: "Expert Agents",
      description: "Connect with experienced professionals who know your market",
      stats: "500+",
      statsLabel: "Agents",
    },
  ];

  const benefits = [
    "Verified property listings",
    "24/7 customer support",
    "No hidden fees",
    "Easy financing options",
    "Virtual property tours",
    "Legal assistance included",
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full mb-4">
            <Award className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-semibold text-emerald-600">
              Why Choose Us
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
            The{" "}
            <span className="bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">
              Smart Choice
            </span>{" "}
            for Real Estate
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experience the difference with our cutting-edge platform and dedicated service
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  {feature.stats}
                </h3>
                <p className="text-sm text-blue-600 font-semibold mb-3">
                  {feature.statsLabel}
                </p>
                <h4 className="text-lg font-bold text-slate-900 mb-2">
                  {feature.title}
                </h4>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Benefits List */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="text-gray-700 font-medium">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WhyChooseSection;
