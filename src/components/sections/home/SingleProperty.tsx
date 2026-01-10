/* eslint-disable @typescript-eslint/no-explicit-any */
import { JSX, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  MapPin,
  BedDouble,
  Bath,
  Ruler,
  DollarSign,
  Loader2,
  Building2,
  ClipboardList,
  CheckCircle2,
  Dumbbell,
  TreePalm,
  Waves,
  Car,
  Shield,
  Wifi,
  Snowflake,
  Flame,
  WashingMachine,
  DoorOpen,
  House,
} from "lucide-react";
import { getSingleProperty } from "@/api/public/property";
import Header from "@/components/layout/public/Header";
import Footer from "@/components/layout/public/Footer";

const SingleProperty = () => {
  const { id } = useParams();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await getSingleProperty(id!);
        const data = res?.data?.property;
        setProperty(data);
      } catch (err) {
        console.error("Failed to fetch property", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
      </div>
    );

  if (!property)
    return (
      <div className="text-center text-red-600 py-20">Property not found.</div>
    );

  // 🧹 Clean up URL for images
  const getImageUrl = (url?: string) => {
    if (!url) return "https://placehold.co/1200x600?text=No+Image";
    if (url.startsWith("http")) return url.replace(/\\/g, "");
    return `${API_BASE_URL}/${url.replace(/^\/+/, "")}`;
  };

  const primaryImage = getImageUrl(property.primary_image_url);

  // 🧹 Agent Avatar
  const agentAvatar =
    property?.agent?.avatar_url && property.agent.avatar_url !== "null"
      ? getImageUrl(property.agent.avatar_url)
      : "/default-avatar.png";

  // 🧹 Amenities Array
  const amenities: string[] =
    Array.isArray(property.amenities) && property.amenities.length > 0
      ? property.amenities
      : [];

  // 🧩 Icon Map for Amenities
  const iconMap: Record<string, JSX.Element> = {
    gym: <Dumbbell className="text-blue-600 w-6 h-6" />,
    garden: <TreePalm className="text-green-600 w-6 h-6" />,
    "swimming pool": <Waves className="text-cyan-500 w-6 h-6" />,
    pool: <Waves className="text-cyan-500 w-6 h-6" />,
    parking: <Car className="text-gray-600 w-6 h-6" />,
    security: <Shield className="text-blue-500 w-6 h-6" />,
    wifi: <Wifi className="text-purple-500 w-6 h-6" />,
    ac: <Snowflake className="text-sky-400 w-6 h-6" />,
    "air conditioning": <Snowflake className="text-sky-400 w-6 h-6" />,
    balcony: <DoorOpen className="text-amber-500 w-6 h-6" />,
    fireplace: <Flame className="text-red-500 w-6 h-6" />,
    laundry: <WashingMachine className="text-teal-500 w-6 h-6" />,
    default: <House className="text-gray-400 w-6 h-6" />,
  };

  // Function to match icons by amenity name
  const getAmenityIcon = (amenity: string) => {
    const key = amenity.toLowerCase();
    return (
      iconMap[key] ||
      iconMap[
        Object.keys(iconMap).find((k) => key.includes(k)) || "default"
      ] ||
      iconMap.default
    );
  };

  return (
    <section className="min-h-screen bg-gray-50">
      <Header />

      {/* === Banner / Hero Image === */}
      <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden">
        <img
          src={primaryImage}
          alt={property.title || "Property Image"}
          className="object-cover w-full h-full"
          onError={(e) =>
            (e.currentTarget.src =
              "https://placehold.co/1200x600?text=No+Image")
          }
        />
        <div className="absolute inset-0 bg-black/30 flex items-end">
          <div className="text-white px-6 md:px-12 pb-8 max-w-5xl">
            <h1 className="text-3xl md:text-5xl font-bold mb-3">
              {property.title || "Untitled Property"}
            </h1>
            <p className="flex items-center gap-2 text-lg text-gray-200">
              <MapPin size={20} />
              {property.address || "Address not available"}
            </p>
          </div>
        </div>
      </div>

      {/* === Property Overview === */}
      <div className="max-w-6xl mx-auto bg-white shadow-sm rounded-xl p-6 md:p-10 mt-8">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Overview Left */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Overview
            </h2>
            <div className="flex flex-wrap gap-6 text-gray-700">
              <div className="flex items-center gap-2">
                <BedDouble size={20} className="text-blue-600" />
                <span>{property.bedrooms || "—"} Beds</span>
              </div>
              <div className="flex items-center gap-2">
                <Bath size={20} className="text-blue-600" />
                <span>{property.bathrooms || "—"} Baths</span>
              </div>
              <div className="flex items-center gap-2">
                <Ruler size={20} className="text-blue-600" />
                <span>{property.area || "—"} Sq Ft</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 size={20} className="text-blue-600" />
                <span>{property.property_type || "Property"}</span>
              </div>
            </div>

            <p className="mt-6 text-gray-600 leading-relaxed">
              {property.description ||
                "No description provided for this property."}
            </p>

            {/* === Amenities Card Grid === */}
            {amenities.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-green-600" /> Amenities
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {amenities.map((a, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col items-center justify-center bg-gray-50 border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200"
                    >
                      <div className="mb-2">{getAmenityIcon(a)}</div>
                      <p className="text-sm font-medium text-gray-700 capitalize text-center">
                        {a}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Price / Info Card */}
          <div className="bg-blue-50 border border-blue-100 p-6 rounded-lg">
            <p className="text-gray-500 text-sm mb-1">Price</p>
            <p className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
              <DollarSign size={24} className="mr-1 text-blue-600" />
              {Number(property.price || 0).toLocaleString()}
            </p>

            <p className="text-sm text-gray-600">
              Status:{" "}
              <span className="capitalize font-medium text-gray-800">
                {property.status || "N/A"}
              </span>
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Type:{" "}
              <span className="capitalize font-medium text-gray-800">
                {property.type || "N/A"}
              </span>
            </p>

            <div className="mt-6">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-semibold transition-all">
                Contact Agent
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* === Property Details === */}
      <div className="max-w-6xl mx-auto mt-8 bg-white rounded-xl shadow-sm p-6 md:p-10">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <ClipboardList size={24} className="text-blue-600" /> Property Details
        </h2>

        <div className="grid md:grid-cols-2 gap-6 text-gray-700">
          <div>
            <p>
              <span className="font-semibold">City:</span> {property.city}
            </p>
            <p>
              <span className="font-semibold">State:</span> {property.state}
            </p>
            <p>
              <span className="font-semibold">Zip Code:</span>{" "}
              {property.zipcode || "—"}
            </p>
          </div>

          <div>
            <p>
              <span className="font-semibold">Approval Status:</span>{" "}
              {property.approval_status || "—"}
            </p>
            <p>
              <span className="font-semibold">Listed On:</span>{" "}
              {property.created_at
                ? new Date(property.created_at).toLocaleDateString()
                : "—"}
            </p>
            <p>
              <span className="font-semibold">Last Updated:</span>{" "}
              {property.updated_at
                ? new Date(property.updated_at).toLocaleDateString()
                : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* === Agent Info === */}
      <div className="max-w-6xl mx-auto my-8 bg-white rounded-xl shadow-sm p-6 md:p-10">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Listed By</h2>
        <div className="flex items-center gap-4">
          <img
            src={agentAvatar}
            alt={property.agent?.name || "Agent"}
            className="w-16 h-16 rounded-full object-cover border"
          />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {property.agent?.name || "Agent Name"}
            </h3>
            <p className="text-gray-500">{property.agent?.email}</p>
          </div>
        </div>
      </div>

      <Footer />
    </section>
  );
};

export default SingleProperty;
