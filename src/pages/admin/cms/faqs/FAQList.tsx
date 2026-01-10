/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import {
  Search,
  Edit,
  Trash2,
  X,
  Filter,
  HelpCircle,
  Grid3x3,
  List,
  Plus,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Save,
} from "lucide-react";
import AdminLayout from "@/components/layout/admin/AdminLayout";
import { toast } from "sonner";
import { deleteFaq, FAQ, getFaqs, updateFaqStatus, createFaq, updateFaq } from "@/api/admin/cms";
import DeleteModal from "../../agents/components/DeleteModal";

const FAQList = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showStatusUpdatePopup, setShowStatusUpdatePopup] = useState(false);
  const [selectedFAQ, setSelectedFAQ] = useState<FAQ | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    status: 0
  });
  const [formErrors, setFormErrors] = useState({
    question: "",
    answer: ""
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadFAQs();
  }, []);

  const loadFAQs = async () => {
    try {
      setLoading(true);
      const data = await getFaqs();
      if (data.success) {
        const filteredFAQs = data.data.filter((faq: FAQ) => {
          const matchesSearch = search === "" || 
            faq.question.toLowerCase().includes(search.toLowerCase()) ||
            faq.answer.toLowerCase().includes(search.toLowerCase());
          
          const matchesFilter = filter === "all" || 
            (filter === "active" && faq.status) ||
            (filter === "inactive" && !faq.status);
          
          return matchesSearch && matchesFilter;
        });
        
        setFaqs(filteredFAQs);
      } else {
        setError("Failed to fetch FAQs.");
      }
    } catch {
      setError("Failed to fetch FAQs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFAQs();
  }, [search, filter]);

  const refresh = async () => {
    await loadFAQs();
  };

  const handleToggleStatus = async () => {
    try {
      setSubmitting(true);
      await updateFaqStatus(selectedFAQ!.id);
      toast.success("FAQ status updated successfully");
      setShowStatusUpdatePopup(false);
      refresh();
      setSubmitting(false);
    } catch {
      toast.error("Failed to update FAQ status");
    }
  };

  const openDeletePopup = (faq: FAQ) => {
    setSelectedFAQ(faq);
    setShowDeletePopup(true);
  };

  const confirmDelete = async () => {
    if (!selectedFAQ) return;
    
    try {
      await deleteFaq(selectedFAQ.id);
      toast.success("FAQ deleted successfully");
      setShowDeletePopup(false);
      refresh();
    } catch {
      toast.error("Failed to delete FAQ");
    }
  };

  const toggleFAQ = (id: number) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  // Open Add Modal
  const openAddModal = () => {
    setFormData({
      question: "",
      answer: "",
      status: 0
    });
    setFormErrors({ question: "", answer: "" });
    setShowAddModal(true);
  };

  // Open Edit Modal
  const openEditModal = (faq: FAQ) => {
    setEditingFAQ(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      status: faq.status
    });
    setFormErrors({ question: "", answer: "" });
    setShowEditModal(true);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      
      // Clear error when user starts typing
      if (formErrors[name as keyof typeof formErrors]) {
        setFormErrors(prev => ({
          ...prev,
          [name]: ""
        }));
      }
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = { question: "", answer: "" };
    let isValid = true;

    if (!formData.question.trim()) {
      errors.question = "Question is required";
      isValid = false;
    }

    if (!formData.answer.trim()) {
      errors.answer = "Answer is required";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // Handle form submission for Add
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSubmitting(true);
    try {
      const response = await createFaq(formData);
      if (response.success) {
        toast.success("FAQ added successfully");
        setShowAddModal(false);
        refresh();
      } else {
        toast.error(response.message || "Failed to add FAQ");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to add FAQ");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle form submission for Edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !editingFAQ) return;
    
    setSubmitting(true);
    try {
      const response = await updateFaq(editingFAQ.id, formData);
      if (response.success) {
        toast.success("FAQ updated successfully");
        setShowEditModal(false);
        refresh();
      } else {
        toast.error(response.message || "Failed to update FAQ");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update FAQ");
    } finally {
      setSubmitting(false);
    }
  };

  const badge = (status: number) => {     
    const baseClasses = "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold";
    
    switch(status) {
      case 1:
        return `${baseClasses} bg-emerald-100 text-emerald-700 dark:bg-emerald-700/20 dark:text-emerald-400`;
      case 0:
        return `${baseClasses} bg-red-100 text-red-700 dark:bg-red-700/20 dark:text-red-400`;
      default:
        return `${baseClasses} bg-red-100 text-red-700 dark:bg-red-700/20 dark:text-red-400`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-xl">
                <HelpCircle className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-semibold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                  Frequently Asked Questions
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Manage all FAQ entries
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 shadow-sm hover:border-blue-400 dark:hover:border-emerald-600 transition-all">
                <Search size={16} className="text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent outline-none text-sm text-gray-900 dark:text-white w-48 placeholder-gray-500"
                />
              </div>

              <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === "grid"
                      ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-emerald-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                  title="Grid View"
                >
                  <Grid3x3 size={18} />
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === "table"
                      ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-emerald-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                  title="Table View"
                >
                  <List size={18} />
                </button>
              </div>

              <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 shadow-sm hover:border-blue-400 dark:hover:border-emerald-600 transition-all">
                <Filter size={16} className="text-gray-400 mr-2" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="bg-transparent outline-none text-sm text-gray-700 dark:text-gray-200 cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <button
                onClick={openAddModal}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white transition-all text-sm shadow-md hover:shadow-lg font-medium"
              >
                <Plus size={16} />
                <span>Add FAQ</span>
              </button>
            </div>
          </div>
        </div>

        {/* Loading / Error */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 border-4 border-blue-500 dark:border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-500 dark:text-gray-400">Loading FAQs...</p>
            </div>
          </div>
        )}
        {error && (
          <div className="text-center py-20">
            <p className="text-red-500 font-medium">{error}</p>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-5 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total FAQs</p>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">{faqs.length}</p>
                  </div>
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <HelpCircle className="text-blue-600 dark:text-blue-400" size={24} />
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 p-5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Active FAQs</p>
                    <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 mt-1">
                      {faqs.filter(f => f.status).length}
                    </p>
                  </div>
                  <div className="p-3 bg-emerald-500/10 rounded-lg">
                    <CheckCircle className="text-emerald-600 dark:text-emerald-400" size={24} />
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-5 rounded-xl border border-red-200 dark:border-red-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-700 dark:text-red-300">Inactive FAQs</p>
                    <p className="text-2xl font-bold text-red-900 dark:text-red-100 mt-1">
                      {faqs.filter(f => !f.status).length}
                    </p>
                  </div>
                  <div className="p-3 bg-red-500/10 rounded-lg">
                    <XCircle className="text-red-600 dark:text-red-400" size={24} />
                  </div>
                </div>
              </div>
            </div>

            {/* Table View */}
            {viewMode === "table" && (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 text-gray-700 dark:text-gray-200">
                        <th className="py-4 px-6 text-left font-semibold">Question</th>
                        <th className="py-4 px-6 text-left font-semibold">Created</th>
                        <th className="py-4 px-6 text-left font-semibold">Status</th>
                        <th className="py-4 px-6 text-center font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900">
                      {faqs.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="py-12 text-center text-gray-500 dark:text-gray-400"
                          >
                            <div className="flex flex-col items-center gap-3">
                              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                <Search className="text-gray-400" size={24} />
                              </div>
                              <p className="font-medium">No FAQs found</p>
                              <p className="text-sm">Try adjusting your search criteria</p>
                              <button
                                onClick={openAddModal}
                                className="mt-2 px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white rounded-lg transition-all"
                              >
                                <Plus size={16} className="inline mr-2" />
                                Add Your First FAQ
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        faqs.map((faq, index) => (
                          <>
                            <tr
                              key={faq.id}
                              className={`border-b border-gray-100 dark:border-gray-800 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all group cursor-pointer ${
                                index % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50/50 dark:bg-gray-800/50"
                              }`}
                              onClick={() => toggleFAQ(faq.id)}
                            >
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-emerald-100 dark:from-blue-900/20 dark:to-emerald-900/20 flex items-center justify-center">
                                    <HelpCircle className="text-blue-600 dark:text-blue-400" size={20} />
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                      {faq.question}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                      {faq.answer.substring(0, 100)}...
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-6 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                {formatDate(faq.created_at)}
                              </td>
                              <td className="py-4 px-6">
                                <span className={badge(faq.status)}>
                                  <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                    faq.status ? "bg-emerald-600 dark:bg-emerald-400" : "bg-red-600 dark:bg-red-400"
                                  }`}></span>
                                  {faq.status ? "Active" : "Inactive"}
                                </span>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex justify-center gap-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openEditModal(faq);
                                    }}
                                    className="p-2 rounded-lg hover:bg-emerald-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-all hover:scale-110"
                                    title="Edit FAQ"
                                  >
                                    <Edit size={18} />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedFAQ(faq);
                                      setShowStatusUpdatePopup(true)
                                    }}
                                    className={`p-2 rounded-lg transition-all hover:scale-110 ${
                                      faq.status
                                        ? "hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                                        : "hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                                    }`}
                                    title={faq.status ? "Deactivate FAQ" : "Activate FAQ"}
                                  >
                                    {faq.status ? <XCircle size={18} /> : <CheckCircle size={18} />}
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openDeletePopup(faq);
                                    }}
                                    className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-all hover:scale-110"
                                    title="Delete FAQ"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                            {expandedFAQ === faq.id && (
                              <tr className="bg-blue-50/30 dark:bg-blue-900/5 border-b border-gray-100 dark:border-gray-800">
                                <td colSpan={4} className="px-6 py-4">
                                  <div className="pl-12 pr-4">
                                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                      <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Answer:</h4>
                                      <p className="text-gray-600 dark:text-gray-400">{faq.answer}</p>
                                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                          Updated: {formatDate(faq.updated_at)}
                                        </span>
                                        <button
                                          onClick={() => setExpandedFAQ(null)}
                                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                        >
                                          <ChevronUp size={16} />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Grid View */}
            {viewMode === "grid" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {faqs.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                        <Search className="text-gray-400" size={24} />
                      </div>
                      <p className="font-medium text-gray-500 dark:text-gray-400">No FAQs found</p>
                      <p className="text-sm text-gray-400">Try adjusting your search criteria</p>
                      <button
                        onClick={openAddModal}
                        className="mt-4 px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white rounded-lg transition-all"
                      >
                        <Plus size={16} className="inline mr-2" />
                        Add Your First FAQ
                      </button>
                    </div>
                  </div>
                ) : (
                  faqs.map((faq) => (
                    <div
                      key={faq.id}
                      className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-800 transition-all group"
                    >
                      <div 
                        className="p-6 cursor-pointer"
                        onClick={() => toggleFAQ(faq.id)}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-emerald-100 dark:from-blue-900/20 dark:to-emerald-900/20 flex items-center justify-center">
                              <HelpCircle className="text-blue-600 dark:text-blue-400" size={24} />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                                {faq.question}
                              </h3>
                              <div className="flex items-center gap-2 mt-2">
                                <span className={badge(faq.status)}>
                                  {faq.status ? "Active" : "Inactive"}
                                </span>
                              </div>
                            </div>
                          </div>
                          <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                            {expandedFAQ === faq.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                          </button>
                        </div>

                        {expandedFAQ === faq.id && (
                          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Answer:</h4>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">{faq.answer}</p>
                            <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                              <div>
                                <span>Created: {formatDate(faq.created_at)}</span>
                                <span className="mx-2">•</span>
                                <span>Updated: {formatDate(faq.updated_at)}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 p-4 justify-between border-t border-gray-100 dark:border-gray-700">
                        <button
                          onClick={() => openEditModal(faq)}
                          className="flex items-center justify-center gap-2 p-2.5 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-all font-medium text-sm cursor-pointer"
                        >
                          <Edit size={16} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedFAQ(faq);
                            setShowStatusUpdatePopup(true)
                          }}
                          className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            faq.status
                              ? "hover:bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 dark:hover:bg-amber-900/50"
                              : "hover:bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-900/50"
                          }`}
                        >
                          {faq.status ? <XCircle size={16} /> : <CheckCircle size={16} />}
                          <span>{faq.status ? "Deactivate" : "Activate"}</span>
                        </button>
                        <button
                          onClick={() => openDeletePopup(faq)}
                          className="p-2.5 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-all cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}

        {/* Add Modal */}
        <FAQModal 
          isEdit={false}
          isOpen={showAddModal}
          setIsOpen={setShowAddModal}
          onSubmit={handleAddSubmit}
          formData={formData}
          formErrors={formErrors}
          handleInputChange={handleInputChange}
          submitting={submitting}
        />

        {/* Edit Modal */}
        <FAQModal 
          isEdit={true}
          isOpen={showEditModal}
          setIsOpen={setShowEditModal}
          onSubmit={handleEditSubmit}
          formData={formData}
          formErrors={formErrors}
          handleInputChange={handleInputChange}
          submitting={submitting}
        />

        {/* Status update Confirmation Popup */}
        <DeleteModal
          show={showStatusUpdatePopup}
          title="Update News Status"
          message="Do you really want to update this news status?"
          onClose={() => setShowStatusUpdatePopup(false)}
          onConfirm={handleToggleStatus}
          loading={submitting}
          confirmText="Update"
          cancelText="Cancel"
          loadingText="Updating..."
          buttonColor={!selectedFAQ?.status ? "amber" : "green"}
          modalIcon={CheckCircle}
        />

        {/* Delete Confirmation Popup */}
        <DeleteModal
          show={showDeletePopup}
          title="Delete News"
          message="This action cannot be undone. Do you really want to delete this news?"
          onClose={() => setShowDeletePopup(false)}
          onConfirm={confirmDelete}
          loading={loading}
          confirmText="Delete"
          cancelText="Cancel"
        />
      </div>
    </AdminLayout>
  );
};

  // Modal component
  const FAQModal = ({ 
  isEdit = false,
  isOpen,
  setIsOpen,
  onSubmit,
  formData,
  formErrors,
  handleInputChange,
  submitting
}: {
  isEdit?: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: any;
  formErrors: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  submitting: boolean;
}) => {
    const title = isEdit ? "Edit FAQ" : "Add New FAQ";
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h4 className="text-lg font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-100">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg">
                <HelpCircle className="text-white" size={20} />
              </div>
              {title}
            </h4>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
              disabled={submitting}
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={onSubmit} className="p-6">
            <div className="space-y-4">
              {/* Question Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Question *
                </label>
                <input
                  type="text"
                  name="question"
                  value={formData.question}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    formErrors.question 
                      ? 'border-red-300 dark:border-red-700 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-emerald-500'
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all`}
                  placeholder="Enter the question"
                  disabled={submitting}
                />
                {formErrors.question && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.question}</p>
                )}
              </div>

              {/* Answer Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Answer *
                </label>
                <textarea
                  name="answer"
                  value={formData.answer}
                  onChange={handleInputChange}
                  rows={6}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    formErrors.answer 
                      ? 'border-red-300 dark:border-red-700 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-emerald-500'
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all resize-none`}
                  placeholder="Enter the detailed answer"
                  disabled={submitting}
                />
                {formErrors.answer && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.answer}</p>
                )}
              </div>

              {/* Status Field */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Status
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Active FAQs will be visible to users
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="status"
                    checked={formData.status == 1 ? true : false}
                    onChange={handleInputChange}
                    className="sr-only peer"
                    disabled={submitting}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
                  <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                    {formData.status ? "Active" : "Inactive"}
                  </span>
                </label>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{isEdit ? "Updating..." : "Adding..."}</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>{isEdit ? "Update FAQ" : "Add FAQ"}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

export default FAQList;