/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import {
  Search,
  Edit,
  Trash2,
  X,
  Filter,
  FileText,
  Grid3x3,
  List,
  Plus,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Save,
  Eye,
  Image as ImageIcon,
  Calendar,
  Star,
  ImageOff,
} from "lucide-react";
import AdminLayout from "@/components/layout/admin/AdminLayout";
import { toast } from "sonner";
import {
  Blog,
  BlogFormData,
  createBlog,
  deleteBlog,
  getBlogs,
  updateBlog,
  updateBlogStatus,
  BlogCategory,
  getBlogCategories,
} from "@/api/agent/cms";
import { validateImage } from "@/helpers/image_helper";
import DeleteModal from "../../agents/components/DeleteModal";
import Select from "react-select";
import { customStyles } from "@/utils/reactSelectStyles";
import React from "react";

const statusOptions = [
  { value: "draft", label: "Draft" },
  { value: "pending", label: "Pending" },
];

const AgentBlogsList = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [expandedBlog, setExpandedBlog] = useState<number | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);

  // Form states
  const [formData, setFormData] = useState<BlogFormData>({
    title: "",
    content: "",
    category_id: null,
    image: null,
    featured_image: null,
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
    status: "",
  });
  const [formErrors, setFormErrors] = useState({
    title: "",
    content: "",
    image: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    try {
      setLoading(true);
      const data = await getBlogs();
      const blogsArray: Blog[] = (data as any).data.data ?? data;

      const filteredBlogs = blogsArray.filter((blog: Blog) => {
        const matchesSearch =
          search === "" ||
          blog.title.toLowerCase().includes(search.toLowerCase()) ||
          blog.content.toLowerCase().includes(search.toLowerCase());

        const matchesFilter =
          filter === "all" ||
          (filter === "active" && blog.status) ||
          (filter === "inactive" && !blog.status);

        return matchesSearch && matchesFilter;
      });

      setBlogs(filteredBlogs);
    } catch {
      setError("Failed to fetch blogs.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    const res = await getBlogCategories();
    setCategories(res.data);
  };

  useEffect(() => {
    loadBlogs();
  }, [search, filter]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isFeatured = false) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const validFiles = validateImage(e, 5);
    if (!validFiles) return;

    if (validFiles.length > 0) {
      const file = validFiles[0];
      const previewUrl = URL.createObjectURL(file);
      
      if (isFeatured) {
        setFeaturedImage(file);
        setFeaturedImagePreview(previewUrl);
      } else {
        setImage(file);
        setImagePreview(previewUrl);
      }
    } else {
      e.target.value = "";
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await updateBlogStatus(id);
      toast.success("Blog status updated successfully");
      refresh();
    } catch {
      toast.error("Failed to update blog status");
    }
  };

  const openDeletePopup = (blog: Blog) => {
    setSelectedBlog(blog);
    setShowDeletePopup(true);
  };

  const confirmDelete = async () => {
    if (!selectedBlog) return;

    try {
      await deleteBlog(selectedBlog.id);
      toast.success("Blog deleted successfully");
      setShowDeletePopup(false);
      refresh();
    } catch {
      toast.error("Failed to delete blog");
    }
  };

  const toggleBlog = (id: number) => {
    setExpandedBlog(expandedBlog === id ? null : id);
  };

  // Open Add Modal
  const openAddModal = () => {
    fetchCategories();
    setFormData({
      title: "",
      content: "",
      image: "",
      category_id: null,
      status: "",
    } as any);
    setFormErrors({ title: "", content: "", image: "" });
    setImage(null);
    setFeaturedImage(null);
    setImagePreview("");
    setFeaturedImagePreview("");
    setShowAddModal(true);
  };

  // Open Edit Modal
  const openEditModal = (blog: Blog) => {
    fetchCategories();
    setEditingBlog(blog);

    const meta = (blog as any).meta_tags ?? {};

    setFormData({
      title: blog.title,
      content: blog.content,
      category_id: blog.category_id,
      status: blog.status,
      meta_title: meta.title ?? "",
      meta_description: meta.description ?? "",
      meta_keywords: meta.keywords ?? "",
      image: null,
      featured_image: null,
    });

    // Reset file states but keep previews from existing URLs
    setImage(null);
    setFeaturedImage(null);
    setImagePreview(blog.image_url || "");
    setFeaturedImagePreview(blog.featured_image_url || "");

    setShowEditModal(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev: any) => ({
        ...prev,
        [name]: checked ? 1 : 0,
      }));
    } else {
      setFormData((prev: any) => ({
        ...prev,
        [name]: value,
      }));

      if (formErrors[name as keyof typeof formErrors]) {
        setFormErrors((prev) => ({
          ...prev,
          [name]: "",
        }));
      }
    }
  };

  const validateForm = () => {
    const errors = { title: "", content: "", image: "" };
    let isValid = true;

    if (!formData?.title?.trim()) {
      errors.title = "Title is required";
      isValid = false;
    }

    if (!formData?.content?.trim()) {
      errors.content = "Content is required";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const form = new FormData();

      (Object.keys(formData) as Array<keyof BlogFormData>).forEach((key) => {
        if (key !== 'image' && key !== 'featured_image') {
          form.append(key, (formData as any)[key] as any);
        }
      });

      if (image) {
        form.append("image", image);
      }
      if (featuredImage) {
        form.append("featured_image", featuredImage);
      }

      form.append("meta_tags[title]", formData.meta_title || "");
      form.append("meta_tags[description]", formData.meta_description || "");
      form.append("meta_tags[keywords]", formData.meta_keywords || "");

      const response = await createBlog(form);
      if ((response as any).success) {
        toast.success("Blog added successfully");
        setShowAddModal(false);
        refresh();
      } else {
        toast.error((response as any).message || "Failed to add blog");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to add blog");
    } finally {
      setSubmitting(false);
    }
  };

  const refresh = async () => {
    await loadBlogs();
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !editingBlog) return;

    setSubmitting(true);

    try {
      const form = new FormData();

      form.append("title", formData.title);
      form.append("content", formData.content);
      form.append("category_id", String(formData.category_id ?? ""));
      form.append("status", formData.status ?? "");

      if (image instanceof File) {
        form.append("image", image);
      }

      if (featuredImage instanceof File) {
        form.append("featured_image", featuredImage);
      }

      form.append("meta_tags[title]", formData.meta_title || "");
      form.append("meta_tags[description]", formData.meta_description || "");
      form.append("meta_tags[keywords]", formData.meta_keywords || "");

      const response = await updateBlog(editingBlog.id, form);

      if (response?.success) {
    toast.success(response.message || "Blog updated successfully");
    setShowEditModal(false);
    refresh();
  } else {
    toast.error(response?.message || "Failed to update blog");
  }
} catch (err: any) {
  toast.error(err.response?.data?.message || err.message || "Error updating blog");
} finally {
  setSubmitting(false);
}
  };

  const badge = (status: string) => {
    const baseClasses = "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold";

    switch (status) {
      case "approved":
        return `${baseClasses} bg-emerald-100 text-emerald-700 dark:bg-emerald-700/20 dark:text-emerald-400`;
      case "rejected":
        return `${baseClasses} bg-red-100 text-red-700 dark:bg-red-700/20 dark:text-red-400`;
      default:
        return `${baseClasses} bg-red-100 text-red-700 dark:bg-red-700/20 dark:text-red-400`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const clearImage = (isFeatured: boolean) => {
    if (isFeatured) {
      setFeaturedImage(null);
      setFeaturedImagePreview("");
    } else {
      setImage(null);
      setImagePreview("");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-xl">
                  <FileText className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                    Blog Posts
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Manage all blog posts and articles
                  </p>
                </div>
              </div>

              <button
                onClick={openAddModal}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white transition-all text-sm shadow-md hover:shadow-lg font-medium w-full sm:w-auto justify-center"
              >
                <Plus size={16} />
                <span>Add Blog</span>
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search blogs..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900">
                    <Filter size={16} className="text-gray-400 mr-2" />
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="bg-transparent outline-none text-sm text-gray-700 dark:text-gray-200 cursor-pointer w-full"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
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
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading / Error */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 border-4 border-blue-500 dark:border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-500 dark:text-gray-400">Loading blogs...</p>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-5 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      Total Blogs
                    </p>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                      {blogs.length}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <FileText className="text-blue-600 dark:text-blue-400" size={24} />
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 p-5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                      Approved Blogs
                    </p>
                    <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 mt-1">
                      {blogs.filter((b) => b.status === "approved").length}
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
                    <p className="text-sm font-medium text-red-700 dark:text-red-300">
                      Rejected Blogs
                    </p>
                    <p className="text-2xl font-bold text-red-900 dark:text-red-100 mt-1">
                      {blogs.filter((b) => b.status === "rejected").length}
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
            <th className="py-4 px-4 sm:px-6 text-left font-semibold">Blog Post</th>
            <th className="py-4 px-4 sm:px-6 text-left font-semibold hidden sm:table-cell">
              Created
            </th>
            <th className="py-4 px-4 sm:px-6 text-left font-semibold">Status</th>
            <th className="py-4 px-4 sm:px-6 text-center font-semibold">Actions</th>
          </tr>
        </thead>

        <tbody className="bg-white dark:bg-gray-900">
          {blogs.length === 0 ? (
            <tr>
              <td
                colSpan={4}
                className="py-12 text-center text-gray-500 dark:text-gray-400"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <Search className="text-gray-400" size={24} />
                  </div>
                  <p className="font-medium">No blogs found</p>
                  <p className="text-sm">Try adjusting your search criteria</p>
                  <button
                    onClick={openAddModal}
                    className="mt-2 px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white rounded-lg transition-all"
                  >
                    <Plus size={16} className="inline mr-2" />
                    Add Your First Blog
                  </button>
                </div>
              </td>
            </tr>
          ) : (
            blogs.map((blog, index) => (
              <React.Fragment key={blog.id}>
                <tr
                  className={`border-b border-gray-100 dark:border-gray-800 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all group cursor-pointer ${
                    index % 2 === 0
                      ? "bg-white dark:bg-gray-900"
                      : "bg-gray-50/50 dark:bg-gray-800/50"
                  }`}
                  onClick={() => toggleBlog(blog.id)}
                >
                  {/* Blog column */}
                  <td className="py-4 px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={blog?.image_url ?? "/assets/no_image_found.jpg"}
                          alt={blog.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">
                          {blog.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                          {truncateText(blog.content, 100)}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Created column */}
                  <td className="py-4 px-4 sm:px-6 text-gray-600 dark:text-gray-400 whitespace-nowrap hidden sm:table-cell">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-gray-400" />
                      {formatDate(blog.created_at)}
                    </div>
                  </td>

                  {/* Status column */}
                  <td className="py-4 px-4 sm:px-6">
                    <span className={badge(blog.status)}>
                      <span
                        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                          blog.status === "approved"
                            ? "bg-emerald-600 dark:bg-emerald-400"
                            : "bg-red-600 dark:bg-red-400"
                        }`}
                      ></span>
                      {blog.status === "approved" ? "Active" : "Inactive"}
                    </span>
                  </td>

                  {/* Actions column */}
                  <td className="py-4 px-4 sm:px-6">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(blog);
                        }}
                        className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-emerald-900/30 text-blue-600 dark:text-blue-400 transition-all hover:scale-110"
                        title="Edit Blog"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleStatus(blog.id);
                        }}
                        className={`p-2 rounded-lg transition-all hover:scale-110 ${
                          blog.status === "approved"
                            ? "hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                            : "hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                        }`}
                        title={
                          blog.status === "approved" ? "Reject Blog" : "Approve Blog"
                        }
                      >
                        {blog.status === "approved" ? (
                          <XCircle size={18} />
                        ) : (
                          <CheckCircle size={18} />
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeletePopup(blog);
                        }}
                        className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-all hover:scale-110"
                        title="Delete Blog"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Expanded row */}
                {expandedBlog === blog.id && (
                  <tr className="bg-blue-50/30 dark:bg-blue-900/5 border-b border-gray-100 dark:border-gray-800">
                    <td colSpan={4} className="px-4 sm:px-6 py-4">
                      <div className="pl-4 sm:pl-20 pr-4">
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div className="flex flex-col sm:flex-row gap-4">
                            <div className="w-full sm:w-32 h-24 rounded-lg overflow-hidden flex-shrink-0">
                              <img
                                src={blog?.image_url ?? ""}
                                alt={blog.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    "https://images.unsplash.com/photo-1581276879432-15e50529f34b?w=400&h=200&fit=crop";
                                }}
                              />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Content:
                              </h4>
                              <p className="text-gray-600 dark:text-gray-400">
                                {blog.content}
                              </p>
                              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 gap-2">
                                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                  <span>Updated: {formatDate(blog.updated_at)}</span>
                                </div>
                                <button
                                  onClick={() => setExpandedBlog(null)}
                                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                  <ChevronUp size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
)}


            {/* Grid View */}
            {viewMode === "grid" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogs.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                        <Search className="text-gray-400" size={24} />
                      </div>
                      <p className="font-medium text-gray-500 dark:text-gray-400">No blogs found</p>
                      <p className="text-sm text-gray-400">Try adjusting your search criteria</p>
                      <button
                        onClick={openAddModal}
                        className="mt-4 px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white rounded-lg transition-all"
                      >
                        <Plus size={16} className="inline mr-2" />
                        Add Your First Blog
                      </button>
                    </div>
                  </div>
                ) : (
                  blogs.map((blog) => (
                    <div
                      key={blog.id}
                      className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-800 transition-all group overflow-hidden"
                    >
                      {/* Blog Image */}
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={
                            blog.featured_image_url ||
                            blog.image_url ||
                            "/assets/no_image_found.jpg"
                          }
                          alt={blog.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute top-3 right-3">
                          <span className={badge(blog.status)}>
                            {blog.status === "approved" ? "Active" : "Inactive"}
                          </span>
                        </div>
                        {blog.featured_image_url && (
                          <div className="absolute top-3 left-3">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-white">
                              <Star size={10} className="mr-1" />
                              Featured
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-4 sm:p-6 cursor-pointer" onClick={() => toggleBlog(blog.id)}>
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 flex-1">
                            {blog.title}
                          </h3>
                          {blog.views_count !== undefined && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                              <Eye size={12} className="mr-1" />
                              {blog.views_count}
                            </span>
                          )}

                          <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-2">
                            {expandedBlog === blog.id ? (
                              <ChevronUp size={20} />
                            ) : (
                              <ChevronDown size={20} />
                            )}
                          </button>
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} />
                            <span>{formatDate(blog.created_at)}</span>
                          </div>
                        </div>

                        {expandedBlog === blog.id ? (
                          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Content:
                            </h4>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                            {truncateText(blog.content, 120)}
                          </p>
                            <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                              <div className="flex items-center gap-2"></div>
                              <span>Updated: {formatDate(blog.updated_at)}</span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
                            {truncateText(blog.content, 150)}
                          </p>
                        )}
                    </div>

                      {/* Actions */}
                      <div className="flex gap-2 p-4 border-t border-gray-100 dark:border-gray-700 items-center justify-between">
                        <button
                          onClick={() => openEditModal(blog)}
                          className="flex items-center justify-center gap-2 p-2.5 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-all font-medium text-sm cursor-pointer"
                        >
                          <Edit size={16} />
                          <span>Edit</span>
                        </button>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleToggleStatus(blog.id)}
                            className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                              blog.status === "approved"
                                ? "hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                                : "hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                            }`}
                            title={blog.status === "approved" ? "Reject" : "Approve"}
                          >
                            {blog.status === "approved" ? (
                              <XCircle size={16} />
                            ) : (
                              <CheckCircle size={16} />
                            )}
                          </button>
                          <button
                            onClick={() => openDeletePopup(blog)}
                            className="p-2.5 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-all cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}

        {/* Modals */}
        <BlogModal
          isEdit={false}
          isOpen={showAddModal}
          setIsOpen={setShowAddModal}
          onSubmit={handleAddSubmit}
          formData={formData}
          formErrors={formErrors}
          handleInputChange={handleInputChange}
          handleFileChange={handleFileChange}
          imagePreview={imagePreview}
          featuredImagePreview={featuredImagePreview}
          clearImage={clearImage}
          submitting={submitting}
          categories={categories}
          statusOptions={statusOptions}
        />

        <BlogModal
          isEdit={true}
          isOpen={showEditModal}
          setIsOpen={setShowEditModal}
          onSubmit={handleEditSubmit}
          formData={formData}
          formErrors={formErrors}
          handleInputChange={handleInputChange}
          handleFileChange={handleFileChange}
          imagePreview={imagePreview}
          featuredImagePreview={featuredImagePreview}
          clearImage={clearImage}
          submitting={submitting}
          categories={categories}
          statusOptions={statusOptions}
        />

        <DeleteModal
          show={showDeletePopup}
          title="Delete Blog"
          message="This action cannot be undone. Do you really want to delete this blog?"
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
const BlogModal = ({
  isEdit = false,
  isOpen,
  setIsOpen,
  onSubmit,
  formData,
  formErrors,
  handleInputChange,
  handleFileChange,
  imagePreview,
  featuredImagePreview,
  clearImage,
  submitting,
  categories,
  statusOptions,
}: {
  isEdit?: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: any;
  formErrors: any;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>, isFeatured?: boolean) => void;
  imagePreview: string | null;
  featuredImagePreview: string | null;
  clearImage: (isFeatured: boolean) => void;
  submitting: boolean;
  categories: BlogCategory[];
  statusOptions: any;
}) => {
  const title = isEdit ? "Edit Blog" : "Add New Blog";
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h4 className="text-lg font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-100">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg">
              <FileText className="text-white" size={20} />
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

        <form onSubmit={onSubmit} className="p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LEFT COLUMN */}
            <div className="space-y-6">
              {/* TITLE */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    formErrors.title
                      ? "border-red-300 dark:border-red-700 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-emerald-500"
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all`}
                  placeholder="Enter blog title"
                  disabled={submitting}
                />
                {formErrors.title && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.title}</p>
                )}
              </div>

              {/* CATEGORY */}
              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-gray-200 mb-3">
                  Category
                </label>
                <Select
                  options={categories.map((category) => ({
                    value: category.id,
                    label: category.name,
                    data: category,
                  }))}
                  value={
                    formData.category_id
                      ? {
                          value: formData.category_id,
                          label:
                            categories.find((c) => c.id == formData.category_id)?.name ||
                            "Unknown Category",
                        }
                      : null
                  }
                  onChange={(selectedOption) => {
                    const fakeEvent = {
                      target: {
                        name: "category_id",
                        value: selectedOption?.value || "",
                        type: "select-one",
                      },
                    } as React.ChangeEvent<HTMLSelectElement>;
                    handleInputChange(fakeEvent);
                  }}
                  placeholder="Search and select a category..."
                  isSearchable
                  isClearable
                  styles={customStyles}
                />
              </div>

              {/* STATUS */}
              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-gray-200 mb-3">
                  Status
                </label>
                <Select
                  options={statusOptions}
                  value={
                    formData.status !== undefined
                      ? statusOptions.find((s: { value: any }) => s.value == formData.status) ||
                        null
                      : null
                  }
                  onChange={(selectedOption) => {
                    const fakeEvent = {
                      target: {
                        name: "status",
                        value: selectedOption?.value || "",
                        type: "select-one",
                      },
                    } as React.ChangeEvent<HTMLSelectElement>;
                    handleInputChange(fakeEvent);
                  }}
                  placeholder="Select status..."
                  isClearable
                  isSearchable
                  styles={customStyles}
                />
              </div>

              {/* META FIELDS */}
              <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-2">
                  SEO Settings
                </h3>
                {/* META TITLE */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    name="meta_title"
                    value={formData.meta_title || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Meta title for SEO"
                    disabled={submitting}
                  />
                </div>

                {/* META DESCRIPTION */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Meta Description
                  </label>
                  <textarea
                    name="meta_description"
                    value={formData.meta_description || ""}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Meta description for SEO"
                    disabled={submitting}
                  ></textarea>
                </div>

                {/* META KEYWORDS */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Meta Keywords
                  </label>
                  <input
                    type="text"
                    name="meta_keywords"
                    value={formData.meta_keywords || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="keyword1, keyword2, keyword3"
                    disabled={submitting}
                  />
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN - IMAGES */}
            <div className="space-y-6">
              {/* FEATURED IMAGE - Highlighted */}
              <div className="border border-amber-200 dark:border-amber-700 rounded-xl p-4 bg-amber-50/30 dark:bg-amber-900/10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Star className="text-amber-500" size={16} />
                    <label className="block text-sm font-semibold text-gray-900 dark:text-gray-200">
                      Featured Image *
                    </label>
                  </div>
                  <span className="text-xs px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded">
                    Displayed on blog list
                  </span>
                </div>
                
                {featuredImagePreview ? (
                  <div className="mb-3 relative">
                    <img
                      src={featuredImagePreview}
                      alt="Featured Preview"
                      className="w-full h-48 object-cover rounded-lg border-2 border-amber-300 dark:border-amber-600"
                    />
                    <button
                      type="button"
                      onClick={() => clearImage(true)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      disabled={submitting}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="mb-4 text-center py-8 bg-amber-50/50 dark:bg-amber-900/10 rounded-lg border-2 border-dashed border-amber-300 dark:border-amber-700">
                    <ImageOff className="text-amber-400 mx-auto mb-2" size={24} />
                    <p className="text-sm text-amber-600 dark:text-amber-400 mb-3">
                      No featured image selected
                    </p>
                  </div>
                )}

                <div className="border-2 border-dashed border-amber-300 dark:border-amber-600 rounded-lg p-4 text-center hover:border-amber-400 dark:hover:border-amber-500 transition-colors bg-white dark:bg-gray-700">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="featured-image-upload"
                    onChange={(e) => handleFileChange(e, true)}
                    disabled={submitting}
                  />
                  <label
                    htmlFor="featured-image-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <ImageIcon className="text-amber-500 mb-2" size={24} />
                    <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                      Upload Featured Image
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Recommended: 1200×630px
                    </span>
                  </label>
                </div>
              </div>

              {/* MAIN IMAGE */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-semibold text-gray-900 dark:text-gray-200">
                    Content Image
                  </label>
                  <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                    Optional
                  </span>
                </div>
                
                {imagePreview ? (
                  <div className="mb-3 relative">
                    <img
                      src={imagePreview}
                      alt="Content Preview"
                      className="w-full h-48 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                    />
                    <button
                      type="button"
                      onClick={() => clearImage(false)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      disabled={submitting}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="mb-4 text-center py-8 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                    <ImageOff className="text-gray-400 mx-auto mb-2" size={24} />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      No content image selected
                    </p>
                  </div>
                )}

                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-blue-500 dark:hover:border-emerald-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="image-upload"
                    onChange={(e) => handleFileChange(e, false)}
                    disabled={submitting}
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <ImageIcon className="text-gray-400 mb-2" size={24} />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Upload Content Image
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Displayed within blog content
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* CONTENT */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Content *
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              rows={8}
              className={`w-full px-4 py-3 rounded-lg border ${
                formErrors.content
                  ? "border-red-300 dark:border-red-700"
                  : "border-gray-300 dark:border-gray-600"
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all resize-y`}
              placeholder="Enter blog description/content (Supports HTML)"
              disabled={submitting}
            />
            {formErrors.content && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.content}</p>
            )}
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 order-2 sm:order-1"
              disabled={submitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white shadow-md order-1 sm:order-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{isEdit ? "Updating..." : "Creating..."}</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>{isEdit ? "Update Blog" : "Create Blog"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AgentBlogsList;