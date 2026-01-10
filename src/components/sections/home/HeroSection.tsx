/**
 * Hero Section - Premium Real Estate Platform
 * Modern, professional hero with stunning visuals and smooth interactions
 */

import { motion, AnimatePresence } from "framer-motion";
import { ChangeEvent, useEffect, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Home as HomeIcon,
  Building2,
  DollarSign,
  Bed,
  Bath,
  Maximize2,
  ChevronDown,
} from "lucide-react";
import { FilterState } from "@/types/property";
import { useNavigate } from "react-router-dom";
import { PropertyAttribute, propertyAttributes } from "@/api/customer/properties";

const HeroSection = () => {
  const [activeTab, setActiveTab] = useState<"rent" | "sale">("sale");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [propertyTypes, setPropertyTypes] = useState<PropertyAttribute[]>([]);
  const navigate = useNavigate();

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
    type: "sale",
    amenities: [],
    sort_by: '',
    sort_order: '',
    sortBy: 'Newest First',
  });

  useEffect(() => {
    const fetchAttributes = async () => {
      try {
        const response = await propertyAttributes();
        setPropertyTypes(response.data.property_types || []);
      } catch (error) {
        console.error("Failed to fetch attributes:", error);
      }
    };
    fetchAttributes();
  }, []);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, type: activeTab }));
  }, [activeTab]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    setFilters((prev) => ({ ...prev, [id]: value }));
  };

  const handleSearch = () => {
    const path = activeTab === "rent" ? "/properties/rent" : "/properties/sale";
    navigate(path, { state: { filters } });
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoNHYzMGgtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] animate-pulse"></div>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-transparent"></div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 sm:py-32">
        {/* Main Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Find Your{" "}
            <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              Dream Home
            </span>
          </h1>
          <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto font-light">
            Discover the perfect property from our curated collection of premium
            homes, apartments, and commercial spaces
          </p>
        </motion.div>

        {/* Search Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="max-w-5xl mx-auto"
        >
          {/* Glass Card */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-6 sm:p-8">
            {/* Tabs */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setActiveTab("sale")}
                className={`flex-1 py-4 px-6 rounded-2xl font-semibold text-lg transition-all duration-300 cursor-pointer ${
                  activeTab === "sale"
                    ? "bg-white text-slate-900 shadow-lg"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <Building2 className="inline-block w-5 h-5 mr-2" />
                Buy
              </button>
              <button
                onClick={() => setActiveTab("rent")}
                className={`flex-1 py-4 px-6 rounded-2xl font-semibold text-lg transition-all duration-300 cursor-pointer ${
                  activeTab === "rent"
                    ? "bg-white text-slate-900 shadow-lg"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <HomeIcon className="inline-block w-5 h-5 mr-2" />
                Rent
              </button>
            </div>

            {/* Main Search Bar */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Location Input */}
                <div className="flex-1 relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    id="location"
                    value={filters.location}
                    onChange={handleInputChange}
                    placeholder="Enter location, city, or neighborhood"
                    className="w-full pl-12 pr-4 py-4 bg-white/95 border-0 rounded-2xl  text-slate-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-lg shadow-sm"
                  />
                </div>

                {/* Search Button */}
                <button
                  onClick={handleSearch}
                  className="px-8 py-4 bg-gradient-to-r cursor-pointer from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <Search className="w-5 h-5 " />
                  Search
                </button>
              </div>

              {/* Advanced Filters Toggle */}
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-white/80 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                {showAdvanced ? "Hide" : "Show"} Advanced Filters
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    showAdvanced ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Advanced Filters */}
              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-6 border-t border-white/10 space-y-4">
                      {/* Property Type & Price Range */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <select
                          id="property_type"
                          value={filters.property_type}
                          onChange={handleInputChange}
                          className="px-4 py-3 bg-white/95 border-0 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium shadow-sm"
                        >
                          <option value="">All Property Types</option>
                          {propertyTypes.map((type) => (
                            <option key={type.key} value={type.key}>
                              {type.label}
                            </option>
                          ))}
                        </select>

                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="number"
                            id="min_price"
                            value={filters.min_price}
                            onChange={handleInputChange}
                            placeholder="Min Price"
                            className="w-full pl-10 pr-4 py-3 bg-white/95 border-0 rounded-xl text-slate-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium shadow-sm"
                          />
                        </div>

                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="number"
                            id="max_price"
                            value={filters.max_price}
                            onChange={handleInputChange}
                            placeholder="Max Price"
                            className="w-full pl-10 pr-4 py-3 bg-white/95 border-0 rounded-xl text-slate-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium shadow-sm"
                          />
                        </div>
                      </div>

                      {/* Beds, Baths, Area */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="relative">
                          <Bed className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="number"
                            id="bedrooms"
                            value={filters.bedrooms}
                            onChange={handleInputChange}
                            placeholder="Bedrooms"
                            className="w-full pl-10 pr-4 py-3 bg-white/95 border-0 rounded-xl text-slate-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium shadow-sm"
                          />
                        </div>

                        <div className="relative">
                          <Bath className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="number"
                            id="bathrooms"
                            value={filters.bathrooms}
                            onChange={handleInputChange}
                            placeholder="Bathrooms"
                            className="w-full pl-10 pr-4 py-3 bg-white/95 border-0 rounded-xl text-slate-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium shadow-sm"
                          />
                        </div>

                        <div className="relative">
                          <Maximize2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="number"
                            id="min_area"
                            value={filters.min_area}
                            onChange={handleInputChange}
                            placeholder="Min Area (sq ft)"
                            className="w-full pl-10 pr-4 py-3 bg-white/95 border-0 rounded-xl text-slate-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium shadow-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8"
          >
            {[
              { label: "Active Listings", value: "10,000+", icon: Building2 },
              { label: "Happy Clients", value: "5,000+", icon: HomeIcon },
              { label: "Expert Agents", value: "500+", icon: HomeIcon },
              { label: "Cities Covered", value: "50+", icon: MapPin },
            ].map((stat, index) => (
              <div
                key={index}
                className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-4 text-center"
              >
                <stat.icon className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-300">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-6 left-1/2 transform -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-2 text-white/60">
          <span className="text-sm font-medium">Explore More</span>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-6 h-10 border-2 border-white/40 rounded-full flex items-start justify-center p-2"
          >
            <div className="w-1.5 h-1.5 bg-white/60 rounded-full"></div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default HeroSection;
