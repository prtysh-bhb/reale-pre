/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/admin/credits/CreditPackagesList.tsx
import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  X,
  CheckCircle,
  XCircle,
  DollarSign,
  Coins,
  Save,
  Loader2,
  TrendingUp,
  Package,
  Eye,
  EyeOff,
} from "lucide-react";
import AdminLayout from "@/components/layout/admin/AdminLayout";
import { toast } from "sonner";
import {
  CreditPackage,
  getCreditPackages,
  createCreditPackage,
  updateCreditPackage,
  deleteCreditPackage,
  CreditPackagePayload,
} from "@/api/admin/credit";

const Credit = () => {
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all, active, inactive
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState<CreditPackagePayload>({
    name: "",
    price: 0,
    coins: 0,
    description: "",
    status: "active",
  });

  const [formErrors, setFormErrors] = useState({
    name: "",
    price: "",
    coins: "",
  });

  // Load packages
  const loadPackages = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCreditPackages();
      setPackages(data);
    } catch (err) {
      console.error("Error loading packages:", err);
      setError("Failed to load credit packages. Please try again.");
      toast.error("Failed to load credit packages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPackages();
  }, []);

  // Filter packages based on search and filter
  const filteredPackages = packages.filter((pkg) => {
    const matchesSearch =
      search === "" ||
      pkg.name.toLowerCase().includes(search.toLowerCase()) ||
      pkg.description?.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "all" ||
      (filter === "active" && pkg.status === "active") ||
      (filter === "inactive" && pkg.status === "inactive");

    return matchesSearch && matchesFilter;
  });

  // Calculate statistics
  const stats = {
    total: packages.length,
    active: packages.filter((pkg) => pkg.status === "active").length,
    inactive: packages.filter((pkg) => pkg.status === "inactive").length,
    totalValue: packages.reduce((sum, pkg) => sum + pkg.price, 0),
    totalCoins: packages.reduce((sum, pkg) => sum + pkg.coins, 0),
  };

  // Open Add Modal
  const openAddModal = () => {
    setFormData({
      name: "",
      price: 0,
      coins: 0,
      description: "",
      status: "active",
    });
    setFormErrors({ name: "", price: "", coins: "" });
    setShowAddModal(true);
  };

  // Open Edit Modal
  const openEditModal = (pkg: CreditPackage) => {
    setSelectedPackage(pkg);
    setFormData({
      name: pkg.name,
      price: pkg.price,
      coins: pkg.coins,
      description: pkg.description || "",
      status: pkg.status,
    });
    setFormErrors({ name: "", price: "", coins: "" });
    setShowEditModal(true);
  };

  // Open Delete Modal
  const openDeleteModal = (pkg: CreditPackage) => {
    setSelectedPackage(pkg);
    setShowDeleteModal(true);
  };

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev: any) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? 0 : parseFloat(value)) : value,
    }));

    // Clear error when user starts typing
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = { name: "", price: "", coins: "" };
    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = "Package name is required";
      isValid = false;
    }

    if (formData.price <= 0) {
      errors.price = "Price must be greater than 0";
      isValid = false;
    }

    if (formData.coins <= 0) {
      errors.coins = "Coins amount must be greater than 0";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // Handle Add Package
  const handleAddPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const response = await createCreditPackage(formData);

      if (response.success) {
        toast.success("Credit package created successfully");
        setShowAddModal(false);
        loadPackages();
      } else {
        toast.error(response.message || "Failed to create package");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create package");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Edit Package
  const handleEditPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !selectedPackage) return;

    setSubmitting(true);
    try {
      const response = await updateCreditPackage(selectedPackage.id, formData);

      if (response.success) {
        toast.success("Credit package updated successfully");
        setShowEditModal(false);
        loadPackages();
      } else {
        toast.error(response.message || "Failed to update package");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update package");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Package
  const handleDeletePackage = async () => {
    if (!selectedPackage) return;

    try {
      const response = await deleteCreditPackage(selectedPackage.id);

      if (response.success) {
        toast.success("Credit package deleted successfully");
        setShowDeleteModal(false);
        setSelectedPackage(null);
        loadPackages();
      } else {
        toast.error(response.message || "Failed to delete package");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete package");
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    if (status === "active") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
          <CheckCircle className="w-3 h-3 mr-1" />
          Active
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
          <XCircle className="w-3 h-3 mr-1" />
          Inactive
        </span>
      );
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-xl">
                <Coins className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-semibold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                  Credit Packages
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Manage credit packages for users to purchase
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
              {/* Search */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search packages..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Filter */}
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>

              {/* Add Package Button */}
              <button
                onClick={openAddModal}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white transition-all shadow-md hover:shadow-lg font-medium"
              >
                <Plus size={16} />
                <span>Add Package</span>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Total Packages
                  </p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                    {stats.total}
                  </p>
                </div>
                <Package className="text-blue-600 dark:text-blue-400 w-8 h-8" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                    Active Packages
                  </p>
                  <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 mt-1">
                    {stats.active}
                  </p>
                </div>
                <TrendingUp className="text-emerald-600 dark:text-emerald-400 w-8 h-8" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-4 rounded-xl border border-red-200 dark:border-red-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-700 dark:text-red-300">
                    Inactive Packages
                  </p>
                  <p className="text-2xl font-bold text-red-900 dark:text-red-100 mt-1">
                    {stats.inactive}
                  </p>
                </div>
                <EyeOff className="text-red-600 dark:text-red-400 w-8 h-8" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                    Total Value
                  </p>
                  <p className="text-2xl font-bold text-amber-900 dark:text-amber-100 mt-1">
                    {formatCurrency(stats.totalValue)}
                  </p>
                </div>
                <DollarSign className="text-amber-600 dark:text-amber-400 w-8 h-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 border-4 border-blue-500 dark:border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-500 dark:text-gray-400">Loading packages...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <XCircle className="text-red-600 dark:text-red-400 w-6 h-6" />
              <div>
                <p className="font-medium text-red-800 dark:text-red-300">{error}</p>
                <button
                  onClick={loadPackages}
                  className="mt-2 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Packages Grid */}
        {!loading && !error && (
          <>
            {filteredPackages.length === 0 ? (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-full flex items-center justify-center">
                    <Package className="text-white w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      No credit packages found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                      {search || filter !== "all"
                        ? "Try adjusting your search or filter criteria"
                        : "Get started by creating your first credit package"}
                    </p>
                    <div className="flex justify-center items-center">
                      <button
                        onClick={openAddModal}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg font-medium"
                      >
                        <Plus size={18} />
                        Create First Package
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPackages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`bg-white dark:bg-gray-900 rounded-xl border shadow-sm hover:shadow-lg transition-all overflow-hidden group ${
                      pkg.status === "active"
                        ? "border-emerald-200 dark:border-emerald-800 hover:border-emerald-300 dark:hover:border-emerald-700"
                        : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
                    }`}
                  >
                    {/* Package Header */}
                    <div
                      className={`p-6 ${
                        pkg.status === "active"
                          ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
                          : "bg-gradient-to-r from-gray-500 to-gray-600"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <Coins className="text-white w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-white">{pkg.name}</h3>
                            {getStatusBadge(pkg.status)}
                          </div>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-center mb-4">
                        <div className="text-3xl font-bold text-white">
                          {formatCurrency(pkg.price)}
                        </div>
                        <div className="text-white/80 text-sm">One-time payment</div>
                      </div>

                      {/* Coins */}
                      <div className="flex items-center justify-center gap-2 bg-white/10 rounded-lg py-3">
                        <Coins className="text-white w-5 h-5" />
                        <span className="text-2xl font-bold text-white">
                          {pkg.coins.toLocaleString()}
                        </span>
                        <span className="text-white/80">Coins</span>
                      </div>
                    </div>

                    {/* Package Body */}
                    <div className="p-6">
                      {pkg.description && (
                        <div className="mb-6">
                          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Description
                          </h4>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">
                            {pkg.description}
                          </p>
                        </div>
                      )}

                      <div className="space-y-3 mb-6">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Package ID:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            #{pkg.id}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Created:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {formatDate(pkg.created_at)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Last Updated:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {formatDate(pkg.updated_at)}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(pkg)}
                            className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-colors"
                            title="Edit Package"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => openDeleteModal(pkg)}
                            className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors"
                            title="Delete Package"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {pkg.status === "active" ? (
                            <span className="flex items-center gap-1">
                              <Eye size={12} />
                              Visible to users
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <EyeOff size={12} />
                              Hidden from users
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Add Package Modal */}
        {showAddModal && (
          <PackageModal
            title="Add New Credit Package"
            isOpen={showAddModal}
            setIsOpen={setShowAddModal}
            onSubmit={handleAddPackage}
            formData={formData}
            formErrors={formErrors}
            handleInputChange={handleInputChange}
            submitting={submitting}
            isEdit={false}
          />
        )}

        {/* Edit Package Modal */}
        {showEditModal && selectedPackage && (
          <PackageModal
            title={`Edit Package: ${selectedPackage.name}`}
            isOpen={showEditModal}
            setIsOpen={setShowEditModal}
            onSubmit={handleEditPackage}
            formData={formData}
            formErrors={formErrors}
            handleInputChange={handleInputChange}
            submitting={submitting}
            isEdit={true}
          />
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedPackage && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <Trash2 className="text-red-600 dark:text-red-400 w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Delete Package
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Are you sure you want to delete <strong>{selectedPackage.name}</strong>? This
                  action cannot be undone.
                </p>
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Price:</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(selectedPackage.price)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Coins:</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedPackage.coins.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Status:</span>
                      <div className="mt-1">{getStatusBadge(selectedPackage.status)}</div>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Created:</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatDate(selectedPackage.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setSelectedPackage(null);
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeletePackage}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    Delete Package
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

// Package Modal Component
const PackageModal = ({
  title,
  isOpen,
  setIsOpen,
  onSubmit,
  formData,
  formErrors,
  handleInputChange,
  submitting,
  isEdit,
}: {
  title: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: CreditPackagePayload;
  formErrors: { name: string; price: string; coins: string };
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  submitting: boolean;
  isEdit: boolean;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h4 className="text-lg font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-100">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg">
              <Coins className="text-white" size={20} />
            </div>
            {title}
          </h4>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
            disabled={submitting}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6">
          <div className="space-y-6">
            {/* Package Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Package Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg border ${
                  formErrors.name
                    ? "border-red-300 dark:border-red-700 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all`}
                placeholder="e.g., Starter Pack, Pro Bundle"
                disabled={submitting}
              />
              {formErrors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.name}</p>
              )}
            </div>

            {/* Price and Coins - Side by side on larger screens */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Price (USD) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="text-gray-400 w-5 h-5" />
                  </div>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                      formErrors.price
                        ? "border-red-300 dark:border-red-700 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all`}
                    placeholder="0.00"
                    disabled={submitting}
                  />
                </div>
                {formErrors.price && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.price}</p>
                )}
              </div>

              {/* Coins */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Coins Amount *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Coins className="text-gray-400 w-5 h-5" />
                  </div>
                  <input
                    type="number"
                    name="coins"
                    value={formData.coins}
                    onChange={handleInputChange}
                    min="0"
                    step="1"
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                      formErrors.coins
                        ? "border-red-300 dark:border-red-700 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all`}
                    placeholder="e.g., 1000"
                    disabled={submitting}
                  />
                </div>
                {formErrors.coins && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.coins}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description || ""}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe what users get with this package..."
                disabled={submitting}
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    value="active"
                    checked={formData.status === "active"}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                    disabled={submitting}
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">Active</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    value="inactive"
                    checked={formData.status === "inactive"}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                    disabled={submitting}
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">Inactive</span>
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors order-2 sm:order-1"
              disabled={submitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white shadow-md order-1 sm:order-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4" />
                  <span>{isEdit ? "Updating..." : "Creating..."}</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>{isEdit ? "Update Package" : "Create Package"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Credit;
