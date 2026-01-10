/* eslint-disable @typescript-eslint/no-unused-vars */
// src/pages/agent/comments/AgentCommentsList.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  MessageSquare,
  Calendar,
  User,
  Eye,
  Trash2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  ExternalLink,
  Loader2,
} from "lucide-react";
import AdminLayout from "@/components/layout/admin/AdminLayout";
import { toast } from "sonner";
import { BlogComment, Paginated, AgentBlog } from "@/api/agent/cms";
import { getAgentBlogs, getAgentBlogComments, deleteAgentBlog } from "@/api/agent/cms";

// Mock functions for comment actions (you'll need to implement these in your API)
const approveComment = async (commentId: number) => {
  // Implement this API call
  console.log("Approving comment:", commentId);
  return Promise.resolve();
};

const rejectComment = async (commentId: number) => {
  // Implement this API call
  console.log("Rejecting comment:", commentId);
  return Promise.resolve();
};

const deleteAgentComment = async (commentId: number) => {
  // Implement this API call
  console.log("Deleting comment:", commentId);
  return Promise.resolve();
};

const AgentCommentsList = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<AgentBlog[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<AgentBlog | null>(null);
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all, approved, pending
  const [selectedComments, setSelectedComments] = useState<number[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<BlogComment | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalComments, setTotalComments] = useState(0);
  const [perPage] = useState(20);

  // Load agent blogs
  const loadBlogs = async () => {
    try {
      setLoadingBlogs(true);
      setError(null);
      
      const response = await getAgentBlogs({ status: "approved" });
      setBlogs(response.data);
      
      // Select first blog by default
      if (response.data.length > 0 && !selectedBlog) {
        setSelectedBlog(response.data[0]);
      }
      
    } catch (err) {
      console.error("Error loading blogs:", err);
      setError("Failed to load blogs. Please try again.");
      toast.error("Failed to load blogs");
    } finally {
      setLoadingBlogs(false);
    }
  };

  // Load comments for selected blog
  const loadComments = async () => {
    if (!selectedBlog || loadingComments) return;

    try {
      setLoadingComments(true);
      setError(null);
      
      const response = await getAgentBlogComments(selectedBlog.id, currentPage);
      setComments(response.data);
      setTotalPages(response.last_page);
      setTotalComments(response.total);
      setCurrentPage(response.current_page);
      
    } catch (err) {
      console.error("Error loading comments:", err);
      setError("Failed to load comments. Please try again.");
      toast.error("Failed to load comments");
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  useEffect(() => {
    if (selectedBlog) {
      loadComments();
    }
  }, [selectedBlog, currentPage]);

  // Filter comments based on search and filter
  const filteredComments = comments.filter(comment => {
    const matchesSearch = 
      search === "" ||
      comment.comment.toLowerCase().includes(search.toLowerCase()) ||
      comment.user?.name.toLowerCase().includes(search.toLowerCase());

    const matchesFilter = 
      filter === "all" ||
      (filter === "approved" && comment.is_approved) ||
      (filter === "pending" && !comment.is_approved);

    return matchesSearch && matchesFilter;
  });

  // Handle comment selection
  const handleSelectComment = (id: number) => {
    setSelectedComments(prev =>
      prev.includes(id)
        ? prev.filter(commentId => commentId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedComments.length === filteredComments.length) {
      setSelectedComments([]);
    } else {
      setSelectedComments(filteredComments.map(comment => comment.id));
    }
  };

  // Handle comment actions
  const handleApproveComment = async (comment: BlogComment) => {
    try {
      await approveComment(comment.id);
      toast.success("Comment approved successfully");
      loadComments();
    } catch (error) {
      toast.error("Failed to approve comment");
    }
  };

  const handleRejectComment = async (comment: BlogComment) => {
    try {
      await rejectComment(comment.id);
      toast.success("Comment rejected successfully");
      loadComments();
    } catch (error) {
      toast.error("Failed to reject comment");
    }
  };

  const handleDeleteComment = async () => {
    if (!commentToDelete) return;

    try {
      await deleteAgentComment(commentToDelete.id);
      toast.success("Comment deleted successfully");
      setShowDeleteModal(false);
      setCommentToDelete(null);
      loadComments();
    } catch (error) {
      toast.error("Failed to delete comment");
    }
  };

  // Bulk actions
  const handleBulkApprove = async () => {
    try {
      await Promise.all(selectedComments.map(id => approveComment(id)));
      toast.success(`${selectedComments.length} comments approved successfully`);
      setSelectedComments([]);
      loadComments();
    } catch (error) {
      toast.error("Failed to approve comments");
    }
  };

  const handleBulkReject = async () => {
    try {
      await Promise.all(selectedComments.map(id => rejectComment(id)));
      toast.success(`${selectedComments.length} comments rejected successfully`);
      setSelectedComments([]);
      loadComments();
    } catch (error) {
      toast.error("Failed to reject comments");
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedComments.length} comments?`)) return;

    try {
      await Promise.all(selectedComments.map(id => deleteAgentComment(id)));
      toast.success(`${selectedComments.length} comments deleted successfully`);
      setSelectedComments([]);
      loadComments();
    } catch (error) {
      toast.error("Failed to delete comments");
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Truncate text
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Get status badge
  const getStatusBadge = (isApproved: boolean) => {
    if (isApproved) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
          <CheckCircle className="w-3 h-3 mr-1" />
          Approved
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
          <AlertCircle className="w-3 h-3 mr-1" />
          Pending
        </span>
      );
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Get blog stats
  const getBlogStats = () => {
    if (!selectedBlog) return { total: 0, approved: 0, pending: 0 };
    
    const total = comments.length;
    const approved = comments.filter(c => c.is_approved).length;
    const pending = total - approved;
    
    return { total, approved, pending };
  };

  if (loadingBlogs) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-500">Loading blogs...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-xl">
                <MessageSquare className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-semibold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                  My Blog Comments
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Manage comments on your blog posts
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
              {/* Refresh */}
              <button
                onClick={() => {
                  loadBlogs();
                  if (selectedBlog) loadComments();
                }}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* Blog Selection */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Blog Post
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {blogs.map(blog => (
                <button
                  key={blog.id}
                  onClick={() => setSelectedBlog(blog)}
                  className={`p-4 rounded-xl border transition-all ${
                    selectedBlog?.id === blog.id
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {blog.image_url && (
                      <img
                        src={blog.image_url}
                        alt={blog.title}
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 text-left">
                      <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2">
                        {blog.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
                          {blog.approved_comments_count || 0} comments
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
                          {blog.views_count || 0} views
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Blog Stats */}
        {selectedBlog && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Selected Blog
                  </p>
                  <p className="text-lg font-bold text-blue-900 dark:text-blue-100 mt-1 line-clamp-2">
                    {selectedBlog.title}
                  </p>
                </div>
                <ExternalLink className="text-blue-600 dark:text-blue-400 w-8 h-8" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                    Total Comments
                  </p>
                  <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 mt-1">
                    {getBlogStats().total}
                  </p>
                </div>
                <MessageSquare className="text-emerald-600 dark:text-emerald-400 w-8 h-8" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                    Approved
                  </p>
                  <p className="text-2xl font-bold text-amber-900 dark:text-amber-100 mt-1">
                    {getBlogStats().approved}
                  </p>
                </div>
                <CheckCircle className="text-amber-600 dark:text-amber-400 w-8 h-8" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-4 rounded-xl border border-red-200 dark:border-red-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-700 dark:text-red-300">
                    Pending
                  </p>
                  <p className="text-2xl font-bold text-red-900 dark:text-red-100 mt-1">
                    {getBlogStats().pending}
                  </p>
                </div>
                <AlertCircle className="text-red-600 dark:text-red-400 w-8 h-8" />
              </div>
            </div>
          </div>
        )}

        {/* Comments Management */}
        {selectedBlog ? (
          <>
            {/* Search and Filter Bar */}
            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full">
                  {/* Search */}
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search comments..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Filter */}
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Comments</option>
                    <option value="approved">Approved Only</option>
                    <option value="pending">Pending Only</option>
                  </select>
                </div>

                {selectedComments.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleBulkApprove}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve ({selectedComments.length})
                    </button>
                    <button
                      onClick={handleBulkReject}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject ({selectedComments.length})
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete ({selectedComments.length})
                    </button>
                    <button
                      onClick={() => setSelectedComments([])}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Loading State */}
            {loadingComments && (
              <div className="flex items-center justify-center py-20">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-gray-500">Loading comments...</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && !loadingComments && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="text-red-600 dark:text-red-400 w-6 h-6" />
                  <div>
                    <p className="font-medium text-red-800 dark:text-red-300">{error}</p>
                    <button
                      onClick={loadComments}
                      className="mt-2 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Comments List */}
            {!loadingComments && !error && (
              <>
                {/* Desktop Table */}
                <div className="hidden lg:block bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full w-full border-collapse text-sm">
                      <thead>
                        <tr className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 text-gray-700 dark:text-gray-200">
                          <th className="py-4 px-6 text-left font-semibold w-12">
                            <input
                              type="checkbox"
                              checked={selectedComments.length === filteredComments.length && filteredComments.length > 0}
                              onChange={handleSelectAll}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </th>
                          <th className="py-4 px-6 text-left font-semibold">Comment & User</th>
                          <th className="py-4 px-6 text-left font-semibold">Date</th>
                          <th className="py-4 px-6 text-left font-semibold">Status</th>
                          <th className="py-4 px-6 text-left font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900">
                        {filteredComments.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-12 text-center text-gray-500 dark:text-gray-400">
                              <div className="flex flex-col items-center gap-3">
                                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                  <Search className="text-gray-400" size={24} />
                                </div>
                                <p className="font-medium">No comments found</p>
                                <p className="text-sm">Try adjusting your search or filter criteria</p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          filteredComments.map((comment, index) => (
                            <tr
                              key={comment.id}
                              className={`border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                                index % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50/50 dark:bg-gray-800/50"
                              }`}
                            >
                              <td className="py-4 px-6">
                                <input
                                  type="checkbox"
                                  checked={selectedComments.includes(comment.id)}
                                  onChange={() => handleSelectComment(comment.id)}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex items-start gap-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                                    {comment.user?.avatar_url ?  (
                                      <img
                                        src={comment.user.avatar_url}
                                        alt={comment.user.name}
                                        className="w-full h-full rounded-full object-cover"
                                      />
                                    ) : (
                                      <span>{comment.user?.name?.charAt(0).toUpperCase() || "U"}</span>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <p className="font-semibold text-gray-900 dark:text-white">
                                        {comment.user?.name || "Anonymous"}
                                      </p>
                                      <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
                                        User #{comment.user_id}
                                      </span>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                                      {comment.comment}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-6 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-gray-400" />
                                  {formatDate(comment.created_at)}
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                {getStatusBadge(comment.is_approved)}
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-2">
                                  {!comment.is_approved ? (
                                    <button
                                      onClick={() => handleApproveComment(comment)}
                                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-1"
                                    >
                                      <CheckCircle className="w-3 h-3" />
                                      Approve
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleRejectComment(comment)}
                                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-1"
                                    >
                                      <XCircle className="w-3 h-3" />
                                      Reject
                                    </button>
                                  )}
                                  <button
                                    onClick={() => {
                                      setCommentToDelete(comment);
                                      setShowDeleteModal(true);
                                    }}
                                    className="px-3 py-1 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-1"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden space-y-4">
                  {filteredComments.length === 0 ? (
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                          <Search className="text-gray-400" size={24} />
                        </div>
                        <p className="font-medium text-gray-900 dark:text-white">No comments found</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Try adjusting your search or filter criteria
                        </p>
                      </div>
                    </div>
                  ) : (
                    filteredComments.map((comment) => (
                      <div
                        key={comment.id}
                        className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={selectedComments.includes(comment.id)}
                              onChange={() => handleSelectComment(comment.id)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1"
                            />
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                              {comment.user?.avatar_url? (
                                <img
                                  src={comment.user.avatar_url}
                                  alt={comment.user.name}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <span>{comment.user?.name?.charAt(0).toUpperCase() || "U"}</span>
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {comment.user?.name || "Anonymous"}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {formatDate(comment.created_at)}
                              </p>
                            </div>
                          </div>
                          <div>{getStatusBadge(comment.is_approved)}</div>
                        </div>

                        <div className="mb-4">
                          <p className="text-gray-700 dark:text-gray-300">
                            {comment.comment}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                          <div className="flex flex-wrap gap-2">
                            {!comment.is_approved ? (
                              <button
                                onClick={() => handleApproveComment(comment)}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-1"
                              >
                                <CheckCircle className="w-3 h-3" />
                                Approve
                              </button>
                            ) : (
                              <button
                                onClick={() => handleRejectComment(comment)}
                                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-1"
                              >
                                <XCircle className="w-3 h-3" />
                                Reject
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setCommentToDelete(comment);
                                setShowDeleteModal(true);
                              }}
                              className="px-3 py-1 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Pagination */}
                {filteredComments.length > 0 && totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Showing {(currentPage - 1) * perPage + 1} to {Math.min(currentPage * perPage, totalComments)} of {totalComments} comments
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <div className="flex items-center gap-1">
                        {[...Array(Math.min(5, totalPages))].map((_, i) => {
                          let pageNumber;
                          if (totalPages <= 5) {
                            pageNumber = i + 1;
                          } else if (currentPage <= 3) {
                            pageNumber = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNumber = totalPages - 4 + i;
                          } else {
                            pageNumber = currentPage - 2 + i;
                          }

                          return (
                            <button
                              key={pageNumber}
                              onClick={() => handlePageChange(pageNumber)}
                              className={`px-3 py-1 rounded-lg text-sm font-medium ${
                                currentPage === pageNumber
                                  ? "bg-blue-600 text-white"
                                  : "border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                              }`}
                            >
                              {pageNumber}
                            </button>
                          );
                        })}
                      </div>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          /* No Blog Selected */
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8 text-center">
            <div className="flex flex-col items-center gap-3">
              <MessageSquare className="text-gray-400 w-12 h-12" />
              <p className="font-medium text-gray-900 dark:text-white">Select a Blog Post</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Please select a blog post from the list above to view and manage its comments
              </p>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <Trash2 className="text-red-600 dark:text-red-400 w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Delete Comment
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Are you sure you want to delete this comment? This action cannot be undone.
                </p>
                {commentToDelete && (
                  <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg mb-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                      "{truncateText(commentToDelete.comment, 100)}"
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      - {commentToDelete.user?.name || "Anonymous"}
                    </p>
                  </div>
                )}
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setCommentToDelete(null);
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteComment}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    Delete Comment
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      </AdminLayout>
  );
};

export default AgentCommentsList;