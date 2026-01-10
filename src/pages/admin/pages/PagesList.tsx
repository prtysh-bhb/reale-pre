/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  FileText,
  Eye,
  Search,
  Grid3x3,
  List,
  CheckCircle,
  XCircle,
  Calendar,
  Filter,
  Globe,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/layout/admin/AdminLayout";
import { toast } from "sonner";
import { Page } from "@/types/page";
import { getPages, deletePage } from "@/api/admin/pages";
import { Button } from "@/components/ui/button";
import DeleteModal from "../agents/components/DeleteModal";

const PagesList = () => {
  const navigate = useNavigate();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [filter, setFilter] = useState("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);

  const loadPages = async () => {
    try {
      setLoading(true);
      const res = await getPages();
      setPages(res);
    } catch {
      toast.error("Failed to load pages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPages();
  }, []);

  const openDeleteModal = (page: Page) => {
    setSelectedPage(page);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!selectedPage) return;

    try {
      await deletePage(selectedPage.id);
      toast.success("Page deleted successfully");
      setShowDeleteModal(false);
      loadPages();
    } catch {
      toast.error("Failed to delete page");
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold";

    return status === "published" ? (
      <span
        className={`${baseClasses} bg-emerald-100 text-emerald-700 dark:bg-emerald-700/20 dark:text-emerald-400`}
      >
        <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-emerald-600 dark:bg-emerald-400"></span>
        Published
      </span>
    ) : (
      <span
        className={`${baseClasses} bg-gray-100 text-gray-700 dark:bg-gray-700/20 dark:text-gray-400`}
      >
        <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-gray-600 dark:bg-gray-400"></span>
        Draft
      </span>
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Filter pages
  const filteredPages = pages.filter((page) => {
    const matchesSearch =
      searchQuery === "" ||
      page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.slug.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filter === "all" ||
      (filter === "published" && page.status === "published") ||
      (filter === "draft" && page.status === "draft");

    return matchesSearch && matchesFilter;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-xl">
                <FileText className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Pages</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Manage your website pages
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Search */}
              <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 shadow-sm hover:border-blue-400 dark:hover:border-emerald-600 transition-all">
                <Search size={16} className="text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Search pages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent outline-none text-sm text-gray-900 dark:text-white w-48 placeholder-gray-500"
                />
              </div>

              {/* Filter */}
              <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 shadow-sm hover:border-blue-400 dark:hover:border-emerald-600 transition-all">
                <Filter size={16} className="text-gray-400 mr-2" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="bg-transparent outline-none text-sm text-gray-700 dark:text-gray-200 cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              {/* View Toggle */}
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

              <Button
                onClick={() => navigate("/admin/pages/create")}
                className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white shadow-md hover:shadow-lg"
              >
                <Plus size={18} />
                <span>Add Page</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-5 rounded-xl border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Total Pages
                  </p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                    {pages.length}
                  </p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <FileText className="text-blue-600 dark:text-blue-400" size={20} />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 p-5 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                    Published
                  </p>
                  <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 mt-1">
                    {pages.filter((p) => p.status === "published").length}
                  </p>
                </div>
                <div className="p-3 bg-emerald-500/10 rounded-lg">
                  <CheckCircle className="text-emerald-600 dark:text-emerald-400" size={20} />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 p-5 rounded-xl border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Drafts</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                    {pages.filter((p) => p.status === "draft").length}
                  </p>
                </div>
                <div className="p-3 bg-gray-500/10 rounded-lg">
                  <XCircle className="text-gray-600 dark:text-gray-400" size={20} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 border-4 border-blue-500 dark:border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-500 dark:text-gray-400">Loading pages...</p>
            </div>
          </div>
        )}

        {/* Content */}
        {!loading && (
          <>
            {/* Grid View */}
            {viewMode === "grid" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPages.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                        <Search className="text-gray-400" size={24} />
                      </div>
                      <p className="font-medium text-gray-500 dark:text-gray-400">No pages found</p>
                      <p className="text-sm text-gray-400">Try adjusting your search criteria</p>
                      {pages.length === 0 && (
                        <Button
                          onClick={() => navigate("/admin/pages/create")}
                          className="mt-4 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white"
                        >
                          <Plus size={18} />
                          <span>Create Your First Page</span>
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  filteredPages.map((page) => (
                    <div
                      key={page.id}
                      className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-800 transition-all group overflow-hidden"
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">
                              {page.title}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
                              <Globe size={14} />
                              <span className="truncate">/{page.slug}</span>
                            </div>
                          </div>
                          {getStatusBadge(page.status)}
                        </div>

                        <div className="space-y-2 mb-4 pb-4 border-b border-gray-100 dark:border-gray-800">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">In Footer:</span>
                            <span
                              className={
                                page.show_in_footer
                                  ? "text-emerald-600 dark:text-emerald-400 font-medium"
                                  : "text-gray-400"
                              }
                            >
                              {page.show_in_footer ? "Yes" : "No"}
                            </span>
                          </div>
                          {page.show_in_footer && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500 dark:text-gray-400">Order:</span>
                              <span className="text-gray-700 dark:text-gray-300 font-medium">
                                {page.footer_order ?? "-"}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <Calendar size={14} />
                            <span>{formatDate(page.published_at)}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          {page.status === "published" && (
                            <Button
                              onClick={() => window.open(`/page/${page.slug}`, "_blank")}
                              variant="ghost"
                              size="sm"
                              className="flex-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                            >
                              <Eye size={16} />
                              <span>View</span>
                            </Button>
                          )}
                          <Button
                            onClick={() => navigate(`/admin/pages/edit/${page.id}`)}
                            variant="ghost"
                            size="sm"
                            className="flex-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                          >
                            <Edit size={16} />
                            <span>Edit</span>
                          </Button>
                          <Button
                            onClick={() => openDeleteModal(page)}
                            variant="ghost"
                            size="sm"
                            disabled={!page.can_deleted}
                            className="p-2.5 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Table View */}
            {viewMode === "table" && (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 text-gray-700 dark:text-gray-200">
                        <th className="py-4 px-6 text-left font-semibold">Title</th>
                        <th className="py-4 px-6 text-left font-semibold">Slug</th>
                        <th className="py-4 px-6 text-center font-semibold">Status</th>
                        <th className="py-4 px-6 text-center font-semibold">Footer</th>
                        <th className="py-4 px-6 text-center font-semibold">Order</th>
                        <th className="py-4 px-6 text-left font-semibold">Published</th>
                        <th className="py-4 px-6 text-center font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900">
                      {filteredPages.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="py-12 text-center text-gray-500 dark:text-gray-400"
                          >
                            <div className="flex flex-col items-center gap-3">
                              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                <Search className="text-gray-400" size={24} />
                              </div>
                              <p className="font-medium">No pages found</p>
                              <p className="text-sm">Try adjusting your search criteria</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredPages.map((page, index) => (
                          <tr
                            key={page.id}
                            className={`border-b border-gray-100 dark:border-gray-800 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all group ${
                              index % 2 === 0
                                ? "bg-white dark:bg-gray-900"
                                : "bg-gray-50/50 dark:bg-gray-800/50"
                            }`}
                          >
                            <td className="py-4 px-6">
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {page.title}
                              </p>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                <Globe size={14} />
                                <span>/{page.slug}</span>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-center">{getStatusBadge(page.status)}</td>
                            <td className="py-4 px-6 text-center">
                              <span
                                className={
                                  page.show_in_footer
                                    ? "text-emerald-600 dark:text-emerald-400 font-medium"
                                    : "text-gray-400"
                                }
                              >
                                {page.show_in_footer ? "Yes" : "No"}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-center text-gray-600 dark:text-gray-400">
                              {page.footer_order ?? "-"}
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                <Calendar size={14} />
                                <span>{formatDate(page.published_at)}</span>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                {page.status === "published" && (
                                  <button
                                    onClick={() => window.open(`/page/${page.slug}`, "_blank")}
                                    className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-all hover:scale-110"
                                    title="View Page"
                                  >
                                    <Eye size={18} />
                                  </button>
                                )}
                                <button
                                  onClick={() => navigate(`/admin/pages/edit/${page.id}`)}
                                  className="p-2 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 transition-all hover:scale-110"
                                  title="Edit Page"
                                >
                                  <Edit size={18} />
                                </button>
                                <button
                                  onClick={() => openDeleteModal(page)}
                                  className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-all hover:scale-110"
                                  title="Delete Page"
                                >
                                  <Trash2 size={18} />
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
            )}
          </>
        )}

        {/* Delete Modal */}
        <DeleteModal
          show={showDeleteModal}
          title="Delete Page"
          message={`Are you sure you want to delete "${selectedPage?.title}"? This action cannot be undone.`}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          loading={false}
          confirmText="Delete"
          cancelText="Cancel"
        />
      </div>
    </AdminLayout>
  );
};

export default PagesList;
