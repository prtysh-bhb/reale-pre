import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FileText, AlertCircle, ArrowLeft, Calendar } from "lucide-react";
import { getPublicPage } from "@/api/admin/pages";
import { Page } from "@/types/page";

const PageView = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      loadPage(slug);
    }
  }, [slug]);

  const loadPage = async (pageSlug: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPublicPage(pageSlug);
      setPage(data);

      // Update page title and meta tags for SEO
      if (data) {
        document.title = data.meta_title || data.title;

        // Update meta description
        let metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
          metaDescription = document.createElement('meta');
          metaDescription.setAttribute('name', 'description');
          document.head.appendChild(metaDescription);
        }
        metaDescription.setAttribute('content', data.meta_description || `Read ${data.title}`);
      }
    } catch (err: any) {
      setError(err.response?.status === 404 ? "Page not found" : "Failed to load page");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-blue-600 dark:border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">Loading page...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !page) {
    return (
      <>
        <div className="min-h-[60vh] flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={40} className="text-red-500 dark:text-red-400" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
              {error === "Page not found" ? "404" : "Oops!"}
            </h1>
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {error === "Page not found" ? "Page Not Found" : "Something Went Wrong"}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              {error === "Page not found"
                ? "The page you're looking for doesn't exist or has been moved."
                : "We encountered an error while loading this page. Please try again later."}
            </p>
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
            >
              <ArrowLeft size={18} />
              Back to Homepage
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="bg-gray-50 dark:bg-gray-900">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white">
          <div className="container mx-auto px-4 py-12 md:py-16">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors mb-6 group"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Back</span>
            </button>

            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-4">
                <FileText size={16} />
                <span>Page</span>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                {page.title}
              </h1>

              {page.published_at && (
                <div className="flex items-center gap-2 text-white/80">
                  <Calendar size={16} />
                  <span className="text-sm">
                    Published on {new Date(page.published_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="container mx-auto px-4 py-12">
          <article className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-8 md:p-12 lg:p-16 cmsContent">
                <div
                  className="cmsContent"
                  dangerouslySetInnerHTML={{ __html: page.content }}
                />
              </div>
            </div>

            {/* Back to top button */}
            <div className="mt-12 text-center">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm hover:shadow-md text-gray-700 dark:text-gray-300 font-medium"
              >
                <ArrowLeft size={18} className="rotate-90" />
                Back to Top
              </button>
            </div>
          </article>
        </div>
      </div>
    </>
  );
};

export default PageView;
