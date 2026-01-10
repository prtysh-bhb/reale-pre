/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  Calendar,
  TrendingUp,
  TrendingDown,
  Users,
  MessageSquare,
  Target,
  BarChart3,
  RefreshCw,
  Download,
  Eye,
  Phone,
  Mail,
  UserPlus,
  X,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Clock,
  XCircle,
  UserCheck,
  UserX,
  MoreVertical,
  Loader2,
  Sparkles,
  Brain,
  Shield,
  AlertCircle,
  ArrowUpDown,
} from "lucide-react";
import { toast } from "sonner";
import AdminLayout from "@/components/layout/admin/AdminLayout";
import {
  getAIChatLeads,
  getAIChatLeadById,
  updateAIChatLeadStatus,
  AIChatLead,
  AIChatLeadStatus,
  PaginatedResponse,
  ApiResponse,
} from "@/api/admin/aichatlead";

const AIChatLeadsDashboard = () => {
  // State
  const [leads, setLeads] = useState<AIChatLead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<AIChatLead[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);
  const [selectedLead, setSelectedLead] = useState<AIChatLead | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    status: "" as AIChatLeadStatus | "",
    minScore: "",
    sortBy: "created_at" as "created_at" | "lead_score",
    sortOrder: "desc" as "asc" | "desc",
  });

  // Status options
  const statusOptions: { value: AIChatLeadStatus; label: string; color: string; bgColor: string; icon: React.ReactNode }[] = [
    { value: "new", label: "New", color: "text-blue-700", bgColor: "bg-blue-100", icon: <Clock className="w-4 h-4" /> },
    { value: "contacted", label: "Contacted", color: "text-purple-700", bgColor: "bg-purple-100", icon: <Phone className="w-4 h-4" /> },
    { value: "qualified", label: "Qualified", color: "text-emerald-700", bgColor: "bg-emerald-100", icon: <UserCheck className="w-4 h-4" /> },
    { value: "converted", label: "Converted", color: "text-green-700", bgColor: "bg-green-100", icon: <CheckCircle className="w-4 h-4" /> },
    { value: "lost", label: "Lost", color: "text-red-700", bgColor: "bg-red-100", icon: <UserX className="w-4 h-4" /> },
  ];

  // Load leads
  const loadLeads = async (page = 1) => {
    try {
      setLoading(true);
      const params: any = {
        page,
        sort_by: filters.sortBy,
        sort_order: filters.sortOrder,
      };
      
      if (filters.status) params.status = filters.status;
      if (filters.minScore) params.min_score = parseInt(filters.minScore);
      
      const response = await getAIChatLeads(params);
      
      if (response.success && response.data) {
        setLeads(response.data.data);
        setFilteredLeads(response.data.data);
        setCurrentPage(response.data.current_page);
        setTotalPages(response.data.last_page);
        setTotalLeads(response.data.total);
      } else {
        toast.error(response.message || "Failed to load leads");
      }
    } catch (error: any) {
      console.error("Error loading leads:", error);
      toast.error(error.response?.data?.message || "Failed to load leads");
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  };

  // Search leads function
  const searchLeads = useCallback(() => {
    if (!searchTerm.trim()) {
      setFilteredLeads(leads);
      return;
    }

    setSearchLoading(true);
    
    const searchLower = searchTerm.toLowerCase().trim();
    
    const results = leads.filter(lead => {
      // Search in user name
      if (lead.user?.name?.toLowerCase().includes(searchLower)) {
        return true;
      }
      
      // Search in user email
      if (lead.user?.email?.toLowerCase().includes(searchLower)) {
        return true;
      }
      
      // Search in conversation ID
      if (lead.conversation?.id?.toString().includes(searchLower)) {
        return true;
      }
      
      // Search in session ID
      if (lead.conversation?.session_id?.toLowerCase().includes(searchLower)) {
        return true;
      }
      
      // Search in lead ID
      if (lead.id.toString().includes(searchLower)) {
        return true;
      }
      
      // Search in status
      if (lead.status.toLowerCase().includes(searchLower)) {
        return true;
      }
      
      return false;
    });
    
    setFilteredLeads(results);
    setSearchLoading(false);
  }, [searchTerm, leads]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchLeads();
  };

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      searchLeads();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, searchLeads]);

  // Calculate stats
  const calculateStats = (leadsData: AIChatLead[]) => {
    const statsData = {
      total: leadsData.length,
      new: leadsData.filter(lead => lead.status === "new").length,
      contacted: leadsData.filter(lead => lead.status === "contacted").length,
      qualified: leadsData.filter(lead => lead.status === "qualified").length,
      converted: leadsData.filter(lead => lead.status === "converted").length,
      lost: leadsData.filter(lead => lead.status === "lost").length,
    };
    return statsData;
  };

  // Get stats from filtered leads
  const stats = calculateStats(filteredLeads);

  // Load single lead
  const loadLeadById = async (id: number) => {
    try {
      const response = await getAIChatLeadById(id);
      if (response.success && response.data) {
        setSelectedLead(response.data);
      }
    } catch (error: any) {
      console.error("Error loading lead:", error);
      toast.error("Failed to load lead details");
    }
  };

  // Update lead status
  const handleUpdateStatus = async (leadId: number, newStatus: AIChatLeadStatus) => {
    try {
      setUpdatingStatus(leadId);
      const response = await updateAIChatLeadStatus(leadId, newStatus);
      
      if (response.success && response.data) {
        // Update local state
        const updatedLeads = leads.map(lead => 
          lead.id === leadId ? { ...lead, status: newStatus } : lead
        );
        setLeads(updatedLeads);
        setFilteredLeads(updatedLeads.filter(lead => 
          filteredLeads.some(filtered => filtered.id === lead.id)
        ));
        
        if (selectedLead?.id === leadId) {
          setSelectedLead(prev => prev ? { ...prev, status: newStatus } : null);
        }
        
        toast.success(`Lead status updated to ${newStatus}`);
      } else {
        toast.error(response.message || "Failed to update status");
      }
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast.error(error.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      status: "",
      minScore: "",
      sortBy: "created_at",
      sortOrder: "desc",
    });
    setSearchTerm("");
    loadLeads(1);
  };

  // Apply filters
  const applyFilters = () => {
    setShowFilters(false);
    loadLeads(1);
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return dateString;
    }
  };

  // Get status display
  const getStatusDisplay = (status: AIChatLeadStatus) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option || statusOptions[0];
  };

  // Get lead score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 bg-emerald-100";
    if (score >= 60) return "text-amber-600 bg-amber-100";
    if (score >= 40) return "text-orange-600 bg-orange-100";
    return "text-red-600 bg-red-100";
  };

  // Get lead score label
  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Hot";
    if (score >= 60) return "Warm";
    if (score >= 40) return "Cold";
    return "Very Cold";
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm("");
    setFilteredLeads(leads);
  };

  // Initial load
  useEffect(() => {
    loadLeads(1);
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Brain className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">AI Chat Leads</h1>
                <p className="text-blue-100">Manage leads generated from AI chat conversations</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => loadLeads(1)}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors backdrop-blur-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Leads</p>
                <p className="text-2xl font-bold text-gray-900">{totalLeads}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">New</p>
                <p className="text-2xl font-bold text-gray-900">{stats.new}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Contacted</p>
                <p className="text-2xl font-bold text-gray-900">{stats.contacted}</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Phone className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Qualified</p>
                <p className="text-2xl font-bold text-gray-900">{stats.qualified}</p>
              </div>
              <div className="p-2 bg-emerald-100 rounded-lg">
                <UserCheck className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Converted</p>
                <p className="text-2xl font-bold text-gray-900">{stats.converted}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Lost</p>
                <p className="text-2xl font-bold text-gray-900">{stats.lost}</p>
              </div>
              <div className="p-2 bg-red-100 rounded-lg">
                <UserX className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Search leads by name, email, conversation ID, or status..."
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                {searchLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  </div>
                )}
              </form>
              {searchTerm && (
                <div className="mt-2 text-sm text-gray-600">
                  Found {filteredLeads.length} lead{filteredLeads.length !== 1 ? 's' : ''} matching "{searchTerm}"
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-4 h-4" />
                Filters
                {showFilters ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-6 p-4 border border-gray-200 rounded-xl bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange("status", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  >
                    <option value="">All Status</option>
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Min Score Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Lead Score
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={filters.minScore}
                    onChange={(e) => handleFilterChange("minScore", e.target.value)}
                    placeholder="0-100"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={filters.sortBy}
                      onChange={(e) => handleFilterChange("sortBy", e.target.value as any)}
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    >
                      <option value="created_at">Created Date</option>
                      <option value="lead_score">Lead Score</option>
                    </select>
                    <button
                      onClick={() => handleFilterChange("sortOrder", filters.sortOrder === "asc" ? "desc" : "asc")}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Reset All
                </button>
                <button
                  onClick={applyFilters}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Leads Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">AI Chat Leads</h2>
              <span className="text-sm text-gray-600">
                {searchTerm ? `${filteredLeads.length} of ${leads.length}` : totalLeads} lead{totalLeads !== 1 ? 's' : ''} found
              </span>
            </div>
          </div>

          {/* Table Body */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading leads...</p>
              </div>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm ? "No Matching Leads Found" : "No Leads Found"}
              </h3>
              <p className="text-gray-600">
                {searchTerm 
                  ? `No leads found matching "${searchTerm}". Try a different search term.`
                  : "No AI chat leads available yet"}
              </p>
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Mobile View */}
              <div className="block md:hidden">
                <div className="divide-y divide-gray-200">
                  {filteredLeads.map((lead) => {
                    const statusDisplay = getStatusDisplay(lead.status);
                    return (
                      <div
                        key={lead.id}
                        className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => loadLeadById(lead.id)}
                      >
                        <div className="space-y-3">
                          {/* User Info */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium text-gray-900">
                                {lead.user?.name || "Anonymous User"}
                              </h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(lead.lead_score)}`}>
                                {lead.lead_score} ({getScoreLabel(lead.lead_score)})
                              </span>
                            </div>
                            {lead.user?.email && (
                              <p className="text-sm text-gray-600 flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {lead.user.email}
                              </p>
                            )}
                          </div>

                          {/* Status & Actions */}
                          <div className="flex items-center justify-between">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusDisplay.color} ${statusDisplay.bgColor}`}>
                              {statusDisplay.icon}
                              {statusDisplay.label}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDate(lead.created_at)}
                            </span>
                          </div>

                          {/* Quick Actions */}
                          <div className="flex gap-2 pt-2 border-t border-gray-200">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                loadLeadById(lead.id);
                              }}
                              className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Eye className="w-3 h-3" />
                              View
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Desktop View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Lead
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredLeads.map((lead) => {
                      const statusDisplay = getStatusDisplay(lead.status);
                      return (
                        <tr
                          key={lead.id}
                          className="hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => loadLeadById(lead.id)}
                        >
                          {/* Lead Info */}
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-medium text-gray-900">
                                {lead.user?.name || "Anonymous User"}
                              </div>
                              {lead.user?.email && (
                                <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                                  <Mail className="w-3 h-3" />
                                  {lead.user.email}
                                </div>
                              )}
                              {lead.conversation && (
                                <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                  <MessageSquare className="w-3 h-3" />
                                  Conversation #{lead.conversation.id}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Lead Score */}
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className={`inline-flex justify-center px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(lead.lead_score)}`}>
                                {lead.lead_score}%
                              </span>
                              <span className="text-xs text-gray-500 mt-1">
                                {getScoreLabel(lead.lead_score)}
                              </span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusDisplay.color} ${statusDisplay.bgColor}`}>
                                {statusDisplay.icon}
                                {statusDisplay.label}
                              </span>
                            </div>
                          </td>

                          {/* Created Date */}
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {formatDate(lead.created_at)}
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  loadLeadById(lead.id);
                                }}
                                className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                                View
                              </button>
                              <div className="relative">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Handle more actions
                                  }}
                                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination - Only show for API pagination, not for search results */}
              {!searchTerm && totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing page {currentPage} of {totalPages}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => loadLeads(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => loadLeads(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Search Results Info */}
              {searchTerm && filteredLeads.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-200 bg-blue-50">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-blue-700">
                      Showing {filteredLeads.length} search result{filteredLeads.length !== 1 ? 's' : ''} for "{searchTerm}"
                    </div>
                    <button
                      onClick={clearSearch}
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                    >
                      Clear Search
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Lead Details Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Lead Details</h3>
                  <p className="text-sm text-gray-600">AI Chat Lead #{selectedLead.id}</p>
                </div>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Lead Info */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Lead Card */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                          {selectedLead.user?.name || "Anonymous User"}
                        </h4>
                        {selectedLead.user?.email && (
                          <div className="flex items-center gap-2 text-gray-600 mb-1">
                            <Mail className="w-4 h-4" />
                            <span>{selectedLead.user.email}</span>
                          </div>
                        )}
                        {selectedLead.user?.id && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Shield className="w-4 h-4" />
                            <span>User ID: {selectedLead.user.id}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(selectedLead.lead_score)}`}>
                          Lead Score: {selectedLead.lead_score}% ({getScoreLabel(selectedLead.lead_score)})
                        </span>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusDisplay(selectedLead.status).color} ${getStatusDisplay(selectedLead.status).bgColor}`}>
                          {getStatusDisplay(selectedLead.status).icon}
                          {getStatusDisplay(selectedLead.status).label}
                        </span>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="space-y-3">
                      <h5 className="font-medium text-gray-900 mb-2">Timeline</h5>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Created</span>
                          <span className="text-gray-900">{formatDate(selectedLead.created_at)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Last Updated</span>
                          <span className="text-gray-900">{formatDate(selectedLead.updated_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Conversation Details */}
                  {selectedLead.conversation && (
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h5 className="font-medium text-gray-900 mb-4">Conversation Details</h5>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Conversation ID</span>
                          <span className="font-medium text-gray-900">{selectedLead.conversation.id}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Session ID</span>
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                            {selectedLead.conversation.session_id}
                          </code>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Started</span>
                          <span className="text-gray-900">{formatDate(selectedLead.conversation.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - Actions */}
                <div className="space-y-6">
                  {/* Status Update */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h5 className="font-medium text-gray-900 mb-4">Update Status</h5>
                    <div className="space-y-2">
                      {statusOptions.map((status) => (
                        <button
                          key={status.value}
                          onClick={() => handleUpdateStatus(selectedLead.id, status.value)}
                          disabled={updatingStatus === selectedLead.id || selectedLead.status === status.value}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                            selectedLead.status === status.value
                              ? `${status.color} ${status.bgColor}`
                              : "text-gray-700 hover:bg-gray-100"
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {status.icon}
                          {status.label}
                          {updatingStatus === selectedLead.id && selectedLead.status === status.value && (
                            <Loader2 className="w-3 h-3 animate-spin ml-auto" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Lead Info */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h5 className="font-medium text-gray-900 mb-4">Lead Information</h5>
                    <dl className="space-y-2">
                      <div>
                        <dt className="text-xs text-gray-500">Lead ID</dt>
                        <dd className="text-sm font-medium text-gray-900">{selectedLead.id}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-gray-500">User ID</dt>
                        <dd className="text-sm font-medium text-gray-900">{selectedLead.user_id || "Not linked"}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-gray-500">Conversation ID</dt>
                        <dd className="text-sm font-medium text-gray-900">{selectedLead.conversation_id || "Not linked"}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setSelectedLead(null)}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AIChatLeadsDashboard;