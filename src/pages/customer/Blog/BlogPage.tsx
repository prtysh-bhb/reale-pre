/* eslint-disable @typescript-eslint/no-unused-vars */
// src/pages/public/BlogPage.tsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search,  
  Calendar, 
  Eye,  
  ChevronRight,
  Clock,
  Tag,
  X,
  TrendingUp,
  Star,
  BookOpen
} from "lucide-react";
import { 
  getBlogs, 
  getBlogCategories, 
  getFeaturedBlogs, 
  getPopularBlogs,
  getBlogStatistics,
  searchBlogs,
  getBlogsByCategory,
  Blog,
  BlogCategory,
  BlogStatistics
} from "@/api/customer/cms";
import { toast } from "sonner";

const BlogPage = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [featuredBlogs, setFeaturedBlogs] = useState<Blog[]>([]);
  const [popularBlogs, setPopularBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [statistics, setStatistics] = useState<BlogStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showSearch, setShowSearch] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadBlogs(),
        loadFeaturedBlogs(),
        loadPopularBlogs(),
        loadCategories(),
        loadStatistics()
      ]);
    } catch (error) {
      toast.error("Failed to load blogs");
    } finally {
      setLoading(false);
    }
  };

  const loadBlogs = async (page = 1, category?: string | null, search?: string) => {
    try {
      let response;
      if (category) {
        const categoryObj = categories.find(c => c.slug === category || c.name === category);
        if (categoryObj) {
          response = await getBlogsByCategory(categoryObj.slug, page);
        } else {
          response = await getBlogs(page);
        }
      } else if (search) {
        response = await searchBlogs(search, page);
      } else {
        response = await getBlogs(page);
      }

      if (page === 1) {
        setBlogs(response.data.data);
      } else {
        setBlogs(prev => [...prev, ...response.data.data]);
      }
      setCurrentPage(response.data.current_page);
      setTotalPages(response.data.last_page);
    } catch (error) {
      toast.error("Failed to load blogs");
    }
  };

  const loadFeaturedBlogs = async () => {
    try {
      const response = await getFeaturedBlogs();
      setFeaturedBlogs(response.data.filter(blog => blog.status === "approved"));
    } catch (error) {
      console.error("Failed to load featured blogs");
    }
  };

  const loadPopularBlogs = async () => {
    try {
      const response = await getPopularBlogs();
      setPopularBlogs(response.data.filter(blog => blog.status === "approved"));
    } catch (error) {
      console.error("Failed to load popular blogs");
    }
  };

  const loadCategories = async () => {
    try {
      const response = await getBlogCategories();
      setCategories(response.data);
    } catch (error) {
      console.error("Failed to load categories");
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await getBlogStatistics();
      setStatistics(response);
    } catch (error) {
      console.error("Failed to load statistics");
    }
  };

  const handleSearch = () => {
  fetch(`/search?q=${searchQuery}`)
    .then(res => res.json())
    .then(data => console.log(data));
};

  const handleCategorySelect = useCallback(async (categorySlug: string | null) => {
    setSelectedCategory(categorySlug);
    setCurrentPage(1);
    await loadBlogs(1, categorySlug);
  }, []);

  const handleLoadMore = async () => {
    if (currentPage >= totalPages || loadingMore) return;
    
    setLoadingMore(true);
    try {
      await loadBlogs(currentPage + 1, selectedCategory, searchQuery);
    } finally {
      setLoadingMore(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const getTimeToRead = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  };

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return "";
    const stripped = text.replace(/<[^>]*>/g, '');
    if (stripped.length <= maxLength) return stripped;
    return stripped.substring(0, maxLength) + "...";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-blue-500 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-emerald-600 dark:from-blue-800 dark:to-emerald-800 py-16 md:py-24">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Our Blog
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Discover insights, tutorials, and stories from our community
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search articles..."
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 dark:text-white shadow-lg"
                />
                <button
                  onClick={handleSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-6 py-2 rounded-xl hover:from-blue-700 hover:to-emerald-700 transition-all"
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      {statistics && (
        <section className="hidden md:block container w-full max-w-4xl mx-auto px-4 -mt-8 relative z-20">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {statistics.total_blogs}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Articles</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {statistics.total_categories}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                {statistics.total_views}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Views</div>
            </div>
          </div>
        </section>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="lg:w-2/3">
            {/* Featured Blogs */}
            {featuredBlogs.length > 0 && (
              <section className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Star className="text-amber-500" size={24} />
                    Featured Articles
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded-lg ${viewMode === "grid" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : "text-gray-500"}`}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded-lg ${viewMode === "list" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : "text-gray-500"}`}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>

                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {featuredBlogs.map((blog) => (
                      <article
                        key={blog.id}
                        onClick={() => navigate(`/blog/${blog.slug}`)}
                        className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
                      >
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={blog.featured_image_url || blog.image_url || "/assets/no_image_found.jpg"}
                            alt={blog.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute top-4 left-4">
                            <span className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full">
                              Featured
                            </span>
                          </div>
                          <div className="absolute bottom-4 left-4">
                            <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
                              {blog.category?.name || "Uncategorized"}
                            </span>
                          </div>
                        </div>
                        <div className="p-6">
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                            <div className="flex items-center gap-1">
                              <Calendar size={14} />
                              {formatDate(blog.created_at)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock size={14} />
                              {getTimeToRead(blog.content)}
                            </div>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {blog.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 mb-4">
                            {truncateText(blog.excerpt || blog.content, 120)}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {blog.user?.avatar_url && (
                                <img
                                  src={blog.user.avatar_url}
                                  alt={blog.user.name}
                                  className="w-8 h-8 rounded-full"
                                />
                              )}
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {blog.user?.name || "Admin"}
                              </span>
                            </div>
                            <ChevronRight className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {featuredBlogs.map((blog) => (
                      <article
                        key={blog.id}
                        onClick={() => navigate(`/blog/${blog.slug}`)}
                        className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col md:flex-row"
                      >
                        <div className="md:w-1/3 relative">
                          <img
                            src={blog.featured_image_url || blog.image_url || "/assets/no_image_found.jpg"}
                            alt={blog.title}
                            className="w-full h-48 md:h-full object-cover"
                          />
                          <div className="absolute top-4 left-4">
                            <span className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full">
                              Featured
                            </span>
                          </div>
                        </div>
                        <div className="md:w-2/3 p-6">
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-3">
                            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                              {blog.category?.name || "Uncategorized"}
                            </span>
                            <div className="flex items-center gap-1">
                              <Calendar size={14} />
                              {formatDate(blog.created_at)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock size={14} />
                              {getTimeToRead(blog.content)}
                            </div>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {blog.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 mb-4">
                            {truncateText(blog.excerpt || blog.content, 200)}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {blog.user?.avatar_url && (
                                <img
                                  src={blog.user.avatar_url}
                                  alt={blog.user.name}
                                  className="w-8 h-8 rounded-full"
                                />
                              )}
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {blog.user?.name || "Admin"}
                              </span>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1 text-gray-500">
                                <Eye size={16} />
                                <span className="text-sm">{blog.views_count || 0}</span>
                              </div>
                              <ChevronRight className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* All Blogs with Filter */}
            <section>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  All Articles
                  {selectedCategory && (
                    <span className="ml-2 text-blue-600 dark:text-blue-400">
                      ({categories.find(c => c.slug === selectedCategory || c.name === selectedCategory)?.name})
                    </span>
                  )}
                </h2>
                
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleCategorySelect(null)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      !selectedCategory
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.slice(0, 4).map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategorySelect(category.slug)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedCategory === category.slug || selectedCategory === category.name
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                  {categories.length > 4 && (
                    <div className="relative group">
                      <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600">
                        More +
                      </button>
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        {categories.slice(4).map((category) => (
                          <button
                            key={category.id}
                            onClick={() => handleCategorySelect(category.slug)}
                            className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm"
                          >
                            {category.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {blogs.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <BookOpen className="text-gray-400" size={32} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No articles found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {searchQuery 
                      ? `No results for "${searchQuery}"`
                      : selectedCategory
                      ? `No articles in this category yet`
                      : "No articles published yet"}
                  </p>
                  {(searchQuery || selectedCategory) && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedCategory(null);
                        loadBlogs(1);
                      }}
                      className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {blogs.map((blog) => (
                      <article
                        key={blog.id}
                        onClick={() => navigate(`/blog/${blog.slug}`)}
                        className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
                      >
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={blog.image_url || "/assets/no_image_found.jpg"}
                            alt={blog.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute bottom-4 left-4">
                            <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
                              {blog.category?.name || "Uncategorized"}
                            </span>
                          </div>
                        </div>
                        <div className="p-5">
                          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                            <div className="flex items-center gap-1">
                              <Calendar size={12} />
                              {formatDate(blog.created_at)}
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <Eye size={12} />
                                {blog.views_count || 0}
                              </div>
                            </div>
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                            {blog.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                            {truncateText(blog.excerpt || blog.content, 100)}
                          </p>
                          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-2">
                              {blog.user?.avatar_url && (
                                <img
                                  src={blog.user.avatar_url}
                                  alt={blog.user.name}
                                  className="w-8 h-8 rounded-full"
                                />
                              )}
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {blog.user?.name || "Admin"}
                              </span>
                            </div>
                            <ChevronRight size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>

                  {currentPage < totalPages && (
                    <div className="text-center mt-12">
                      <button
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loadingMore ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Loading...
                          </div>
                        ) : (
                          "Load More Articles"
                        )}
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:w-1/3">
            <div className="sticky top-24 space-y-6">
              {/* Popular Articles */}
              {popularBlogs.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="text-amber-500" />
                    Popular Articles
                  </h3>
                  <div className="space-y-4">
                    {popularBlogs.slice(0, 5).map((blog, index) => (
                      <div
                        key={blog.id}
                        onClick={() => navigate(`/blog/${blog.slug}`)}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors group"
                      >
                        <div className="flex-shrink-0 w-15 h-15 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center text-white font-bold">
                          {blog.image_url ? (
                            <img
                              src={blog.image_url}
                              alt={blog.title}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <span>{index + 1}</span>
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                            {blog.title}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <Calendar size={10} />
                            {formatDate(blog.created_at)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Categories */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Tag className="text-purple-500" />
                  Categories
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => handleCategorySelect(null)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                      !selectedCategory
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                        : "hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">All Categories</span>
                      <span className="text-sm bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
                        {statistics?.total_categories || 0}
                      </span>
                    </div>
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategorySelect(category.slug)}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                        selectedCategory === category.slug || selectedCategory === category.name
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                          : "hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{category.name}</span>
                        <span className="text-sm bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
                          {/* You would need to get category counts from API */}
                          {Math.floor(Math.random() * 50) + 1}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Newsletter */}
              <div className="bg-gradient-to-br from-blue-500 to-emerald-500 rounded-2xl p-6 text-white shadow-lg">
                <div className="text-center">
                  <BookOpen className="w-12 h-12 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Stay Updated</h3>
                  <p className="text-blue-100 mb-4">
                    Get the latest articles and news delivered to your inbox
                  </p>
                  <div className="space-y-3">
                    <input
                      type="email"
                      placeholder="Your email address"
                      className="w-full px-4 py-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-blue-100 focus:outline-none focus:ring-2 focus:ring-white"
                    />
                    <button className="w-full px-4 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors">
                      Subscribe Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;