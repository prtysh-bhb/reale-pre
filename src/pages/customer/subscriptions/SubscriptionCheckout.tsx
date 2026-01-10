/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { 
  CreditCard, 
  Lock, 
  Shield, 
  CheckCircle, 
  ArrowLeft,
  Sparkles,
  Building2,
  Star,
  Calendar,
  Image,
  Headphones
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { SubscriptionPlan } from "@/api/admin/subscriptions";
import { confirmSubscriptionPlanPayment, createSubscriptionPlanIntent, getSubscriptionPlan , emailInvoice, fetchInvoicePdf } from "@/api/customer/subscriptions";
import { useAuth } from "@/context/AuthContext";
import AdminLayout from "@/components/layout/admin/AdminLayout";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

function CheckoutForm() {
  const { user } = useAuth();
  const { planId } = useParams();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [subscriptionPlan, setSubscriptionPlan] = useState<SubscriptionPlan | null>(null);

  let isAgent = false;

  if(user?.role == "agent"){
    isAgent = true;
  }

  const Layout = isAgent ? AdminLayout : React.Fragment;

  // Fetch plan details and create payment intent
  useEffect(() => {
    async function createIntent() {
      try {
        const res = await getSubscriptionPlan(Number(planId));   
        const paymentIntentRes = await createSubscriptionPlanIntent(Number(planId));   
        
        if (res.success) {
          setClientSecret(paymentIntentRes.data.client_secret);
          setSubscriptionPlan(res.data.plan);
        } else {
          toast.error("Failed to load plan details");
        }
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Something went wrong");
        navigate(isAgent ? '/agent/subscription-plans' : '/subscription-plans');
      }
    }
    createIntent();
  }, [planId, navigate]);

  // Handle form submit
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!stripe || !elements) return;
    setLoading(true);

    const card = elements.getElement(CardElement);
    if (!card) {
      toast.error("Card input not found");
      setLoading(false);
      return;
    }

    try {    
      const result = await stripe.confirmCardPayment(clientSecret!, {
        payment_method: { card },
      });

      if (result.error) {
        toast.error(result.error.message || "Payment failed");
        setLoading(false);
        return;
      }

      if (result.paymentIntent?.status === "succeeded") {
        // 1) Confirm subscription + get payment ID from your backend
        const confirmRes = await confirmSubscriptionPlanPayment(
          Number(planId),
          result.paymentIntent.id
        );

        if (!confirmRes?.success) {
          toast.error("Subscription activation failed");
          setLoading(false);
          return;
        }

        const paymentId = confirmRes.data?.payment?.id;
        if (!paymentId) {
          toast.success("Subscription activated (no invoice ID returned)");
          // navigate to dashboard anyway
          navigate("/dashboard");
          return;
        }

        // 2) Open a blank tab immediately to avoid popup blocking
        const invoiceWindow = window.open("", "_blank");

        // 3) Fetch protected PDF via axios (sanctum/auth included in `api`)
        try {
          const pdfBlob = await fetchInvoicePdf(paymentId); // returns Blob
          const fileURL = window.URL.createObjectURL(pdfBlob as Blob);

          // If the new window was opened successfully, set its location to the blob URL.
          // If popup was blocked and invoiceWindow is null, fallback to open in same tab.
          if (invoiceWindow) {
            // set location of opened tab to the blob URL
            invoiceWindow.location.href = fileURL;
          } else {
            // popup blocked — open in same tab
            window.location.href = fileURL;
          }

          // 4) Fire-and-forget email invoice (don't await — so navigation is immediate)
          emailInvoice(paymentId).catch((err) => {
            console.error("Email invoice failed:", err);
          });

          // 5) Notify user and navigate current tab to dashboard immediately
          toast.success("🎉 Subscription active — Invoice opened & emailed!");
          navigate(isAgent ? "/agent/my-subscriptions" : "/my-subscriptions");

        } catch (invErr) {
          console.error("Invoice fetch/open error:", invErr);

          try {
            if (invoiceWindow && !invoiceWindow.closed) invoiceWindow.close();
          } catch (err) {
            // ignore
          }

          // Fallback: ask backend to email invoice, then redirect to dashboard
          try {
            await emailInvoice(paymentId);
          } catch (emailErr) {
            console.error("Fallback email failed:", emailErr);
          }

          toast.success("Subscription active! Invoice will be emailed shortly.");
          navigate("/dashboard");
        }
      }
    } catch (error: any) {
      console.error("Payment processing failed:", error);
      toast.error("Payment failed: " + (error.message || ""));
    } finally {
      setLoading(false);
    }
  }

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#374151',
        '::placeholder': {
          color: '#9CA3AF',
        },
        padding: '12px',
      },
    },
    hidePostalCode: true,
  };

  // Dark mode card element options
  const cardElementOptionsDark = {
    style: {
      base: {
        fontSize: '16px',
        color: '#E5E7EB',
        '::placeholder': {
          color: '#6B7280',
        },
        backgroundColor: '#1F2937',
        iconColor: '#9CA3AF',
        padding: '12px',
      },
    },
    hidePostalCode: true,
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <Button
              onClick={() => navigate(isAgent ? '/agent/subscription-plans' : '/subscription-plans')}
              variant="ghost"
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/30 mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Plans
            </Button>
            
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-emerald-500 dark:from-blue-600 dark:to-emerald-600 rounded-2xl">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Complete Your Purchase</h1>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Secure checkout with industry-leading encryption
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Payment Form */}
            <Card className="bg-white dark:bg-gray-900/50 dark:backdrop-blur-sm border-2 border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Shield className="w-6 h-6 text-emerald-600 dark:text-emerald-500" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Payment Details</h2>
                </div>

                {/* Security Badge */}
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 border-2 border-emerald-200 dark:border-emerald-800/50 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <p className="font-semibold text-emerald-900 dark:text-emerald-300">Secure Payment</p>
                      <p className="text-sm text-emerald-700 dark:text-emerald-400">
                        Your payment information is encrypted and secure
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Card Element */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Card Information
                    </label>
                    <div className="border-2 border-gray-300 dark:border-gray-700 rounded-xl p-4 hover:border-blue-500 dark:hover:border-blue-500 focus-within:border-blue-500 dark:focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500 dark:focus-within:ring-blue-500 transition-all duration-200">
                      <CardElement options={cardElementOptionsDark} />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Supported cards: Visa, MasterCard, American Express
                    </p>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={!stripe || loading || !clientSecret}
                    className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 dark:from-blue-700 dark:to-emerald-700 dark:hover:from-blue-800 dark:hover:to-emerald-800 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5 mr-2" />
                        Complete Purchase
                      </>
                    )}
                  </Button>

                  {/* Trust Indicators */}
                  <div className="flex items-center justify-center gap-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
                      SSL Secure
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <Lock className="w-4 h-4 text-blue-600 dark:text-blue-500" />
                      256-bit Encryption
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 border-2 border-blue-200 dark:border-blue-800/50 rounded-2xl shadow-xl">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Order Summary</h2>
                  </div>

                  {subscriptionPlan && (
                    <div className="space-y-6">
                      {/* Plan Header */}
                      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 dark:from-blue-600 dark:to-cyan-600 rounded-2xl p-6 text-white">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-2xl font-bold">{subscriptionPlan.name}</h3>
                          <Badge className="bg-white/20 dark:bg-white/10 backdrop-blur-sm text-white border-white/30 dark:border-white/20">
                            Selected Plan
                          </Badge>
                        </div>
                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-4xl font-bold">${subscriptionPlan.price}</p>
                            <p className="text-blue-100 dark:text-blue-200 text-lg">
                              per {subscriptionPlan.duration_days} days
                            </p>
                          </div>
                          <CreditCard className="w-8 h-8 text-white opacity-80" />
                        </div>
                      </div>

                      {/* Plan Features */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-lg">What's Included:</h4>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                            <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white text-sm">
                                {subscriptionPlan.property_limit === 0 ? 'Unlimited' : subscriptionPlan.property_limit}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Properties</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                            <Star className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white text-sm">{subscriptionPlan.featured_limit}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Featured</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                            <Image className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white text-sm">{subscriptionPlan.image_limit}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Images</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                            <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white text-sm">{subscriptionPlan.duration_days}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Days</p>
                            </div>
                          </div>
                        </div>

                        {/* Premium Features */}
                        <div className="space-y-3">
                          <h5 className="font-semibold text-gray-900 dark:text-white">Premium Features:</h5>
                          {subscriptionPlan.features.slice(0, 3).map((feature, index) => (
                            <div key={index} className="flex items-center gap-3">
                              <CheckCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                            </div>
                          ))}
                          
                          {/* Additional Premium Indicators */}
                          <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">Video Tours</span>
                            {subscriptionPlan.video_allowed ? (
                              <CheckCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                            ) : (
                              <div className="w-5 h-5 text-gray-300 dark:text-gray-600">—</div>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">Priority Support</span>
                            {subscriptionPlan.priority_support ? (
                              <CheckCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                            ) : (
                              <div className="w-5 h-5 text-gray-300 dark:text-gray-600">—</div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Total */}
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <div className="flex items-center justify-between text-lg font-bold text-gray-900 dark:text-white">
                          <span>Total Due Today</span>
                          <span>${subscriptionPlan.price}</span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                          Your subscription will auto-renew every {subscriptionPlan.duration_days} days
                        </p>
                      </div>
                    </div>
                  )}

                  {!subscriptionPlan && (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                      <p className="text-gray-600 dark:text-gray-400">Loading plan details...</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Support Card */}
              <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/30 dark:to-violet-900/30 border-2 border-purple-200 dark:border-purple-800/50 rounded-2xl shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Headphones className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Need Help?</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Our support team is here to help</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-4 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30"
                    onClick={() => window.open('mailto:support@realestate.com', '_blank')}
                  >
                    Contact Support
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default function SubscriptionCheckout() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
}