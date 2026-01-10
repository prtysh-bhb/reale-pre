/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/PropertyValuation.tsx
import React, { useState } from 'react';
import { calculateValuation, ValuationPayload } from '@/api/customer/valuation';
import { Home, MapPin, Ruler, Bed, Bath, Mail, TrendingUp, Target, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

const PropertyValuation: React.FC = () => {
  const [formData, setFormData] = useState<ValuationPayload>({
    property_address: '',
    property_type: 'Apartment',
    area: 0,
    bedrooms: 1,
    bathrooms: 1,
    email: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [result, setResult] = useState<any>(null);
  const [isFormCollapsed, setIsFormCollapsed] = useState(true); // Form is collapsed by default

  // Property type options
  const propertyTypes = [
    { value: 'Apartment', label: 'Apartment' },
    { value: 'Villa', label: 'Villa' },
    { value: 'Plot', label: 'Plot/Land' },
    { value: 'Independent House', label: 'Independent House' },
    { value: 'Penthouse', label: 'Penthouse' },
    { value: 'Farmhouse', label: 'Farmhouse' },
  ];

  // Handle text input
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation errors
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    setError(null);
  };

  // Handle numeric input with validation
  const handleNumericChange = (name: keyof ValuationPayload, value: string) => {
    // Allow only numbers
    const numericValue = value.replace(/[^0-9]/g, '');
    
    setFormData(prev => ({
      ...prev,
      [name]: numericValue === '' ? 0 : parseInt(numericValue) || 0
    }));
    
    // Clear validation errors
    if (validationErrors[name as string]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as string];
        return newErrors;
      });
    }
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setValidationErrors({});
    setResult(null);

    try {
      const data = await calculateValuation(formData);
      setResult(data);
      setIsFormCollapsed(true); // Collapse form after successful submission
    } catch (err: any) {
      if (err.validation) {
        setValidationErrors(err.validation);
      } else {
        setError(err.message || 'An error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format number for display in input
  const formatNumberInput = (value: number) => {
    if (value === 0) return '';
    return value.toString();
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Toggle form collapse
  const toggleFormCollapse = () => {
    setIsFormCollapsed(!isFormCollapsed);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
      {/* Header - Always visible */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Home className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Property Valuation</h3>
              <p className="text-purple-100 text-sm">Get instant property value estimation</p>
            </div>
          </div>
          
          {/* Show toggle button only when there's no result */}
          {!result && (
            <button
              onClick={toggleFormCollapse}
              className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition"
              aria-label={isFormCollapsed ? "Open valuation form" : "Close valuation form"}
            >
              {isFormCollapsed ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronUp className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        {/* Collapsible Form Section */}
        <div className={`transition-all duration-300 ${isFormCollapsed && !result ? 'max-h-0 overflow-hidden opacity-0' : 'max-h-[2000px] opacity-100'}`}>
          {(!isFormCollapsed || result) && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Property Address */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Property Details
                </h4>
                
                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Property Address *
                  </label>
                  <textarea
                    name="property_address"
                    value={formData.property_address}
                    onChange={handleTextChange}
                    rows={3}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition resize-none ${
                      validationErrors.property_address ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter complete property address with landmark"
                    required
                  />
                  {validationErrors.property_address && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.property_address[0]}</p>
                  )}
                </div>

                {/* Property Type and Area */}
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Property Type *
                    </label>
                    <select
                      name="property_type"
                      value={formData.property_type}
                      onChange={handleTextChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                    >
                      {propertyTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Built-up Area *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={formatNumberInput(formData.area)}
                        onChange={(e) => handleNumericChange('area', e.target.value)}
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition ${
                          validationErrors.area ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="e.g., 1200"
                        required
                      />
                      <Ruler className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">sq.ft</span>
                    </div>
                    {validationErrors.area && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.area[0]}</p>
                    )}
                  </div>
                </div>

                {/* Bedrooms and Bathrooms */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bedrooms
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={formatNumberInput(formData.bedrooms)}
                        onChange={(e) => handleNumericChange('bedrooms', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                        placeholder="e.g., 2"
                      />
                      <Bed className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bathrooms
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={formatNumberInput(formData.bathrooms)}
                        onChange={(e) => handleNumericChange('bathrooms', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                        placeholder="e.g., 2"
                      />
                      <Bath className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Contact Information
                </h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleTextChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition ${
                      validationErrors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your email for valuation report"
                    required
                  />
                  {validationErrors.email && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.email[0]}</p>
                  )}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="w-5 h-5" />
                    <p className="font-medium">{error}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Calculating Valuation...
                  </div>
                ) : (
                  'Get Free Valuation'
                )}
              </button>
            </form>
          )}
        </div>

        {/* Call to Action Button when form is collapsed and no result */}
        {isFormCollapsed && !result && (
          <div className="text-center py-4">
            <button
              onClick={toggleFormCollapse}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition"
            >
              <Target className="w-4 h-4" />
              Start Property Valuation
            </button>
            {/* <p className="text-sm text-gray-600 mt-2">
              Click above to estimate your property value instantly
            </p> */}
          </div>
        )}

        {/* Results Section - Always visible when there's a result */}
        {result && (
          <div className="mt-6">
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6">
              {/* Results Header with New Valuation Button */}
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div>
                  <h4 className="font-bold text-lg text-gray-900">Valuation Report</h4>
                  <p className="text-gray-600 text-sm truncate max-w-md">{result.property_address}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Valuation Date: {formatDate(result.valuation_date)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full font-medium flex items-center gap-2 whitespace-nowrap">
                    <Target className="w-4 h-4" />
                    Estimated Value
                  </div>
                </div>
              </div>

              {/* Main Estimated Value */}
              <div className="bg-white rounded-xl p-6 border border-purple-100 mb-6">
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2">Estimated Market Value</p>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                    <p className="text-3xl md:text-4xl font-bold text-gray-900">
                      {formatCurrency(result.estimated_value)}
                    </p>
                  </div>
                  
                  {/* Value Range */}
                  <div className="relative pt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Lower Range</span>
                      <span>Upper Range</span>
                    </div>
                    <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="absolute h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full"
                        style={{ 
                          left: '10%', 
                          width: '80%',
                          transform: 'translateX(-10%)'
                        }}
                      />
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-sm font-medium text-gray-700">
                        {formatCurrency(result.min_value)}
                      </span>
                      <span className="text-sm font-medium text-gray-700">
                        {formatCurrency(result.max_value)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Property Summary */}
              <div className="bg-white rounded-xl p-6 border border-purple-100 mb-6">
                <h5 className="font-semibold text-gray-900 mb-4">Property Summary</h5>
                <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">Property Type</div>
                    <div className="font-medium text-gray-900">{formData.property_type}</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">Area</div>
                    <div className="font-medium text-gray-900">{formData.area} sq.ft</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">Bedrooms</div>
                    <div className="font-medium text-gray-900">{formData.bedrooms}</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">Bathrooms</div>
                    <div className="font-medium text-gray-900">{formData.bathrooms}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Disclaimer - Always visible */}
        <div className="mt-6 pt-6 border-t">
          <p className="text-xs text-gray-500 text-center">
            * This valuation is an estimate based on the information provided. 
            For an accurate valuation, our experts will conduct an on-site inspection. 
            Market conditions may affect the final value.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PropertyValuation;