/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * PropertyView Component
 * Professional property details page with premium UI
 *
 * Updated to use review API types and flow from src/api/customer/reviews.ts
 *
 * Screenshot (dev): /mnt/data/1ab1f4d7-eed7-4bb1-820b-277b5460a353.png
 */

import {
  Attributes,
  getProperty,
  InquiryFormData,
  propertyAttributes,
  propertyInquiry,
} from "@/api/customer/properties";
import Loader from "@/components/ui/Loader";
import { DocumentFile, Property } from "@/types/property";
import { createCustomerAppointment } from "@/api/customer/appointments";
import {
  Bed,
  Bath,
  Maximize,
  MapPin,
  Share2,
  Heart,
  FileText,
  FileImage,
  FileSpreadsheet,
  FileType,
  File,
  Eye,
  ChevronLeft,
  ChevronRight,
  Home,
  CheckCircle2,
  Mail,
  Phone,
  Download,
  Building2,
  Sparkles,
  Video,
  Image,
  Calendar,
  Clock,
  X,
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Leaf,
  Goal,
  Users,
  CarFront,
  Wrench,
  Lock,
  Unlock,
  Coins,
  ShoppingCart,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { JSX, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import CustomerInquiryModal from "./CustomerInquiryModal";
import { toast } from "sonner";
import { formatAmount, getDocumentTypeFromUrl, getFileSizeInMB, handleKeyPress } from "@/helpers/customer_helper";
import ImageModal from "./ImageModal";
import { AnimatePresence, motion } from "framer-motion";
import ReactPlayer from "react-player";
import moment from "moment-timezone";
import { removeFavProperties, setFavProperties } from "@/api/customer/properties";

// Reviews API client and types
import {
  fetchPropertyReviews,
  submitPropertyReview,
  Review as ReviewType,
  CreateReviewPayload,
  submitAgentReview,
} from "@/api/customer/propertyreview";

// Wallet API imports
import {
  WalletActionType,
  getWalletSummary,
  spendWalletCredits,
  getWalletBalance,
  WalletSummary,
} from "@/api/customer/credit";
import { CreditCosts, getCreditCostsCustomer } from "@/api/admin/appsetting";

// Swiper imports
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { TruncatedText } from "@/components/ui/TruncatedText";
import LoanCalculator from "@/components/property/LoanCalculator";
import PropertyValuation from "@/components/property/PropertyValuation";

/**
 * Local RatingSummary type for frontend display (backend doesn't return this directly)
 */
interface RatingSummary {
  average_rating: number;
  total_reviews: number;
  recommended_percentage?: number;
  feature_ratings: {
    construction: number;
    amenities: number;
    management: number;
    connectivity: number;
    green_area: number;
    locality: number;
  };
  rating_distribution?: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

// Quick action interface
interface QuickAction {
  type: WalletActionType;
  label: string;
  cost: number;
  icon: JSX.Element;
  description: string;
  requiresProperty: boolean;
}

const PropertyView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [property, setProperty] = useState<Property | null>(null);
  const [amenities, setAmenities] = useState<Attributes[]>();
  const [propertyTypes, setPropertyTypes] = useState<Attributes[]>();
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [activeTab, setActiveTab] = useState<"photos" | "videos">("photos");
  const isLogin = localStorage.getItem("token") ? true : false;

  // Appointment modal state
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState<string>("");
  const [appointmentTime, setAppointmentTime] = useState<string>("");
  const [appointmentType, setAppointmentType] = useState<"visit" | "call">("visit");
  const [customerNotes, setCustomerNotes] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [locationInput, setLocationInput] = useState<string>("");
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [creatingAppointment, setCreatingAppointment] = useState(false);
  const [isFav, setIsFav] = useState<boolean>(false);
  const [creditCosts, setCreditCosts] = useState<CreditCosts>();
  const [showPhotoUnlock, setShowPhotoUnlock] = useState<boolean>(false);
  const [showAgentUnlock, setShowAgentUnlock] = useState<boolean>(false);
  const [showVideoUnlock, setShowVideoUnlock] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [walletSummary, setWalletSummary] = useState<WalletSummary | null>(null);

  // Review and Rating state
  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const [ratingSummary, setRatingSummary] = useState<RatingSummary | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<"all" | "negative" | "recent">("all");
  // userReview now matches backend CreateReviewPayload
  const [userReview, setUserReview] = useState<
    CreateReviewPayload & { positive_comment?: string | null; negative_comment?: string | null }
  >({
    construction: 3,
    amenities: 3,
    management: 3,
    connectivity: 3,
    green_area: 3,
    locality: 3,
    positive_comment: "",
    negative_comment: "",
  });

  const [isAgentReviewModalOpen, setIsAgentReviewModalOpen] = useState(false);
  const [agentRating, setAgentRating] = useState(0);
  const [agentComment, setAgentComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Wallet and Quick Actions state
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [loadingWallet, setLoadingWallet] = useState(false);
  const [showQuickActionModal, setShowQuickActionModal] = useState(false);
  const [selectedQuickAction, setSelectedQuickAction] = useState<QuickAction | null>(null);
  const [isProcessingSpend, setIsProcessingSpend] = useState(false);

  // Track unlocked features for this property
  const [unlockedFeatures, setUnlockedFeatures] = useState<Record<string, boolean>>({});
  const [featureHistory, setFeatureHistory] = useState<string[]>([]);

  // Handle spending credits from modal
  const handleSpendCredits = async (propertyId: number, action_type: WalletActionType) => {
    try {
      setIsProcessing(true);
      const payload = { 
        action_type: action_type, 
        property_id: propertyId || null 
      };
      const response = await spendWalletCredits(payload);
      
      if (response.success) {
        toast.success(`Transaction completed successfully!`);
        loadWalletBalance();
        
        // Close modal
        setShowPhotoUnlock(false);
        setShowVideoUnlock(false);
        setShowAgentUnlock(false);
        loadAllData();
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

  const fetchCreditCosts = async () => {
    try {
      const response = await getCreditCostsCustomer();      
      if (response.success) {
        console.log(response.data.credit_costs);
        
        setCreditCosts(response.data.credit_costs || []);
      }
    } catch (error) {
      console.error("Error fetching credit costs:", error);
    }
  }

  // Load wallet balance
  const loadWalletBalance = async () => {
    if (!isLogin) return;
    
    try {
      setLoadingWallet(true);
      const summaryResponse = await getWalletSummary();
      setWalletSummary(summaryResponse.data);
    } catch (error) {
      console.error("Error loading wallet balance:", error);
    } finally {
      setLoadingWallet(false);
    }
  };

  const fetchPropertyAttributes = async () => {
    try {
      const response = await propertyAttributes();
      setAmenities(response.data.amenities);
      setPropertyTypes(response.data.property_types);
    } catch (err) {
      console.error("Failed to load property attributes", err);
    }
  };

  const handleSubmitAgentReview = async () => {
    if (!property?.agent?.id || agentRating === 0) return;

    setIsSubmittingReview(true);
    try {
      const response = await submitAgentReview(property.agent.id, {
        rating: agentRating,
        comment: agentComment.trim() || undefined,
      });

      if (response.success) {
        toast.success("Review submitted successfully!");
        setIsAgentReviewModalOpen(false);
        setAgentRating(0);
        setAgentComment("");
      } else {
        toast.error(response.message || "Failed to submit review");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to submit review");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleSubmitInquiry = async (inquiryData: InquiryFormData) => {
    const response = await propertyInquiry(Number(id), inquiryData);

    if (response.success) {
      toast.success(response.message);
    } else {
      toast.error(response.message);
    }

    setIsModalOpen(false);
  };

  const handleCreateAppointment = async () => {
    // validations
    if (!appointmentDate || !appointmentTime) {
      toast.error("Please select date and time");
      return;
    }
    if (appointmentType === "call" && !phoneNumber.trim()) {
      toast.error("Please enter phone number for call");
      return;
    }
    if (appointmentType === "visit" && !locationInput.trim()) {
      toast.error("Please enter meeting location for visit");
      return;
    }
    if (!property) {
      toast.error("Property data not loaded");
      return;
    }

    try {
      setCreatingAppointment(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Not authenticated — please log in");
        setIsAppointmentModalOpen(false);
        navigate("/login");
        return;
      }

      // convert date + time to timezone-aware ISO (Asia/Kolkata used as example)
      const scheduledAt = moment
        .tz(`${appointmentDate} ${appointmentTime}`, "YYYY-MM-DD HH:mm", "Asia/Kolkata")
        .toISOString();

      // Build payload exactly matching backend fields
      await createCustomerAppointment(
        Number(property.id),
        property.agent?.id ?? null,
        scheduledAt,
        appointmentType,
        Number(durationMinutes) || 30,
        customerNotes?.trim() || null,
        phoneNumber?.trim() || null,
        (appointmentType === "visit"
          ? locationInput?.trim() || property.address
          : property.address) || null,
        "scheduled",
        token
      );

      toast.success("Appointment created successfully!");
      setIsAppointmentModalOpen(false);

      // Reset form
      setAppointmentDate("");
      setAppointmentTime("");
      setAppointmentType("visit");
      setCustomerNotes("");
      setPhoneNumber("");
      setLocationInput("");
      setDurationMinutes(30);
    } catch (err: any) {
      console.error("create appointment", err?.response?.data ?? err);
      const msg = err?.response?.data?.message ?? err?.message ?? "Failed to create appointment";
      toast.error(msg);
    } finally {
      setCreatingAppointment(false);
    }
  };

  const getDocumentIcon = (type: "pdf" | "image" | "word" | "excel" | "other"): JSX.Element => {
    switch (type) {
      case "pdf":
        return <FileText className="text-red-500" />;
      case "image":
        return <FileImage className="text-green-500" />;
      case "word":
        return <FileType className="text-blue-600" />;
      case "excel":
        return <FileSpreadsheet className="text-green-600" />;
      default:
        return <File className="text-gray-500" />;
    }
  };

  const handleToggleFavorite = async () => {
    if (!isLogin) {
      navigate("/login");
      return;
    }

    if (!property || typeof property.id !== "number") {
      toast.error("Property not loaded yet");
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
    } catch (err) {
      console.error("toggle favorite error", err);
      toast.error("Failed to update favorites");
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const shareUrl = property
      ? `${window.location.origin}/properties/view/${property.id}`
      : window.location.href;

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const handleCloseImageModal = () => {
    setIsImageModalOpen(false);
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) => (images.length ? (prev + 1) % images.length : 0));
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) =>
      images.length ? (prev - 1 + images.length) % images.length : 0
    );
  };

  // Compute rating summary from reviews
  const computeRatingSummary = (reviewsList: ReviewType[] | null): RatingSummary | null => {
    if (!reviewsList || reviewsList.length === 0) return null;
    const total = reviewsList.length;

    const avg = (vals: number[]) => +(vals.reduce((a, b) => a + b, 0) / total).toFixed(1);

    const feature_ratings = {
      construction: avg(reviewsList.map((r) => r.construction)),
      amenities: avg(reviewsList.map((r) => r.amenities)),
      management: avg(reviewsList.map((r) => r.management)),
      connectivity: avg(reviewsList.map((r) => r.connectivity)),
      green_area: avg(reviewsList.map((r) => r.green_area)),
      locality: avg(reviewsList.map((r) => r.locality)),
    };

    const average_rating = +(
      reviewsList
        .map(
          (r) =>
            (r.construction +
              r.amenities +
              r.management +
              r.connectivity +
              r.green_area +
              r.locality) /
            6
        )
        .reduce((a, b) => a + b, 0) / total
    ).toFixed(1);

    const rating_distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviewsList.forEach((r) => {
      const key = Math.min(
        5,
        Math.max(
          1,
          Math.round(
            (r.construction +
              r.amenities +
              r.management +
              r.connectivity +
              r.green_area +
              r.locality) /
              6
          )
        )
      );
      rating_distribution[key as 1 | 2 | 3 | 4 | 5] =
        (rating_distribution[key as 1 | 2 | 3 | 4 | 5] || 0) + 1;
    });

    const recommended_percentage = undefined;

    return {
      average_rating,
      total_reviews: total,
      recommended_percentage,
      feature_ratings,
      rating_distribution,
    };
  };

  // Fetch reviews from API
  const fetchReviews = async () => {
    try {
      const res = await fetchPropertyReviews(Number(id));
      if (!res.success) {
        toast.error("Failed to load reviews");
        setReviews([]);
        setRatingSummary(null);
        return;
      }

      const mapped: ReviewType[] = res.data.map((r: any) => ({
        ...r,
      }));

      setReviews(mapped);
      setRatingSummary(computeRatingSummary(mapped));
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to load reviews");
    }
  };

  const handleSubmitReview = async () => {
    if (!userReview.positive_comment || !userReview.positive_comment.trim()) {
      toast.error("Please enter positives");
      return;
    }

    try {
      const payload: CreateReviewPayload = {
        construction: Number(userReview.construction),
        amenities: Number(userReview.amenities),
        management: Number(userReview.management),
        connectivity: Number(userReview.connectivity),
        green_area: Number(userReview.green_area),
        locality: Number(userReview.locality),
        positive_comment: userReview.positive_comment?.trim() || null,
        negative_comment: userReview.negative_comment?.trim() || null,
      };

      const res = await submitPropertyReview(Number(id), payload);
      if (!res.success) {
        toast.error(res.message || "Failed to submit review");
        return;
      }

      await fetchReviews();
      setShowReviewForm(false);

      setUserReview({
        construction: 3,
        amenities: 3,
        management: 3,
        connectivity: 3,
        green_area: 3,
        locality: 3,
        positive_comment: "",
        negative_comment: "",
      });

      toast.success("Review submitted successfully!");
    } catch (error: any) {
      console.error("Error submitting review:", error);
      toast.error(error?.message ?? "Failed to submit review");
    }
  };

  const filteredReviews = () => {
    switch (reviewFilter) {
      case "all":
        return reviews;
      case "negative":
        return reviews.filter((r) => {
          const avg =
            (r.construction +
              r.amenities +
              r.management +
              r.connectivity +
              r.green_area +
              r.locality) /
            6;
          return avg <= 3;
        });
      case "recent":
        return [...reviews].sort(
          (a, b) => (Date.parse(b.created_at) || 0) - (Date.parse(a.created_at) || 0)
        );
      default:
        return reviews;
    }
  };

  const handleOpenReview = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    setShowReviewForm(true);
  };

  const fetchProperty = async () => {
    try {
      const data = await getProperty(Number(id));
      if (data.success) {
        initDocuments(data.data.property?.document_urls ?? []);
        setProperty(data.data.property);
        setImages(data.data.property?.image_urls ?? []);
        setDocuments(data.data.property?.document_urls ?? []);
        setIsFav(Boolean(data.data.property?.is_favorite));
      } else {
        console.error("Error fetching property:" + data.message);
      }
    } catch (err) {
      console.error("Failed to load property details", err);
      toast.error("Failed to load property details");
    } finally {
      setLoading(false);
    }
  };

  const loadAllData = async () => {
    await fetchPropertyAttributes();
    await fetchProperty();
    await fetchReviews();
    await fetchCreditCosts();
    
    if (isLogin) {
      await loadWalletBalance();
    }
  };

  useEffect(() => {
    loadAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const initDocuments = (documentsList: DocumentFile[] = []): void => {
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
    const videoExtensions = [".mp4", ".mov", ".avi", ".mkv", ".webm"];

    const imageDocs = documentsList.filter((doc) =>
      imageExtensions.some((ext) => (doc.url ?? "").toLowerCase().endsWith(ext))
    );

    const nonImageDocs = documentsList.filter(
      (doc) =>
        !imageExtensions.some((ext) => (doc.url ?? "").toLowerCase().endsWith(ext)) &&
        !videoExtensions.some((ext) => (doc.url ?? "").toLowerCase().endsWith(ext))
    );

    setImages(imageDocs.map((doc) => doc.url));
    setDocuments(nonImageDocs);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-gray-600 hover:text-blue-600 transition-colors">
              Home
            </Link>
            <ChevronRight size={16} className="text-gray-400" />
            <Link
              to={`/properties/${property?.type}`}
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              {property?.type === "sale" ? "For Sale" : "For Rent"}
            </Link>
            <ChevronRight size={16} className="text-gray-400" />
            <span className="text-gray-900 font-semibold truncate max-w-xs">{property?.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8">
        {/* Property Header with Wallet Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">{property?.title}</h1>

                {property?.is_featured && (
                  <span className="flex justify-center items-center text-xs font-semibold p-[5px] rounded-full capitalize bg-purple-600 text-white">
                    <Star size={16} />
                  </span>
                )}

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    property?.approval_status === "approved"
                      ? "bg-emerald-100 text-emerald-700"
                      : property?.approval_status === "rejected"
                      ? "bg-red-100 text-red-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {(property?.approval_status?.charAt(0).toUpperCase() ?? "") +
                    (property?.approval_status?.slice(1) ?? "")}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 mb-4 max-w-auto">
                <MapPin size={18} className="text-blue-600 flex-shrink-0" />
                <span className="text-base">
                  {property?.address}, {property?.city}, {property?.state} {property?.zipcode}
                </span>
              </div>
            </div>

            {/* Price, Wallet & Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="text-left sm:text-right">
                <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                  {formatAmount(property?.price ?? 0)}
                </p>
                <p className="text-gray-600 capitalize font-medium mt-1">
                  For {property?.type === "sale" ? "Sale" : "Rent"}
                </p>
                
                {/* Wallet Balance */}
                {isLogin && (
                  <div className="mt-3 flex items-center gap-2 bg-gradient-to-r from-blue-50 to-emerald-50 px-3 py-2 rounded-xl">
                    <Coins className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-semibold text-gray-900">
                      {loadingWallet ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        `${walletSummary?.current_credits.toLocaleString() ?? 0} credits`
                      )}
                    </span>
                    <Link 
                      to="/my-wallet" 
                      className="text-xs text-blue-600 hover:text-blue-800 hover:underline ml-2"
                    >
                      Add Credits
                    </Link>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleShare}
                  className="p-3 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-blue-300 transition-all shadow-sm cursor-pointer"
                >
                  <Share2 size={20} className="text-gray-600 cursor-pointer" />
                </button>
                <button
                  onClick={handleToggleFavorite}
                  className="p-3 bg-white border-2 border-gray-200 rounded-xl hover:bg-red-50 hover:border-red-300 transition-all shadow-sm cursor-pointer"
                >
                  <Heart
                    className={`w-5 h-5 ${isFav ? "fill-red-500 text-red-500" : "text-slate-700"}`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                icon: Bed,
                label: "Bedrooms",
                value: property?.bedrooms ?? "-",
                color: "from-blue-500 to-blue-600",
              },
              {
                icon: Bath,
                label: "Bathrooms",
                value: property?.bathrooms ?? "-",
                color: "from-emerald-500 to-emerald-600",
              },
              {
                icon: Maximize,
                label: "Area",
                value: property?.area ? `${property.area.toLocaleString()} ft²` : "-",
                color: "from-purple-500 to-purple-600",
              },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6"
              >
                <div className={`inline-flex p-3 bg-gradient-to-br ${stat.color} rounded-xl mb-3`}>
                  <stat.icon size={24} className="text-white" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Media Gallery with Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab("photos")}
                className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all ${
                  activeTab === "photos"
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Image size={20} />
                Photos ({images.length})
              </button>
              <button
                onClick={() => setActiveTab("videos")}
                className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all ${
                  activeTab === "videos"
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Video size={20} />
                Video
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              {activeTab === "photos" ? (
                <>
                  {/* Check if photos are accessible */}
                  {property?.access_flags?.is_images_accessible ? (
                    images.length > 0 ? (
                      <div className="relative">
                        {/* Main Image */}
                        <div className="relative h-96 sm:h-[500px] lg:h-[600px]">
                          <img
                            src={images[selectedImageIndex] ?? ""}
                            alt={`Property image ${selectedImageIndex + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "/assets/no_image_found.jpg";
                            }}
                          />

                          {/* Navigation Arrows */}
                          {images.length > 1 && (
                            <>
                              <button
                                onClick={prevImage}
                                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all"
                              >
                                <ChevronLeft size={24} className="text-gray-900" />
                              </button>
                              <button
                                onClick={nextImage}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all"
                              >
                                <ChevronRight size={24} className="text-gray-900" />
                              </button>
                            </>
                          )}

                          {/* Image Counter */}
                          <div className="absolute bottom-4 right-4 px-4 py-2 bg-black/60 backdrop-blur-sm rounded-full text-white text-sm font-semibold">
                            {selectedImageIndex + 1} / {images.length}
                          </div>
                        </div>

                        {/* Thumbnail Strip */}
                        {images.length > 1 && (
                          <div className="p-4 bg-gray-50 border-t border-gray-200">
                            <div className="flex gap-3 overflow-x-auto pb-2">
                              {images.map((image, index) => (
                                <button
                                  key={index}
                                  onClick={() => setSelectedImageIndex(index)}
                                  className={`relative flex-shrink-0 w-24 h-20 rounded-xl overflow-hidden transition-all ${
                                    selectedImageIndex === index
                                      ? "ring-4 ring-blue-600 scale-105"
                                      : "ring-2 ring-gray-200 hover:ring-blue-300"
                                  }`}
                                >
                                  <img
                                    src={image}
                                    alt={`Thumbnail ${index + 1}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.src = "/assets/no_image_found.jpg";
                                    }}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-96 flex flex-col items-center justify-center bg-gray-100">
                        <Image className="w-16 h-16 text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg">No photos available</p>
                      </div>
                    )
                  ) : (
                    /* Lock Screen for Photos */
                    <div className="w-full h-96 flex flex-col items-center justify-center bg-gray-100 relative">
                      {/* Lock Icon Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-center">
                        <Lock className="w-20 h-20 text-white/80" />
                      </div>
                      
                      {/* Blurred Preview */}
                      <img
                        src={images[0] || "/assets/no_image_found.jpg"}
                        alt="Preview"
                        className="w-full h-full object-cover filter blur-lg"
                      />
                      
                      {/* Unlock Button */}
                      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
                        <button
                          onClick={() => {
                            // Handle unlock logic here
                            console.log("Unlock photos requested");
                            // You can trigger a modal or direct unlock
                            setShowPhotoUnlock(true);
                          }}
                          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-3"
                        >
                          <Unlock size={20} />
                          Unlock Photos for {creditCosts?.images_access} Credits
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Check if videos are accessible */}
                  {property?.access_flags?.is_video_accessible ? (
                    property?.video_url ? (
                      <div className="space-y-4">
                        {/* Main Video Player */}
                        <div className="relative h-96 sm:h-[500px] lg:h-[600px] bg-black rounded-xl overflow-hidden">
                          <ReactPlayer
                            src={property?.video_url}
                            width="100%"
                            height="100%"
                            controls
                            style={{ borderRadius: "12px" }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-96 flex flex-col items-center justify-center bg-gray-100">
                        <Video className="w-16 h-16 text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg">No video available</p>
                        <p className="text-gray-400 text-sm mt-2">
                          Check back later for property video
                        </p>
                      </div>
                    )
                  ) : (
                    /* Lock Screen for Videos */
                    <div className="w-full h-96 flex flex-col items-center justify-center bg-gray-100 relative">
                      {/* Lock Icon Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-center">
                        <Lock className="w-20 h-20 text-white/80" />
                      </div>
                      
                      {/* Video Preview Thumbnail (if available) */}
                      <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                        <Video className="w-32 h-32 text-gray-600" />
                      </div>
                      
                      {/* Unlock Button */}
                      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
                        <button
                          onClick={() => {
                            // Handle unlock logic here
                            console.log("Unlock video requested");
                            setShowVideoUnlock(true);
                          }}
                          className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-3"
                        >
                          <Unlock size={20} />
                          Unlock Video for {creditCosts?.video_access} Credits
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Property Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                  <Home size={24} className="text-white" />
                </div>
                Property Description
              </h2>
              <p className="text-gray-700 leading-relaxed text-lg">{property?.description}</p>
            </motion.div>

            {/* Property Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl">
                  <Building2 size={24} className="text-white" />
                </div>
                Property Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                {[
                  {
                    label: "Property Type",
                    value:
                      propertyTypes?.find((a) => a.key === property?.property_type)?.label ?? "-",
                  },
                  { label: "City", value: property?.city },
                  { label: "State", value: property?.state },
                  { label: "Zip Code", value: property?.zipcode },
                  {
                    label: "Listed On",
                    value: new Date(property?.created_at ?? "").toLocaleDateString(),
                  },
                  { label: "Property ID", value: `#${property?.id}` },
                ].map((detail, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0"
                  >
                    <span className="text-gray-600 font-medium">{detail.label}</span>
                    <span className="font-bold text-gray-900 capitalize w-50">{detail.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Amenities */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                  <Sparkles size={24} className="text-white" />
                </div>
                Amenities & Features
              </h2>
              {property?.amenities && property?.amenities?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {property?.amenities?.map((amenityKey: string, index: number) => {
                    const amenity = amenities?.find((a) => a.key === amenityKey);

                    return (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border-2 border-transparent hover:border-blue-100 hover:bg-blue-50 transition-all"
                      >
                        <CheckCircle2 size={20} className="text-emerald-600 flex-shrink-0" />
                        <span className="text-gray-700 font-medium">
                          {amenity ? amenity.label : amenityKey}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 italic">
                  No amenities listed for this property
                </div>
              )}
            </motion.div>

            {/* Location & Map */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
            >
              <div className="p-6 sm:p-8 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                    <MapPin size={24} className="text-white" />
                  </div>
                  Location
                </h2>
              </div>
              <div className="p-6 sm:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <Home size={18} className="text-blue-600" />
                      Address
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {property?.address}
                      <br />
                      {property?.city}, {property?.state} {property?.zipcode}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <MapPin size={18} className="text-emerald-600" />
                      Neighborhood
                    </h3>
                    <p className="text-gray-700">{property?.location}</p>
                  </div>
                </div>
                {/* Map */}
                <div className="rounded-2xl overflow-hidden h-64 sm:h-80 shadow-lg">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3679.8776891874794!2d72.57136217526489!3d23.022505779165887!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e84f5cf3a65df%3A0x3b1c7c5c50b99b39!2sAhmedabad%2C%20Gujarat!5e0!3m2!1sen!2sin!4v1699536000000!5m2!1sen!2sin"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Property Location Map"
                  ></iframe>
                </div>
              </div>
            </motion.div>

            {/* Reviews & Ratings Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-12"
            >
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3 mb-2">
                    <div className="p-2 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl">
                      <Star size={24} className="text-white" />
                    </div>
                    Reviews & Ratings
                  </h2>
                  <p className="text-gray-600">See what residents say about this property</p>
                </div>

                {/* Rating Summary */}
                <div className="p-8 border-b border-gray-200">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-25">
                    {/* Average Rating */}
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="text-5xl font-bold text-gray-900">
                          {(ratingSummary?.average_rating ?? 0).toFixed(1)}
                        </span>
                        <div className="text-left">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={20}
                                className={`${
                                  i < Math.floor(ratingSummary?.average_rating ?? 0)
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-gray-600 text-sm mt-1">
                            {ratingSummary?.total_reviews ?? 0} Total Reviews
                          </p>
                        </div>
                      </div>

                      {/* Rating Distribution */}
                      <div className="mt-6 space-y-2">
                        {[5, 4, 3, 2, 1].map((stars) => (
                          <div key={stars} className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 w-4">{stars}★</span>
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-amber-500 rounded-full"
                                style={{
                                  width: `${
                                    ((ratingSummary?.rating_distribution?.[
                                      stars as keyof typeof ratingSummary.rating_distribution
                                    ] || 0) /
                                      (ratingSummary?.total_reviews || 1)) *
                                    100
                                  }%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600 w-8 text-right">
                              {ratingSummary?.rating_distribution?.[
                                stars as keyof typeof ratingSummary.rating_distribution
                              ] || 0}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Feature Ratings */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Ratings by Features
                      </h3>
                      <div className="space-y-4">
                        {[
                          {
                            label: "Construction",
                            value: ratingSummary?.feature_ratings.construction ?? 0,
                          },
                          {
                            label: "Amenities",
                            value: ratingSummary?.feature_ratings.amenities ?? 0,
                          },
                          {
                            label: "Management",
                            value: ratingSummary?.feature_ratings.management ?? 0,
                          },
                          {
                            label: "Connectivity",
                            value: ratingSummary?.feature_ratings.connectivity ?? 0,
                          },
                          {
                            label: "Green Area",
                            value: ratingSummary?.feature_ratings.green_area ?? 0,
                          },
                          {
                            label: "Locality",
                            value: ratingSummary?.feature_ratings.locality ?? 0,
                          },
                        ].map((feature, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-gray-700">{feature.label}</span>
                            <div className="flex items-center gap-2">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    size={16}
                                    className={`${
                                      i < Math.floor(feature.value)
                                        ? "fill-amber-400 text-amber-400"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-gray-900 font-semibold w-8">
                                {(feature.value ?? 0).toFixed(1)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Review Filter Tabs */}
                <div className="px-8 pt-6 border-b border-gray-200">
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setReviewFilter("all")}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        reviewFilter === "all"
                          ? "bg-blue-100 text-blue-700"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      All ({reviews.length})
                    </button>
                    <button
                      onClick={() => setReviewFilter("negative")}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        reviewFilter === "negative"
                          ? "bg-red-100 text-red-700"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Negative First (
                      {
                        reviews.filter(
                          (r) =>
                            (r.construction +
                              r.amenities +
                              r.management +
                              r.connectivity +
                              r.green_area +
                              r.locality) /
                              6 <=
                            3
                        ).length
                      }
                      )
                    </button>
                    <button
                      onClick={() => setReviewFilter("recent")}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        reviewFilter === "recent"
                          ? "bg-emerald-100 text-emerald-700"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Recent First
                    </button>
                  </div>
                </div>

                {/* Reviews List (Swiper slider) */}
                <div className="p-8">
                  {filteredReviews().length > 0 ? (
                    <div>
                      <Swiper
                        modules={[Navigation, Pagination, A11y]}
                        spaceBetween={20}
                        slidesPerView={1}
                        navigation
                        breakpoints={{
                          640: { slidesPerView: 1 },
                          768: { slidesPerView: 2 },
                          1024: { slidesPerView: 2 },
                          1280: { slidesPerView: 2 },
                        }}
                        a11y={{ enabled: true }}
                      >
                        {filteredReviews().map((review) => (
                          <SwiperSlide key={review.id}>
                            <div className="border border-gray-200 rounded-2xl p-6 hover:border-blue-300 transition-all h-full flex flex-col justify-between">
                              {/* Review Header */}
                              <div>
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br overflow-hidden from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                                      <img
                                        src={review.user?.avatar_url ?? ""}
                                        alt={review.user?.name ?? "Anonymous"}
                                      />
                                    </div>
                                    <div>
                                      <h4 className="font-bold text-gray-900">
                                        {review.user?.name ?? "Anonymous"}
                                      </h4>
                                      <div className="flex items-center gap-2 mt-1">
                                        <div className="flex">
                                          {(() => {
                                            const avgRating = Math.round(
                                              (review.construction +
                                                review.amenities +
                                                review.management +
                                                review.connectivity +
                                                review.green_area +
                                                review.locality) /
                                                6
                                            );
                                            return [...Array(5)].map((_, i) => (
                                              <Star
                                                key={i}
                                                size={16}
                                                className={`${
                                                  i < avgRating
                                                    ? "fill-amber-400 text-amber-400"
                                                    : "text-gray-300"
                                                }`}
                                              />
                                            ));
                                          })()}
                                        </div>
                                        <span className="text-sm text-gray-500">
                                          {new Date(review.created_at).toLocaleDateString()}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Feature Ratings */}
                                <div className="grid grid-cols-3 sm:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                                  {[
                                    {
                                      key: "construction",
                                      label: "Construction",
                                      value: review.construction,
                                      Icon: Wrench,
                                    },
                                    {
                                      key: "amenities",
                                      label: "Amenities",
                                      value: review.amenities,
                                      Icon: Goal,
                                    },
                                    {
                                      key: "management",
                                      label: "Management",
                                      value: review.management,
                                      Icon: Users,
                                    },
                                    {
                                      key: "connectivity",
                                      label: "Connectivity",
                                      value: review.connectivity,
                                      Icon: CarFront,
                                    },
                                    {
                                      key: "green_area",
                                      label: "Green Area",
                                      value: review.green_area,
                                      Icon: Leaf,
                                    },
                                    {
                                      key: "locality",
                                      label: "Locality",
                                      value: review.locality,
                                      Icon: MapPin,
                                    },
                                  ].map(({ key, label, value, Icon }) => (
                                    <div
                                      key={key}
                                      className="flex flex-col-1 gap-2 items-center justify-center"
                                    >
                                      {/* Icon Wrapper with Tooltip */}
                                      <div
                                        className="relative group cursor-default"
                                        tabIndex={0}
                                        title={label}
                                      >
                                        {/* Icon Bubble */}
                                        <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm group-hover:scale-110 transition-all">
                                          <div className="w-10 h-10 rounded-full bg-gray flex items-center justify-center">
                                            <Icon className="w-5 h-5 text-yellow-400" />
                                          </div>
                                        </div>

                                        {/* Tooltip */}
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity whitespace-nowrap">
                                          {label}
                                          <span className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-t-4 border-t-gray-900 border-x-4 border-x-transparent"></span>
                                        </div>
                                      </div>

                                      {/* Rating Count */}
                                      <p className="text-xs text-gray-700 mt-1 font-semibold">
                                        {Number(value).toFixed(1)}
                                      </p>
                                    </div>
                                  ))}
                                </div>

                                {/* Review Content */}
                                <div className="space-y-4">
                                  <div>
                                    <div className="flex items-center gap-2 mb-2">
                                      <ThumbsUp size={18} className="text-emerald-600" />
                                      <span className="font-semibold text-gray-900">Positives</span>
                                    </div>
                                    <p className="text-gray-700 bg-emerald-50 p-4 rounded-xl">
                                      <TruncatedText
                                        text={review.positive_comment ?? ""}
                                        maxLength={300}
                                      />
                                    </p>
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2 mb-2">
                                      <ThumbsDown size={18} className="text-red-600" />
                                      <span className="font-semibold text-gray-900">Negatives</span>
                                    </div>
                                    <p className="text-gray-700 bg-red-50 p-4 rounded-xl">
                                      <TruncatedText
                                        text={review.negative_comment ?? ""}
                                        maxLength={300}
                                      />
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </SwiperSlide>
                        ))}
                      </Swiper>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reviews Yet</h3>
                      <p className="text-gray-600">Be the first to share your experience!</p>
                    </div>
                  )}

                  {/* Add Review Button - show to all, redirect to login if not logged in */}
                  <div className="mt-8 text-center">
                    <button
                      onClick={handleOpenReview}
                      className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl font-bold"
                    >
                      <MessageCircle size={20} />
                      Write a Review
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Agent & Actions */}
          <div className="space-y-6">
            {/* Contact Agent */}
            {/* Contact Agent */}
<motion.div
  initial={{ opacity: 0, x: 20 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ delay: 0.3 }}
  className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl shadow-xl p-6 sm:p-8 top-24"
>
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-2xl font-bold text-white">Listing Agent</h2>
    {!property?.access_flags?.is_agent_contact_accessible && (
      <span className="bg-yellow-500 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
        <Lock size={12} />
        Locked
      </span>
    )}
  </div>

  {!property?.access_flags?.is_agent_contact_accessible ? (
    <div className="relative">
      {/* Blurred/Obscured Agent Info */}
      <div className="relative mb-6">
        <div className="flex items-center gap-4">
          {/* Blurred Agent Avatar */}
          <div className="relative">
            <img
              src={property?.agent?.avatar_url ?? " "}
              alt="Agent"
              className="w-20 h-20 rounded-full object-cover border-4 border-white/30 filter blur-lg"
              onError={(e) => {
                e.currentTarget.src = "/assets/user.jpg";
              }}
            />
            {/* Lock Icon Overlay */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-900/40 to-purple-900/40 backdrop-blur-sm flex items-center justify-center border-4 border-white/20">
              <Lock className="w-10 h-10 text-white/80" />
            </div>
          </div>
          
          {/* Obscured Agent Details */}
          <div className="space-y-2">
            <div className="h-6 bg-white/20 rounded-lg w-40 backdrop-blur-sm"></div>
            <div className="h-4 bg-white/15 rounded-lg w-32 backdrop-blur-sm"></div>
          </div>
        </div>
      </div>

      {/* Locked Contact Info */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-3 p-3 bg-white/10 backdrop-blur-sm rounded-xl">
          <Mail size={18} className="text-white/60" />
          <div className="h-4 bg-white/15 rounded-lg w-full"></div>
        </div>
        {property?.agent?.phone && (
          <div className="flex items-center gap-3 p-3 bg-white/10 backdrop-blur-sm rounded-xl">
            <Phone size={18} className="text-white/60" />
            <div className="h-4 bg-white/15 rounded-lg w-32"></div>
          </div>
        )}
      </div>

      {/* Lock Overlay Content */}
      <div className="relative p-4 bg-gradient-to-r from-blue-800/40 to-purple-800/40 backdrop-blur-sm rounded-xl border border-white/20 mb-6">
        <div className="text-center">
          {/* Lock Icon */}
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-amber-500 mb-3">
            <Lock className="w-6 h-6 text-white" />
          </div>
          
          <h3 className="text-lg font-bold text-white mb-2">Agent Contact Locked</h3>
          <p className="text-blue-100 text-sm mb-4">
            Unlock to view agent details and contact information
          </p>
          
          {/* Unlock Button */}
          <button
            onClick={() => setShowAgentUnlock(true)}
            className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white py-3 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] p-3"
          >
            Unlock Agent Contact for {creditCosts?.agent_contact_access} Credits
          </button>
        </div>
      </div>

      {/* Locked Buttons (Disabled) */}
      <div className="space-y-3 opacity-50">
        <button
          disabled
          className="w-full bg-white/20 text-white/60 py-4 rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 cursor-not-allowed"
        >
          <Mail size={20} />
          Request Information
        </button>

        <button
          disabled
          className="w-full bg-emerald-500/50 text-white/60 py-4 rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 cursor-not-allowed"
        >
          <Calendar size={20} />
          Create Appointment
        </button>

        <button
          disabled
          className="w-full bg-purple-500/50 text-white/60 py-4 rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 cursor-not-allowed"
        >
          <Star size={20} />
          Agent Review
        </button>
      </div>
    </div>
  ) : (
    <>
      <div className="flex items-center gap-4 mb-6">
        <img
          src={property?.agent?.avatar_url ?? " "}
          alt="Agent"
          className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
          onError={(e) => {
            e.currentTarget.src = "/assets/user.jpg";
          }}
        />
        <div>
          <h3 className="font-bold text-xl text-white">{property?.agent?.name}</h3>
          <p className="text-blue-100 text-sm">Licensed Agent</p>
          {/* Unlocked Badge */}
          <span className="inline-flex items-center gap-1 mt-1 bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
            <Unlock size={12} />
            Unlocked
          </span>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <a
          href={`mailto:${property?.agent?.email}`}
          className="flex items-center gap-3 p-3 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all text-white"
        >
          <Mail size={18} />
          <span className="text-sm truncate">{property?.agent?.email}</span>
        </a>
        {property?.agent?.phone && (
          <a
            href={`tel:${property?.agent?.phone}`}
            className="flex items-center gap-3 p-3 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all text-white"
          >
            <Phone size={18} />
            <span className="text-sm">{property?.agent?.phone}</span>
          </a>
        )}
      </div>

      <div className="space-y-3">
        <button
          onClick={() => {
            if (isLogin) {
              setIsModalOpen(true);
            } else {
              navigate("/login");
            }
          }}
          className="w-full cursor-pointer bg-white text-blue-700 py-4 rounded-2xl hover:bg-gray-50 transition-all font-bold shadow-lg flex items-center justify-center gap-2 transform hover:scale-105"
        >
          <Mail size={20} />
          Request Information
        </button>

        <button
          onClick={() => {
            if (isLogin) {
              setLocationInput(property?.address ?? "");
              setIsAppointmentModalOpen(true);
            } else {
              navigate("/login");
            }
          }}
          className="w-full cursor-pointer bg-emerald-500 text-white py-4 rounded-2xl hover:bg-emerald-600 transition-all font-bold shadow-lg flex items-center justify-center gap-2 transform hover:scale-105"
        >
          <Calendar size={20} />
          Create Appointment
        </button>

        <button
          onClick={() => {
            if (isLogin) {
              setIsAgentReviewModalOpen(true);
            } else {
              navigate("/login");
            }
          }}
          className="w-full cursor-pointer bg-purple-500 text-white py-4 rounded-2xl hover:bg-purple-600 transition-all font-bold shadow-lg flex items-center justify-center gap-2 transform hover:scale-105"
        >
          <Star size={20} />
          Agent Review
        </button>
      </div>
    </>
  )}
</motion.div>

            {/* Property Status */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Property Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Listing Status</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      property?.status === "published"
                        ? "bg-emerald-100 text-emerald-700"
                        : property?.status === "sold" || property?.status === "rented"
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {(property?.status?.charAt(0).toUpperCase() ?? "") + property?.status?.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-600 font-medium">Approval Status</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      property?.approval_status === "approved"
                        ? "bg-emerald-100 text-emerald-700"
                        : property?.approval_status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {(property?.approval_status?.charAt(0).toUpperCase() ?? "") +
                      property?.approval_status?.slice(1)}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Documents */}
            {documents.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText size={20} className="text-blue-600" />
                  Documents
                </h3>
                <div className="space-y-3">
                  {documents.map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border-2 border-gray-100 rounded-2xl hover:border-blue-200 hover:bg-blue-50 transition-all group"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          {getDocumentIcon(getDocumentTypeFromUrl(doc.url))}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{doc.name}</p>
                          <p className="text-gray-500 text-xs">{getFileSizeInMB(doc.size)}</p>
                        </div>
                      </div>
                      {isLogin ? (
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className="flex-shrink-0 p-2 text-blue-600 hover:bg-blue-100 rounded-xl transition-all"
                        >
                          <Download size={20} />
                        </a>
                      ) : (
                        <Link
                          to="/login"
                          className="flex-shrink-0 p-2 text-blue-600 hover:bg-blue-100 rounded-xl transition-all"
                        >
                          <Eye size={20} />
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Loan Calculator */}
            <motion.div className="my-10">
              <LoanCalculator />
            </motion.div>

            {/* Property Valuation */}
            <motion.div className="my-10">
              <PropertyValuation />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Inquiry Modal */}
      <CustomerInquiryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitInquiry}
      />

      {/* Image Modal */}
      <ImageModal
        images={images ?? []}
        initialIndex={selectedImageIndex}
        isOpen={isImageModalOpen}
        onClose={handleCloseImageModal}
        title="Property Images"
      />

      {/* Appointment Modal */}
      {isAppointmentModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsAppointmentModalOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Create Appointment
                </h3>
                <button
                  onClick={() => setIsAppointmentModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Property Info */}
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <h4 className="font-semibold text-gray-900">{property?.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{property?.address}</p>
                <p className="text-sm font-medium text-blue-600 mt-1">
                  Agent: {property?.agent?.name}
                </p>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                <input
                  type="date"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time *</label>
                <input
                  type="time"
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Appointment Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Appointment Type *
                </label>
                <select
                  value={appointmentType}
                  onChange={(e) => setAppointmentType(e.target.value as "visit" | "call")}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="visit">Property Visit</option>
                  <option value="call">Phone Call</option>
                </select>
              </div>

              {/* Phone Number (for calls) */}
              {appointmentType === "call" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) =>
                        handleKeyPress(e, /[0-9()+-\s]/, false)
                      }
                    placeholder="Enter your phone number"
                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Location (for visits) */}
              {appointmentType === "visit" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meeting Location *
                  </label>
                  <input
                    type="text"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    placeholder="Enter meeting address or spot (defaults to property address)"
                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  min={15}
                  max={480}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Customer Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  rows={3}
                  placeholder="Any special requirements or questions..."
                  className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Location Info */}
              <div className="p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>Location: {property?.address}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                  <Clock className="w-4 h-4" />
                  <span>Default Duration: 30 minutes (you can change)</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setIsAppointmentModalOpen(false)}
                className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all"
                disabled={creatingAppointment}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAppointment}
                disabled={
                  creatingAppointment ||
                  !appointmentDate ||
                  !appointmentTime ||
                  (appointmentType === "call" && !phoneNumber.trim()) ||
                  (appointmentType === "visit" && !locationInput.trim())
                }
                className="px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {creatingAppointment ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4" />
                    Create Appointment
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowReviewForm(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[70vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-blue-600" />
                  Write Your Review
                </h3>
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Feature Ratings */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Rate by Features
                </label>
                <div className="space-y-4">
                  {Object.entries({
                    construction: userReview.construction,
                    amenities: userReview.amenities,
                    management: userReview.management,
                    connectivity: userReview.connectivity,
                    green_area: userReview.green_area,
                    locality: userReview.locality,
                  }).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-gray-700 capitalize">
                        {(key as string).replace("_", " ")}
                      </span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setUserReview({ ...userReview, [key]: star } as any)}
                            className="p-1"
                          >
                            <Star
                              size={20}
                              className={`${
                                star <= (value as number)
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-gray-300 hover:text-amber-300"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Positives */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Positives *</label>
                <textarea
                  value={userReview.positive_comment ?? ""}
                  onChange={(e) =>
                    setUserReview({ ...userReview, positive_comment: e.target.value })
                  }
                  rows={3}
                  placeholder="What do you like about this property?"
                  className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  required
                />
              </div>

              {/* Negatives */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Areas for Improvement
                </label>
                <textarea
                  value={userReview.negative_comment ?? ""}
                  onChange={(e) =>
                    setUserReview({ ...userReview, negative_comment: e.target.value })
                  }
                  rows={3}
                  placeholder="What could be improved?"
                  className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowReviewForm(false)}
                className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={!userReview.positive_comment || !userReview.positive_comment.trim()}
                className="px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Agent Review Modal */}
      <AnimatePresence>
        {isAgentReviewModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setIsAgentReviewModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Rate Agent</h2>
                  <button
                    onClick={() => setIsAgentReviewModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <img
                    src={property?.agent?.avatar_url ?? "/assets/user.jpg"}
                    alt="Agent"
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                    onError={(e) => {
                      e.currentTarget.src = "/assets/user.jpg";
                    }}
                  />
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{property?.agent?.name}</h3>
                    <p className="text-gray-600 text-sm">Licensed Agent</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Rating Stars */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Your Rating</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setAgentRating(star)}
                          className="text-3xl focus:outline-none transition-transform hover:scale-110"
                        >
                          {star <= agentRating ? (
                            <Star className="text-yellow-500 fill-yellow-500" />
                          ) : (
                            <Star className="text-gray-300" />
                          )}
                        </button>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500">
                      {agentRating === 0
                        ? "Select a rating"
                        : agentRating === 1
                        ? "Poor"
                        : agentRating === 2
                        ? "Fair"
                        : agentRating === 3
                        ? "Good"
                        : agentRating === 4
                        ? "Very Good"
                        : "Excellent"}
                    </p>
                  </div>

                  {/* Comment */}
                  <div className="space-y-2">
                    <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
                      Your Review (Optional)
                    </label>
                    <textarea
                      id="comment"
                      value={agentComment}
                      onChange={(e) => setAgentComment(e.target.value)}
                      placeholder="Share your experience with this agent..."
                      className="w-full h-32 px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                      maxLength={2000}
                    />
                    <p className="text-xs text-gray-500 text-right">
                      {agentComment.length}/2000 characters
                    </p>
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleSubmitAgentReview}
                    disabled={agentRating === 0 || isSubmittingReview}
                    className={`w-full py-4 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                      agentRating === 0 || isSubmittingReview
                        ? "bg-gray-300 cursor-not-allowed text-gray-500"
                        : "bg-purple-600 hover:bg-purple-700 text-white transform hover:scale-105"
                    }`}
                  >
                    {isSubmittingReview ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Star className="w-5 h-5" />
                        Submit Review
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <QuickActionModal
        isOpen={showPhotoUnlock}
        onClose={() => setShowPhotoUnlock(false)}
        action={{
          type: 'property_photo',
          label: "Property Photos Access",
          cost: creditCosts?.images_access ?? 0,
        }}
        walletSummary={walletSummary}
        isProcessing={isProcessing}
        onConfirm={() => handleSpendCredits(property?.id ?? 1, 'property_photo')}
      />

      <QuickActionModal
        isOpen={showVideoUnlock}
        onClose={() => setShowVideoUnlock(false)}
        action={{
          type: 'property_video',
          label: "Property Video Access",
          cost: creditCosts?.video_access ?? 0,
        }}
        walletSummary={walletSummary}
        isProcessing={isProcessing}
        onConfirm={() => handleSpendCredits(property?.id ?? 1, 'property_video')}
      />

      <QuickActionModal
        isOpen={showAgentUnlock}
        onClose={() => setShowAgentUnlock(false)}
        action={{
          type: 'agent_number',
          label: "Agent Information Access",
          cost: creditCosts?.agent_contact_access ?? 0,
        }}
        walletSummary={walletSummary}
        isProcessing={isProcessing}
        onConfirm={() => handleSpendCredits(property?.id ?? 1, 'agent_number')}
      />
    </div>
  );
};

// Quick Action Modal Component
const QuickActionModal = ({
  action,
  isOpen,
  onClose,
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
  onClose: () => void;
  onConfirm: () => void;
  isProcessing: boolean;
  walletSummary: WalletSummary | null;
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Confirm Action
            </h3>
            <button
              onClick={onClose}
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
                {<FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
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
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              disabled={isProcessing}
            >
              Cancel
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

// Add XCircle import
import { XCircle } from "lucide-react";

export default PropertyView;