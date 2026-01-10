/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/customer/wallet/CustomerWallet.tsx
import { useState, useEffect } from "react";
import {
  Coins,
  TrendingUp,
  TrendingDown,
  History,
  ShoppingCart,
  CreditCard,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Search,
  Calendar,
  Loader2,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Package,
  Clock,
  Image,
  Phone,
  CalendarDays,
  FileText,
  MapPin,
  Video,
  MessageSquare,
  Eye as EyeIcon,
  BarChart3,
  X
} from "lucide-react";
import { toast } from "sonner";
import {
  WalletSummary,
  CreditPackage,
  WalletTransaction,
  WalletActionType,
  getWalletSummary,
  getWalletPackages,
  getWalletTransactions,
  buyWalletPackage,
  spendWalletCredits,
  getWalletBalance,
} from "@/api/customer/credit";
import { getAppSettings } from "@/api/admin/appsetting";

// Mock Stripe integration (you'll need to implement actual Stripe)
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

// Initialize Stripe (replace with your publishable key)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "pk_test_123");

// Icon mapping for quick actions
const quickActionIcons: Record<string, React.ReactNode> = {
  property_photo: <Image className="w-4 h-4" />,
  property_video: <Video className="w-4 h-4" />,
  agent_number: <Phone className="w-4 h-4" />,
  book_appointment: <CalendarDays className="w-4 h-4" />,
  exact_location: <MapPin className="w-4 h-4" />,
  unlock_documents: <FileText className="w-4 h-4" />,
  send_inquiry: <MessageSquare className="w-4 h-4" />,
  unlock_vr_tour: <EyeIcon className="w-4 h-4" />,
  view_analytics: <BarChart3 className="w-4 h-4" />,
};

// Default quick actions (fallback if no settings found)
const defaultQuickActions = [
  { type: "property_photo" as WalletActionType, label: "Property Photo", cost: 10 },
  { type: "agent_number" as WalletActionType, label: "Agent Contact", cost: 25 },
  { type: "book_appointment" as WalletActionType, label: "Book Appointment", cost: 50 },
  { type: "unlock_documents" as WalletActionType, label: "Unlock Documents", cost: 30 },
];

const CustomerWallet = () => {
  const [walletSummary, setWalletSummary] = useState<WalletSummary | null>(null);
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all, purchase, spend
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
  const [showBalance, setShowBalance] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionStats, setTransactionStats] = useState({
    totalTransactions: 0,
    totalPurchased: 0,
    totalSpent: 0,
    recentTransactions: 0,
  });
  const [quickActions, setQuickActions] = useState<Array<{
    type: WalletActionType;
    label: string;
    cost: number;
  }>>(defaultQuickActions);
  const [loadingQuickActions, setLoadingQuickActions] = useState(false);
  
  // New state for quick action modal
  const [showQuickActionModal, setShowQuickActionModal] = useState(false);
  const [selectedQuickAction, setSelectedQuickAction] = useState<{
    type: WalletActionType;
    label: string;
    cost: number;
  } | null>(null);
  const [propertyId, setPropertyId] = useState<string>("");

  // Load wallet data
  const loadWalletData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load summary
      const summaryResponse = await getWalletSummary();
      setWalletSummary(summaryResponse.data);
      
      // Load packages
      const packagesResponse = await getWalletPackages();
      setPackages(packagesResponse.data);
      
      // Load transactions
      const transactionsResponse = await getWalletTransactions({ page: currentPage });
      setTransactions(transactionsResponse.data.data);
      setTotalPages(transactionsResponse.data.last_page);
      
      // Calculate stats
      if (transactionsResponse.data.data.length > 0) {
        const stats = {
          totalTransactions: transactionsResponse.data.total,
          totalPurchased: transactionsResponse.data.data
            .filter(t => t.type === "purchase" || t.type === "admin_add")
            .reduce((sum, t) => sum + t.credits, 0),
          totalSpent: Math.abs(transactionsResponse.data.data
            .filter(t => t.type.includes("spend") || t.type === "admin_deduct")
            .reduce((sum, t) => sum + t.credits, 0)),
          recentTransactions: transactionsResponse.data.data.length,
        };
        setTransactionStats(stats);
      }
      
    } catch (err) {
      console.error("Error loading wallet data:", err);
      setError("Failed to load wallet data. Please try again.");
      toast.error("Failed to load wallet data");
    } finally {
      setLoading(false);
    }
  };

  // Load quick actions from app settings
  const loadQuickActions = async () => {
    try {
      setLoadingQuickActions(true);
      const response = await getAppSettings("wallet_actions");
      
      if (response.success && response.data) {
        // Check if response.data is an array or grouped object
        let settings: any[] = [];
        
        if (Array.isArray(response.data)) {
          settings = response.data;
        } else if (typeof response.data === 'object') {
          // If grouped by category, flatten the object
          settings = Object.values(response.data).flat();
        }
        
        // Parse quick actions from settings
        const parsedActions = parseQuickActionsFromSettings(settings);
        setQuickActions(parsedActions.length > 0 ? parsedActions : defaultQuickActions);
      } else {
        // Use default if API fails
        setQuickActions(defaultQuickActions);
      }
    } catch (error) {
      console.error("Error loading quick actions:", error);
      setQuickActions(defaultQuickActions);
    } finally {
      setLoadingQuickActions(false);
    }
  };

  // Helper function to parse quick actions from settings
  const parseQuickActionsFromSettings = (settings: any[]) => {
    const actions: Array<{
      type: WalletActionType;
      label: string;
      cost: number;
    }> = [];

    // Action type mapping from setting names to WalletActionType
    const actionTypeMapping: Record<string, WalletActionType> = {
      'property_photo_cost': 'property_photo',
      'property_video_cost': 'property_video',
      'agent_contact_cost': 'agent_number',
      'appointment_cost': 'book_appointment',
      'location_cost': 'exact_location',
      'documents_cost': 'unlock_documents',
      'inquiry_cost': 'send_inquiry',
      'vr_tour_cost': 'unlock_vr_tour',
      'analytics_cost': 'view_analytics',
    };

    // Action label mapping
    const actionLabelMapping: Record<string, string> = {
      'property_photo_cost': 'Property Photo',
      'property_video_cost': 'Property Video',
      'agent_contact_cost': 'Agent Contact',
      'appointment_cost': 'Book Appointment',
      'location_cost': 'Exact Location',
      'documents_cost': 'Unlock Documents',
      'inquiry_cost': 'Send Inquiry',
      'vr_tour_cost': 'VR Tour',
      'analytics_cost': 'View Analytics',
    };

    settings.forEach(setting => {
      const actionType = actionTypeMapping[setting.name];
      const label = actionLabelMapping[setting.name] || setting.label || setting.name;
      
      if (actionType && setting.value) {
        const cost = parseInt(setting.value, 10);
        if (!isNaN(cost) && cost > 0) {
          actions.push({
            type: actionType,
            label,
            cost
          });
        }
      }
    });

    // If no actions found in settings, return default
    return actions.length > 0 ? actions : defaultQuickActions;
  };

  useEffect(() => {
    loadWalletData();
    loadQuickActions();
  }, [currentPage]);

  // Handle package purchase
  const handleBuyPackage = async (pkg: CreditPackage) => {
    setSelectedPackage(pkg);
    setShowBuyModal(true);
  };

  // Handle quick action click - opens modal instead of alert
  const handleQuickActionClick = (action: {
    type: WalletActionType;
    label: string;
    cost: number;
  }) => {
    if (!walletSummary || walletSummary.current_credits <= 0) {
      toast.error("Insufficient credits");
      return;
    }

    if (walletSummary.current_credits < action.cost) {
      toast.error(`Insufficient credits. Required: ${action.cost}, Available: ${walletSummary.current_credits}`);
      return;
    }

    setSelectedQuickAction(action);
    setShowQuickActionModal(true);
  };

  // Handle spending credits from modal
  const handleSpendCredits = async (propertyId?: number) => {
    if (!selectedQuickAction || !walletSummary) return;

    try {
      setIsProcessing(true);
      const payload = { 
        action_type: selectedQuickAction.type, 
        property_id: propertyId || null 
      };
      const response = await spendWalletCredits(payload);
      
      if (response.success) {
        toast.success(`${selectedQuickAction.label} completed successfully!`);
        loadWalletData(); // Refresh data
        
        // Show remaining balance
        toast.info(`Remaining credits: ${walletSummary.current_credits - selectedQuickAction.cost}`, {
          duration: 3000,
        });
        
        // Close modal
        setShowQuickActionModal(false);
        setSelectedQuickAction(null);
        setPropertyId("");
      } else {
        toast.error(response.message || "Failed to complete action");
      }
    } catch (error: any) {
      console.error("Error spending credits:", error);
      toast.error(error.response?.data?.message || "Failed to complete action");
    } finally {
      setIsProcessing(false);
    }
  };

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      search === "" ||
      transaction.description?.toLowerCase().includes(search.toLowerCase()) ||
      transaction.type.toLowerCase().includes(search.toLowerCase());

    const matchesFilter = 
      filter === "all" ||
      (filter === "purchase" && (transaction.type === "purchase" || transaction.type === "admin_add")) ||
      (filter === "spend" && (transaction.type.includes("spend") || transaction.type === "admin_deduct"));

    return matchesSearch && matchesFilter;
  });

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get transaction type label
  const getTransactionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      purchase: "Credit Purchase",
      admin_add: "Admin Addition",
      spend: "Credit Spend",
      admin_deduct: "Admin Deduction",
      property_photo: "Property Photo",
      property_video: "Property Video",
      agent_number: "Agent Contact",
      book_appointment: "Book Appointment",
      exact_location: "Exact Location",
      unlock_documents: "Unlock Documents",
      send_inquiry: "Send Inquiry",
      unlock_vr_tour: "VR Tour",
      view_analytics: "View Analytics",
    };
    return labels[type] || type.replace('_', ' ');
  };

  // Get transaction icon
  const getTransactionIcon = (type: string, credits: number) => {
    const isPurchase = type === "purchase" || type === "admin_add";
    
    if (isPurchase) {
      return <ArrowUpRight className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
    } else {
      return <ArrowDownRight className="w-5 h-5 text-red-600 dark:text-red-400" />;
    }
  };

  // Get transaction amount color
  const getTransactionColor = (type: string, credits: number) => {
    const isPurchase = type === "purchase" || type === "admin_add";
    
    if (isPurchase) {
      return "text-emerald-600 dark:text-emerald-400";
    } else {
      return "text-red-600 dark:text-red-400";
    }
  };

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-500">Loading wallet...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-emerald-500 rounded-2xl p-6 text-white mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Coins className="text-white w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">My Wallet</h1>
                <p className="text-white/80">Manage your credits and transactions</p>
              </div>
            </div>
            <button
              onClick={() => {
                loadWalletData();
                loadQuickActions();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors backdrop-blur-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Main Balance Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg">
                  <Coins className="text-white w-6 h-6" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Current Balance
                </h2>
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  {showBalance ? (
                    <EyeOff className="w-4 h-4 text-gray-500" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-500" />
                  )}
                </button>
              </div>
              
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
                    {showBalance ? (walletSummary?.current_credits || 0).toLocaleString() : "•••••"}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 text-lg">credits</span>
                </div>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                  Available for use on property features and services
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <TrendingUp className="text-blue-600 dark:text-blue-400 w-5 h-5" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Purchased</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {walletSummary?.total_credits_purchased?.toLocaleString() || 0}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                  <TrendingDown className="text-emerald-600 dark:text-emerald-400 w-5 h-5" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Spent</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {walletSummary?.total_credits_spent?.toLocaleString() || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="lg:w-96 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900 dark:text-white">Quick Actions</h3>
                {loadingQuickActions && (
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                )}
              </div>
              
              {quickActions.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No actions available</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {quickActions.map((action) => (
                    <button
                      key={action.type}
                      onClick={() => handleQuickActionClick(action)}
                      disabled={!walletSummary || walletSummary.current_credits < action.cost || isProcessing}
                      className="p-3 text-center bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className={`p-2 rounded-lg ${
                          action.type.includes('photo') || action.type.includes('video') 
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                            : action.type.includes('agent') || action.type.includes('appointment')
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                            : action.type.includes('location') || action.type.includes('documents')
                            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                            : action.type.includes('inquiry') || action.type.includes('tour') || action.type.includes('analytics')
                            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}>
                          {quickActionIcons[action.type] || <FileText className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {action.label}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {action.cost} credits
                          </div>
                        </div>
                      </div>
                      
                      {walletSummary && walletSummary.current_credits < action.cost && (
                        <div className="mt-2 text-xs text-red-500 dark:text-red-400">
                          Insufficient credits
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
              
              <button
                onClick={() => setShowBuyModal(true)}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="animate-spin w-5 h-5" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    Buy More Credits
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Rest of the component remains the same... */}
        {/* Credit Packages */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg">
                <Package className="text-white w-5 h-5" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Available Credit Packages
              </h2>
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              Choose a package that fits your needs
            </p>
          </div>

          {packages.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No credit packages available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {packages
                .filter(pkg => pkg.status === "active")
                .map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`border rounded-xl p-5 transition-all hover:shadow-lg ${
                      pkg.status === "active"
                        ? "border-emerald-200 dark:border-emerald-800 hover:border-emerald-300 dark:hover:border-emerald-700"
                        : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">{pkg.name}</h3>
                        {pkg.status === "active" ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 mt-1">
                            Available
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 mt-1">
                            Unavailable
                          </span>
                        )}
                      </div>
                      <Coins className="text-gray-400 w-6 h-6" />
                    </div>

                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-gray-900 dark:text-white">
                          {formatCurrency(pkg.price)}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">USD</span>
                      </div>
                      <div className="mt-2">
                        <div className="flex items-center gap-2">
                          <Coins className="text-amber-500 w-4 h-4" />
                          <span className="text-lg font-semibold text-gray-900 dark:text-white">
                            {pkg.coins.toLocaleString()} credits
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {pkg.description || "Get credits for premium features"}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleBuyPackage(pkg)}
                      disabled={pkg.status !== "active" || isProcessing}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white rounded-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="animate-spin w-4 h-4" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4" />
                          Buy Now
                        </>
                      )}
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Transaction History */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg">
                  <History className="text-white w-5 h-5" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Transaction History
                </h2>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Transactions</option>
                  <option value="purchase">Purchases</option>
                  <option value="spend">Spends</option>
                </select>
              </div>
            </div>
          </div>

          {/* Transaction Stats */}
          <div className="p-6 bg-gray-50 dark:bg-gray-800/50">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <History className="text-blue-600 dark:text-blue-400 w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Transactions</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {transactionStats.totalTransactions}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                    <TrendingUp className="text-emerald-600 dark:text-emerald-400 w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Purchased</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {transactionStats.totalPurchased}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <TrendingDown className="text-red-600 dark:text-red-400 w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Spent</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {transactionStats.totalSpent}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                    <Clock className="text-amber-600 dark:text-amber-400 w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Recent (This Page)</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {transactionStats.recentTransactions}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Transactions List */}
          <div className="p-6">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <History className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No transactions found</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {search || filter !== "all" ? "Try adjusting your search or filter" : "Start by purchasing credits"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-white dark:bg-gray-900 rounded-lg">
                        {getTransactionIcon(transaction.type, transaction.credits)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {getTransactionTypeLabel(transaction.type)}
                          </p>
                          {transaction.property && (
                            <span className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded">
                              Property
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {transaction.description || "No description"}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <Calendar className="w-3 h-3" />
                            {formatDate(transaction.created_at)}
                          </span>
                          {transaction.property && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              ID: {transaction.property_id}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getTransactionColor(transaction.type, transaction.credits)}`}>
                        {transaction.type === "purchase" || transaction.type === "admin_add" ? "+" : "-"}
                        {Math.abs(transaction.credits).toLocaleString()} credits
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Transaction #{transaction.id}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 pt-6 border-t border-gray-200 dark:border-gray-800">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Buy Package Modal */}
      {showBuyModal && selectedPackage && (
        <Elements stripe={stripePromise}>
          <BuyPackageModal
            pkg={selectedPackage}
            isOpen={showBuyModal}
            setIsOpen={setShowBuyModal}
            onSuccess={loadWalletData}
          />
        </Elements>
      )}

      {/* Quick Action Confirmation Modal */}
      {showQuickActionModal && selectedQuickAction && (
        <QuickActionModal
          action={selectedQuickAction}
          isOpen={showQuickActionModal}
          setIsOpen={setShowQuickActionModal}
          propertyId={propertyId}
          setPropertyId={setPropertyId}
          onConfirm={() => handleSpendCredits(propertyId ? parseInt(propertyId) : undefined)}
          isProcessing={isProcessing}
          walletSummary={walletSummary}
        />
      )}
    </>
  );
};

// Buy Package Modal Component
const BuyPackageModal = ({
  pkg,
  isOpen,
  setIsOpen,
  onSuccess,
}: {
  pkg: CreditPackage;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSuccess: () => void;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
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

      // Call your API to process payment
      const response = await buyWalletPackage({
        package_id: pkg.id,
        payment_method_id: paymentMethod.id,
      });

      if (response.success) {
        toast.success("Payment successful! Credits added to your wallet.");
        setIsOpen(false);
        onSuccess();
      } else {
        throw new Error(response.message || "Payment failed");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      setPaymentError(error.message || "Payment failed. Please try again.");
      toast.error("Payment failed");
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Purchase Credits
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
                  {formatCurrency(pkg.price)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {pkg.coins.toLocaleString()} credits
                </div>
              </div>
            </div>
          </div>

          {/* Card Details */}
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

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-20 px-4 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              disabled={processing}
            >
              <X className="w-4 h-4 inline-block" />
            </button>
            <button
              type="submit"
              disabled={!stripe || processing}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white rounded-lg transition-all font-medium disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  Pay {formatCurrency(pkg.price)}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Quick Action Modal Component
const QuickActionModal = ({
  action,
  isOpen,
  setIsOpen,
  propertyId,
  setPropertyId,
  onConfirm,
  isProcessing,
  walletSummary,
}: {
  action: {
    type: WalletActionType;
    label: string;
    cost: number;
  };
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  propertyId: string;
  setPropertyId: (id: string) => void;
  onConfirm: () => void;
  isProcessing: boolean;
  walletSummary: WalletSummary | null;
}) => {
  if (!isOpen) return null;

  const needsPropertyId = action.type.includes('property') || 
                         action.type.includes('photo') || 
                         action.type.includes('video') ||
                         action.type === 'unlock_documents' ||
                         action.type === 'unlock_vr_tour' ||
                         action.type === 'exact_location';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Confirm Action
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
              disabled={isProcessing}
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Action Details */}
          <div className="mb-6">
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-900/20 dark:to-emerald-900/20 rounded-lg">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                {quickActionIcons[action.type] || <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
              </div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white">{action.label}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">This action will cost {action.cost} credits</p>
              </div>
            </div>
          </div>

          {/* Balance Info */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Current Balance</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {walletSummary?.current_credits?.toLocaleString() || 0} credits
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">After Spending</p>
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {(walletSummary ? walletSummary.current_credits - action.cost : 0).toLocaleString()} credits
                </p>
              </div>
            </div>
          </div>

          {/* Property ID Input (if needed) */}
          {needsPropertyId && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Property ID (Optional)
              </label>
              <input
                type="number"
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
                placeholder="Enter property ID if applicable"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Enter the property ID this action is for (if applicable)
              </p>
            </div>
          )}

          {/* Security Note */}
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This action cannot be undone. Credits will be deducted immediately upon confirmation.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-20 px-4 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              disabled={isProcessing}
            >
              <X className="w-4 h-4 inline-block" />
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isProcessing}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white rounded-lg transition-all font-medium disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Confirm ({action.cost} credits)
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add missing AlertTriangle icon import
import { AlertTriangle } from "lucide-react";

// Format currency helper
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export default CustomerWallet;