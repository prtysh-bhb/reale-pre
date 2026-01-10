/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Property Card - Premium Design
 * Stunning property card with modern aesthetics and smooth interactions
 */

import { FC, useState, useRef, useEffect } from "react";
import {
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Heart,
  Eye,
  Share2,
  TrendingUp,
  Home,
  Star,
  X,
  Wrench,
  Building,
  Trees,
  Navigation,
} from "lucide-react";
import { Property } from "@/types/property";
import { removeFavProperties, setFavProperties } from "@/api/customer/properties";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { formatAmount } from "@/helpers/customer_helper";
import React from "react";
import ReactDOM from "react-dom";

interface PropertyCardProps {
  property: Property;
  isFavorite?: boolean;
  fetchProperties?: () => void;
}

interface RatingCategoryProps {
  name: string;
  rating: number;
}

const RatingCategory: FC<RatingCategoryProps> = ({ name, rating }) => {
  // Function to get color based on rating
  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "text-green-600 bg-green-100";
    if (rating >= 3) return "text-yellow-600 bg-yellow-100";
    if (rating >= 2) return "text-orange-600 bg-orange-100";
    return "text-red-600 bg-red-100";
  };

  // Function to get color for text
  const getRatingTextColor = (rating: number) => {
    if (rating >= 4) return "text-green-700";
    if (rating >= 3) return "text-yellow-700";
    if (rating >= 2) return "text-orange-700";
    return "text-red-700";
  };

  // Function to get background color for progress bar
  const getProgressBarColor = (rating: number) => {
    if (rating >= 4) return "bg-green-500";
    if (rating >= 3) return "bg-yellow-500";
    if (rating >= 2) return "bg-orange-500";
    return "bg-red-500";
  };

  // Function to get icon for each category
  const getCategoryIcon = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case "construction":
        return <Building className="w-4 h-4" />;
      case "amenities":
        return <Wrench className="w-4 h-4" />;
      case "management":
        return <TrendingUp className="w-4 h-4" />;
      case "connectivity":
        return <Navigation className="w-4 h-4" />;
      case "green area":
        return <Trees className="w-4 h-4" />;
      case "locality":
        return <MapPin className="w-4 h-4" />;
      default:
        return <Star className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${getRatingColor(rating)}`}>
            {getCategoryIcon(name)}
          </div>
          <span className="text-xs font-medium text-gray-700">{name}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className={`text-sm font-semibold ${getRatingTextColor(rating)}`}>
            {rating.toFixed(1)}
          </span>
        </div>
      </div>
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${getProgressBarColor(rating)} transition-all duration-500`}
          style={{ width: `${(rating / 5) * 100}%` }}
        />
      </div>
    </div>
  );
};

// Create a portal for the popup
const RatingPopup: FC<{
  ratingStat: NonNullable<Property["rating_stat"]>;
  averageRating: number;
  propertyId: number;
  isVisible: boolean;
  onClose: () => void;
  triggerRect: DOMRect | null;
}> = ({ ratingStat, averageRating, propertyId, isVisible, onClose, triggerRect }) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (triggerRect && isVisible) {
      // Calculate position relative to viewport
      const popupWidth = 320; // w-80 = 320px
      const left = triggerRect.left - popupWidth / 2 + triggerRect.width / 2;
      const top = triggerRect.bottom + 10;

      setPosition({
        top: Math.min(top, window.innerHeight - 400), // Keep within viewport
        left: Math.max(10, Math.min(left, window.innerWidth - popupWidth - 10)), // Keep within viewport
      });
    }
  }, [triggerRect, isVisible]);

  if (!isVisible) return null;

  return ReactDOM.createPortal(
    <motion.div
      ref={popupRef}
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="fixed z-[9999] pointer-events-none"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Popup Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Property Ratings</h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-gray-900 mr-2">
                    {averageRating.toFixed(1)}
                  </span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.round(averageRating)
                            ? averageRating >= 4
                              ? "text-green-500"
                              : averageRating >= 3
                              ? "text-yellow-500"
                              : averageRating >= 2
                              ? "text-orange-500"
                              : "text-red-500"
                            : "text-gray-300"
                        }`}
                        fill={star <= Math.round(averageRating) ? "currentColor" : "none"}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-1">3 Total Reviews</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Rating Categories - Two columns side by side */}
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <RatingCategory name="Construction" rating={ratingStat.avg_construction} />
            <RatingCategory name="Amenities" rating={ratingStat.avg_amenities} />
            <RatingCategory name="Management" rating={ratingStat.avg_management} />
            <RatingCategory name="Connectivity" rating={ratingStat.avg_connectivity} />
            <RatingCategory name="Green Area" rating={ratingStat.avg_green_area} />
            <RatingCategory name="Locality" rating={ratingStat.avg_locality} />
          </div>
        </div>
      </div>
    </motion.div>,
    document.body
  );
};

const PropertyCard: FC<PropertyCardProps> = ({ property, isFavorite = false, fetchProperties }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFav, setIsFav] = useState(isFavorite);
  const [showRatingPopup, setShowRatingPopup] = useState(false);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);
  const ratingRef = useRef<HTMLDivElement>(null);
  const isLogin = localStorage.getItem("token") ? true : false;
  const navigate = useNavigate();

  const imageSrc = property.primary_image_url || property.image_urls?.[0];
  const ratingStat = property.rating_stat;

  // Function to get overall rating color
  const getOverallRatingColor = (rating: number) => {
    if (rating >= 4) return "bg-green-100 text-green-800";
    if (rating >= 3) return "bg-yellow-100 text-yellow-800";
    if (rating >= 2) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };

  // Function to get star color based on rating
  const getStarColor = (rating: number) => {
    if (rating >= 4) return "text-green-500";
    if (rating >= 3) return "text-yellow-500";
    if (rating >= 2) return "text-orange-500";
    return "text-red-500";
  };

  // Calculate average rating
  const calculateAverageRating = (stats: typeof ratingStat) => {
    if (!stats) return 0;
    const ratings = [
      stats.avg_construction,
      stats.avg_amenities,
      stats.avg_management,
      stats.avg_connectivity,
      stats.avg_green_area,
      stats.avg_locality,
    ].filter((r) => r > 0);

    if (ratings.length === 0) return 0;
    return ratings.reduce((a, b) => a + b, 0) / ratings.length;
  };

  const averageRating = ratingStat ? calculateAverageRating(ratingStat) : 0;

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLogin) {
      navigate("/login");
      return;
    }

    try {
      if (isFav) {
        await removeFavProperties(property.id);
        setIsFav(false);
        toast.success("Removed from favorites");
      } else {
        await setFavProperties(property.id);
        setIsFav(true);
        toast.success("Added to favorites");
      }
      fetchProperties?.();
    } catch {
      toast.error("Failed to update favorites");
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const shareUrl = `${window.location.origin}/properties/view/${property.id}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const handleRatingMouseEnter = () => {
    if (ratingRef.current) {
      setTriggerRect(ratingRef.current.getBoundingClientRect());
    }
    setShowRatingPopup(true);
  };

  const handleRatingMouseLeave = () => {
    setTimeout(() => {
      setShowRatingPopup(false);
    }, 300);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (showRatingPopup && ratingRef.current) {
        setTriggerRect(ratingRef.current.getBoundingClientRect());
      }
    };

    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [showRatingPopup]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showRatingPopup) {
        setShowRatingPopup(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showRatingPopup]);

  return (
    <>
      <Link to={`/properties/view/${property.id}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -8 }}
          transition={{ duration: 0.3 }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Image Container */}
          <div className="relative aspect-[4/3] overflow-hidden">
            {imageSrc ? (
              <motion.img
                src={imageSrc}
                alt={property.title}
                className="w-full h-full object-cover object-top"
                animate={{ scale: isHovered ? 1.1 : 1 }}
                transition={{ duration: 0.6 }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                <Home className="w-16 h-16 text-gray-300 dark:text-gray-600" />
              </div>
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Status Badge */}
            <div className="absolute flex justify-center items-center gap-1 top-4 left-4">
              <span className="flex px-4 py-2 bg-white/95 backdrop-blur-sm text-slate-900 text-sm font-semibold rounded-full shadow-lg">
                {property.type === "sale" ? "For Sale" : "For Rent"}
              </span>
              {property.is_featured && (
                <span className="flex justify-center items-center text-xs font-semibold p-[5px] rounded-full capitalize bg-purple-600 text-white">
                  <Star size={16} />
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleShare}
                className="w-10 h-10 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors cursor-pointer"
              >
                <Share2 className="w-5 h-5 text-slate-700" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleFavorite}
                className="w-10 h-10 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors cursor-pointer"
              >
                <Heart
                  className={`w-5 h-5 ${isFav ? "fill-red-500 text-red-500" : "text-slate-700"}`}
                />
              </motion.button>
            </div>

            {/* Price Tag */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-slate-900">
                      {formatAmount(property.price)}
                    </p>
                    {property.type === "rent" && (
                      <p className="text-sm text-gray-600 font-medium">/month</p>
                    )}
                  </div>
                  <TrendingUp className="w-6 h-6 text-emerald-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Title */}
            <div className="flex justify-between">
              <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                {property.title}
              </h3>
              {ratingStat && (
                <div
                  ref={ratingRef}
                  className="relative"
                  onMouseEnter={handleRatingMouseEnter}
                  onMouseLeave={handleRatingMouseLeave}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRatingMouseEnter();
                  }}
                >
                  <span
                    className={`ml-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold cursor-pointer transition-all duration-300 hover:scale-105 ${getOverallRatingColor(
                      averageRating
                    )}`}
                  >
                    <Star className={`w-4 h-4 mr-1 ${getStarColor(averageRating)}`} />
                    {averageRating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 text-gray-600 mb-4">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <p className="text-sm font-medium line-clamp-1">
                {property.city}, {property.state}
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 py-4 border-t border-gray-100">
              <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <Bed className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm font-semibold text-slate-900">{property.bedrooms}</span>
                <span className="text-xs text-gray-500">Beds</span>
              </div>

              <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                  <Bath className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="text-sm font-semibold text-slate-900">{property.bathrooms}</span>
                <span className="text-xs text-gray-500">Baths</span>
              </div>

              <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                  <Maximize2 className="w-5 h-5 text-amber-600" />
                </div>
                <span className="text-sm font-semibold text-slate-900">{property.area}</span>
                <span className="text-xs text-gray-500">sqft</span>
              </div>
            </div>

            {/* View Details Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full mt-4 py-3 cursor-pointer bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Eye className="w-5 h-5" />
              View Details
            </motion.button>
          </div>

          {/* Hover Border Effect */}
          <div className="absolute inset-0 border-2 border-blue-500/0 group-hover:border-blue-500/20 rounded-3xl transition-all duration-500 pointer-events-none" />
        </motion.div>
      </Link>

      {/* Rating Popup Portal */}
      {ratingStat && (
        <RatingPopup
          ratingStat={ratingStat}
          averageRating={averageRating}
          propertyId={property.id}
          isVisible={showRatingPopup}
          onClose={() => setShowRatingPopup(false)}
          triggerRect={triggerRect}
        />
      )}
    </>
  );
};

export default PropertyCard;
