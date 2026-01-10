/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  CreditCard, 
  Calendar, 
  Star, 
  CheckCircle,
  XCircle,
  Building2,
  Image,
  Sparkles,
  Users,
  ArrowRight,
  Shield,
  Award,
} from "lucide-react";
import { toast } from "sonner";
import { getSubscriptionPlans } from "@/api/customer/subscriptions";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import AdminLayout from "@/components/layout/admin/AdminLayout";
import { useAuth } from "@/context/AuthContext";

interface SubscriptionPlan {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  duration_days: number;
  property_limit: number;
  featured_limit: number;
  image_limit: number;
  video_allowed: boolean;
  priority_support: boolean;
  is_active: boolean;
  sort_order: number;
  features: string[];
  created_at: string;
  updated_at: string;
}

const SubscriptionPlans = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  let isAgent = false;

  if(user?.role == "agent"){
    isAgent = true;
  }

  const Layout = isAgent ? AdminLayout : React.Fragment;

  useEffect(() => {
    fetchSubscriptionPlans();
  }, []);

  const fetchSubscriptionPlans = async () => {
    try {
      setLoading(true);
      const response = await getSubscriptionPlans();
      
      if (response.success && response.data) {
        // Filter only active plans and sort by sort_order
        const activePlans = response.data.plans
         .filter((plan: SubscriptionPlan) => plan.is_active)
          .sort((a: SubscriptionPlan, b: SubscriptionPlan) => a.sort_order - b.sort_order);
        setPlans(activePlans);
      } else {
        toast.error("Failed to fetch subscription plans");
      }
    } catch (error: any) {
      toast.error("Error fetching subscription plans: " + (error.message || ""));
    } finally {
      setLoading(false);
    }
  };

  const getPlanColor = (index: number) => {
    const colors = [
      "from-blue-500 to-cyan-500",
      "from-emerald-500 to-green-500", 
      "from-purple-500 to-violet-500",
      "from-amber-500 to-orange-500"
    ];
    return colors[index % colors.length];
  };

  const getPlanDarkColor = (index: number) => {
    const colors = [
      "dark:from-blue-600 dark:to-cyan-600",
      "dark:from-emerald-600 dark:to-green-600",
      "dark:from-purple-600 dark:to-violet-600",
      "dark:from-amber-600 dark:to-orange-600"
    ];
    return colors[index % colors.length];
  };

  const getPlanBgColor = (index: number) => {
    const colors = [
      "from-blue-50 to-cyan-50",
      "from-emerald-50 to-green-50",
      "from-purple-50 to-violet-50",
      "from-amber-50 to-orange-50"
    ];
    return colors[index % colors.length];
  };

  const getPlanDarkBgColor = (index: number) => {
    const colors = [
      "dark:from-blue-900/30 dark:to-cyan-900/30",
      "dark:from-emerald-900/30 dark:to-green-900/30",
      "dark:from-purple-900/30 dark:to-violet-900/30",
      "dark:from-amber-900/30 dark:to-orange-900/30"
    ];
    return colors[index % colors.length];
  };

  const getPlanBorderColor = (index: number) => {
    const colors = [
      "border-blue-200",
      "border-emerald-200",
      "border-purple-200",
      "border-amber-200"
    ];
    return colors[index % colors.length];
  };

  const getPlanDarkBorderColor = (index: number) => {
    const colors = [
      "dark:border-blue-800/50",
      "dark:border-emerald-800/50",
      "dark:border-purple-800/50",
      "dark:border-amber-800/50"
    ];
    return colors[index % colors.length];
  };

  const getPlanButtonColor = (index: number) => {
    const colors = [
      "from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700",
      "from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700",
      "from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700",
      "from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
    ];
    return colors[index % colors.length];
  };

  const getPlanDarkButtonColor = (index: number) => {
    const colors = [
      "dark:from-blue-700 dark:to-cyan-700 dark:hover:from-blue-800 dark:hover:to-cyan-800",
      "dark:from-emerald-700 dark:to-green-700 dark:hover:from-emerald-800 dark:hover:to-green-800",
      "dark:from-purple-700 dark:to-violet-700 dark:hover:from-purple-800 dark:hover:to-violet-800",
      "dark:from-amber-700 dark:to-orange-700 dark:hover:from-amber-800 dark:hover:to-orange-800"
    ];
    return colors[index % colors.length];
  };

  const getPopularPlanIndex = () => {
    // The middle plan is usually the most popular
    return Math.floor(plans.length / 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading plans...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br">
        {/* Header Section */}
        {!isAgent && (
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 dark:from-blue-700 dark:via-purple-700 dark:to-emerald-700"></div>
            <div className="absolute inset-0 bg-black/10 dark:bg-black/20"></div>
            
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
              <div className="text-center">
                <Badge className="bg-white/20 dark:bg-white/10 backdrop-blur-sm text-white border-white/30 dark:border-white/20 px-4 py-2 text-sm font-semibold mb-6">
                  <Sparkles className="w-4 h-4 mr-2" />
                  CHOOSE YOUR PLAN
                </Badge>
                
                <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                  Simple, Transparent
                  <span className="block bg-gradient-to-r from-amber-300 to-yellow-300 bg-clip-text text-transparent">
                    Pricing
                  </span>
                </h1>
                
                <p className="text-xl text-blue-100 dark:text-blue-200 max-w-3xl mx-auto mb-8">
                  Choose the perfect plan for your real estate business. All plans include core features 
                  with flexible options to scale as you grow.
                </p>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto mt-12">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-white/20 dark:bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-white">500+</p>
                    <p className="text-blue-100 dark:text-blue-200">Active Agents</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-white/20 dark:bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-white">10K+</p>
                    <p className="text-blue-100 dark:text-blue-200">Properties Listed</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-white/20 dark:bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-white">99%</p>
                    <p className="text-blue-100 dark:text-blue-200">Satisfaction Rate</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Plans */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          {/* Features Comparison */}
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Compare Plans & Features
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              All plans include our core features with additional benefits as you upgrade
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => {
              const isPopular = index === getPopularPlanIndex();
              
              return (
                <div 
                  key={plan.id} 
                  className={`relative hover:lg:scale-105 transition-all duration-400`}
                >
                  
                  <Card 
                    className={`h-full bg-gradient-to-br ${getPlanBgColor(index)} ${getPlanDarkBgColor(index)} border-2 ${
                      isPopular ? 'border-amber-300 dark:border-amber-600 shadow-2xl' : `${getPlanBorderColor(index)} ${getPlanDarkBorderColor(index)}`
                    } rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden`}
                  >
                    <CardContent className="p-0 h-full flex flex-col">
                      {/* Plan Header */}
                      <div className={`bg-gradient-to-r ${getPlanColor(index)} ${getPlanDarkColor(index)} p-8 text-white relative overflow-hidden`}>
                        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 dark:bg-white/5 rounded-full -translate-y-10 translate-x-10"></div>
                        <div className="relative z-10">
                          <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                          <p className="text-white/80 dark:text-white/70 text-sm mb-6">{plan.description}</p>
                          
                          <div className="flex items-end justify-between">
                            <div>
                              <p className="text-4xl lg:text-5xl font-bold">${plan.price}</p>
                              <p className="text-white/80 dark:text-white/70 text-lg">per {plan.duration_days} days</p>
                            </div>
                            <div className="text-right">
                              <div className="w-12 h-12 bg-white/20 dark:bg-white/10 rounded-xl flex items-center justify-center">
                                <CreditCard className="w-6 h-6 text-white" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Plan Features */}
                      <div className="p-6 flex-1">
                        <div className="space-y-4 mb-8">
                          {/* Core Limits */}
                          <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                              <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                              <p className="font-semibold text-gray-900 dark:text-white text-sm">
                                {plan.property_limit === 0 ? 'Unlimited' : plan.property_limit}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Properties</p>
                            </div>
                            <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                              <Star className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
                              <p className="font-semibold text-gray-900 dark:text-white text-sm">{plan.featured_limit}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Featured</p>
                            </div>
                            <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                              <Image className="w-6 h-6 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                              <p className="font-semibold text-gray-900 dark:text-white text-sm">{plan.image_limit}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Images</p>
                            </div>
                            <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                              <Calendar className="w-6 h-6 text-amber-600 dark:text-amber-400 mx-auto mb-2" />
                              <p className="font-semibold text-gray-900 dark:text-white text-sm">{plan.duration_days}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Days</p>
                            </div>
                          </div>

                          {/* Key Features */}
                          <div className="space-y-3">
                            {plan.features.slice(0, 4).map((feature, featureIndex) => (
                              <div key={featureIndex} className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                              </div>
                            ))}
                            
                            {/* Premium Features */}
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">Video Tours</span>
                                {plan.video_allowed ? (
                                  <CheckCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                                ) : (
                                  <XCircle className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                                )}
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">Priority Support</span>
                                {plan.priority_support ? (
                                  <CheckCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                                ) : (
                                  <XCircle className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* CTA Button */}
                        <Button
                          onClick={() => navigate(isAgent ? `/agent/subscription-plan/checkout/${plan.id}` : `/subscription-plan/checkout/${plan.id}`)}
                          className={`w-full bg-gradient-to-r ${getPlanButtonColor(index)} ${getPlanDarkButtonColor(index)} text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none cursor-pointer`}
                        >
                          Get Started
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>

          {/* FAQ Section */}
          {!isAgent && (
            <div className="max-w-4xl mx-auto mt-24">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Frequently Asked Questions
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-400">
                  Everything you need to know about our subscription plans
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  {
                    question: "Can I change plans later?",
                    answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately."
                  },
                  {
                    question: "Is there a free trial?",
                    answer: "We offer a 14-day free trial on all paid plans. No credit card required to start."
                  },
                  {
                    question: "What payment methods do you accept?",
                    answer: "We accept all major credit cards, PayPal, and bank transfers for annual plans."
                  },
                  {
                    question: "Can I cancel anytime?",
                    answer: "Yes, you can cancel your subscription at any time. No long-term contracts required."
                  }
                ].map((faq, index) => (
                  <Card key={index} className="bg-white dark:bg-gray-900/50 dark:backdrop-blur-sm border-2 border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        {faq.question}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{faq.answer}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Bottom CTA */}
          {!isAgent && (
            <div className="text-center mt-16">
              <Card className="bg-gradient-to-r from-blue-600 to-emerald-600 dark:from-blue-700 dark:to-emerald-700 border-0 shadow-2xl">
                <CardContent className="p-8 text-white">
                  <h3 className="text-2xl lg:text-3xl font-bold mb-4">
                    Ready to Grow Your Real Estate Business?
                  </h3>
                  <p className="text-blue-100 dark:text-blue-200 text-lg mb-6 max-w-2xl mx-auto">
                    Join thousands of successful agents who trust our platform to showcase their properties and connect with buyers.
                  </p>
                  <Button
                    className="bg-white text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-200 font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SubscriptionPlans;