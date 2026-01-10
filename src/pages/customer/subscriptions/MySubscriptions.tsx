/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  CreditCard, 
  Crown,
  Zap,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Eye,
  Headphones,
  Sparkles,
  TrendingUp,
  RefreshCw
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { cancelSubscription, mySubscriptions, UserSubscription } from "@/api/customer/subscriptions";
import DeleteModal from "@/pages/admin/agents/components/DeleteModal";
import AdminLayout from "@/components/layout/admin/AdminLayout";
import { useAuth } from "@/context/AuthContext";

const MySubscriptions = () => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [showCancelSubscriptionModal, setShowCancelSubscriptionModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cancelingId, setCancelingId] = useState<number | null>(null);
  const [canceling, setCanceling] = useState(false);
  const navigate = useNavigate();

  let isAgent = false;

  if(user?.role == "agent"){
    isAgent = true;
  }

  const Layout = isAgent ? AdminLayout : React.Fragment;

  useEffect(() => {
      fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      // Replace with your actual API endpoint
      const response = await mySubscriptions();
      
      if (response.success) {
        setSubscriptions(response.data.subscriptions);
      } else {
        toast.error("Failed to fetch subscriptions");
      }
    } catch (error: any) {
      toast.error("Error loading subscriptions: " + (error.message || ""));
    } finally {
      setLoading(false);
    }
  };

  const openCancelSubscriptionModal = (subscriptionId: number) => {
    setCancelingId(subscriptionId);
    setShowCancelSubscriptionModal(true);
  }

  const handleCancelSubscription = async (subscriptionId: number) => {
    try {
      setCanceling(true);
      const res = await cancelSubscription(subscriptionId);
      
      if (res.success) {
        toast.success(res.message || "Subscription cancelled successfully");
        fetchSubscriptions();
      } else {
        toast.error(res.message || "Failed to cancel subscription");
      }
    } catch (error: any) {
      toast.error("Error cancelling subscription: " + (error.message || ""));
    } finally {
      setCancelingId(null);
      setShowCancelSubscriptionModal(false);
    }
  };

  const handleRenewSubscription = async (subscriptionId: number) => {
    try {
      const response = await fetch(`/api/subscriptions/${subscriptionId}/renew`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success("Subscription renewed successfully");
        fetchSubscriptions();
      } else {
        toast.error("Failed to renew subscription");
      }
    } catch (error: any) {
      toast.error("Error renewing subscription: " + (error.message || ""));
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { 
        color: 'bg-emerald-100 text-emerald-800', 
        darkColor: 'dark:bg-emerald-900/30 dark:text-emerald-400',
        icon: CheckCircle 
      },
      canceled: { 
        color: 'bg-amber-100 text-amber-800', 
        darkColor: 'dark:bg-amber-900/30 dark:text-amber-400',
        icon: Clock 
      },
      expired: { 
        color: 'bg-red-100 text-red-800', 
        darkColor: 'dark:bg-red-900/30 dark:text-red-400',
        icon: XCircle 
      },
      pending: { 
        color: 'bg-blue-100 text-blue-800', 
        darkColor: 'dark:bg-blue-900/30 dark:text-blue-400',
        icon: Clock 
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} ${config.darkColor} px-3 py-1 text-sm font-semibold`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getRemainingDays = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === 0) return 0; // Unlimited
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage < 70) return 'bg-emerald-500';
    if (percentage < 90) return 'bg-amber-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your subscriptions...</p>
        </div>
      </div>
    );
  }
  
  const activeSubscription = subscriptions.find(sub => sub.status === 'active');
  const pastSubscriptions = subscriptions.filter(sub => sub.status !== 'active');

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-emerald-500 dark:from-blue-600 dark:to-emerald-600 rounded-2xl">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">My Subscriptions</h1>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Manage your subscription plans and track your usage
            </p>
          </div>

          {/* Current Subscription */}
          {activeSubscription ? (
            <div className="space-y-6 mb-12">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-amber-500" />
                  Current Active Plan
                </h2>
                {getStatusBadge(activeSubscription.status)}
              </div>

              <Card className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 border-2 border-emerald-200 dark:border-emerald-800/50 rounded-2xl shadow-xl overflow-hidden">
                <CardContent className="p-0">
                  {/* Plan Header */}
                  <div className="bg-gradient-to-r from-emerald-500 to-green-500 dark:from-emerald-600 dark:to-green-600 p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 dark:bg-white/5 rounded-full -translate-y-12 translate-x-12"></div>
                    <div className="relative z-10">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                        <div>
                          <h3 className="text-3xl font-bold">{activeSubscription?.plan?.name ?? ""}</h3>
                          <p className="text-emerald-100 dark:text-emerald-200 text-lg">Active Subscription</p>
                        </div>
                        <div className="text-right">
                          <p className="text-4xl font-bold">${activeSubscription?.plan?.price ?? ""}</p>
                          <p className="text-emerald-100 dark:text-emerald-200">per {activeSubscription?.plan?.duration_days ?? ""} days</p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="bg-white/20 rounded-full h-3 mb-2">
                        <div 
                          className="bg-white rounded-full h-3 transition-all duration-500"
                          style={{ 
                            width: `${(getRemainingDays(activeSubscription?.ends_at ?? "") / (activeSubscription?.plan?.duration_days ?? 0)) * 100}%` 
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm text-emerald-100 dark:text-emerald-200">
                        <span>Renews in {getRemainingDays(activeSubscription?.ends_at ?? "")} days</span>
                        <span>{new Date(activeSubscription?.ends_at ?? "").toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Usage Statistics */}
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          Usage Statistics
                        </h4>
                        <div className="space-y-4">
                          {/* Properties Usage */}
                          <div>
                            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                              <span>Properties</span>
                              <span>
                                {activeSubscription?.plan?.property_limit ?? 0}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-500 ${getUsageColor(
                                  getUsagePercentage(10, activeSubscription?.plan?.property_limit ?? 0)
                                )}`}
                                style={{ 
                                  width: `${getUsagePercentage(10, activeSubscription?.plan?.property_limit ?? 0)}%` 
                                }}
                              ></div>
                            </div>
                          </div>

                          {/* Featured Usage */}
                          <div>
                            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                              <span>Featured Properties</span>
                              <span>{activeSubscription?.plan?.featured_limit ?? 0}</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-500 ${getUsageColor(
                                  getUsagePercentage(10, activeSubscription?.plan?.featured_limit ?? 0)
                                )}`}
                                style={{ 
                                  width: `${getUsagePercentage(10, activeSubscription?.plan?.featured_limit ?? 0)}%` 
                                }}
                              ></div>
                            </div>
                          </div>

                          {/* Images Usage */}
                          <div>
                            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                              <span>Images Used</span>
                              <span>{activeSubscription?.plan?.image_limit ?? 0}</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-500 ${getUsageColor(
                                  getUsagePercentage(10, activeSubscription?.plan?.image_limit ?? 0)
                                )}`}
                                style={{ 
                                  width: `${getUsagePercentage(10, activeSubscription?.plan?.image_limit ?? 0)}%` 
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Plan Features */}
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <Zap className="w-5 h-5 text-amber-600" />
                          Plan Features
                        </h4>
                        <div className="space-y-3">
                          {activeSubscription?.plan?.features.slice(0, 4).map((feature, index) => (
                            <div key={index} className="flex items-center gap-3">
                              <CheckCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                            </div>
                          ))}
                          
                          {/* Premium Features */}
                          <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">Video Tours</span>
                              {activeSubscription?.plan?.video_allowed ? (
                                <CheckCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                              ) : (
                                <XCircle className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">Priority Support</span>
                              {activeSubscription?.plan?.priority_support ? (
                                <CheckCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                              ) : (
                                <XCircle className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        onClick={() => navigate(isAgent ? '/agent/subscription-plans' : '/subscription-plans')}
                        variant="outline"
                        className="flex-1 border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Other Plans
                      </Button>
                      <Button
                        onClick={() => openCancelSubscriptionModal(activeSubscription.id)}
                        disabled={cancelingId === activeSubscription.id}
                        variant="outline"
                        className="flex-1 border-amber-300 dark:border-amber-700 cursor-pointer text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30"
                      >
                          <XCircle className="w-4 h-4 mr-2" />
                          Cancel Subscription
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* No Active Subscription */
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 border-2 border-blue-200 dark:border-blue-800/50 rounded-2xl shadow-xl mb-12">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 dark:from-blue-600 dark:to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Active Subscription</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  You don't have an active subscription. Choose a plan to unlock premium features and grow your real estate business.
                </p>
                <Button
                  onClick={() => navigate(isAgent ? '/agent/subscription-plans' : '/subscription-plans')}
                  className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 dark:from-blue-700 dark:to-emerald-700 dark:hover:from-blue-800 dark:hover:to-emerald-800 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Browse Plans
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Past Subscriptions */}
          {pastSubscriptions.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Clock className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                Subscription History
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastSubscriptions.map((subscription) => (
                  <Card key={subscription.id} className="bg-white dark:bg-gray-900/50 dark:backdrop-blur-sm border-2 border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{subscription?.plan?.name ?? ''}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">${subscription?.plan?.price ?? 0} / {subscription?.plan?.duration_days ?? 0} days</p>
                        </div>
                        {getStatusBadge(subscription.status)}
                      </div>

                      <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex justify-between">
                          <span>Started</span>
                          <span>{new Date(subscription?.starts_at ?? "").toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Ended</span>
                          <span>{new Date(subscription.ends_at ?? "").toLocaleDateString()}</span>
                        </div>
                        {subscription?.cancelled_at && (
                          <div className="flex justify-between">
                            <span>Cancelled</span>
                            <span>{new Date(subscription.cancelled_at).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      {subscription.status === 'expired' && (
                        <Button
                          onClick={() => handleRenewSubscription(subscription.id)}
                          className="w-full mt-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 dark:from-blue-700 dark:to-cyan-700 dark:hover:from-blue-800 dark:hover:to-cyan-800 text-white"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Renew Plan
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Support Card */}
          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/30 dark:to-violet-900/30 border-2 border-purple-200 dark:border-purple-800/50 rounded-2xl shadow-xl mt-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Headphones className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Need Help with Your Subscription?</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Our support team is here to assist you</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <Button
                  variant="outline"
                  className="flex-1 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30"
                  onClick={() => window.open('mailto:support@realestate.com', '_blank')}
                >
                  Contact Support
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => window.open('/help/subscriptions', '_blank')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Help Center
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <DeleteModal 
          show={showCancelSubscriptionModal}
          title="Cancel Subscription" 
          message="Are you sure you want to cancel this subscription? You'll lose access to premium features."
          onClose={() => {setCancelingId(null); setShowCancelSubscriptionModal(false);}}
          onConfirm={() => handleCancelSubscription(cancelingId ?? 0)} 
          loading={canceling}
          cancelText="Cancel"
          confirmText="Yes"
          loadingText="Cancelling..."
        />
      </div>
    </Layout>
  );
};

export default MySubscriptions;