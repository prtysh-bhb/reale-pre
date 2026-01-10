/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * PropertyFilters Component
 * Professional property listing page with advanced filters
 * Premium design with glassmorphism and modern aesthetics
 */

import { Attributes, getPropertiesByFilter, propertyAttributes } from "@/api/customer/properties";
import PropertyCard from "@/components/sections/home/PropertyCard";
import Loader from "@/components/ui/Loader";
import { FilterState, Property } from "@/types/property";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  X,
  LayoutGrid,
  RotateCcw,
  Building2,
  MapPin,
  Sparkles,
  Brain,
  ArrowRight,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { ChangeEvent, useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";

// Import AI chat functionality
import { sendAIChatMessage } from "@/api/customer/aichat";
import type { AIRecommendationRequest } from "@/api/customer/aidevelop";
import { recommendProperty } from "@/api/customer/aidevelop";

const PropertyFilters = () => {
  const location = useLocation();
  const propType = location.pathname.includes("/properties/sale") ? "sale" : "rent";
  const [loading, setLoading] = useState<boolean>(true);
  const [shouldFetch, setShouldFetch] = useState<boolean>(false);
  const [amenities, setAmenities] = useState<Attributes[]>();
  const [propertyTypes, setPropertyTypes] = useState<Attributes[]>();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isOpen, setIsOpen] = useState(false);
  const [totalRecords, setTotalRecords] = useState<number>(0);

  // AI Filter States
  const [aiFilterOpen, setAiFilterOpen] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([
    "Find me a 3-bedroom house with a backyard under $500k",
    "Show modern apartments downtown with a pool",
    "Family homes near good schools with 4+ bedrooms",
    "Luxury condos with ocean view and parking",
  ]);

  const [filters, setFilters] = useState<FilterState>({
    keyword: "",
    location: "",
    state: "",
    city: "",
    property_type: "",
    min_price: "",
    max_price: "",
    bedrooms: "",
    bathrooms: "",
    min_area: "",
    max_area: "",
    type: propType,
    amenities: [],
    sort_by: "",
    sort_order: "",
    sortBy: "Newest First",
  });

  const [properties, setProperties] = useState<Property[]>([]);

  // Parse natural language to extract property requirements
  const parseAIQueryToFilters = useCallback(
    async (query: string): Promise<Partial<FilterState>> => {
      const lowerQuery = query.toLowerCase();
      const newFilters: Partial<FilterState> = {};

      // Extract bedrooms
      const bedMatch = lowerQuery.match(/(\d+)\s*(?:bedroom|bed|br)/i);
      if (bedMatch) {
        newFilters.bedrooms = bedMatch[1];
      }

      // Extract bathrooms
      const bathMatch = lowerQuery.match(/(\d+)\s*(?:bathroom|bath|ba)/i);
      if (bathMatch) {
        newFilters.bathrooms = bathMatch[1];
      }

      // Extract price
      const priceMatch = lowerQuery.match(/(?:under|below|less than|up to)\s*\$?(\d+[kKmM]?)/i);
      if (priceMatch) {
        let price = priceMatch[1];
        if (price.toLowerCase().includes("k")) {
          price = (parseFloat(price) * 1000).toString();
        } else if (price.toLowerCase().includes("m")) {
          price = (parseFloat(price) * 1000000).toString();
        }
        newFilters.max_price = price;
      }

      // Extract location keywords
      const locationKeywords = ["downtown", "suburbs", "near", "close to", "in"];
      for (const keyword of locationKeywords) {
        if (lowerQuery.includes(keyword)) {
          const afterKeyword = lowerQuery.split(keyword)[1]?.trim().split(" ")[0];
          if (afterKeyword && afterKeyword.length > 2) {
            newFilters.location = afterKeyword;
            break;
          }
        }
      }

      // Extract property type
      const propertyTypes = ["apartment", "condo", "house", "villa", "townhouse", "studio"];
      for (const type of propertyTypes) {
        if (lowerQuery.includes(type)) {
          newFilters.property_type = type;
          break;
        }
      }

      // Extract amenities
      const amenityKeywords = [
        { key: "pool", label: "Swimming Pool" },
        { key: "parking", label: "Parking" },
        { key: "garden", label: "Garden" },
        { key: "balcony", label: "Balcony" },
        { key: "garage", label: "Garage" },
        { key: "gym", label: "Gym" },
      ];

      const extractedAmenities: string[] = [];
      amenityKeywords.forEach((amenity) => {
        if (lowerQuery.includes(amenity.key)) {
          extractedAmenities.push(amenity.key);
        }
      });

      if (extractedAmenities.length > 0) {
        newFilters.amenities = extractedAmenities;
      }

      return newFilters;
    },
    []
  );

  // Handle AI filter submission
  const handleAIFilter = async (query?: string) => {
    const filterQuery = query || aiInput.trim();
    if (!filterQuery) return;

    setAiLoading(true);
    setAiFilterOpen(false);

    try {
      // First try to parse locally
      const parsedFilters = await parseAIQueryToFilters(filterQuery);

      // Update filters with AI parsed values
      setFilters((prev) => ({
        ...prev,
        ...parsedFilters,
        keyword: filterQuery, // Store the original query as keyword
      }));

      // Show success message
      if (Object.keys(parsedFilters).length > 0) {
        // Trigger filter application
        setShouldFetch(true);

        // Add a system message to show what was found
        console.log("AI Filters Applied:", parsedFilters);
      } else {
        // If no filters were found, just search with keyword
        setFilters((prev) => ({
          ...prev,
          keyword: filterQuery,
        }));
        setShouldFetch(true);
      }

      // Clear input
      setAiInput("");
    } catch (error) {
      console.error("AI Filter Error:", error);
      // Fallback to simple keyword search
      setFilters((prev) => ({
        ...prev,
        keyword: filterQuery,
      }));
      setShouldFetch(true);
    } finally {
      setAiLoading(false);
    }
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;

    let sort_by = "";
    let sort_order = "";
    let sortBy = "";

    switch (value) {
      case "Newest First":
        sort_by = "created_at";
        sort_order = "desc";
        sortBy = value;
        break;

      case "Oldest First":
        sort_by = "created_at";
        sort_order = "asc";
        sortBy = value;
        break;

      case "Price: Low to High":
        sort_by = "price";
        sort_order = "asc";
        sortBy = value;
        break;

      case "Price: High to Low":
        sort_by = "price";
        sort_order = "desc";
        sortBy = value;
        break;

      default:
        break;
    }

    setFilters((prev) => ({
      ...prev,
      sort_by,
      sort_order,
      sortBy,
    }));

    setShouldFetch(true);
  };

  const handleAmenityChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;

    setFilters((prev) => {
      const newAmenities = checked
        ? [...prev.amenities, value]
        : prev.amenities.filter((a) => a !== value);

      return { ...prev, amenities: newAmenities };
    });
  };

  const fetchPropertyAttributes = async () => {
    const response = await propertyAttributes();
    setAmenities(response.data.amenities);
    setPropertyTypes(response.data.property_types);
  };

  useEffect(() => {
    const filterData = location.state?.filters ?? filters;
    setFilters(() => ({
      ...filterData,
      type: propType,
    }));
    setShouldFetch(true);
  }, [propType]);

  const fetchProperties = async () => {
    setLoading(true);

    try {
      const data = await getPropertiesByFilter(page, filters);

      if (data.success) {
        setProperties(data?.data.data ?? []);
        setTotalPages(data?.data?.last_page || 1);
        setTotalRecords(data?.data?.total || 0);
        setLoading(false);
        setShouldFetch(false);
      } else {
        console.error("Error fetching properties: " + data.message);
      }
    } catch (e) {
      console.error("Failed to fetch properties: " + e);
    }
  };

  useEffect(() => {
    if (shouldFetch) {
      fetchProperties();
      fetchPropertyAttributes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldFetch]);

  useEffect(() => {
    setShouldFetch(true);
  }, [page]);

  const handleApplyFilters = () => {
    setShouldFetch(true);
    setIsOpen(false);
  };

  const handleResetFilters = () => {
    setFilters({
      keyword: "",
      location: "",
      state: "",
      city: "",
      property_type: "",
      min_price: "",
      max_price: "",
      bedrooms: "",
      bathrooms: "",
      min_area: "",
      max_area: "",
      type: propType,
      amenities: [],
      sort_by: "",
      sort_order: "",
      sortBy: "Newest First",
    });

    handleApplyFilters();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-white font-semibold">
                Properties For {propType === "sale" ? "Sale" : "Rent"}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Discover Your{" "}
              <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                Perfect Property
              </span>
            </h1>

            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              Browse through our curated selection of premium properties and find your dream home
              today
            </p>

            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-8 mt-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">{totalRecords}+</div>
                <div className="text-sm text-gray-400">Available Properties</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">50+</div>
                <div className="text-sm text-gray-400">Cities Covered</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">98%</div>
                <div className="text-sm text-gray-400">Customer Satisfaction</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-12" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
              className="fill-gray-50"
            ></path>
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12">
        {/* Mobile Filter Button */}
        <div className="lg:hidden mb-6">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-4 rounded-2xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all font-semibold"
          >
            <Filter size={20} />
            {isOpen ? "Hide Filters" : "Show Filters & Search"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filter Sidebar - Desktop */}
          <div className="hidden lg:block">
            {/* AI Filter Section */}
            <AIFilterSection
              aiFilterOpen={aiFilterOpen}
              setAiFilterOpen={setAiFilterOpen}
              aiInput={aiInput}
              setAiInput={setAiInput}
              aiLoading={aiLoading}
              aiSuggestions={aiSuggestions}
              handleAIFilter={handleAIFilter}
            />

            <FilterSidebar
              filters={filters}
              amenities={amenities ?? []}
              propertyTypes={propertyTypes ?? []}
              handleInputChange={handleInputChange}
              handleAmenityChange={handleAmenityChange}
              handleApplyFilters={handleApplyFilters}
              handleResetFilters={handleResetFilters}
            />
          </div>

          {/* Properties Grid */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <motion.div
              className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl">
                    <LayoutGrid className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Available Properties</h3>
                    <p className="text-gray-600 mt-1">
                      <span className="font-bold text-blue-600">{totalRecords}</span> properties
                      match your search criteria
                    </p>
                  </div>
                </div>

                {/* Sort Dropdown */}
                <select
                  id="sortBy"
                  value={filters?.sortBy}
                  onChange={handleSortChange}
                  className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer font-medium"
                >
                  <option value="Newest First">Newest First</option>
                  <option value="Oldest First">Oldest First</option>
                  <option value="Price: Low to High">Price: Low to High</option>
                  <option value="Price: High to Low">Price: High to Low</option>
                </select>
              </div>
            </motion.div>

            {/* Properties Grid */}
            {loading ? (
              <div className="flex justify-center items-center min-h-[60vh]">
                <Loader />
              </div>
            ) : properties.length > 0 ? (
              <div className="grid gap-8 grid-cols-1 md:grid-cols-2">
                {properties.map((property, index) => (
                  <motion.div
                    key={property.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <PropertyCard
                      property={property}
                      isFavorite={property?.is_favorite ?? false}
                      fetchProperties={fetchProperties}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl shadow-xl border border-gray-100 p-12 text-center"
              >
                <div className="inline-flex flex-col items-center gap-6 max-w-md mx-auto">
                  <div className="p-8 bg-gradient-to-br from-blue-50 to-emerald-50 rounded-3xl">
                    <Building2 className="w-20 h-20 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-3">No Properties Found</h3>
                    <p className="text-gray-600 text-lg leading-relaxed">
                      We couldn't find any properties matching your search criteria. Try adjusting
                      your filters or search in a different location.
                    </p>
                  </div>
                  <button
                    onClick={handleResetFilters}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all transform hover:scale-105"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Reset All Filters
                  </button>
                </div>
              </motion.div>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center items-center gap-3 mt-12"
              >
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-4 bg-white border-2 border-gray-200 text-gray-700 rounded-2xl hover:bg-gray-50 hover:border-blue-300 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`px-5 py-3 rounded-2xl font-bold transition-all ${
                          page === pageNum
                            ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30"
                            : "bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-4 bg-white border-2 border-gray-200 text-gray-700 rounded-2xl hover:bg-gray-50 hover:border-blue-300 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Sliding Drawer */}
            <motion.div
              className="lg:hidden fixed top-0 right-0 h-full w-[90%] max-w-md bg-white backdrop-blur-xl shadow-2xl z-50 overflow-y-auto"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white backdrop-blur-xl border-b border-gray-200 p-6 flex items-center justify-between z-10 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                    <Filter className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Filters & Search</h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X size={22} className="text-gray-600" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Mobile AI Filter Section */}
                <AIFilterSection
                  aiFilterOpen={aiFilterOpen}
                  setAiFilterOpen={setAiFilterOpen}
                  aiInput={aiInput}
                  setAiInput={setAiInput}
                  aiLoading={aiLoading}
                  aiSuggestions={aiSuggestions}
                  handleAIFilter={handleAIFilter}
                />

                <FilterSidebar
                  filters={filters}
                  amenities={amenities ?? []}
                  propertyTypes={propertyTypes ?? []}
                  handleInputChange={handleInputChange}
                  handleAmenityChange={handleAmenityChange}
                  handleApplyFilters={handleApplyFilters}
                  handleResetFilters={handleResetFilters}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* AI Filter Modal */}
      <AnimatePresence>
        {aiFilterOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setAiFilterOpen(false)}
            />

            {/* Modal */}
            <motion.div
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-lg bg-white backdrop-blur-xl rounded-3xl shadow-2xl z-50 overflow-hidden"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              {/* Header */}
              <div className="p-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Brain className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">AI Property Search Assistant</h3>
                    <p className="text-sm text-blue-100">
                      Describe what you're looking for in natural language
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="mb-6">
                  <div className="relative">
                    <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !aiLoading) {
                          handleAIFilter();
                        }
                      }}
                      placeholder="Example: 'Find me a 3-bedroom house with a backyard under $500k'"
                      className="w-full pl-12 pr-24 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      disabled={aiLoading}
                    />
                    <button
                      onClick={() => handleAIFilter()}
                      disabled={aiLoading || !aiInput.trim()}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {aiLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <span>Search</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Quick Suggestions */}
                <div className="mb-2">
                  <h4 className="text-sm font-bold text-gray-900 mb-3">
                    Try saying something like:
                  </h4>
                  <div className="space-y-2">
                    {aiSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setAiInput(suggestion);
                          setTimeout(() => handleAIFilter(suggestion), 100);
                        }}
                        disabled={aiLoading}
                        className="cursor-pointer w-full text-left p-4 bg-gray-50 hover:bg-blue-50 border-2 border-gray-200 hover:border-blue-200 rounded-xl text-gray-700 hover:text-gray-900 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-lg group-hover:bg-blue-100 transition-colors">
                            <Sparkles className="w-4 h-4 text-gray-500 group-hover:text-blue-600" />
                          </div>
                          <span className="text-sm font-medium">{suggestion}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-gray-500 text-center mt-4">
                  💡 Our AI will automatically set the appropriate filters based on your description
                </p>
              </div>

              {/* Footer */}
              <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setAiFilterOpen(false)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// AI Filter Section Component
const AIFilterSection = ({
  aiFilterOpen,
  setAiFilterOpen,
  aiInput,
  setAiInput,
  aiLoading,
  aiSuggestions,
  handleAIFilter,
}: {
  aiFilterOpen: boolean;
  setAiFilterOpen: (open: boolean) => void;
  aiInput: string;
  setAiInput: (input: string) => void;
  aiLoading: boolean;
  aiSuggestions: string[];
  handleAIFilter: (query?: string) => Promise<void>;
}) => {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-3xl shadow-xl mb-6 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              AI-Powered Search</h3>
              <span
                className="
                inline-flex items-center justify-center
                px-2 pt-0.5
                text-[10px] font-bold
                rounded-full
                bg-transparent
                border border-blue-900
                bg-clip-text text-transparent
                bg-gradient-to-r from-purple-600 to-blue-600
              "
              >
                BETA
              </span>
            {/* <p className="text-sm text-gray-600">Find properties using natural language</p> */}
          </div>
        </div>

        <button
          onClick={() => setAiFilterOpen(true)}
          className="cursor-pointer w-full flex items-center justify-center gap-3 px-4 py-4 bg-white border-2 border-purple-200 hover:border-purple-300 rounded-xl text-purple-700 hover:text-purple-800 font-medium transition-all group"
        >
          <Sparkles className="w-5 h-5" />
          <span className="flex-1 text-left">Describe your dream property...</span>
        </button>

        <div className="mt-4 space-y-2">
          <p className="text-xs text-gray-500 mb-2">Quick suggestions:</p>
          {aiSuggestions.slice(0, 2).map((suggestion, index) => (
            <button
              key={index}
              onClick={() => {
                setAiInput(suggestion);
                handleAIFilter(suggestion);
              }}
              disabled={aiLoading}
              className="cursor-pointer w-full text-left px-4 py-3 bg-white/60 hover:bg-white border border-purple-100 hover:border-purple-200 rounded-lg text-sm text-gray-700 hover:text-gray-900 transition-all hover:shadow-sm"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const FilterSidebar = ({
  filters,
  amenities,
  propertyTypes,
  handleInputChange,
  handleAmenityChange,
  handleApplyFilters,
  handleResetFilters,
}: {
  filters: FilterState;
  amenities: Attributes[];
  propertyTypes: Attributes[];
  handleInputChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleAmenityChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleApplyFilters: () => void;
  handleResetFilters: () => void;
}) => {
  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 lg:sticky lg:top-24">
      {/* Section Header */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
            <Filter className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Filter Properties</h3>
        </div>
        <p className="text-sm text-gray-600">Refine your search to find the perfect match</p>
      </div>

      {/* Quick Search */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-gray-900 mb-3">Quick Search</label>
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by keyword..."
            id="keyword"
            maxLength={100}
            value={filters?.keyword}
            onChange={handleInputChange}
            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-6">
        {/* Location */}
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3">
            <MapPin className="w-4 h-4 text-blue-600" />
            Location
          </label>
          <input
            type="text"
            id="location"
            value={filters?.location}
            onChange={handleInputChange}
            maxLength={50}
            placeholder="e.g., Downtown, Suburbs..."
            className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-3">City</label>
          <input
            type="text"
            id="city"
            value={filters?.city}
            onChange={handleInputChange}
            maxLength={50}
            placeholder="e.g., New York, Los Angeles..."
            className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Price Range */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-bold text-gray-900">Maximum Price</label>
            <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
              ${Number(filters?.max_price || 0).toLocaleString()}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="10000000"
            step="10000"
            id="max_price"
            value={filters?.max_price || 0}
            onChange={handleInputChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-2 font-medium">
            <span>$0</span>
            <span>$10M+</span>
          </div>
        </div>

        {/* Bedrooms & Bathrooms Row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Bedrooms */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">Beds</label>
            <select
              id="bedrooms"
              value={filters?.bedrooms}
              onChange={handleInputChange}
              className="w-full px-3 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer font-medium"
            >
              <option value="">Any</option>
              {[1, 2, 3, 4, 5].map((num) => (
                <option key={num} value={num}>
                  {num}+
                </option>
              ))}
            </select>
          </div>

          {/* Bathrooms */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">Baths</label>
            <select
              id="bathrooms"
              value={filters?.bathrooms}
              onChange={handleInputChange}
              className="w-full px-3 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer font-medium"
            >
              <option value="">Any</option>
              {[1, 2, 3, 4].map((num) => (
                <option key={num} value={num}>
                  {num}+
                </option>
              ))}
              <option value="5">5+</option>
            </select>
          </div>
        </div>

        {/* Size Range */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-bold text-gray-900">Maximum Area</label>
            <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">
              {Number(filters?.max_area || 0).toLocaleString()} ft²
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="10000"
            step="100"
            id="max_area"
            value={filters?.max_area || 0}
            onChange={handleInputChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-2 font-medium">
            <span>0 ft²</span>
            <span>10,000+ ft²</span>
          </div>
        </div>

        {/* Property Type */}
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3">
            <Building2 className="w-4 h-4 text-blue-600" />
            Property Type
          </label>
          <select
            id="property_type"
            value={filters?.property_type}
            onChange={handleInputChange}
            className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer font-medium"
          >
            <option value="">All Types</option>
            {propertyTypes?.map((type) => (
              <option key={type.key} value={type.key}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Amenities */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            Amenities
          </h3>
          <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto scrollbar-thin pr-2">
            {amenities?.map((item) => (
              <label
                key={item.key}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 cursor-pointer transition-all group border-2 border-transparent hover:border-blue-100"
              >
                <input
                  type="checkbox"
                  value={item.key}
                  checked={filters?.amenities?.includes(item.key)}
                  onChange={handleAmenityChange}
                  className="w-5 h-5 rounded-lg border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-sm text-gray-700 font-medium group-hover:text-gray-900">
                  {item.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-6 border-t border-gray-200 space-y-3">
          <button
            onClick={handleApplyFilters}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all flex items-center justify-center gap-2 transform hover:scale-105"
          >
            <Search className="w-5 h-5" />
            Apply Filters
          </button>
          <button
            onClick={handleResetFilters}
            className="w-full bg-gray-100 text-gray-700 py-4 rounded-2xl font-bold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Reset All
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyFilters;
