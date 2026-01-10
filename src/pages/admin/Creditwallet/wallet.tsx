/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/pages/admin/WalletManagement.tsx
import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Download,
  Plus,
  Minus,
  Eye,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  CreditCard,
  BarChart3,
  Calendar,
  User,
  ChevronRight,
  RefreshCw,
  FileText,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import AdminLayout from "@/components/layout/admin/AdminLayout";
import { toast } from "sonner";
import {
  adminGetWallets,
  adminGetWalletByUser,
  adminAddCredits,
  adminDeductCredits,
  adminGetCreditUsageReport,
  adminGetCreditTransactions,
  AdminWallet,
  AdminCreditTransaction,
  CreditUsageReportData,
  AdminAdjustCreditsPayload,
  AdminWalletShowData,
} from "@/api/admin/credit";
import Select from "react-select";
import { customStyles } from "@/utils/reactSelectStyles";

const Wallet = () => {
  // States
  const [wallets, setWallets] = useState<AdminWallet[]>([]);
  const [transactions, setTransactions] = useState<AdminCreditTransaction[]>([]);
  const [report, setReport] = useState<CreditUsageReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingReport, setLoadingReport] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);

  // Mobile states
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"wallets" | "transactions">("wallets");

  // Search & Filters
  const [search, setSearch] = useState("");
  const [transactionType, setTransactionType] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({
    from: "",
    to: "",
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeductModal, setShowDeductModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<AdminWallet | null>(null);
  const [selectedUserDetails, setSelectedUserDetails] = useState<AdminWalletShowData | null>(null);

  // Form states
  const [adjustCredits, setAdjustCredits] = useState({
    credits: "",
    reason: "",
  });

  // Transaction type options
  const transactionTypeOptions = [
    { value: "", label: "All Types" },
    { value: "purchase", label: "Purchase" },
    { value: "spend", label: "Spend" },
    { value: "admin_add", label: "Admin Add" },
    { value: "admin_deduct", label: "Admin Deduct" },
    { value: "refund", label: "Refund" },
  ];

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadWallets(),
        loadReport(),
        loadTransactions(),
      ]);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const loadWallets = async () => {
    try {
      const response = await adminGetWallets({ search, page: currentPage });
      setWallets(response.data.data);
      setTotalPages(response.data.last_page);
    } catch (error) {
      toast.error("Failed to load wallets");
    }
  };

  const loadReport = async () => {
    try {
      setLoadingReport(true);
      const response = await adminGetCreditUsageReport();
      setReport(response.data);
    } catch (error) {
      toast.error("Failed to load report");
    } finally {
      setLoadingReport(false);
    }
  };

  const loadTransactions = async (params?: any) => {
    try {
      setLoadingTransactions(true);
      const response = await adminGetCreditTransactions({
        ...params,
        type: transactionType || undefined,
        user_id: userId || undefined,
        from_date: dateRange.from || undefined,
        to_date: dateRange.to || undefined,
        page: currentPage,
      });
      setTransactions(response.data.data);
    } catch (error) {
      toast.error("Failed to load transactions");
    } finally {
      setLoadingTransactions(false);
    }
  };

  const loadUserDetails = async (userId: number) => {
    try {
      const response = await adminGetWalletByUser(userId);
      setSelectedUserDetails(response.data);
      setShowDetailsModal(true);
    } catch (error) {
      toast.error("Failed to load user details");
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadWallets();
    loadTransactions();
  };

  const handleClearFilters = () => {
    setSearch("");
    setTransactionType("");
    setUserId("");
    setDateRange({ from: "", to: "" });
    setCurrentPage(1);
    loadWallets();
    loadTransactions();
  };

  const handleAddCredits = async () => {
    if (!selectedWallet) return;

    if (!adjustCredits.credits || !adjustCredits.reason) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      const payload: AdminAdjustCreditsPayload = {
        credits: parseInt(adjustCredits.credits),
        reason: adjustCredits.reason,
      };

      const response = await adminAddCredits(selectedWallet.user_id, payload);
      
      if (response.success) {
        toast.success(`Successfully added ${adjustCredits.credits} credits`);
        setShowAddModal(false);
        setAdjustCredits({ credits: "", reason: "" });
        loadAllData();
      }
    } catch (error) {
      toast.error("Failed to add credits");
    }
  };

  const handleDeductCredits = async () => {
    if (!selectedWallet) return;

    if (!adjustCredits.credits || !adjustCredits.reason) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      const payload: AdminAdjustCreditsPayload = {
        credits: parseInt(adjustCredits.credits),
        reason: adjustCredits.reason,
      };

      const response = await adminDeductCredits(selectedWallet.user_id, payload);
      
      if (response.success) {
        toast.success(`Successfully deducted ${adjustCredits.credits} credits`);
        setShowDeductModal(false);
        setAdjustCredits({ credits: "", reason: "" });
        loadAllData();
      }
    } catch (error) {
      toast.error("Failed to deduct credits");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("en-US");
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "purchase":
      case "admin_add":
      case "refund":
        return "text-emerald-600 dark:text-emerald-400";
      case "spend":
      case "admin_deduct":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "purchase":
      case "admin_add":
      case "refund":
        return <Plus size={14} className="text-emerald-500" />;
      case "spend":
      case "admin_deduct":
        return <Minus size={14} className="text-red-500" />;
      default:
        return null;
    }
  };

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case "purchase": return "Purchase";
      case "spend": return "Spend";
      case "admin_add": return "Admin Add";
      case "admin_deduct": return "Admin Deduct";
      case "refund": return "Refund";
      default: return type;
    }
  };

  // Calculate today's date for date inputs
  const today = new Date().toISOString().split('T')[0];

  return (
    <AdminLayout>
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 p-4 md:p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 md:p-3 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-xl">
                  <CreditCard className="text-white" size={20} />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-semibold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                    Wallet Management
                  </h1>
                  <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Manage user credits and transactions
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => loadAllData()}
                  className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  title="Refresh"
                >
                  <RefreshCw size={18} />
                </button>
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
                </button>
              </div>
            </div>

            {/* Mobile Tabs */}
            <div className="md:hidden">
              <div className="flex border-b border-gray-200 dark:border-gray-800">
                <button
                  onClick={() => setActiveTab("wallets")}
                  className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
                    activeTab === "wallets"
                      ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-500"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  Wallets
                </button>
                <button
                  onClick={() => setActiveTab("transactions")}
                  className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
                    activeTab === "transactions"
                      ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-500"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  Transactions
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-16 md:py-20">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-blue-500 dark:border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">
                Loading wallet data...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Overview - Mobile Responsive */}
            {report && (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 md:p-5 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs md:text-sm font-medium text-blue-700 dark:text-blue-300">
                        Purchased
                      </p>
                      <p className="text-lg md:text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                        {formatCurrency(report.overview.total_credits_purchased)}
                      </p>
                    </div>
                    <div className="p-2 md:p-3 bg-blue-500/10 rounded-lg">
                      <TrendingUp className="text-blue-600 dark:text-blue-400" size={20} />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 p-4 md:p-5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs md:text-sm font-medium text-emerald-700 dark:text-emerald-300">
                        Spent
                      </p>
                      <p className="text-lg md:text-2xl font-bold text-emerald-900 dark:text-emerald-100 mt-1">
                        {formatCurrency(report.overview.total_credits_spent)}
                      </p>
                    </div>
                    <div className="p-2 md:p-3 bg-emerald-500/10 rounded-lg">
                      <TrendingDown className="text-emerald-600 dark:text-emerald-400" size={20} />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 md:p-5 rounded-xl border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs md:text-sm font-medium text-purple-700 dark:text-purple-300">
                        In Circulation
                      </p>
                      <p className="text-lg md:text-2xl font-bold text-purple-900 dark:text-purple-100 mt-1">
                        {formatCurrency(report.overview.total_current_credits)}
                      </p>
                    </div>
                    <div className="p-2 md:p-3 bg-purple-500/10 rounded-lg">
                      <DollarSign className="text-purple-600 dark:text-purple-400" size={20} />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 p-4 md:p-5 rounded-xl border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs md:text-sm font-medium text-amber-700 dark:text-amber-300">
                        Users
                      </p>
                      <p className="text-lg md:text-2xl font-bold text-amber-900 dark:text-amber-100 mt-1">
                        {formatCurrency(report.overview.total_users_with_wallet)}
                      </p>
                    </div>
                    <div className="p-2 md:p-3 bg-amber-500/10 rounded-lg">
                      <Users className="text-amber-600 dark:text-amber-400" size={20} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Transaction Breakdown - Mobile Responsive */}
            {report && report.transactions_by_type.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-4 md:p-6">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <BarChart3 className="text-blue-500" size={18} />
                    <span className="hidden md:inline">Transaction Breakdown</span>
                    <span className="md:hidden">Breakdown</span>
                  </h2>
                  <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                    Total: {formatCurrency(report.overview.total_transactions)}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  {report.transactions_by_type.map((item) => (
                    <div
                      key={item.type}
                      className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 md:p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs md:text-sm font-medium ${getTransactionColor(item.type)} truncate`}>
                          {getTransactionLabel(item.type)}
                        </span>
                        <div className="flex items-center gap-1">
                          {getTransactionIcon(item.type)}
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {item.count}
                          </span>
                        </div>
                      </div>
                      <div className="text-base md:text-lg font-bold text-gray-900 dark:text-white">
                        {formatCurrency(item.total_credits)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        credits
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mobile Content Toggle */}
            <div className="md:hidden">
              {activeTab === "wallets" ? (
                // Mobile Wallets View
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                  {/* Mobile Filters */}
                  <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                    <div className="space-y-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <input
                          type="text"
                          placeholder="Search users..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={handleSearch}
                          className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                        >
                          Search
                        </button>
                        <button
                          onClick={handleClearFilters}
                          className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Wallets List */}
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {wallets.length === 0 ? (
                      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="font-medium">No wallets found</p>
                      </div>
                    ) : (
                      wallets.map((wallet) => (
                        <div
                          key={wallet.id}
                          className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white font-bold">
                                {wallet.user?.name?.charAt(0) || "U"}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {wallet.user?.name || "Unknown User"}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {wallet.user?.email || "No email"}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedWallet(wallet);
                                  setShowAddModal(true);
                                }}
                                className="p-1.5 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 transition-colors"
                                title="Add"
                              >
                                <Plus size={16} />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedWallet(wallet);
                                  setShowDeductModal(true);
                                }}
                                className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors"
                                title="Deduct"
                              >
                                <Minus size={16} />
                              </button>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-2 mb-3">
                            <div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Current</div>
                              <div className="font-bold text-gray-900 dark:text-white">
                                {formatCurrency(wallet.current_credits)}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Purchased</div>
                              <div className="text-emerald-600 dark:text-emerald-400 font-medium">
                                {formatCurrency(wallet.total_credits_purchased)}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Spent</div>
                              <div className="text-red-600 dark:text-red-400 font-medium">
                                {formatCurrency(wallet.total_credits_spent)}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>Updated: {formatDate(wallet.updated_at)}</span>
                            <button
                              onClick={() => {
                                setSelectedWallet(wallet);
                                loadUserDetails(wallet.user_id);
                              }}
                              className="flex items-center gap-1 text-blue-600 dark:text-blue-400"
                            >
                              <Eye size={12} />
                              Details
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                // Mobile Transactions View
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                      Recent Transactions
                    </h3>
                    {loadingTransactions ? (
                      <div className="py-8 text-center">
                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      </div>
                    ) : transactions.length === 0 ? (
                      <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                        No transactions found
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {transactions.slice(0, 5).map((transaction) => (
                          <div
                            key={transaction.id}
                            className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {getTransactionIcon(transaction.type)}
                                <span className={`text-sm font-medium ${getTransactionColor(transaction.type)}`}>
                                  {getTransactionLabel(transaction.type)}
                                </span>
                              </div>
                              <div className={`text-sm font-bold ${getTransactionColor(transaction.type)}`}>
                                {transaction.type === "spend" || transaction.type === "admin_deduct" ? "-" : "+"}
                                {formatCurrency(transaction.credits)}
                              </div>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                              {transaction.user?.name || "Unknown"} • {formatDate(transaction.created_at)}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-300 truncate">
                              {transaction.description || "No description"}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Desktop Content */}
            <div className="hidden md:block">
              {/* Filters */}
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden mb-6">
                <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-800">
                  <div className="flex flex-col lg:flex-row gap-3 md:gap-4">
                    {/* Search */}
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="text"
                          placeholder="Search users by name or email..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Transaction Type Filter */}
                    <div className="w-full lg:w-48">
                      <Select
                        options={transactionTypeOptions}
                        value={transactionTypeOptions.find(opt => opt.value === transactionType) || transactionTypeOptions[0]}
                        onChange={(selected) => setTransactionType(selected?.value || "")}
                        styles={customStyles}
                        className="react-select-container"
                        classNamePrefix="react-select"
                      />
                    </div>

                    {/* Date Range */}
                    <div className="flex gap-2">
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <input
                          type="date"
                          value={dateRange.from}
                          onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                          max={dateRange.to || today}
                          className="pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white w-40"
                        />
                      </div>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <input
                          type="date"
                          value={dateRange.to}
                          onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                          min={dateRange.from}
                          max={today}
                          className="pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white w-40"
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={handleSearch}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        Apply Filters
                      </button>
                      <button
                        onClick={handleClearFilters}
                        className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </div>

                {/* Wallets Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full w-full border-collapse">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 text-gray-700 dark:text-gray-200">
                        <th className="py-3 px-4 md:px-6 text-left font-semibold text-sm">User</th>
                        <th className="py-3 px-4 md:px-6 text-left font-semibold text-sm">Current Credits</th>
                        <th className="py-3 px-4 md:px-6 text-left font-semibold text-sm">Total Purchased</th>
                        <th className="py-3 px-4 md:px-6 text-left font-semibold text-sm">Total Spent</th>
                        <th className="py-3 px-4 md:px-6 text-left font-semibold text-sm">Last Updated</th>
                        <th className="py-3 px-4 md:px-6 text-center font-semibold text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900">
                      {wallets.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 md:py-12 text-center text-gray-500 dark:text-gray-400">
                            <div className="flex flex-col items-center gap-2 md:gap-3">
                              <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                <Search className="text-gray-400" size={20} />
                              </div>
                              <p className="font-medium">No wallets found</p>
                              <p className="text-sm">Try adjusting your search criteria</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        wallets.map((wallet) => (
                          <tr
                            key={wallet.id}
                            className="border-b border-gray-100 dark:border-gray-800 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors"
                          >
                            <td className="py-3 px-4 md:px-6">
                              <div className="flex items-center gap-2 md:gap-3">
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white font-bold text-sm">
                                  {wallet.user?.name?.charAt(0) || "U"}
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900 dark:text-white text-sm">
                                    {wallet.user?.name || "Unknown User"}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px] md:max-w-none">
                                    {wallet.user?.email || "No email"}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 md:px-6">
                              <div className="text-base md:text-lg font-bold text-gray-900 dark:text-white">
                                {formatCurrency(wallet.current_credits)}
                              </div>
                            </td>
                            <td className="py-3 px-4 md:px-6">
                              <div className="text-emerald-600 dark:text-emerald-400 font-medium">
                                {formatCurrency(wallet.total_credits_purchased)}
                              </div>
                            </td>
                            <td className="py-3 px-4 md:px-6">
                              <div className="text-red-600 dark:text-red-400 font-medium">
                                {formatCurrency(wallet.total_credits_spent)}
                              </div>
                            </td>
                            <td className="py-3 px-4 md:px-6 text-gray-600 dark:text-gray-400 text-sm">
                              {formatDate(wallet.updated_at)}
                            </td>
                            <td className="py-3 px-4 md:px-6">
                              <div className="flex justify-center gap-1 md:gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedWallet(wallet);
                                    loadUserDetails(wallet.user_id);
                                  }}
                                  className="p-1.5 md:p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-emerald-900/30 text-blue-600 dark:text-blue-400 transition-colors"
                                  title="View Details"
                                >
                                  <Eye size={16} />
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedWallet(wallet);
                                    setShowAddModal(true);
                                  }}
                                  className="p-1.5 md:p-2 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 transition-colors"
                                  title="Add Credits"
                                >
                                  <Plus size={16} />
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedWallet(wallet);
                                    setShowDeductModal(true);
                                  }}
                                  className="p-1.5 md:p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors"
                                  title="Deduct Credits"
                                >
                                  <Minus size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent Transactions Table */}
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-800">
                  <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <FileText className="text-blue-500" size={18} />
                    Recent Transactions
                  </h2>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full w-full border-collapse">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 text-gray-700 dark:text-gray-200">
                        <th className="py-3 px-4 md:px-6 text-left font-semibold text-sm">Transaction ID</th>
                        <th className="py-3 px-4 md:px-6 text-left font-semibold text-sm">User</th>
                        <th className="py-3 px-4 md:px-6 text-left font-semibold text-sm">Type</th>
                        <th className="py-3 px-4 md:px-6 text-left font-semibold text-sm">Credits</th>
                        <th className="py-3 px-4 md:px-6 text-left font-semibold text-sm">Description</th>
                        <th className="py-3 px-4 md:px-6 text-left font-semibold text-sm">Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900">
                      {loadingTransactions ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center">
                            <div className="flex items-center justify-center">
                              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          </td>
                        </tr>
                      ) : transactions.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-gray-500 dark:text-gray-400">
                            No transactions found
                          </td>
                        </tr>
                      ) : (
                        transactions.slice(0, 10).map((transaction) => (
                          <tr
                            key={transaction.id}
                            className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                          >
                            <td className="py-3 px-4 md:px-6">
                              <div className="font-mono text-xs text-gray-600 dark:text-gray-400">
                                #{transaction.id}
                              </div>
                            </td>
                            <td className="py-3 px-4 md:px-6">
                              <div className="font-medium text-gray-900 dark:text-white text-sm">
                                {transaction.user?.name || "Unknown"}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                ID: {transaction.user_id}
                              </div>
                            </td>
                            <td className="py-3 px-4 md:px-6">
                              <div className="flex items-center gap-2">
                                {getTransactionIcon(transaction.type)}
                                <span className={`font-medium text-sm ${getTransactionColor(transaction.type)}`}>
                                  {getTransactionLabel(transaction.type)}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 md:px-6">
                              <div className={`font-bold text-sm ${getTransactionColor(transaction.type)}`}>
                                {transaction.type === "spend" || transaction.type === "admin_deduct" ? "-" : "+"}
                                {formatCurrency(transaction.credits)}
                              </div>
                            </td>
                            <td className="py-3 px-4 md:px-6">
                              <div className="text-xs text-gray-600 dark:text-gray-400 max-w-[200px] truncate">
                                {transaction.description || "-"}
                              </div>
                            </td>
                            <td className="py-3 px-4 md:px-6 text-gray-600 dark:text-gray-400 text-sm">
                              {formatDate(transaction.created_at)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Modals - Mobile Responsive */}
        {/* Add Credits Modal */}
        {showAddModal && selectedWallet && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-4 md:mx-auto border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
                <h4 className="text-base md:text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg">
                    <Plus className="text-white" size={18} />
                  </div>
                  Add Credits
                </h4>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              <div className="p-4 md:p-6">
                <div className="mb-4 md:mb-6">
                  <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-2">User</div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white font-bold">
                      {selectedWallet.user?.name?.charAt(0) || "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 dark:text-white truncate">
                        {selectedWallet.user?.name || "Unknown User"}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Current: {formatCurrency(selectedWallet.current_credits)} credits
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 md:space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                      Credits to Add *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={adjustCredits.credits}
                      onChange={(e) => setAdjustCredits({ ...adjustCredits, credits: e.target.value })}
                      className="w-full px-3 py-2 md:px-4 md:py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm md:text-base"
                      placeholder="Enter credits amount"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                      Reason *
                    </label>
                    <textarea
                      value={adjustCredits.reason}
                      onChange={(e) => setAdjustCredits({ ...adjustCredits, reason: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 md:px-4 md:py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none text-sm md:text-base"
                      placeholder="Enter reason for adding credits"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 md:gap-3 mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="px-3 py-1.5 md:px-4 md:py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddCredits}
                    className="px-3 py-1.5 md:px-4 md:py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-md"
                  >
                    Add Credits
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Deduct Credits Modal */}
        {showDeductModal && selectedWallet && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-4 md:mx-auto border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
                <h4 className="text-base md:text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg">
                    <Minus className="text-white" size={18} />
                  </div>
                  Deduct Credits
                </h4>
                <button
                  onClick={() => setShowDeductModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              <div className="p-4 md:p-6">
                <div className="mb-4 md:mb-6">
                  <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-2">User</div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white font-bold">
                      {selectedWallet.user?.name?.charAt(0) || "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 dark:text-white truncate">
                        {selectedWallet.user?.name || "Unknown User"}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Current: {formatCurrency(selectedWallet.current_credits)} credits
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 md:space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                      Credits to Deduct *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={selectedWallet.current_credits}
                      value={adjustCredits.credits}
                      onChange={(e) => setAdjustCredits({ ...adjustCredits, credits: e.target.value })}
                      className="w-full px-3 py-2 md:px-4 md:py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm md:text-base"
                      placeholder={`Max: ${formatCurrency(selectedWallet.current_credits)}`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                      Reason *
                    </label>
                    <textarea
                      value={adjustCredits.reason}
                      onChange={(e) => setAdjustCredits({ ...adjustCredits, reason: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 md:px-4 md:py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none text-sm md:text-base"
                      placeholder="Enter reason for deducting credits"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 md:gap-3 mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setShowDeductModal(false)}
                    className="px-3 py-1.5 md:px-4 md:py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeductCredits}
                    className="px-3 py-1.5 md:px-4 md:py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white shadow-md"
                  >
                    Deduct Credits
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Details Modal */}
        {showDetailsModal && selectedUserDetails && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl mx-4 md:mx-auto border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                <h4 className="text-base md:text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg">
                    <User className="text-white" size={18} />
                  </div>
                  <span className="truncate">User Wallet Details</span>
                </h4>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all flex-shrink-0 ml-2"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              <div className="p-4 md:p-6">
                {/* User Info */}
                <div className="mb-6 md:mb-8">
                  <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                    <div className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white text-xl md:text-2xl font-bold flex-shrink-0">
                      {selectedUserDetails.user.name?.charAt(0) || "U"}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white truncate">
                        {selectedUserDetails.user.name}
                      </h3>
                      <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 truncate">
                        {selectedUserDetails.user.email}
                      </p>
                    </div>
                  </div>

                  {selectedUserDetails.wallet && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 md:p-5 rounded-xl border border-blue-200 dark:border-blue-800">
                        <p className="text-xs md:text-sm font-medium text-blue-700 dark:text-blue-300">
                          Current Credits
                        </p>
                        <p className="text-xl md:text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                          {formatCurrency(selectedUserDetails.wallet.current_credits)}
                        </p>
                      </div>
                      <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 p-4 md:p-5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                        <p className="text-xs md:text-sm font-medium text-emerald-700 dark:text-emerald-300">
                          Total Purchased
                        </p>
                        <p className="text-xl md:text-2xl font-bold text-emerald-900 dark:text-emerald-100 mt-1">
                          {formatCurrency(selectedUserDetails.wallet.total_credits_purchased)}
                        </p>
                      </div>
                      <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-4 md:p-5 rounded-xl border border-red-200 dark:border-red-800">
                        <p className="text-xs md:text-sm font-medium text-red-700 dark:text-red-300">
                          Total Spent
                        </p>
                        <p className="text-xl md:text-2xl font-bold text-red-900 dark:text-red-100 mt-1">
                          {formatCurrency(selectedUserDetails.wallet.total_credits_spent)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Recent Transactions */}
                <div>
                  <h4 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3 md:mb-4">
                    Recent Transactions
                  </h4>
                  {selectedUserDetails.recent_transactions.length === 0 ? (
                    <div className="text-center py-6 md:py-8 text-gray-500 dark:text-gray-400 text-sm">
                      No transactions found
                    </div>
                  ) : (
                    <div className="space-y-2 md:space-y-3">
                      {selectedUserDetails.recent_transactions.map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between p-3 md:p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                        >
                          <div className="flex items-center gap-2 md:gap-4 min-w-0">
                            <div className={`p-1.5 md:p-2 rounded-lg ${getTransactionColor(transaction.type)} bg-opacity-10 flex-shrink-0`}>
                              {getTransactionIcon(transaction.type)}
                            </div>
                            <div className="min-w-0">
                              <div className={`font-medium text-sm ${getTransactionColor(transaction.type)} truncate`}>
                                {getTransactionLabel(transaction.type)}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {transaction.description || "No description"}
                              </div>
                            </div>
                          </div>
                          <div className="text-right ml-2">
                            <div className={`text-base md:text-lg font-bold ${getTransactionColor(transaction.type)}`}>
                              {transaction.type === "spend" || transaction.type === "admin_deduct" ? "-" : "+"}
                              {formatCurrency(transaction.credits)}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDate(transaction.created_at)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Wallet;