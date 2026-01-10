/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/LoanCalculator.tsx
import React, { useState } from "react";
import { calculateLoan, LoanCalculatorPayload } from "@/api/customer/loancalculator";
import {
  DollarSign,
  TrendingUp,
  Calendar,
  User,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { handleKeyPress } from "@/helpers/customer_helper";

const LoanCalculator: React.FC = () => {
  const [formData, setFormData] = useState<LoanCalculatorPayload>({
    applicant_name: "",
    email: "",
    monthly_income: 0,
    existing_emi: null,
    loan_amount: 0,
    interest_rate: 7.5,
    tenure_years: 20,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [result, setResult] = useState<any>(null);
  const [isFormCollapsed, setIsFormCollapsed] = useState(true); // Form is collapsed by default

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "applicant_name" || name === "email" ? value : parseFloat(value) || 0,
    }));
    // Clear errors when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
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
      const data = await calculateLoan(formData);
      setResult(data);
      setIsFormCollapsed(true); // Collapse form after successful submission
    } catch (err: any) {
      if (err.validation) {
        setValidationErrors(err.validation);
      } else {
        setError(err.message || "An error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Toggle form collapse
  const toggleFormCollapse = () => {
    setIsFormCollapsed(!isFormCollapsed);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
      {/* Header - Always visible */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Loan Calculator</h3>
              <p className="text-blue-100 text-sm">Calculate your home loan eligibility & EMI</p>
            </div>
          </div>
          
          {/* Show toggle button only when there's no result */}
          {!result && (
            <button
              onClick={toggleFormCollapse}
              className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition"
              aria-label={isFormCollapsed ? "Open loan calculator form" : "Close loan calculator form"}
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
              {/* Personal Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Personal Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      name="applicant_name"
                      value={formData.applicant_name}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                        validationErrors.applicant_name ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter your full name"
                      required
                    />
                    {validationErrors.applicant_name && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.applicant_name[0]}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                        validationErrors.email ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter your email"
                      required
                    />
                    {validationErrors.email && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.email[0]}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Financial Details */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Financial Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Monthly Income *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="text"
                        name="monthly_income"
                        value={formData.monthly_income || ""}
                        onChange={handleChange}
                        onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) =>
                          handleKeyPress(e, /[0-9]/, false)
                        }
                        min="0"
                        className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                          validationErrors.monthly_income ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="e.g., 75000"
                        required
                      />
                    </div>
                    {validationErrors.monthly_income && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.monthly_income[0]}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Existing EMI (Optional)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="text"
                        name="existing_emi"
                        value={formData.existing_emi || ""}
                        onChange={handleChange}
                        onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) =>
                          handleKeyPress(e, /[0-9]/, false)
                        }
                        min="0"
                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        placeholder="e.g., 15000"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Loan Amount *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="text"
                        name="loan_amount"
                        value={formData.loan_amount || ""}
                        onChange={handleChange}
                        onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) =>
                          handleKeyPress(e, /[0-9]/, false)
                        }
                        min="0"
                        className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                          validationErrors.loan_amount ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="e.g., 5000000"
                        required
                      />
                    </div>
                    {validationErrors.loan_amount && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.loan_amount[0]}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Loan Terms */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Loan Terms
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Interest Rate (% per annum)
                    </label>
                    <div className="relative">
                      <input
                        type="range"
                        name="interest_rate"
                        min="6"
                        max="15"
                        step="0.1"
                        value={formData.interest_rate}
                        onChange={handleChange}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>6%</span>
                        <span className="font-medium text-blue-600">{formData.interest_rate}%</span>
                        <span>15%</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tenure (Years)
                    </label>
                    <div className="space-y-2">
                      <input
                        type="range"
                        name="tenure_years"
                        min="5"
                        max="30"
                        step="1"
                        value={formData.tenure_years}
                        onChange={handleChange}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>5 years</span>
                        <span className="font-medium text-blue-600">{formData.tenure_years} years</span>
                        <span>30 years</span>
                      </div>
                    </div>
                  </div>
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
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Calculating...
                  </div>
                ) : (
                  "Calculate Loan"
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
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition"
            >
              <DollarSign className="w-4 h-4" />
              Start Loan Calculation
            </button>
            {/* <p className="text-sm text-gray-600 mt-2">
              Click above to calculate your loan eligibility and EMI instantly
            </p> */}
          </div>
        )}

        {/* Results Section - Always visible when there's a result */}
        {result && (
          <div className="mt-6">
            <div
              className={`p-6 rounded-xl ${
                result.eligible
                  ? "bg-green-50 border border-green-200"
                  : "bg-amber-50 border border-amber-200"
              }`}
            >
              {/* Results Header with New Calculation Button */}
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div>
                  <h4 className="font-bold text-lg text-gray-900">Calculation Results</h4>
                  <p className="text-gray-600">For {result.applicant_name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className={`px-4 py-2 rounded-full ${
                      result.eligible ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                    } font-medium flex items-center gap-2 whitespace-nowrap`}
                  >
                    {result.eligible ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Eligible
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" />
                        Not Eligible
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4">
                <div className="bg-white p-4 rounded-lg border">
                  <p className="text-sm text-gray-500">Loan Amount</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(result.loan_amount)}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <p className="text-sm text-gray-500">Monthly EMI</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(result.monthly_emi)}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <p className="text-sm text-gray-500">Total Payable</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(result.total_payable)}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <p className="text-sm text-gray-500">Total Interest</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(result.total_interest)}
                  </p>
                </div>
              </div>

              {!result.eligible && (
                <div className="mt-6 p-4 bg-white border border-amber-200 rounded-lg">
                  <div className="flex items-center gap-3 text-amber-800">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Eligibility Issue</p>
                      <p className="text-sm mt-1">
                        Your maximum eligible EMI is {formatCurrency(result.max_eligible_emi)} based
                        on your income and existing obligations. The requested loan EMI (
                        {formatCurrency(result.monthly_emi)}) exceeds this limit.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500 mt-3">
                  By applying, you agree to our terms and consent to credit verification
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-6 pt-6 border-t">
          <p className="text-xs text-gray-500 text-center">
            * Calculator results are approximate. Actual loan terms may vary based on credit score,
            property valuation, and bank policies. EMI calculated on reducing balance method.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoanCalculator;