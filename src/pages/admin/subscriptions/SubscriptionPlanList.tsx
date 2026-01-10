/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Eye,
  Trash2,
  X,
  AlertTriangle,
  Filter,
  CreditCard,
  Grid3x3,
  List,
  Plus,
  Edit3,
  Zap,
  Crown,
  Star,
  Check,
  X as XIcon,
} from "lucide-react";
import AdminLayout from "@/components/layout/admin/AdminLayout";
import { toast } from "sonner";
import Loader from "@/components/ui/Loader";
import { Button } from "@/components/ui/button";
import { deleteSubscriptionPlan, getSubscriptionPlans, SubscriptionPlan, toggleStatusSubscriptionPlan } from "@/api/admin/subscriptions";
import DeleteModal from "../agents/components/DeleteModal";

const SubscriptionPlanList = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeactivatePopup, setShowDeactivatePopup] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [reason, setReason] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const navigate = useNavigate();

  const deleteModal = (planId: number) => {
    setSelectedPlan(plans.find(plan => plan.id === planId) || null);    
    setShowDeleteModal(true);
  }

  useEffect(() => {
    const loadPlans = async () => {
      try {
        setLoading(true);
        const data = await getSubscriptionPlans(search);
        if (data.success) {
          const mockPlans: SubscriptionPlan[] = data.data.plans;

          // Filter plans based on search and filter
          let filteredPlans = mockPlans;
          if (search) {
            filteredPlans = filteredPlans.filter(plan => 
              plan.name.toLowerCase().includes(search.toLowerCase()) ||
              plan.description.toLowerCase().includes(search.toLowerCase())
            );
          }
          if (filter === "active") {
            filteredPlans = filteredPlans.filter(plan => plan.is_active);
          } else if (filter === "inactive") {
            filteredPlans = filteredPlans.filter(plan => !plan.is_active);
          }

          setPlans(filteredPlans);
        } else setError("Failed to fetch subscription plans.");
      } catch {
        setError("Failed to fetch subscription plans.");
      } finally {
        setLoading(false);
      }
    };
    loadPlans();
  }, [search, filter]);

  const refresh = async () => {
    const data = await getSubscriptionPlans(search);
    setPlans(data.data.plans || []);
  };

  const openDeactivatePopup = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setReason("");
    setShowDeactivatePopup(true);
  };

  const confirmDeactivate = async () => {
    if (!reason.trim() && selectedPlan?.is_active) {
      toast.error("Please enter a reason");
      return;
    }
    try {
      const response = await toggleStatusSubscriptionPlan(selectedPlan!.id);
      toast.success(response.message);
      setShowDeactivatePopup(false);
      refresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to deactivate plan");
    }
  };

  const handleDelete = async () => {
    try {      
      await deleteSubscriptionPlan(selectedPlan?.id ?? 0);
      toast.success("Plan deleted successfully");
      refresh();
    } catch {
      toast.error("Failed to delete plan");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const getPlanIcon = (plan: SubscriptionPlan) => {
    if (plan.price >= 150) return <Crown className="text-amber-500" size={20} />;
    if (plan.price >= 50) return <Zap className="text-purple-500" size={20} />;
    return <Star className="text-blue-500" size={20} />;
  };

  const getPlanGradient = (plan: SubscriptionPlan) => {
    if (plan.price >= 150) return "from-amber-500 to-orange-500";
    if (plan.price >= 50) return "from-purple-500 to-pink-500";
    return "from-blue-500 to-cyan-500";
  };

  const badge = (isActive: boolean) =>
    isActive
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-700/20 dark:text-emerald-400"
      : "bg-red-100 text-red-700 dark:bg-red-700/20 dark:text-red-400";

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-xl">
                <CreditCard className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Subscription Plans
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Manage all subscription plans and pricing
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 shadow-sm hover:border-blue-400 dark:hover:border-emerald-600 transition-all">
                <Search size={16} className="text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Search plans..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent outline-none text-sm text-gray-900 dark:text-white w-48 placeholder-gray-500"
                />
              </div>

              <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === "grid"
                      ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-emerald-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                  title="Grid View"
                >
                  <Grid3x3 size={18} />
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === "table"
                      ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-emerald-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                  title="Table View"
                >
                  <List size={18} />
                </button>
              </div>

              <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 shadow-sm hover:border-blue-400 dark:hover:border-emerald-600 transition-all">
                <Filter size={16} className="text-gray-400 mr-2" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="bg-transparent outline-none text-sm text-gray-700 dark:text-gray-200 cursor-pointer"
                >
                  <option value="all">All Plans</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* <button
                onClick={async () => {
                  try {
                    toast.info("Preparing your download...");
                    await exportPlans();
                    toast.success("Export successful!");
                  } catch {
                    toast.error("Failed to export plans");
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all text-sm shadow-md hover:shadow-lg font-medium cursor-pointer"
              >
                <FileDown size={16} />
                <span>Export</span>
              </button> */}

              <Button
                onClick={() => navigate("/admin/subscriptions/new")}
                className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white shadow-md hover:shadow-lg"
              >
                <Plus size={18} />
                <span>New Plan</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Loading / Error */}
        {loading && (
          <Loader />
        )}
        {error && (
          <div className="text-center py-20">
            <p className="text-red-500 font-medium">{error}</p>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            {/* Table View */}
            {viewMode === "table" && (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 text-gray-700 dark:text-gray-200">
                        <th className="py-4 px-6 text-left font-semibold">Plan</th>
                        <th className="py-4 px-6 text-left font-semibold">Price</th>
                        <th className="py-4 px-6 text-left font-semibold">Duration</th>
                        <th className="py-4 px-6 text-left font-semibold">Properties</th>
                        <th className="py-4 px-6 text-left font-semibold">Features</th>
                        <th className="py-4 px-6 text-left font-semibold">Status</th>
                        <th className="py-4 px-6 text-center font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900">
                      {plans.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="py-12 text-center text-gray-500 dark:text-gray-400"
                          >
                            <div className="flex flex-col items-center gap-3">
                              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                <Search className="text-gray-400" size={24} />
                              </div>
                              <p className="font-medium">No subscription plans found</p>
                              <p className="text-sm">Try adjusting your search criteria</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        plans.map((plan, index) => (
                          <tr
                            key={plan.id}
                            className={`border-b border-gray-100 dark:border-gray-800 hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-all group ${
                              index % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50/50 dark:bg-gray-800/50"
                            }`}
                          >
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getPlanGradient(plan)} flex items-center justify-center text-white shadow-md`}>
                                  {getPlanIcon(plan)}
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900 dark:text-white">
                                    {plan.name}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">{plan.description}</p>
                                  <p className="text-xs text-gray-400 dark:text-gray-500">ID: {plan.id}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-gray-900 dark:text-white">
                                  {formatPrice(plan.price)}
                                </span>
                                <span className="text-xs text-gray-500">/month</span>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                              {plan.duration_days} days
                            </td>
                            <td className="py-4 px-6">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="text-gray-600 dark:text-gray-400">Properties:</span>
                                  <span className="font-semibold text-gray-900 dark:text-white">
                                    {plan.property_limit === 0 ? "Unlimited" : plan.property_limit}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="text-gray-600 dark:text-gray-400">Featured:</span>
                                  <span className="font-semibold text-gray-900 dark:text-white">
                                    {plan.featured_limit}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex flex-wrap gap-1">
                                {plan.video_allowed && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                                    Video
                                  </span>
                                )}
                                {plan.priority_support && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                                    Priority
                                  </span>
                                )}
                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
                                  {plan.image_limit} Images
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${badge(
                                  plan.is_active
                                )}`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                  plan.is_active ? "bg-emerald-600 dark:bg-emerald-400" : "bg-red-600 dark:bg-red-400"
                                }`}></span>
                                {plan.is_active ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => navigate(`/admin/subscriptions/${plan.id}`)}
                                  className="p-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 text-purple-600 dark:text-purple-400 transition-all hover:scale-110"
                                  title="View Details"
                                >
                                  <Eye size={18} />
                                </button>
                                <button
                                  onClick={() => navigate(`/admin/subscriptions/${plan.id}/edit`)}
                                  className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-all hover:scale-110"
                                  title="Edit Plan"
                                >
                                  <Edit3 size={18} />
                                </button>
                                {plan.is_active ? (
                                  <button
                                    onClick={() => openDeactivatePopup(plan)}
                                    className="px-3 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50 text-xs font-semibold transition-all"
                                    title="Deactivate Plan"
                                  >
                                    Deactivate
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => openDeactivatePopup(plan)}
                                    className="px-3 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 text-xs font-semibold transition-all"
                                    title="Activate Plan"
                                  >
                                    Activate
                                  </button>
                                )}
                                <button
                                  onClick={() => deleteModal(plan.id)}
                                  className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-all hover:scale-110"
                                  title="Delete Plan"
                                >
                                  <Trash2 size={18} />
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
            )}

            {/* Grid View */}
            {viewMode === "grid" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                        <Search className="text-gray-400" size={24} />
                      </div>
                      <p className="font-medium text-gray-500 dark:text-gray-400">No subscription plans found</p>
                      <p className="text-sm text-gray-400">Try adjusting your search criteria</p>
                    </div>
                  </div>
                ) : (
                  plans.map((plan) => (
                    <div
                      key={plan.id}
                      className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-lg hover:border-purple-200 dark:hover:border-purple-800 transition-all hover:-translate-y-1 group"
                    >
                      {/* Plan Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-xl">
                            <CreditCard className="text-white" size={24} />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                              {plan.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{plan.description}</p>
                          </div>
                        </div>
                        <span
                          className={`px-2.5 py-1 text-xs font-bold rounded-full ${badge(
                            plan.is_active
                          )}`}
                        >
                          {plan.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>

                      {/* Price */}
                      <div className="mb-4">
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold text-gray-900 dark:text-white">
                            {formatPrice(plan.price)}
                          </span>
                          <span className="text-sm text-gray-500">/month</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {plan.duration_days} days duration
                        </p>
                      </div>

                      {/* Features */}
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Properties:</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {plan.property_limit === 0 ? "Unlimited" : plan.property_limit}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Featured:</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {plan.featured_limit}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Images:</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {plan.image_limit} per property
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Video Tours:</span>
                          <span className="font-semibold">
                            {plan.video_allowed ? (
                              <Check className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <XIcon className="w-4 h-4 text-red-500" />
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Priority Support:</span>
                          <span className="font-semibold">
                            {plan.priority_support ? (
                              <Check className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <XIcon className="w-4 h-4 text-red-500" />
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Additional Features */}
                      {plan.features && plan.features.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Features:</p>
                          <div className="space-y-1">
                            {plan.features.slice(0, 3).map((feature, index) => (
                              <div key={index} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                                {feature}
                              </div>
                            ))}
                            {plan.features.length > 3 && (
                              <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                                +{plan.features.length - 3} more features
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <button
                          onClick={() => navigate(`/admin/subscriptions/${plan.id}`)}
                          className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/30 text-purple-600 dark:text-purple-400 transition-all font-medium text-sm"
                        >
                          <Eye size={16} />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => navigate(`/admin/subscriptions/${plan.id}/edit`)}
                          className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-all font-medium text-sm"
                        >
                          <Edit3 size={16} />
                          <span>Edit</span>
                        </button>
                        {plan.is_active ? (
                          <button
                            onClick={() => openDeactivatePopup(plan)}
                            className="px-3 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-semibold rounded-xl hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-all"
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            onClick={() => openDeactivatePopup(plan)}
                            className="px-3 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-xl hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-all"
                          >
                            Activate
                          </button>
                        )}
                        <button
                          onClick={() => deleteModal(plan.id)}
                          className="p-2.5 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}

        {/* Deactivate Popup */}
        {showDeactivatePopup && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-[90%] max-w-md border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-100">
                  <div className={`p-2 ${selectedPlan?.is_active ? 'bg-amber-100' : 'bg-green-100'} dark:bg-amber-900/30 rounded-lg`}>
                  {selectedPlan?.is_active ? (
                    <AlertTriangle className="text-amber-600 dark:text-amber-400" size={20} />
                  ) : (
                    <Check className="text-emerald-600 dark:text-emerald-400" size={20} />
                  )}
                  </div>
                  {selectedPlan?.is_active ? "Deactivate Plan" : "Activate Plan"}
                </h4>
                <button
                  onClick={() => setShowDeactivatePopup(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Provide a reason for deactivating{" "}
                <span className="font-semibold text-gray-900 dark:text-white">{selectedPlan?.name}</span> plan.
              </p>

              {selectedPlan?.is_active && (
                <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-amber-400 dark:focus:ring-amber-500 focus:border-amber-400 dark:focus:border-amber-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 mb-4 transition-all"
                    placeholder="Enter reason..."
                  ></textarea>
              )}

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowDeactivatePopup(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeactivate}
                  className="px-4 py-2 rounded-lg text-sm bg-amber-600 hover:bg-amber-700 text-white font-medium transition-all shadow-md hover:shadow-lg"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ✅ Delete Property Confirmation Modal */}
      {showDeleteModal && (
        <DeleteModal
          show={showDeleteModal}
          title="Delete Subscription Plan"
          message="This action cannot be undone. Do you really want to delete this subscription plan?"
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          loading={deleting}
          confirmText="Delete"
          cancelText="Cancel"
        />
      )}
    </AdminLayout>
  );
};

export default SubscriptionPlanList;