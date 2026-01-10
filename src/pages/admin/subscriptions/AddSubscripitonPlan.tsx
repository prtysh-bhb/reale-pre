/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { CreditCard, DollarSign, Calendar, Zap, Star, X, Plus } from "lucide-react";
import { toast } from "sonner";
import { addSubscriptionPlan } from "@/api/admin/subscriptions";
import { useNavigate } from "react-router-dom";

const AddSubscriptionPlan = () => {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    price: "",
    duration_days: "",
    property_limit: "",
    featured_limit: "",
    image_limit: "",
    video_allowed: false,
    priority_support: false,
    is_active: true,
    sort_order: "",
    features: [""],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSlugManual, setIsSlugManual] = useState(false);
  const navigate = useNavigate();

  // Generate slug from name automatically
  useEffect(() => {
    if (!isSlugManual && formData.name) {
      const generatedSlug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setFormData(prev => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.name, isSlugManual]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Plan name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Plan name must be at least 2 characters";
    } else if (formData.name.length > 100) {
      newErrors.name = "Plan name must be less than 100 characters";
    }

    // Slug validation
    if (!formData.slug.trim()) {
      newErrors.slug = "Slug is required";
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = "Slug can only contain lowercase letters, numbers, and hyphens";
    } else if (formData.slug.length < 2) {
      newErrors.slug = "Slug must be at least 2 characters";
    } else if (formData.slug.length > 100) {
      newErrors.slug = "Slug must be less than 100 characters";
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    } else if (formData.description.length > 500) {
      newErrors.description = "Description must be less than 500 characters";
    }

    // Price validation
    if (!formData.price) {
      newErrors.price = "Price is required";
    } else {
      const price = parseFloat(formData.price);
      if (isNaN(price) || price < 0) {
        newErrors.price = "Price must be a valid positive number";
      } else if (price > 10000) {
        newErrors.price = "Price cannot exceed $10,000";
      }
    }

    // Duration validation
    if (!formData.duration_days) {
      newErrors.duration_days = "Duration is required";
    } else {
      const duration = parseInt(formData.duration_days);
      if (isNaN(duration) || duration < 1) {
        newErrors.duration_days = "Duration must be at least 1 day";
      } else if (duration > 365) {
        newErrors.duration_days = "Duration cannot exceed 365 days";
      }
    }

    // Property limit validation
    if (!formData.property_limit) {
      newErrors.property_limit = "Property limit is required";
    } else {
      const limit = parseInt(formData.property_limit);
      if (isNaN(limit) || limit < 0) {
        newErrors.property_limit = "Property limit must be 0 or greater (0 for unlimited)";
      } else if (limit > 10000) {
        newErrors.property_limit = "Property limit cannot exceed 10,000";
      }
    }

    // Featured limit validation
    if (!formData.featured_limit) {
      newErrors.featured_limit = "Featured limit is required";
    } else {
      const limit = parseInt(formData.featured_limit);
      if (isNaN(limit) || limit < 0) {
        newErrors.featured_limit = "Featured limit must be 0 or greater";
      } else if (limit > 1000) {
        newErrors.featured_limit = "Featured limit cannot exceed 1,000";
      }
    }

    // Image limit validation
    if (!formData.image_limit) {
      newErrors.image_limit = "Image limit is required";
    } else {
      const limit = parseInt(formData.image_limit);
      if (isNaN(limit) || limit < 1) {
        newErrors.image_limit = "Image limit must be at least 1";
      } else if (limit > 200) {
        newErrors.image_limit = "Image limit cannot exceed 200";
      }
    }

    // Sort order validation
    if (formData.sort_order) {
      const sortOrder = parseInt(formData.sort_order);
      if (isNaN(sortOrder) || sortOrder < 0) {
        newErrors.sort_order = "Sort order must be 0 or greater";
      } else if (sortOrder > 100) {
        newErrors.sort_order = "Sort order cannot exceed 100";
      }
    }

    // Features validation
    const validFeatures = formData.features.filter(feature => feature.trim().length > 0);
    if (validFeatures.length === 0) {
      newErrors.features = "At least one feature is required";
    } else {
      for (let i = 0; i < validFeatures.length; i++) {
        if (validFeatures[i].length < 3) {
          newErrors.features = `Feature ${i + 1} must be at least 3 characters`;
          break;
        }
        if (validFeatures[i].length > 100) {
          newErrors.features = `Feature ${i + 1} must be less than 100 characters`;
          break;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the form errors before submitting");
      return;
    }
    try{
        const response = await addSubscriptionPlan(formData);
    
        if (response.success) {
            toast.success("Subscription plan added successfully");
            navigate('/admin/subscriptions');
        }else{
            toast.error("Subscription plan not added!");
        }
    }catch(error: any){
        toast.error("Subscription not added: " + (error.message || ""));
    }

    setIsSlugManual(false);
    setErrors({});
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    // generate slug if name field changes
    const slugValue =
      name === "name"
        ? value
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "")
        : undefined;

    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
      ...(name === "name" && { slug: slugValue }) // update slug only when name changes
    }));

    // Clear errors
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setFormData(prev => ({ ...prev, slug: value }));
    
    if (errors.slug) {
      setErrors(prev => ({ ...prev, slug: "" }));
    }
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, ""]
    }));
    
    if (errors.features) {
      setErrors(prev => ({ ...prev, features: "" }));
    }
  };

  const updateFeature = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => i === index ? value : feature)
    }));

    if (errors.features) {
      setErrors(prev => ({ ...prev, features: "" }));
    }
  };

  const removeFeature = (index: number) => {
    if (formData.features.length === 1) {
      // Don't remove the last feature, just clear it
      setFormData(prev => ({
        ...prev,
        features: [""]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        features: prev.features.filter((_, i) => i !== index)
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      price: "",
      duration_days: "",
      property_limit: "",
      featured_limit: "",
      image_limit: "",
      video_allowed: false,
      priority_support: false,
      is_active: true,
      sort_order: "",
      features: [""],
    });
    setIsSlugManual(false);
    setErrors({});
    toast.info("Form reset successfully");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-xl">
              <CreditCard className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                Add New Subscription Plan
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Create a new subscription plan for your platform
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <CreditCard size={20} className="text-blue-600 dark:text-emerald-400" />
                Plan Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Plan Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    maxLength={100}
                    required
                    className={`w-full px-4 py-2 border ${
                      errors.name 
                        ? 'border-red-500 focus:ring-red-500 dark:focus:ring-red-500' 
                        : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500 focus:border-blue-500 dark:focus:border-emerald-500'
                    } bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white transition-all`}
                    placeholder="Basic Plan"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Slug *
                    <span className="text-xs text-gray-500 ml-2">(auto-generated from name)</span>
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleSlugChange}
                    maxLength={100}
                    required
                    className={`w-full px-4 py-2 border ${
                      errors.slug 
                        ? 'border-red-500 focus:ring-red-500 dark:focus:ring-red-500' 
                        : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500 focus:border-blue-500 dark:focus:border-emerald-500'
                    } bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white`}
                    placeholder="basic-plan"
                  />
                  {errors.slug && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.slug}</p>
                  )}
                  {!isSlugManual && formData.name && (
                    <p className="mt-1 text-xs text-blue-600 dark:text-emerald-400">
                      Slug will update automatically as you type the plan name
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={3}
                    maxLength={500}
                    className={`w-full px-4 py-2 border ${
                      errors.description 
                        ? 'border-red-500 focus:ring-red-500 dark:focus:ring-red-500' 
                        : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500 focus:border-blue-500 dark:focus:border-emerald-500'
                    } bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white`}
                    placeholder="Describe the plan features and benefits..."
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    {formData.description.length}/500 characters
                  </p>
                </div>
              </div>
            </div>

            {/* Pricing & Duration */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <DollarSign size={20} className="text-blue-600 dark:text-emerald-400" />
                Pricing & Duration
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price ($) *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      min="0"
                      step="0.01"
                      max={10000}
                      className={`w-full pl-10 pr-4 py-2 border ${
                        errors.price 
                          ? 'border-red-500 focus:ring-red-500 dark:focus:ring-red-500' 
                          : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500 focus:border-blue-500 dark:focus:border-emerald-500'
                      } bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white`}
                      placeholder="29.99"
                    />
                  </div>
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.price}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Duration (Days) *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="number"
                      name="duration_days"
                      value={formData.duration_days}
                      onChange={handleChange}
                      required
                      min="1"
                      max="365"
                      className={`w-full pl-10 pr-4 py-2 border ${
                        errors.duration_days 
                          ? 'border-red-500 focus:ring-red-500 dark:focus:ring-red-500' 
                          : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500 focus:border-blue-500 dark:focus:border-emerald-500'
                      } bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white`}
                      placeholder="30"
                    />
                  </div>
                  {errors.duration_days && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.duration_days}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    name="sort_order"
                    value={formData.sort_order}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    className={`w-full px-4 py-2 border ${
                      errors.sort_order 
                        ? 'border-red-500 focus:ring-red-500 dark:focus:ring-red-500' 
                        : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500 focus:border-blue-500 dark:focus:border-emerald-500'
                    } bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white`}
                    placeholder="1"
                  />
                  {errors.sort_order && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.sort_order}</p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 dark:text-emerald-500 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-emerald-500"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Active Plan
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Limits & Features */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Zap size={20} className="text-blue-600 dark:text-emerald-400" />
                Plan Limits & Features
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Property Limit *
                    <span className="text-xs text-gray-500 ml-2">(0 for unlimited)</span>
                  </label>
                  <input
                    type="number"
                    name="property_limit"
                    value={formData.property_limit}
                    onChange={handleChange}
                    required
                    min="0"
                    max="10000"
                    className={`w-full px-4 py-2 border ${
                      errors.property_limit 
                        ? 'border-red-500 focus:ring-red-500 dark:focus:ring-red-500' 
                        : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500 focus:border-blue-500 dark:focus:border-emerald-500'
                    } bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white`}
                    placeholder="10"
                  />
                  {errors.property_limit && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.property_limit}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Featured Properties Limit *
                  </label>
                  <input
                    type="number"
                    name="featured_limit"
                    value={formData.featured_limit}
                    onChange={handleChange}
                    required
                    min="0"
                    max="1000"
                    className={`w-full px-4 py-2 border ${
                      errors.featured_limit 
                        ? 'border-red-500 focus:ring-red-500 dark:focus:ring-red-500' 
                        : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500 focus:border-blue-500 dark:focus:border-emerald-500'
                    } bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white`}
                    placeholder="5"
                  />
                  {errors.featured_limit && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.featured_limit}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Images per Property *
                  </label>
                  <input
                    type="number"
                    name="image_limit"
                    value={formData.image_limit}
                    onChange={handleChange}
                    required
                    min="1"
                    max="200"
                    className={`w-full px-4 py-2 border ${
                      errors.image_limit 
                        ? 'border-red-500 focus:ring-red-500 dark:focus:ring-red-500' 
                        : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500 focus:border-blue-500 dark:focus:border-emerald-500'
                    } bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white`}
                    placeholder="20"
                  />
                  {errors.image_limit && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.image_limit}</p>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="video_allowed"
                        checked={formData.video_allowed}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 dark:text-emerald-500 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-emerald-500"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Video Tours Allowed
                      </span>
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="priority_support"
                        checked={formData.priority_support}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 dark:text-emerald-500 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-emerald-500"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Priority Support
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Features List */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Star size={20} className="text-blue-600 dark:text-emerald-400" />
                Plan Features *
              </h3>
              <div className="space-y-3">
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      className={`flex-1 px-4 py-2 border ${
                        errors.features && index === 0
                          ? 'border-red-500 focus:ring-red-500 dark:focus:ring-red-500' 
                          : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500 focus:border-blue-500 dark:focus:border-emerald-500'
                      } bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white`}
                      placeholder="Enter feature description (e.g., '10 Property Listings')"
                    />
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      disabled={formData.features.length === 1}
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
                {errors.features && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.features}</p>
                )}
                <button
                  type="button"
                  onClick={addFeature}
                  className="flex items-center gap-2 px-4 py-2 text-blue-600 dark:text-emerald-400 hover:bg-blue-50 dark:hover:bg-emerald-900/20 rounded-lg border border-dashed border-blue-300 dark:border-emerald-600 transition-colors"
                >
                  <Plus size={18} />
                  Add Feature
                </button>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
              <Button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white shadow-md hover:shadow-lg"
              >
                <CreditCard size={18} className="mr-2" />
                Create Subscription Plan
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                className="border-gray-300 dark:border-gray-600"
              >
                Reset Form
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AddSubscriptionPlan;