import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Eye,
  FileText,
  Settings,
  Search,
  Link as LinkIcon,
  FileEdit,
} from "lucide-react";
import AdminLayout from "@/components/layout/admin/AdminLayout";
import RichTextEditor from "@/components/editor/RichTextEditor";
import { toast } from "sonner";
import { PageFormData } from "@/types/page";
import { getPage, createPage, updatePage } from "@/api/admin/pages";
import { Button } from "@/components/ui/button";

const PageEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"content" | "seo">("content");

  const [formData, setFormData] = useState<PageFormData>({
    title: "",
    content: "",
    status: "draft",
    show_in_footer: false,
    footer_order: null,
    meta_title: "",
    meta_description: "",
  });

  const [generatedSlug, setGeneratedSlug] = useState("");

  // Load page data if editing
  useEffect(() => {
    if (isEditing && id) {
      loadPage(parseInt(id));
    }
  }, [id, isEditing]);

  // Generate slug from title
  useEffect(() => {
    if (formData.title && !isEditing) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setGeneratedSlug(slug);
    }
  }, [formData.title, isEditing]);

  const loadPage = async (pageId: number) => {
    try {
      setLoading(true);
      const page = await getPage(pageId);
      setFormData({
        title: page.title,
        content: page.content,
        status: page.status,
        show_in_footer: page.show_in_footer,
        footer_order: page.footer_order,
        meta_title: page.meta_title || "",
        meta_description: page.meta_description || "",
      });
      setGeneratedSlug(page.slug);
    } catch (error) {
      toast.error("Failed to load page");
      navigate("/admin/pages");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (status: "draft" | "published") => {
    if (!formData.title.trim()) {
      toast.error("Please enter a page title");
      return;
    }

    if (!formData.content.trim()) {
      toast.error("Please add some content");
      return;
    }

    setSubmitting(true);

    try {
      const dataToSubmit = {
        ...formData,
        status,
      };

      if (isEditing && id) {
        await updatePage(parseInt(id), dataToSubmit);
        toast.success("Page updated successfully");
      } else {
        await createPage(dataToSubmit);
        toast.success("Page created successfully");
      }

      navigate("/admin/pages");
    } catch (error: any) {
      toast.error(error.message || "Failed to save page");
    } finally {
      setSubmitting(false);
    }
  };

  const updateField = (field: keyof PageFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-blue-500 dark:border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-500 dark:text-gray-400">Loading page...</p>
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
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/admin/pages")}
                className="hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <ArrowLeft size={20} />
              </Button>
              <div className="p-3 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-xl">
                <FileEdit className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {isEditing ? "Edit Page" : "Create New Page"}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {generatedSlug ? `Slug: /${generatedSlug}` : "Enter a title to generate slug"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {formData.status === "published" && isEditing && (
                <Button
                  variant="outline"
                  onClick={() => window.open(`/page/${generatedSlug}`, "_blank")}
                  className="border-gray-300 dark:border-gray-600"
                >
                  <Eye size={18} />
                  <span>Preview</span>
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => handleSubmit("draft")}
                disabled={submitting}
                className="border-gray-300 dark:border-gray-600"
              >
                <Save size={18} />
                <span>Save Draft</span>
              </Button>
              <Button
                onClick={() => handleSubmit("published")}
                disabled={submitting}
                className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white shadow-md hover:shadow-lg"
              >
                <Save size={18} />
                <span>Publish</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Page Title *
              </label>
              <input
                type="text"
                placeholder="Enter page title..."
                value={formData.title}
                onChange={(e) => updateField("title", e.target.value)}
                className="w-full text-3xl font-semibold border-none outline-none bg-transparent placeholder:text-gray-300 dark:placeholder:text-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Editor */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 block">
                Page Content *
              </label>
              <RichTextEditor
                content={formData.content}
                onChange={(content) => updateField("content", content)}
              />
            </div>

            {/* SEO Section */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
              <div className="border-b border-gray-200 dark:border-gray-800 flex">
                <button
                  onClick={() => setActiveTab("content")}
                  className={`px-6 py-3 font-medium transition-colors text-sm ${
                    activeTab === "content"
                      ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/10"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  Content Settings
                </button>
                <button
                  onClick={() => setActiveTab("seo")}
                  className={`px-6 py-3 font-medium transition-colors text-sm ${
                    activeTab === "seo"
                      ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/10"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  <Search size={16} className="inline mr-1" />
                  SEO
                </button>
              </div>

              <div className="p-6 space-y-4">
                {activeTab === "seo" && (
                  <>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Search size={16} />
                        Meta Title
                      </label>
                      <input
                        type="text"
                        placeholder="SEO title for search engines"
                        value={formData.meta_title}
                        onChange={(e) => updateField("meta_title", e.target.value)}
                        className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500 focus:border-transparent transition-all"
                        maxLength={60}
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formData.meta_title?.length || 0}/60 characters
                      </p>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <FileText size={16} />
                        Meta Description
                      </label>
                      <textarea
                        placeholder="Brief description for search engines"
                        rows={3}
                        value={formData.meta_description}
                        onChange={(e) =>
                          updateField("meta_description", e.target.value)
                        }
                        className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
                        maxLength={160}
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formData.meta_description?.length || 0}/160 characters
                      </p>
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <h4 className="font-medium text-sm mb-3 flex items-center gap-2 text-blue-900 dark:text-blue-100">
                        <Search size={16} />
                        Search Engine Preview
                      </h4>
                      <div className="space-y-1">
                        <p className="text-blue-700 dark:text-blue-400 text-sm font-medium line-clamp-1">
                          {formData.meta_title || formData.title || "Page Title"}
                        </p>
                        <p className="text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                          <LinkIcon size={10} />
                          yourdomain.com/{generatedSlug || "page-slug"}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                          {formData.meta_description ||
                            "Add a meta description to improve SEO and attract more visitors from search engines..."}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === "content" && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Additional content settings and options will be available here in future updates.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
              <h3 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white mb-4">
                <Settings size={18} />
                Page Settings
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                    Status
                  </label>
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${
                        formData.status === "published"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-700/20 dark:text-emerald-400"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-700/20 dark:text-gray-400"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full mr-2 ${
                          formData.status === "published"
                            ? "bg-emerald-600 dark:bg-emerald-400"
                            : "bg-gray-600 dark:bg-gray-400"
                        }`}
                      />
                      {formData.status === "published" ? "Published" : "Draft"}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                  <label className="flex items-center justify-between cursor-pointer group">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Show in Footer
                    </span>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={formData.show_in_footer}
                        onChange={(e) =>
                          updateField("show_in_footer", e.target.checked)
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:bg-blue-600 dark:peer-checked:bg-emerald-600 peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-emerald-800 transition-all"></div>
                      <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all peer-checked:translate-x-5"></div>
                    </div>
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Display this page in the website footer navigation
                  </p>
                </div>

                {formData.show_in_footer && (
                  <div className="pt-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                      Footer Order
                    </label>
                    <input
                      type="number"
                      placeholder="e.g., 1, 2, 3..."
                      value={formData.footer_order ?? ""}
                      onChange={(e) =>
                        updateField(
                          "footer_order",
                          e.target.value ? parseInt(e.target.value) : null
                        )
                      }
                      className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500 focus:border-transparent transition-all"
                      min="1"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Lower numbers appear first in footer
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Info */}
            <div className="bg-gradient-to-br from-blue-50 to-emerald-50 dark:from-blue-900/20 dark:to-emerald-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <FileText size={18} />
                Pro Tips
              </h3>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                  <span>Use headings (H1, H2, H3) to structure your content</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">•</span>
                  <span>Add images to make content more engaging</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                  <span>Keep meta descriptions under 160 characters</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">•</span>
                  <span>Save drafts frequently while working</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default PageEditor;
