/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import {
  DollarSign,
  Home,
  MapPin,
  Bed,
  Bath,
  Maximize,
  Building2,
  Search,
  Filter,
  Calendar,
  TrendingUp,
  TrendingDown,
  Target,
  BarChart3,
  RefreshCw,
  Download,
  Eye,
  Trash2,
  ChevronRight,
  Loader2,
  Sparkles,
  Zap,
  Brain,
  Calculator,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import {
  estimatePropertyPrice,
  getPriceEstimateHistory,
  getPriceEstimateById,
  AIPriceEstimateRequest,
  AIPriceEstimate,
  PaginatedResponse,
} from "@/api/agent/aipriceestimate";
import AdminLayout from "@/components/layout/admin/AdminLayout";

const AIPriceEstimator = () => {
  const [estimating, setEstimating] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [estimates, setEstimates] = useState<AIPriceEstimate[]>([]);
  const [estimateResult, setEstimateResult] = useState<AIPriceEstimate | null>(null);
  const [selectedEstimate, setSelectedEstimate] = useState<AIPriceEstimate | null>(null);
  const [estimateError, setEstimateError] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  // Form state
  const [formData, setFormData] = useState<AIPriceEstimateRequest>({
    location: "",
    bedrooms: 3,
    bathrooms: 2,
    area: 1500,
    property_type: "residential",
    condition: "good",
    amenities: "",
    property_id: null,
  });

  // Property types
  const propertyTypes = [
    { value: "residential", label: "Residential" },
    { value: "apartment", label: "Apartment" },
    { value: "condo", label: "Condo" },
    { value: "townhouse", label: "Townhouse" },
    { value: "villa", label: "Villa" },
    { value: "commercial", label: "Commercial" },
    { value: "industrial", label: "Industrial" },
    { value: "land", label: "Land" },
  ];

  // Condition options
  const conditions = [
    { value: "excellent", label: "Excellent" },
    { value: "good", label: "Good" },
    { value: "average", label: "Average" },
    { value: "needs_work", label: "Needs Work" },
    { value: "poor", label: "Poor" },
  ];

  // Load estimate history
  const loadEstimateHistory = async (page = 1) => {
    try {
      setLoadingHistory(true);
      const response = await getPriceEstimateHistory(page);

      if (response.success && response.data) {
        setEstimates(response.data.data);
        setTotalPages(response.data.last_page);
        setCurrentPage(response.data.current_page);
      } else {
        toast.error(response.message || "Failed to load history");
      }
    } catch (error: any) {
      console.error("Error loading history:", error);
      toast.error(error.response?.data?.message || "Failed to load history");
    } finally {
      setLoadingHistory(false);
    }
  };

  // Helper to extract data from property_details
  const getPropertyDetail = (estimate: AIPriceEstimate, key: string) => {
    if (!estimate.property_details) return null;
    console.log("Property Details:", estimate.property_details);
    return estimate.property_details[key as keyof typeof estimate.property_details];
  };

  // Get location from property_details
  const getLocation = (estimate: AIPriceEstimate) => {
    return getPropertyDetail(estimate, 'location') || 'N/A';
  };

  // Get bedrooms from property_details
  const getBedrooms = (estimate: AIPriceEstimate) => {
    return getPropertyDetail(estimate, 'bedrooms') || 'N/A';
  };

  // Get bathrooms from property_details
  const getBathrooms = (estimate: AIPriceEstimate) => {
    return getPropertyDetail(estimate, 'bathrooms') || 'N/A';
  };

  // Get area from property_details
  const getArea = (estimate: AIPriceEstimate) => {
    return getPropertyDetail(estimate, 'area') || 'N/A';
  };

  // Get property type from property_details
  const getPropertyType = (estimate: AIPriceEstimate) => {
    return getPropertyDetail(estimate, 'property_type') || 'N/A';
  };

  // Get condition from property_details
  const getCondition = (estimate: AIPriceEstimate) => {
    return getPropertyDetail(estimate, 'condition') || 'N/A';
  };

  // Get amenities from property_details
  const getAmenities = (estimate: AIPriceEstimate) => {
    return getPropertyDetail(estimate, 'amenities') || '';
  };

  // Load single estimate
  const loadEstimateById = async (id: number) => {
    try {
      const response = await getPriceEstimateById(id);
      if (response.success && response.data) {
        setSelectedEstimate(response.data);
      }
    } catch (error: any) {
      console.error("Error loading estimate:", error);
      toast.error("Failed to load estimate details");
    }
  };

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]:
        name === "bedrooms" || name === "bathrooms" || name === "area" || name === "property_id"
          ? value === ""
            ? null
            : Number(value)
          : value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent any navigation
    e.stopPropagation();
    
    // Basic validation
    if (!formData.location.trim()) {
      toast.error("Please enter a location");
      return;
    }

    if (formData.bedrooms < 1 || formData.bedrooms > 20) {
      toast.error("Bedrooms must be between 1 and 20");
      return;
    }

    if (formData.bathrooms < 1 || formData.bathrooms > 20) {
      toast.error("Bathrooms must be between 1 and 20");
      return;
    }

    if (formData.area < 100 || formData.area > 100000) {
      toast.error("Area must be between 100 and 100,000 sq ft");
      return;
    }

    try {
      setEstimating(true);
      setEstimateError(null);
      setEstimateResult(null);
      
      console.log("Submitting form data:", formData);
      
      const response = await estimatePropertyPrice(formData);
      console.log("API Response:", response);

      if (response.success && response.data) {
        setEstimateResult(response.data);
        setShowResult(true);
        setEstimateError(null);
        toast.success("Price estimate generated successfully!");
        await loadEstimateHistory(1);
      } else {
        setEstimateResult(null);
        const errorMsg = response.message || "Unable to generate estimate";
        setEstimateError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (error: any) {
      console.error("Estimate error:", error);
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Failed to generate estimate. Please try again.";
      
      setEstimateResult(null);
      setEstimateError(msg);
      toast.error(msg);
    } finally {
      setEstimating(false);
    }
  };

  // Format currency
  const formatCurrency = (amount?: number | null) => {
    if (typeof amount !== "number") return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return dateString;
    }
  };

  // Get confidence score from breakdown or calculate
  const getConfidenceScore = (estimate: AIPriceEstimate) => {
    if (estimate.breakdown && estimate.breakdown.confidence_score) {
      return estimate.breakdown.confidence_score;
    }
    // Default or calculate from other factors
    return 75; // Default value
  };

  // Get confidence color
  const getConfidenceColor = (score?: number) => {
    if (!score) return "text-gray-500";
    if (score >= 80) return "text-emerald-500";
    if (score >= 60) return "text-amber-500";
    return "text-red-500";
  };

  // Get confidence label
  const getConfidenceLabel = (score?: number) => {
    if (!score) return "Unknown";
    if (score >= 80) return "High";
    if (score >= 60) return "Medium";
    return "Low";
  };

  // Get price range from price_range_min and price_range_max
  const getPriceRange = (estimate: AIPriceEstimate) => {
    console.log(estimate);
    
    if (estimate.price_range_min && estimate.price_range_max) {
      return `${formatCurrency(Number(estimate.price_range_min))} - ${formatCurrency(Number(estimate.price_range_max))}`;
    }
    
    // Fallback calculation
    const base = estimate.estimated_price || 0;
    return `${formatCurrency(Math.round(base * 0.85))} - ${formatCurrency(Math.round(base * 1.15))}`;
  };

  // Get condition color
  const getConditionColor = (condition?: string) => {
    if (!condition) return "text-gray-600 bg-gray-100";
    switch (condition.toLowerCase()) {
      case "excellent":
        return "text-emerald-600 bg-emerald-100";
      case "good":
        return "text-blue-600 bg-blue-100";
      case "average":
        return "text-amber-600 bg-amber-100";
      case "needs_work":
        return "text-orange-600 bg-orange-100";
      case "poor":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  // Get condition label
  const getConditionLabel = (condition?: string) => {
    if (!condition) return "Unknown";
    switch (condition.toLowerCase()) {
      case "excellent":
        return "Excellent";
      case "good":
        return "Good";
      case "average":
        return "Average";
      case "needs_work":
        return "Needs Work";
      case "poor":
        return "Poor";
      default:
        return condition.charAt(0).toUpperCase() + condition.slice(1);
    }
  };

  // Get property type label
  const getPropertyTypeLabel = (type?: string) => {
    if (!type) return "N/A";
    const found = propertyTypes.find(t => t.value === type);
    return found ? found.label : type.charAt(0).toUpperCase() + type.slice(1);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      location: "",
      bedrooms: 3,
      bathrooms: 2,
      area: 1500,
      property_type: "residential",
      condition: "good",
      amenities: "",
      property_id: null,
    });
    setEstimateResult(null);
    setEstimateError(null);
    setShowResult(false);
  };

  // Use sample data
  const useSampleData = () => {
    setFormData({
      location: "123 Main St, New York, NY",
      bedrooms: 3,
      bathrooms: 2,
      area: 1800,
      property_type: "residential",
      condition: "good",
      amenities: "garage,garden,pool",
      property_id: null,
    });
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadEstimateHistory(page);
  };

  // Initial load
  useEffect(() => {
    loadEstimateHistory(1);
  }, []);

  // Safely format numbers
  const safeNumber = (value?: number | null) => {
    if (typeof value !== "number") return "N/A";
    return value.toLocaleString();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-emerald-600 rounded-2xl p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Brain className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">AI Price Estimator</h1>
                <p className="text-blue-100">Get intelligent property price estimates using AI</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setShowHistory(!showHistory);
                  if (showHistory) {
                    setShowResult(false);
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors backdrop-blur-sm"
              >
                <Calendar className="w-4 h-4" />
                {showHistory ? "New Estimate" : "View History"}
              </button>
              <button
                onClick={() => loadEstimateHistory(1)}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors backdrop-blur-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Input Form */}
          {!showHistory && (
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-blue-600" />
                    Property Details
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={useSampleData}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Zap className="w-4 h-4" />
                      Use Sample
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Reset
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Location *
                      </div>
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="Enter property address or area"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      required
                    />
                  </div>

                  {/* Basic Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center gap-2">
                          <Bed className="w-4 h-4" />
                          Bedrooms *
                        </div>
                      </label>
                      <input
                        type="number"
                        name="bedrooms"
                        value={formData.bedrooms}
                        onChange={handleInputChange}
                        min="1"
                        max="20"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center gap-2">
                          <Bath className="w-4 h-4" />
                          Bathrooms *
                        </div>
                      </label>
                      <input
                        type="number"
                        name="bathrooms"
                        value={formData.bathrooms}
                        onChange={handleInputChange}
                        min="1"
                        max="20"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center gap-2">
                          <Maximize className="w-4 h-4" />
                          Area (sq ft) *
                        </div>
                      </label>
                      <input
                        type="number"
                        name="area"
                        value={formData.area}
                        onChange={handleInputChange}
                        min="100"
                        max="100000"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Property Type & Condition */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          Property Type *
                        </div>
                      </label>
                      <select
                        name="property_type"
                        value={formData.property_type}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      >
                        {propertyTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Condition
                      </label>
                      <select
                        name="condition"
                        value={formData.condition}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      >
                        {conditions.map((condition) => (
                          <option key={condition.value} value={condition.value}>
                            {condition.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amenities (comma-separated)
                    </label>
                    <textarea
                      name="amenities"
                      value={formData.amenities}
                      onChange={handleInputChange}
                      placeholder="garage, garden, pool, fireplace, etc."
                      rows={2}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                    />
                    <p className="mt-1 text-xs text-gray-500">Enter amenities separated by commas</p>
                  </div>

                  {/* Property ID (Optional) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Property ID (Optional)
                    </label>
                    <input
                      type="number"
                      name="property_id"
                      value={formData.property_id || ""}
                      onChange={handleInputChange}
                      placeholder="Link to existing property"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={estimating}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-xl hover:from-blue-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed font-bold"
                  >
                    {estimating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Generate AI Estimate
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Right Column - Results or History */}
          <div className={`${showHistory ? "lg:col-span-3" : "lg:col-span-1"}`}>
            {showHistory ? (
              /* History View - Updated to match your model structure */
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      Estimate History
                    </h2>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{estimates.length} estimates</span>
                    </div>
                  </div>
                </div>

                {loadingHistory ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                      <p className="text-gray-600">Loading history...</p>
                    </div>
                  </div>
                ) : estimates.length === 0 ? (
                  <div className="text-center py-12">
                    <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Estimates Yet</h3>
                    <p className="text-gray-600">Generate your first AI price estimate</p>
                    <button
                      type="button"
                      onClick={() => setShowHistory(false)}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Create Estimate
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="p-6">
                      <div className="space-y-4">
                        {estimates.map((estimate) => {
                          const confidenceScore = getConfidenceScore(estimate);
                          return (
                            <div
                              key={estimate.id}
                              className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer"
                              onClick={() => loadEstimateById(estimate.id)}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div>
                                    <MapPin className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <span className="font-medium text-gray-900 break-words whitespace-normal truncate">
                                        {getLocation(estimate)}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <div className="flex items-center gap-1">
                                      <Bed className="w-3 h-3" />
                                      <span>{getBedrooms(estimate)} bed</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Bath className="w-3 h-3" />
                                      <span>{getBathrooms(estimate)} bathrooms</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Maximize className="w-3 h-3" />
                                      <span>{safeNumber(getArea(estimate))} sq ft</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-bold text-gray-900">
                                    {formatCurrency(Number(estimate.estimated_price))}
                                  </div>
                                  <div className="flex items-center justify-end gap-2 mt-1">
                                    <span
                                      className={`text-xs px-2 py-1 rounded-full ${getConfidenceColor(
                                        confidenceScore
                                      )} bg-opacity-10`}
                                    >
                                      {getConfidenceLabel(confidenceScore)} Confidence
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {formatDate(estimate.created_at)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="flex justify-center gap-2 mt-6 pt-6 border-t border-gray-200">
                          <button
                            type="button"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Previous
                          </button>
                          <span className="px-4 py-1.5 text-gray-700">
                            Page {currentPage} of {totalPages}
                          </span>
                          <button
                            type="button"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* Results Panel - Updated to match your model structure */
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sticky top-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  AI Estimate Results
                </h2>

                {estimateError ? (
                  /* Error State */
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-red-800 mb-1">
                          Unable to Generate Estimate
                        </h3>
                        <p className="text-sm text-red-700">{estimateError}</p>
                        <ul className="mt-2 text-sm text-red-600 list-disc list-inside">
                          <li>Try a broader location</li>
                          <li>Increase area or change property type</li>
                          <li>Add fewer filters</li>
                        </ul>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="mt-3 px-4 py-2 bg-white border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors w-full"
                    >
                      Try Again
                    </button>
                  </div>
                ) : estimateResult ? (
                  /* Success Result */
                  <div className="space-y-6">
                    {/* Estimated Price */}
                    <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-xl border border-blue-100">
                      <p className="text-sm text-gray-600 mb-2">AI Estimated Price</p>
                      <div className="text-3xl font-bold text-gray-900">
                        {formatCurrency(Number(estimateResult.estimated_price))}
                      </div>
                      <div className="text-sm text-gray-600 mt-2">
                        Price Range: {getPriceRange(estimateResult)}
                      </div>
                    </div>

                    {/* Confidence Score */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Confidence Score</span>
                        <span
                          className={`text-sm font-semibold ${getConfidenceColor(
                            getConfidenceScore(estimateResult)
                          )}`}
                        >
                          {getConfidenceScore(estimateResult)}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            getConfidenceScore(estimateResult) >= 80
                              ? "bg-emerald-500"
                              : getConfidenceScore(estimateResult) >= 60
                              ? "bg-amber-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${getConfidenceScore(estimateResult)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {getConfidenceLabel(getConfidenceScore(estimateResult))} confidence based on
                        market data
                      </p>
                    </div>

                    {/* Property Details Summary */}
                    <div className="space-y-3">
                      <h3 className="font-medium text-gray-900">Property Summary</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 text-gray-600 mb-1">
                            <MapPin className="w-4 h-4" />
                            <span className="text-xs">Location</span>
                          </div>
                          <p className="font-medium text-gray-900 text-sm truncate">
                            {getLocation(estimateResult)}
                          </p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 text-gray-600 mb-1">
                            <Building2 className="w-4 h-4" />
                            <span className="text-xs">Type</span>
                          </div>
                          <p className="font-medium text-gray-900 text-sm">
                            {getPropertyTypeLabel(getPropertyType(estimateResult))}
                          </p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 text-gray-600 mb-1">
                            <Bed className="w-4 h-4" />
                            <span className="text-xs">Bedrooms</span>
                          </div>
                          <p className="font-medium text-gray-900 text-sm">
                            {getBedrooms(estimateResult)} bd
                          </p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 text-gray-600 mb-1">
                            <Maximize className="w-4 h-4" />
                            <span className="text-xs">Area</span>
                          </div>
                          <p className="font-medium text-gray-900 text-sm">
                            {safeNumber(getArea(estimateResult))} sq ft
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Condition */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Condition</h3>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getConditionColor(
                          getCondition(estimateResult)
                        )}`}
                      >
                        {getConditionLabel(getCondition(estimateResult))}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          type="button"
                          onClick={() => setShowHistory(true)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          View History
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Empty State */
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-100 to-emerald-100 flex items-center justify-center">
                      <Brain className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No Estimate Yet
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Fill in the property details and generate your first AI-powered price estimate
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Selected Estimate Modal */}
        {selectedEstimate && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">Estimate Details</h3>
                  <button
                    type="button"
                    onClick={() => setSelectedEstimate(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Header */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-bold text-gray-900">{getLocation(selectedEstimate)}</h4>
                    <span className="text-sm text-gray-500">
                      {formatDate(selectedEstimate.created_at)}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(Number(selectedEstimate.estimated_price))}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Bedrooms</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {getBedrooms(selectedEstimate)}
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Bathrooms</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {getBathrooms(selectedEstimate)}
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Area</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {safeNumber(getArea(selectedEstimate))} sq ft
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Property Type</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {getPropertyTypeLabel(getPropertyType(selectedEstimate))}
                    </div>
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <h5 className="font-medium text-gray-900 mb-2">Price Range</h5>
                  <p className="text-lg font-semibold text-gray-700">{getPriceRange(selectedEstimate)}</p>
                </div>

                {/* Confidence Score */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">Confidence Score</span>
                    <span
                      className={`font-semibold ${getConfidenceColor(
                        getConfidenceScore(selectedEstimate)
                      )}`}
                    >
                      {getConfidenceScore(selectedEstimate)}%
                    </span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        getConfidenceScore(selectedEstimate) >= 80
                          ? "bg-emerald-500"
                          : getConfidenceScore(selectedEstimate) >= 60
                          ? "bg-amber-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${getConfidenceScore(selectedEstimate)}%` }}
                    />
                  </div>
                </div>

                {/* Additional Info */}
                <div className="space-y-4">
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Condition</h5>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getConditionColor(
                        getCondition(selectedEstimate)
                      )}`}
                    >
                      {getConditionLabel(getCondition(selectedEstimate))}
                    </span>
                  </div>

                  {getAmenities(selectedEstimate) && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Amenities</h5>
                      <p className="text-gray-700">{getAmenities(selectedEstimate)}</p>
                    </div>
                  )}

                  {selectedEstimate.ai_reasoning && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">AI Reasoning</h5>
                      <p className="text-gray-700">{selectedEstimate.ai_reasoning}</p>
                    </div>
                  )}

                  {selectedEstimate.suggested_listing_price && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Suggested Listing Price</h5>
                      <p className="text-lg font-semibold text-gray-700">
                        {formatCurrency(Number(selectedEstimate.suggested_listing_price))}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setSelectedEstimate(null)}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AIPriceEstimator;