/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2, Home, Star, StarOff, MapPin, DollarSign, Layers, Ruler, Bed, Bath, Calendar } from "lucide-react";
import AdminLayout from "@/components/layout/admin/AdminLayout";
import {
  getPropertyById,
  deleteProperty,
  deletePropertyVideo,
  markAsFeatured,
  removeFeatured,
} from "@/api/agent/property";
import type { Property } from "@/types/property";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import PropertyDocuments from "./PropertyDocuments";
import { Attributes, propertyAttributes } from "@/api/customer/properties";
import { formatAmount } from "@/helpers/customer_helper";
import ReactPlayer from "react-player";
import DeleteModal from "../components/DeleteModal";

const ViewProperty = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [amenities, setAmenities] = useState<Attributes[]>();
  const [propertyTypes, setPropertyTypes] = useState<Attributes[]>();
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showVideoDeleteModal, setShowVideoDeleteModal] = useState(false);
  const [togglingFeatured, setTogglingFeatured] = useState(false);
  const [featuredRemaining, setFeaturedRemaining] = useState<number | "unlimited" | null>(null);

  const fetchPropertyAttributes = async () => {
    const response = await propertyAttributes();
    setAmenities(response.data.amenities);
    setPropertyTypes(response.data.property_types);
  };

  const updatePropertyFromResponse = (respData: any) => {
    if (!respData) return;
    if (respData.property) {
      setProperty(respData.property);
    }
    if (respData.featured_remaining !== undefined) {
      setFeaturedRemaining(respData.featured_remaining);
    }
  };
  const handleMarkAsFeatured = async () => {
    if (!property?.id) return;
    setTogglingFeatured(true);
    try {
      const data = (await markAsFeatured(property.id)) as any;
      if (data?.success) {
        toast.success(data.message || "Property marked as featured");
        updatePropertyFromResponse(data.data ?? {});
      } else {
        toast.error(data?.message || "Failed to mark featured");
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to mark featured";
      toast.error(msg);
    } finally {
      setTogglingFeatured(false);
    }
  };

  const handleRemoveFeatured = async () => {
    if (!property?.id) return;
    setTogglingFeatured(true);
    try {
      const data = (await removeFeatured(property.id)) as any;
      if (data?.success) {
        toast.success(data?.message || "Featured removed");
        updatePropertyFromResponse(data.data ?? {});
      } else {
        toast.error(data?.message || "Failed to remove featured");
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to remove featured";
      toast.error(msg);
    } finally {
      setTogglingFeatured(false);
    }
  };
  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/agent/properties");
    }
  };

  const fetchProperty = async () => {
    try {
      const data = await getPropertyById(Number(id));
      if (data) setProperty(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load property details");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProperty = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await deleteProperty(Number(id));
      toast.success("Property deleted successfully");
      navigate("/agent/properties");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete property");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleVideoDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await deletePropertyVideo(Number(id));
      toast.success("Property video deleted successfully");
      fetchProperty();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete property");
    } finally {
      setDeleting(false);
      setShowVideoDeleteModal(false);
    }
  };

  useEffect(() => {
    fetchProperty();
    fetchPropertyAttributes();
  }, [id]);

  if (loading)
    return (
      <AdminLayout>
        <div className="min-h-screen dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-950 bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-blue-500 dark:border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-500 dark:text-gray-400">Loading property details...</p>
          </div>
        </div>
      </AdminLayout>
    );

  if (!property)
    return (
      <AdminLayout>
        <div className="min-h-screen dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-950 bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center">
          <div className="text-center dark:text-red-400 text-red-500 p-8 dark:bg-gray-800/50 bg-white rounded-2xl shadow-xl dark:border-gray-700/50 border">
            <Home className="w-16 h-16 mx-auto mb-4" />
            <p className="text-lg font-semibold">Property not found</p>
          </div>
        </div>
      </AdminLayout>
    );

  const allImages =
    property.image_urls && property.image_urls.length > 0 ? property.image_urls : [];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "published":
        return "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400";
      case "draft":
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400";
      case "sold":
        return "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400";
      case "rented":
        return "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400";
    }
  };

  const getApprovalColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400";
      case "rejected":
        return "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400";
      default:
        return "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400";
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto p-6 space-y-8 min-h-screen dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-950 bg-gradient-to-br from-slate-50 to-blue-50/30">
        {/* ---------- Back & Delete Buttons ---------- */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition font-medium cursor-pointer px-4 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50"
          >
            <ArrowLeft size={18} />
            <span className="font-medium">Back to Properties</span>
          </button>
          <div className="flex flex-wrap gap-2">
            {property.is_featured ? (
              <button
                onClick={handleRemoveFeatured}
                disabled={togglingFeatured}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-gray-600 to-gray-700 dark:from-gray-700 dark:to-gray-800 text-white px-4 py-2.5 rounded-xl hover:shadow-lg transition-all text-sm font-medium cursor-pointer disabled:opacity-60"
                title="Remove featured"
              >
                <StarOff size={16} />
                <span className="lg:block hidden">
                  {togglingFeatured ? "Removing..." : "Remove Featured"}
                </span>
              </button>
            ) : (
              <button
                onClick={handleMarkAsFeatured}
                disabled={togglingFeatured}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all text-sm font-medium cursor-pointer disabled:opacity-60"
                title="Mark as featured"
              >
                <Star size={16} />
                <span className="lg:block hidden">
                  {togglingFeatured ? "Featuring..." : "Mark as Featured"}
                </span>
                {featuredRemaining && featuredRemaining !== "unlimited" && (
                  <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded-full">
                    {featuredRemaining} left
                  </span>
                )}
              </button>
            )}

            <button
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all text-sm font-medium"
            >
              <Trash2 size={16} />
              <span className="lg:block hidden">Delete Property</span>
            </button>
          </div>
        </div>

        {/* ---------- Property Header ---------- */}
        <div className="bg-gradient-to-r from-blue-600 to-emerald-600 p-8 rounded-2xl shadow-xl dark:shadow-black/30 border-0 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10 dark:bg-black/20"></div>
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center flex-wrap gap-3 mb-3">
                  <h1 className="text-3xl font-bold">{property.title}</h1>
                  {property.is_featured && (
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-sm font-bold shadow-lg">
                      <Star className="w-4 h-4" /> Featured
                    </span>
                  )}
                </div>
                <div className="flex items-center flex-wrap gap-4 text-blue-100/90">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    <span>{property.city ?? "—"}, {property.state ?? "—"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} />
                    <span className="text-xl font-bold">{formatAmount(property.price)}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <span className={`px-4 py-2 rounded-full text-sm font-bold capitalize border border-white/20 ${getStatusColor(property.status)}`}>
                  {property.status}
                </span>
                <span className={`px-4 py-2 rounded-full text-sm font-bold capitalize border border-white/20 ${getApprovalColor(property.approval_status)}`}>
                  {property.approval_status || "Pending"}
                </span>
              </div>
            </div>
            <p className="text-sm text-blue-100/80 mt-4">
              Property ID: <span className="font-bold">{property.id}</span> • 
              Created: <span className="font-bold">{property.created_at ? new Date(property.created_at).toLocaleDateString() : "—"}</span>
            </p>
          </div>
        </div>

        {/* ---------- Image Gallery ---------- */}
        <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700/50 shadow-lg dark:shadow-black/30 p-6">
          <h2 className="text-xl font-bold dark:text-white text-gray-800 mb-4">Property Gallery</h2>
          {allImages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allImages.map((img: string, i: number) => (
                <div key={i} className="group relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
                  <img
                    src={img}
                    alt={`Property Image ${i + 1}`}
                    className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://placehold.co/800x400?text=Image+Unavailable";
                    }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full h-64 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800/30 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
              <Home className="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No images available</p>
            </div>
          )}
        </div>

        {/* ---------- Property Details Grid ---------- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Property Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Stats */}
            <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700/50 shadow-lg dark:shadow-black/30 p-6">
              <h2 className="text-xl font-bold dark:text-white text-gray-800 mb-6">Property Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <InfoCard 
                  icon={<DollarSign className="w-5 h-5" />}
                  label="Price"
                  value={formatAmount(property.price)}
                  color="text-emerald-600 dark:text-emerald-400"
                />
                <InfoCard 
                  icon={<Bed className="w-5 h-5" />}
                  label="Bedrooms"
                  value={property.bedrooms}
                  color="text-blue-600 dark:text-blue-400"
                />
                <InfoCard 
                  icon={<Bath className="w-5 h-5" />}
                  label="Bathrooms"
                  value={property.bathrooms}
                  color="text-purple-600 dark:text-purple-400"
                />
                <InfoCard 
                  icon={<Ruler className="w-5 h-5" />}
                  label="Area"
                  value={`${property.area} sqft`}
                  color="text-amber-600 dark:text-amber-400"
                />
                <InfoCard 
                  icon={<Layers className="w-5 h-5" />}
                  label="Type"
                  value={property.type}
                  color="text-cyan-600 dark:text-cyan-400"
                />
                <InfoCard 
                  icon={<Home className="w-5 h-5" />}
                  label="Property Type"
                  value={propertyTypes?.find((a) => a.key === property?.property_type)?.label ?? "-"}
                  color="text-indigo-600 dark:text-indigo-400"
                />
              </div>
            </div>

            {/* Location & Address */}
            <Card className="dark:bg-gray-800/50 bg-white border border-gray-200 dark:border-gray-700/50 shadow-lg dark:shadow-black/30">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold dark:text-white text-gray-800 mb-4">Location Details</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                      <MapPin className="text-white" size={18} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                      <p className="dark:text-white text-gray-800 font-medium">{property.address}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">City</p>
                      <p className="dark:text-white text-gray-800 font-medium">{property.city || "—"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">State</p>
                      <p className="dark:text-white text-gray-800 font-medium">{property.state || "—"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Zip Code</p>
                      <p className="dark:text-white text-gray-800 font-medium">{property.zipcode || "—"}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card className="dark:bg-gray-800/50 bg-white border border-gray-200 dark:border-gray-700/50 shadow-lg dark:shadow-black/30">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold dark:text-white text-gray-800 mb-4">Description</h3>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="dark:text-gray-300 text-gray-600 leading-relaxed whitespace-pre-line">
                    {property.description || "No description provided."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Amenities & Additional Info */}
          <div className="space-y-6">
            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <Card className="dark:bg-gray-800/50 bg-white border border-gray-200 dark:border-gray-700/50 shadow-lg dark:shadow-black/30">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold dark:text-white text-gray-800 mb-4">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {property.amenities.map((amenityKey: string, i: number) => {
                      const amenity = amenities?.find((a) => a.key === amenityKey);
                      return (
                        <span
                          key={i}
                          className="px-3 py-2 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 text-blue-700 dark:text-blue-400 text-sm font-medium border border-blue-100 dark:border-blue-800/50"
                        >
                          {amenity ? amenity.label : amenityKey}
                        </span>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Approval Status */}
            <Card className="dark:bg-gray-800/50 bg-white border border-gray-200 dark:border-gray-700/50 shadow-lg dark:shadow-black/30">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold dark:text-white text-gray-800 mb-4">Approval Status</h3>
                <div className="space-y-3">
                  <div className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold capitalize border ${getApprovalColor(property.approval_status)}`}>
                    {property.approval_status || "Pending Review"}
                  </div>
                  {property.rejection_reason && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-sm font-medium text-red-700 dark:text-red-400 mb-1">Rejection Reason:</p>
                      <p className="text-sm text-red-600 dark:text-red-300">{property.rejection_reason}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card className="dark:bg-gray-800/50 bg-white border border-gray-200 dark:border-gray-700/50 shadow-lg dark:shadow-black/30">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold dark:text-white text-gray-800 mb-4">Timeline</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Created</span>
                    <span className="text-sm dark:text-white text-gray-800 font-medium">
                      {property.created_at ? new Date(property.created_at).toLocaleDateString() : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Last Updated</span>
                    <span className="text-sm dark:text-white text-gray-800 font-medium">
                      {property.updated_at ? new Date(property.updated_at).toLocaleDateString() : "—"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ✅ Property Documents Section */}
        <div className="mt-8">
          <PropertyDocuments propertyId={property.id} />
        </div>

        {/* Video Section */}
        {property.video_url && (
          <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700/50 shadow-lg dark:shadow-black/30 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-bold dark:text-white text-gray-800">Property Video</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Watch the property tour</p>
              </div>
              <button
                onClick={() => setShowVideoDeleteModal(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <Trash2 size={16} /> Delete Video
              </button>
            </div>
            <div className="relative h-72 sm:h-96 lg:h-[500px] bg-black rounded-xl overflow-hidden border-2 border-gray-300 dark:border-gray-700">
              <ReactPlayer
                src={property.video_url}
                width="100%"
                height="100%"
                controls
                playing={false}
                light={false}
                style={{ borderRadius: "12px" }}
              />
            </div>
          </div>
        )}

        {/* ✅ Delete Property Confirmation Modal */}
        {showDeleteModal && (
          <DeleteModal
            show={showDeleteModal}
            title="Delete Property"
            message="This action cannot be undone. All associated images, documents, and data will be permanently deleted. Do you really want to delete this property?"
            onClose={() => setShowDeleteModal(false)}
            onConfirm={handleDeleteProperty}
            loading={deleting}
            confirmText="Delete Property"
            cancelText="Cancel"
            buttonColor="red"
          />
        )}

        {/* ✅ Delete Property Video Confirmation Modal */}
        {showVideoDeleteModal && (
          <DeleteModal
            show={showVideoDeleteModal}
            title="Delete Property Video"
            message="This action cannot be undone. The property video will be permanently removed. Do you really want to delete this video?"
            onClose={() => setShowVideoDeleteModal(false)}
            onConfirm={handleVideoDelete}
            loading={deleting}
            confirmText="Delete Video"
            cancelText="Cancel"
            buttonColor="red"
          />
        )}
      </div>
    </AdminLayout>
  );
};

// InfoCard Component
const InfoCard = ({ 
  icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: any; 
  color: string 
}) => (
  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-700">
    <div className="p-2 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-800 rounded-lg">
      <div className={color}>
        {icon}
      </div>
    </div>
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`text-lg font-bold ${color}`}>
        {value !== undefined && value !== null && value !== "" ? value : "—"}
      </p>
    </div>
  </div>
);

export default ViewProperty;