/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/pages/customer/PackagePlans.tsx
import { useState, useEffect } from "react";
import { 
  ShoppingBag, 
  Check, 
  Zap, 
  Award, 
  Crown, 
  Star,
  TrendingUp,
  Shield,
  Clock,
  Gift,
  ChevronRight,
  CreditCard,
  Sparkles,
  Target,
  Users,
  Trophy,
  Loader2,
  AlertCircle,
  Coins,
  XCircle,
  CheckCircle
} from "lucide-react";
import { toast } from "sonner";
import { CreditPackage, getWalletPackages, WalletSummary } from "@/api/customer/credit";

// Stripe integration
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

// Initialize Stripe (replace with your publishable key)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "pk_test_123");

// Features for each plan tier
const planFeatures = [
  { icon: <Zap size={16} />, text: "Instant credit delivery", color: "text-amber-500" },
  { icon: <Shield size={16} />, text: "Secure payment processing", color: "text-blue-500" },
  { icon: <Clock size={16} />, text: "24/7 customer support", color: "text-emerald-500" },
  { icon: <Gift size={16} />, text: "Bonus Coins on larger packs", color: "text-purple-500" },
];

const PackagePlans = () => {
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [walletSummary, setWalletSummary] = useState<WalletSummary | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [purchasing, setPurchasing] = useState(false);
  const [sortBy, setSortBy] = useState<"value" | "price" | "coins">("value");

  useEffect(() => {
    loadPackages();
    // TODO: Fetch user wallet summary from API
    // fetchWalletSummary();
  }, []);

  const loadPackages = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getWalletPackages();
      
      if (response.success) {
        // Filter only active packages and sort by best value
        const activePackages = response.data.filter(pkg => pkg.status === "active");
        const sortedPackages = sortPackages(activePackages, sortBy);
        setPackages(sortedPackages);
      } else {
        setError("Failed to load packages");
        toast.error("Failed to load packages");
      }
    } catch (error) {
      console.error("Error loading packages:", error);
      setError("Unable to connect to server");
      toast.error("Failed to load packages");
      
      // Fallback to mock data for demonstration
      setPackages(getFallbackPackages());
    } finally {
      setLoading(false);
    }
  };

  const sortPackages = (packages: CreditPackage[], sortBy: string) => {
    return [...packages].sort((a, b) => {
      switch (sortBy) {
        case "price":
          return a.price - b.price;
        case "coins":
          return b.coins - a.coins;
        case "value":
        default:
          const valueA = a.coins / a.price;
          const valueB = b.coins / b.price;
          return valueB - valueA;
      }
    });
  };

  const getFallbackPackages = (): CreditPackage[] => {
    return [
      {
        id: 1,
        name: "Starter Pack",
        price: 9.99,
        coins: 100,
        description: "Perfect for trying out our services",
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 2,
        name: "Pro Pack",
        price: 29.99,
        coins: 350,
        description: "Great value for regular users",
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 3,
        name: "Business Pack",
        price: 79.99,
        coins: 1000,
        description: "Best for business users",
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 4,
        name: "Enterprise Pack",
        price: 149.99,
        coins: 2000,
        description: "Maximum value for heavy users",
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 5,
        name: "Special Offer",
        price: 49.99,
        coins: 700,
        description: "Limited time special offer",
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 6,
        name: "Annual Premium",
        price: 299.99,
        coins: 4000,
        description: "Annual subscription with bonus",
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  };

  const handlePurchase = async (pkg: CreditPackage) => {
    setSelectedPackage(pkg);
    setShowPaymentModal(true);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const getPackageColor = (pkg: CreditPackage) => {
    const valuePerDollar = pkg.coins / pkg.price;
    
    if (valuePerDollar > 15) return "from-emerald-500 to-green-500";
    if (valuePerDollar > 10) return "from-blue-500 to-cyan-500";
    if (valuePerDollar > 5) return "from-purple-500 to-pink-500";
    return "from-amber-500 to-orange-500";
  };

  const getPackageIcon = (index: number) => {
    const icons = [
      <Sparkles className="text-white" size={24} />,
      <Zap className="text-white" size={24} />,
      <Award className="text-white" size={24} />,
      <Crown className="text-white" size={24} />,
      <Star className="text-white" size={24} />,
      <Trophy className="text-white" size={24} />
    ];
    return icons[index % icons.length];
  };

  const getBonusCoins = (pkg: CreditPackage) => {
    if (pkg.coins > 1000) return Math.floor(pkg.coins * 0.15);
    if (pkg.coins > 500) return Math.floor(pkg.coins * 0.10);
    if (pkg.coins > 100) return Math.floor(pkg.coins * 0.05);
    return 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 border-4 border-blue-500 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading packages...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && packages.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl mb-6">
              <AlertCircle className="w-12 h-12 text-red-500 dark:text-red-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Unable to Load Packages
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {error}
              </p>
              <button
                onClick={loadPackages}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 dark:from-blue-700 dark:via-purple-700 dark:to-emerald-700 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <TrendingUp size={16} className="text-white" />
              <span className="text-white text-sm font-medium">Boost Your Productivity</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Buy Coins & Unlock Premium Features
            </h1>
            
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Choose the perfect credit package for your needs. More Coins = More value!
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto max-w-6xl px-4 -mt-8 md:-mt-12 relative z-10">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {planFeatures.map((feature, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gradient-to-br ${feature.color.replace('text-', 'bg-')}/10`}>
                <div className={feature.color}>
                  {feature.icon}
                </div>
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {feature.text}
              </span>
            </div>
          ))}
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Sorting Options */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Available Packages
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {packages.length} packages available
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
            <select 
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as any);
                setPackages(sortPackages(packages, e.target.value));
              }}
              className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
            >
              <option value="value">Best Value</option>
              <option value="price">Lowest Price</option>
              <option value="coins">Most Coins</option>
            </select>
          </div>
        </div>

        {/* Packages Grid */}
        <section>
          {/* Mobile: Stacked, Tablet: 2 columns, Desktop: 3 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {packages.map((pkg, index) => {
              const isPopular = pkg.coins >= 1000; // Mark high-value packages as popular
              const valueRatio = pkg.coins / pkg.price;
              const bonusCoins = getBonusCoins(pkg);
              
              return (
                <div
                  key={pkg.id}
                  className={`relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border ${
                    isPopular 
                      ? 'border-emerald-500 dark:border-emerald-500' 
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute top-4 right-4 z-10">
                      <div className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                        <Star size={10} />
                        <span>POPULAR</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Package Header */}
                  <div className={`p-6 bg-gradient-to-br ${getPackageColor(pkg)} relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-8 -translate-x-8"></div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                          {getPackageIcon(index)}
                        </div>
                        {valueRatio > 15 && (
                          <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-bold">
                            BEST VALUE
                          </div>
                        )}
                      </div>
                      
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {pkg.name}
                      </h3>
                      <p className="text-white/90 text-sm">
                        {pkg.description || "Premium Coins package"}
                      </p>
                    </div>
                  </div>

                  {/* Package Details */}
                  <div className="p-6">
                    {/* Price */}
                    <div className="mb-6">
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-gray-900 dark:text-white">
                          {formatPrice(pkg.price)}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                          /one-time
                        </span>
                      </div>
                    </div>

                    {/* Coins */}
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Coins className="text-blue-500" size={18} />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Coins Included
                        </span>
                      </div>
                      <div className="text-3xl font-bold text-gray-900 dark:text-white">
                        {pkg.coins.toLocaleString()}
                      </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                          <Check size={12} className="text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Instant delivery
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                          <Check size={12} className="text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          No expiration date
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                          <Check size={12} className="text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Priority support
                        </span>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <button
                      onClick={() => handlePurchase(pkg)}
                      className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                        isPopular
                          ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white'
                          : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white'
                      }`}
                      disabled={purchasing}
                    >
                      {purchasing && selectedPackage?.id === pkg.id ? (
                        <>
                          <Loader2 className="animate-spin" size={18} />
                          Processing...
                        </>
                      ) : (
                        'Buy Now'
                      )}
                    </button>

                    {/* Bonus Indicator */}
                    {bonusCoins > 0 && (
                      <div className="mt-4 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full">
                          <Gift size={12} className="text-white" />
                          <span className="text-xs font-bold text-white">
                            +{bonusCoins} Bonus Coins!
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* FAQ Section */}
          <div className="mt-16 md:mt-24">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Frequently Asked Questions
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Got questions? We have answers
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[
                {
                  q: "How are Coins delivered?",
                  a: "Coins are delivered instantly to your account after payment confirmation."
                },
                {
                  q: "Do Coins expire?",
                  a: "No, purchased Coins never expire and remain in your account until used."
                },
                {
                  q: "Can I get a refund?",
                  a: "Refunds are available within 30 days for unused Coins."
                },
                {
                  q: "Are there any hidden fees?",
                  a: "No hidden fees. The price you see is the final price."
                },
                {
                  q: "What payment methods are accepted?",
                  a: "We accept all major credit cards, PayPal, and digital wallets."
                },
                {
                  q: "Can I upgrade my package later?",
                  a: "Yes, you can purchase additional Coins at any time."
                }
              ].map((faq, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Target className="text-blue-600 dark:text-blue-400" size={18} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {faq.q}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Stripe Payment Modal */}
      {showPaymentModal && selectedPackage && (
        <Elements stripe={stripePromise}>
          <StripePaymentModal
            pkg={selectedPackage}
            isOpen={showPaymentModal}
            setIsOpen={setShowPaymentModal}
            currentBalance={walletSummary?.current_credits || 150}
            setPurchasing={setPurchasing}
            onSuccess={() => {
              // Refresh data after successful purchase
              loadPackages();
              // TODO: Refresh wallet summary
            }}
          />
        </Elements>
      )}
    </div>
  );
};

// Stripe Payment Modal Component
const StripePaymentModal = ({
  pkg,
  isOpen,
  setIsOpen,
  currentBalance,
  setPurchasing,
  onSuccess,
}: {
  pkg: CreditPackage;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  currentBalance: number;
  setPurchasing: (purchasing: boolean) => void;
  onSuccess: () => void;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("card");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      toast.error("Payment system not initialized");
      return;
    }

    setProcessing(true);
    setPurchasing(true);
    setPaymentError(null);

    try {
      // Create payment method
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error("Card element not found");

      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
      });

      if (paymentMethodError) {
        throw new Error(paymentMethodError.message);
      }

      // Simulate API call (replace with actual buyWalletPackage API)
      const paymentResponse = await simulatePayment(pkg, paymentMethod.id);

      if (paymentResponse.success) {
        toast.success(`Successfully purchased ${pkg.coins.toLocaleString()} Coins!`);
        toast.info(`Transaction ID: ${paymentResponse.transactionId}`, {
          duration: 5000,
        });
        
        onSuccess();
        setIsOpen(false);
      } else {
        throw new Error(paymentResponse.message || "Payment failed");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      setPaymentError(error.message || "Payment failed. Please try again.");
      toast.error("Payment failed");
    } finally {
      setProcessing(false);
      setPurchasing(false);
    }
  };

  const simulatePayment = async (pkg: CreditPackage, paymentMethodId: string) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate payment success
    return {
      success: true,
      transactionId: `TX-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      message: "Payment successful"
    };
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg">
                <CreditCard className="text-white w-5 h-5" />
              </div>
              Complete Purchase
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
              disabled={processing}
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Package Details */}
          <div className="mb-6">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-900/20 dark:to-emerald-900/20 rounded-lg">
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white">{pkg.name}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{pkg.description}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatPrice(pkg.price)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {pkg.coins.toLocaleString()} Coins
                </div>
              </div>
            </div>
          </div>

          {/* Card Details (only shown when card is selected) */}
          {paymentMethod === "card" && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Card Details
              </label>
              <div className="p-4 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900">
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: "16px",
                        color: "#374151",
                        "::placeholder": {
                          color: "#9CA3AF",
                        },
                      },
                      invalid: {
                        color: "#EF4444",
                      },
                    },
                  }}
                />
              </div>
              {paymentError && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{paymentError}</p>
              )}
            </div>
          )}

          {/* Security Note */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle className="text-emerald-600 dark:text-emerald-400 w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your payment is secured with 256-bit SSL encryption. We never store your card details.
                </p>
              </div>
            </div>
          </div>

          {/* Terms */}
          <div className="mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                defaultChecked
                disabled={processing}
                required
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                I agree to the{" "}
                <a href="/terms" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Privacy Policy
                </a>
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              disabled={processing}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!stripe || processing}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-lg transition-all font-medium disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  Pay {formatPrice(pkg.price)}
                </>
              )}
            </button>
          </div>

          {/* Security Notice */}
          <div className="mt-4 text-center">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Shield size={12} />
              <span>Secure payment • 256-bit encryption</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// Import Eye and EyeOff icons
import { Eye, EyeOff } from "lucide-react";

export default PackagePlans;