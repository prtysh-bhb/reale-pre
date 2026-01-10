/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangeEvent, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createProperty } from "@/api/agent/property";
import { toast } from "sonner";
import AdminLayout from "@/components/layout/admin/AdminLayout";
import { useNavigate } from "react-router-dom";
import { Attributes, propertyAttributes, PropertyFormData } from "@/api/customer/properties";
import { validateImage } from "@/helpers/image_helper";
import {
  HousePlus,
  MapPin,
  DollarSign,
  Home,
  Ruler,
  Bed,
  Bath,
  FileImage,
  Video,
  CheckCircle2,
  Upload,
  AlertCircle,
  HouseWifi,
} from "lucide-react";
import { handleKeyPress } from "@/helpers/customer_helper";

const AddProperty = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [amenities, setAmenities] = useState<Attributes[]>();
  const [propertyTypes, setPropertyTypes] = useState<Attributes[]>();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);

  const [formData, setFormData] = useState<PropertyFormData>({
    title: "",
    description: "",
    price: "",
    location: "",
    address: "",
    city: "",
    state: "",
    zipcode: "",
    type: "sale",
    property_type: "apartment",
    bedrooms: "",
    bathrooms: "",
    area: "",
    status: "draft",
    amenities: [],
  });

  const [images, setImages] = useState<FileList | null>(null);
  const [video, setVideo] = useState<File | null>(null);

  const validatePropertyForm = (formData: any): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) newErrors.title = "Title is required.";
    else if (formData.title.length > 100)
      newErrors.title = "Title should not exceed 100 characters.";
    if (!formData.description?.trim() || formData.description.length < 20)
      newErrors.description = "Description must be at least 20 characters.";
    if (!formData.price || isNaN(Number(formData.price)) || formData.price < 0)
      newErrors.price = "Valid price is required.";
    else if (formData.price > 999999999) newErrors.price = "Price cannot exceed 999999999.";
    if (!formData.location?.trim()) newErrors.location = "Location is required.";
    if (!formData.address?.trim()) newErrors.address = "Address is required.";
    if (!formData.city?.trim()) newErrors.city = "City is required.";
    if (!formData.state?.trim()) newErrors.state = "State is required.";
    if (!formData.zipcode?.trim()) newErrors.zipcode = "Zipcode is required.";
    if (!["sale", "rent"].includes(formData.type))
      newErrors.type = "Type must be either Sale or Rent.";
    if (!formData.property_type?.trim()) newErrors.property_type = "Property type is required.";

    if (formData.bedrooms < 0 || isNaN(Number(formData.bedrooms)))
      newErrors.bedrooms = "Valid bedrooms count is required.";
    else if (formData.bedrooms > 20) newErrors.bedrooms = "Bedrooms cannot exceed 20.";
    if (formData.bathrooms < 0 || isNaN(Number(formData.bathrooms)))
      newErrors.bathrooms = "Valid bathrooms count is required.";
    else if (formData.bathrooms > 20) newErrors.bathrooms = "Bathrooms cannot exceed 20.";

    if (formData.area === "" || isNaN(Number(formData.area)) || formData.area < 0)
      newErrors.area = "Valid property area is required.";

    // ✅ Image validation
    if (images && images.length > 0) {
      const maxSize = 5 * 1024 * 1024; // 5MB
      for (const file of images) {
        if (file.size > maxSize) {
          newErrors.images = `"${file.name}" exceeds the 5MB size limit.`;
          break;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAmenityChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData((prev: PropertyFormData) => {
      const newAmenities = checked
        ? [...prev.amenities, value]
        : prev.amenities.filter((a) => a !== value);
      return { ...prev, amenities: newAmenities };
    });
  };

  useEffect(() => {
    fetchPropertyAttributes();
  }, []);

  const fetchPropertyAttributes = async () => {
    const response = await propertyAttributes();
    setAmenities(response.data.amenities);
    setPropertyTypes(response.data.property_types);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // clear field error on change
    if (errors[name]) {
      setErrors((prev) => {
        const newErr = { ...prev };
        delete newErr[name];
        return newErr;
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const validFiles = validateImage(e, 5);
    if (!validFiles) return;

    if (validFiles.length > 0) {
      setImages(validFiles as unknown as FileList);
      setSelectedImages(Array.from(validFiles));
    } else {
      e.target.value = "";
      setSelectedImages([]);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const file = e.target.files[0];
    setSelectedVideo(file);

    // size limit: 50MB
    if (file.size > 50 * 1024 * 1024) {
      toast.error("Video exceeds 50MB size limit.");
      setSelectedVideo(null);
      return;
    }

    // format validation
    if (file.type !== "video/mp4") {
      setErrors((prev) => ({
        ...prev,
        video: "Only MP4 video format is allowed.",
      }));
      setSelectedVideo(null);
      return;
    }

    // valid → clear errors
    setErrors((prev) => ({ ...prev, video: "" }));
    setVideo(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePropertyForm(formData)) return;

    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "amenities") {
          const amenityList = typeof value === "string" ? value.split(",") : value;
          amenityList.forEach((a: string) => data.append("amenities[]", a));
        } else {
          data.append(key, value as string);
        }
      });

      if (images) {
        Array.from(images).forEach((img) => {
          data.append("images[]", img);
        });
      }

      if (video) {
        data.append("video", video);
      }

      await createProperty(data);
      toast.success("Property created successfully!");
      navigate("/agent/properties");
    } catch (err: any) {
      toast.error(err.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    // Need to update the FileList as well
    if (images) {
      const dt = new DataTransfer();
      Array.from(images).forEach((file, i) => {
        if (i !== index) dt.items.add(file);
      });
      setImages(dt.files);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 min-h-screen dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-950">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-xl shadow-lg dark:shadow-black/30">
              <HousePlus className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold dark:text-white text-gray-800">
                Add New Property
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Create a new property listing with all details
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <CheckCircle2 className="text-blue-600 dark:text-blue-400" size={18} />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              All fields are required
            </span>
          </div>
        </div>

        {/* Form Container */}
        <div className="dark:bg-gray-800/50 bg-white rounded-2xl border border-gray-200 dark:border-gray-700/50 shadow-lg dark:shadow-black/30 p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* ---------- Property Info Section ---------- */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                  <Home className="text-white" size={20} />
                </div>
                <h3 className="text-xl font-bold dark:text-white text-gray-800">
                  Property Information
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300 text-gray-700">
                    <span className="flex items-center gap-1">
                      <span>Title</span>
                      <span className="text-red-500">*</span>
                    </span>
                  </label>
                  <div className="relative">
                    <Input
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) =>
                        handleKeyPress(e, /[a-zA-Z0-9@._-\s]/s, false)
                      }
                      maxLength={100}
                      placeholder="Beautiful Family House"
                      className={`dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 ${
                        errors.title ? "border-red-500 dark:border-red-500" : ""
                      }`}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                      {formData.title.length}/100
                    </div>
                  </div>
                  {errors.title && (
                    <div className="flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3 text-red-500" />
                      <p className="text-red-500 text-xs">{errors.title}</p>
                    </div>
                  )}
                </div>

                {/* Property Type */}
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300 text-gray-700">
                    <span className="flex items-center gap-1">
                      <span>Property Type</span>
                      <span className="text-red-500">*</span>
                    </span>
                  </label>
                  <div className="relative">
                    <select
                      name="property_type"
                      value={formData.property_type}
                      onChange={handleChange}
                      className={`w-full border p-2.5 rounded-xl dark:bg-gray-800 dark:border-gray-600 dark:text-white cursor-pointer ${
                        errors.property_type ? "border-red-500 dark:border-red-500" : ""
                      }`}
                    >
                      <option value="" className="dark:bg-gray-800">
                        Select Property Type
                      </option>
                      {propertyTypes?.map((type) => (
                        <option key={type.key} value={type.key} className="dark:bg-gray-800">
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.property_type && (
                    <div className="flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3 text-red-500" />
                      <p className="text-red-500 text-xs">{errors.property_type}</p>
                    </div>
                  )}
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300 text-gray-700">
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      <span>Price ($)</span>
                      <span className="text-red-500">*</span>
                    </span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      $
                    </div>
                    <Input
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={handleChange}
                      onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) =>
                        handleKeyPress(e, /[0-9]/, false)
                      }
                      placeholder="150000"
                      className={`pl-8 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
                        errors.price ? "border-red-500 dark:border-red-500" : ""
                      }`}
                    />
                  </div>
                  {errors.price && (
                    <div className="flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3 text-red-500" />
                      <p className="text-red-500 text-xs">{errors.price}</p>
                    </div>
                  )}
                </div>

                {/* Area */}
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300 text-gray-700">
                    <span className="flex items-center gap-1">
                      <Ruler className="w-4 h-4" />
                      <span>Area (sqft)</span>
                      <span className="text-red-500">*</span>
                    </span>
                  </label>
                  <Input
                    name="area"
                    type="number"
                    value={formData.area}
                    onChange={handleChange}
                    onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) =>
                      handleKeyPress(e, /[0-9]/, false)
                    }
                    placeholder="1200"
                    className={`dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
                      errors.area ? "border-red-500 dark:border-red-500" : ""
                    }`}
                  />
                  {errors.area && (
                    <div className="flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3 text-red-500" />
                      <p className="text-red-500 text-xs">{errors.area}</p>
                    </div>
                  )}
                </div>

                {/* Bedrooms */}
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300 text-gray-700">
                    <span className="flex items-center gap-1">
                      <Bed className="w-4 h-4" />
                      <span>Bedrooms</span>
                      <span className="text-red-500">*</span>
                    </span>
                  </label>
                  <Input
                    name="bedrooms"
                    type="number"
                    value={formData.bedrooms}
                    onChange={handleChange}
                    onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) =>
                      handleKeyPress(e, /[0-9]/, false)
                    }
                    placeholder="3"
                    className={`dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
                      errors.bedrooms ? "border-red-500 dark:border-red-500" : ""
                    }`}
                  />
                  {errors.bedrooms && (
                    <div className="flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3 text-red-500" />
                      <p className="text-red-500 text-xs">{errors.bedrooms}</p>
                    </div>
                  )}
                </div>

                {/* Bathrooms */}
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300 text-gray-700">
                    <span className="flex items-center gap-1">
                      <Bath className="w-4 h-4" />
                      <span>Bathrooms</span>
                      <span className="text-red-500">*</span>
                    </span>
                  </label>
                  <Input
                    name="bathrooms"
                    type="number"
                    value={formData.bathrooms}
                    onChange={handleChange}
                    onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) =>
                      handleKeyPress(e, /[0-9]/, false)
                    }
                    placeholder="2"
                    className={`dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
                      errors.bathrooms ? "border-red-500 dark:border-red-500" : ""
                    }`}
                  />
                  {errors.bathrooms && (
                    <div className="flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3 text-red-500" />
                      <p className="text-red-500 text-xs">{errors.bathrooms}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-300 text-gray-700">
                  <span className="flex items-center gap-1">
                    <span>Description</span>
                    <span className="text-red-500">*</span>
                  </span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  onKeyPress={(e: React.KeyboardEvent<HTMLTextAreaElement>) =>
                    handleKeyPress(e, /[a-z0-9 .,!?'"()-]/, true)
                  }
                  placeholder="Describe the property features, neighborhood, and unique selling points..."
                  className={`w-full border rounded-xl p-4 h-32 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 resize-none ${
                    errors.description ? "border-red-500 dark:border-red-500" : ""
                  }`}
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.description && (
                    <div className="flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-red-500" />
                      <p className="text-red-500 text-xs">{errors.description}</p>
                    </div>
                  )}
                  <div className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                    {formData.description.length} characters
                  </div>
                </div>
              </div>
            </div>

            {/* Amenities - Dark Mode */}
            <div className="mt-6 mb-12">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                  <HouseWifi className="text-white" size={20} />
                </div>
                <h3 className="text-xl font-bold dark:text-white text-gray-800">Amenities</h3>
              </div>

              <div
                className="
    grid grid-cols-2 lg:grid-cols-7 gap-4
    bg-white/90 dark:bg-gray-900/70
    backdrop-blur-sm
    p-5 rounded-xl
    border border-gray-200 dark:border-gray-800
    shadow-sm dark:shadow-lg
  "
              >
                {amenities?.map((item) => (
                  <div
                    key={item.key}
                    className="
          flex items-center
          group
          transition-all duration-200
          hover:bg-gray-50 dark:hover:bg-gray-800/40
          px-3 py-2 rounded-lg
        "
                  >
                    <label className="flex items-center text-sm gap-3 cursor-pointer w-full">
                      {/* Custom checkbox */}
                      <div className="relative">
                        <input
                          type="checkbox"
                          value={item.key}
                          checked={formData.amenities.includes(item.key)}
                          onChange={handleAmenityChange}
                          className="
                appearance-none
                w-5 h-5
                rounded-md
                border-2
                border-gray-300 dark:border-gray-600
                bg-white dark:bg-gray-800
                transition-all
                duration-200
                cursor-pointer
                hover:border-blue-500 dark:hover:border-blue-500
                checked:bg-blue-600
                checked:border-blue-600
                checked:hover:bg-blue-700
              "
                        />
                        {/* Check icon */}
                        <span
                          className="
                pointer-events-none
                absolute inset-0
                flex items-center justify-center
                text-[10px]
                text-white
                opacity-0
                scale-75
                transition-all
                duration-150
                peer-checked:opacity-100
                peer-checked:scale-100
              "
                        >
                          ✓
                        </span>
                      </div>

                      <span
                        className="
            text-gray-700 dark:text-gray-300
            group-hover:text-gray-900 dark:group-hover:text-gray-100
            transition-colors
          "
                      >
                        {item.label}
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* ---------- Media Section ---------- */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Images Upload */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg">
                      <FileImage className="text-white" size={20} />
                    </div>
                    <h3 className="text-xl font-bold dark:text-white text-gray-800">
                      Property Images
                    </h3>
                  </div>

                  <div
                    className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                      errors.images
                        ? "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/10"
                        : "dark:border-gray-600 border-gray-300 hover:border-blue-500 dark:hover:border-emerald-500"
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <Upload className="text-gray-400 dark:text-gray-500 mb-3" size={32} />
                      <p className="text-sm dark:text-gray-300 text-gray-700 mb-2">
                        Upload property images
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                        JPG, PNG up to 5MB each (max 10 images)
                      </p>
                      <label className="cursor-pointer">
                        <div className="px-4 py-2 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white rounded-lg text-sm font-medium transition-all">
                          Choose Images
                        </div>
                        <input
                          type="file"
                          name="images"
                          multiple
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {errors.images && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <p className="text-red-500 text-sm">{errors.images}</p>
                    </div>
                  )}

                  {/* Selected Images Preview */}
                  {selectedImages.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm dark:text-gray-300 text-gray-700 mb-3">
                        Selected images ({selectedImages.length})
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {selectedImages.map((file, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-20 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Video Upload */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg">
                      <Video className="text-white" size={20} />
                    </div>
                    <h3 className="text-xl font-bold dark:text-white text-gray-800">
                      Property Video
                    </h3>
                  </div>

                  <div
                    className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                      errors.video
                        ? "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/10"
                        : "dark:border-gray-600 border-gray-300 hover:border-blue-500 dark:hover:border-emerald-500"
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <Video className="text-gray-400 dark:text-gray-500 mb-3" size={32} />
                      <p className="text-sm dark:text-gray-300 text-gray-700 mb-2">
                        Upload property video
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                        MP4 format up to 50MB
                      </p>
                      <label className="cursor-pointer">
                        <div className="px-4 py-2 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white rounded-lg text-sm font-medium transition-all">
                          Choose Video
                        </div>
                        <input
                          type="file"
                          name="video"
                          accept="video/mp4, video/quicktime, video/x-msvideo, video/x-ms-wmv"
                          onChange={handleVideoChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {errors.video && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <p className="text-red-500 text-sm">{errors.video}</p>
                    </div>
                  )}

                  {/* Selected Video Preview */}
                  {selectedVideo && (
                    <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Video className="text-blue-500 dark:text-blue-400" size={20} />
                          <div>
                            <p className="text-sm font-medium dark:text-white text-gray-700">
                              {selectedVideo.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {(selectedVideo.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedVideo(null);
                            setVideo(null);
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ---------- Location Section ---------- */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                  <MapPin className="text-white" size={20} />
                </div>
                <h3 className="text-xl font-bold dark:text-white text-gray-800">
                  Location Details
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { name: "address", label: "Address", required: true, maxLength: 255 },
                  { name: "location", label: "Location", required: true, maxLength: 50 },
                  { name: "city", label: "City", required: true, maxLength: 50 },
                  { name: "state", label: "State", required: true, maxLength: 50 },
                  { name: "zipcode", label: "Zipcode", required: true, maxLength: 10 },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium mb-2 dark:text-gray-300 text-gray-700">
                      <span className="flex items-center gap-1">
                        <span>{field.label}</span>
                        {field.required && <span className="text-red-500">*</span>}
                      </span>
                    </label>
                    <Input
                      name={field.name}
                      value={(formData as any)[field.name]}
                      onChange={handleChange}
                      maxLength={field.maxLength}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      className={`dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
                        errors[field.name] ? "border-red-500 dark:border-red-500" : ""
                      }`}
                    />
                    {errors[field.name] && (
                      <div className="flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3 h-3 text-red-500" />
                        <p className="text-red-500 text-xs">{errors[field.name]}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ---------- Status Section ---------- */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                  <Home className="text-white" size={20} />
                </div>
                <h3 className="text-xl font-bold dark:text-white text-gray-800">Status & Type</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300 text-gray-700">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full border p-2.5 rounded-xl dark:bg-gray-800 dark:border-gray-600 dark:text-white cursor-pointer"
                  >
                    <option value="draft" className="dark:bg-gray-800">
                      Draft
                    </option>
                    <option value="published" className="dark:bg-gray-800">
                      Published
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300 text-gray-700">
                    <span className="flex items-center gap-1">
                      <span>Type</span>
                      <span className="text-red-500">*</span>
                    </span>
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className={`w-full border p-2.5 rounded-xl dark:bg-gray-800 dark:border-gray-600 dark:text-white cursor-pointer ${
                      errors.type ? "border-red-500 dark:border-red-500" : ""
                    }`}
                  >
                    <option value="sale" className="dark:bg-gray-800">
                      For Sale
                    </option>
                    <option value="rent" className="dark:bg-gray-800">
                      For Rent
                    </option>
                  </select>
                  {errors.type && (
                    <div className="flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3 text-red-500" />
                      <p className="text-red-500 text-xs">{errors.type}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ---------- Submit ---------- */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t dark:border-gray-700 border-gray-200">
              <button
                type="button"
                onClick={() => navigate("/agent/properties")}
                className="px-6 py-3 rounded-xl border dark:border-gray-600 border-gray-300 dark:text-gray-300 text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all font-medium"
              >
                Cancel
              </button>
              <Button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-medium text-base"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating Property...
                  </span>
                ) : (
                  "Create Property"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AddProperty;
