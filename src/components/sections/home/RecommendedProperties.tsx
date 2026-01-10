/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Recommended Properties Section - Premium Design
 * Showcases featured properties with elegant presentation
 */

import { useState, useEffect } from "react";
import { getProperties } from "@/api/public/recomandedproperty";
import PropertyCard from "./PropertyCard";
import { Property } from "@/types/property";
import { motion } from "framer-motion";
import {
  Sparkles,
  Castle,
  ArrowRight,
  House,
  Building2,
} from "lucide-react";
import { Link } from "react-router-dom";

const RecommendedProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    { id: "all", label: "All Properties", icon: Sparkles },
    { id: "featured", label: "Featured", icon: Sparkles },
    { id: "apartment", label: "Apartments", icon: Building2 },
    { id: "villa", label: "Villas", icon: Castle },
    { id: "house", label: "Houses", icon: House },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getProperties();
      console.log("API Response:", res); // For debugging
      
      // Check if the response structure is as expected
      if (res?.data?.properties && Array.isArray(res.data.properties)) {
        const propertyArray: Property[] = res.data.properties;
        setProperties(propertyArray);
        setError(null); // Clear any previous error
      } else {
        // If no properties array in response, check for message in response
        const errorMessage = res?.data?.message || 
                            res?.message || 
                            "Unexpected response format from server";
        setError(errorMessage);
        setProperties([]);
      }
    } catch (err: unknown) {
      console.error("Error fetching properties:", err);
      
      // Extract error message from different possible error structures
      let errorMessage = "Failed to load properties. Please try again later.";
      
      if (typeof err === 'object' && err !== null) {
        const errorObj = err as any;
        
        // Try to get message from different common error formats
        if (errorObj.response?.data?.message) {
          errorMessage = errorObj.response.data.message;
        } else if (errorObj.response?.data?.error) {
          errorMessage = errorObj.response.data.error;
        } else if (errorObj.message) {
          errorMessage = errorObj.message;
        } else if (errorObj.data?.message) {
          errorMessage = errorObj.data.message;
        }
      }
      
      setError(errorMessage);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  // filter by category, support a "featured" category
  const filteredProperties =
    selectedCategory === "all"
      ? properties
      : selectedCategory === "featured"
      ? properties.filter((p) => !!p.is_featured)
      : properties.filter(
          (p) => (p.property_type ?? "").toLowerCase() === selectedCategory
        );

  // sort so featured items appear first
  const sortedProperties = filteredProperties
    .slice()
    .sort((a, b) => {
      const fa = a.is_featured ? 1 : 0;
      const fb = b.is_featured ? 1 : 0;
      return fb - fa; // featured first
    });

  // display up to 6 on this component
  const displayedProperties = sortedProperties.slice(0, 6);

  if (error) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12 bg-white rounded-3xl shadow-lg border border-red-100">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-red-600 font-medium">{error}</p>
            {/* Optional: Add retry button */}
            <button
              onClick={fetchData}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-600">
              Featured Listings
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
            Discover Your{" "}
            <span className="bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">
              Perfect Home
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Handpicked premium properties tailored to your lifestyle and budget
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                  selectedCategory === category.id
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30"
                    : "bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-blue-300"
                }`}
              >
                <Icon className="w-5 h-5" />
                {category.label}
              </motion.button>
            );
          })}
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl overflow-hidden shadow-lg animate-pulse"
              >
                <div className="aspect-[4/3] bg-gray-200"></div>
                <div className="p-6 space-y-3">
                  <div className="h-6 bg-gray-200 rounded-lg w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded-lg w-1/2"></div>
                  <div className="flex gap-4 pt-4">
                    <div className="h-12 bg-gray-200 rounded-xl flex-1"></div>
                    <div className="h-12 bg-gray-200 rounded-xl flex-1"></div>
                    <div className="h-12 bg-gray-200 rounded-xl flex-1"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Properties Grid */}
        {!loading && displayedProperties.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {displayedProperties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <PropertyCard property={property} isFavorite={property.is_favorite} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && displayedProperties.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-center py-16 bg-white rounded-3xl shadow-lg border border-gray-100"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Properties Found</h3>
            <p className="text-gray-600 mb-8">Try selecting a different category</p>
          </motion.div>
        )}

        {/* View All Button */}
        {!loading && properties.length > 6 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-16"
          >
            <Link
              to="/properties/sale"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-2xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 group"
            >
              <span>View All Properties</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default RecommendedProperties;