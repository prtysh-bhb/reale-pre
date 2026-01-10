/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/public/SingleBlogPage.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar,
  Eye,
  Clock,
  ChevronLeft,
  Bookmark,
  MessageCircle,
  Facebook,
  Twitter,
  Linkedin,
  Link as LinkIcon,
  ChevronRight,
  Send,
  User,
  Loader2,
  Trash2,
  Edit,
  Check,
  X,
} from "lucide-react";
import { getBlogBySlug, getRelatedBlogs, Blog } from "@/api/customer/cms";
import { 
  getBlogCommentsBySlug, 
  addBlogComment, 
  updateMyComment, 
  deleteMyComment,
  BlogComment,
  CommentUser 
} from "@/api/customer/cms";
import { toast } from "sonner";

const SingleBlogPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  // Comments state
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editCommentText, setEditCommentText] = useState("");

  // Simulate logged-in user (replace with actual auth)
  const [currentUser] = useState<CommentUser | null>({
    id: 1, // Replace with actual user ID from auth
    name: "John Doe",
    avatar_url: null,
  });

  useEffect(() => {
    if (slug) {
      loadBlog();
      setShareUrl(window.location.href);
    }
  }, [slug]);

  useEffect(() => {
    if (blog) {
      loadComments();
    }
  }, [blog]);

  useEffect(() => {
    if (!blog) return;

    const key = `blog_viewed_${blog.id}`;
    if (sessionStorage.getItem(key)) return;

    sessionStorage.setItem(key, "1");
    // await incrementViewCount(blog.id);
  }, [blog?.id]);

  const loadBlog = async () => {
    try {
      setLoading(true);
      const response = await getBlogBySlug(slug!);

      if (response.data.status !== "approved") {
        toast.error("This blog is not available");
        navigate("/blog");
        return;
      }

      setBlog(response.data);

      // Load related blogs
      const relatedResponse = await getRelatedBlogs(slug!);
      setRelatedBlogs(relatedResponse.data.filter((b) => b.status === "approved"));

      // Increment view count (you might want to call an API endpoint for this)
      // await incrementViewCount(response.data.id);
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast.error("Blog not found");
        navigate("/blog");
      } else {
        toast.error("Failed to load blog");
      }
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    if (!blog || loadingComments) return;

    try {
      setLoadingComments(true);
      const response = await getBlogCommentsBySlug(slug!);
      
      // Show only approved comments
      const approvedComments = response.data.filter((comment: { is_approved: any; }) => comment.is_approved);
      setComments(approvedComments);
      
    } catch (error) {
      toast.error("Failed to load comments");
      console.error("Error loading comments:", error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !blog) return;

    setSubmittingComment(true);
    try {
      const response = await addBlogComment(blog.id, { comment: newComment.trim() });
      
      if (response.success) {
        // Add the new comment to the list
        setComments(prev => [response.data, ...prev]);
        setNewComment("");
        toast.success(response.message || "Comment posted successfully!");
      } else {
        toast.error(response.message || "Failed to post comment");
      }
      
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to post comment");
      console.error("Error posting comment:", error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      const response = await deleteMyComment(commentId);
      
      if (response.success) {
        setComments(prev => prev.filter(comment => comment.id !== commentId));
        toast.success(response.message || "Comment deleted successfully!");
      } else {
        toast.error(response.message || "Failed to delete comment");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete comment");
    }
  };

  const handleStartEdit = (comment: BlogComment) => {
    setEditingCommentId(comment.id);
    setEditCommentText(comment.comment);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditCommentText("");
  };

  const handleSaveEdit = async (commentId: number) => {
    if (!editCommentText.trim()) return;

    try {
      const response = await updateMyComment(commentId, { comment: editCommentText });
      
      if (response.success) {
        setComments(prev => prev.map(comment => 
          comment.id === commentId 
            ? response.data 
            : comment
        ));
        setEditingCommentId(null);
        setEditCommentText("");
        toast.success(response.message || "Comment updated successfully!");
      } else {
        toast.error(response.message || "Failed to update comment");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update comment");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeToRead = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  };

  const handleShare = (platform: string) => {
    const title = blog?.title || "";
    const text = blog?.excerpt || "";

    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        title
      )}&url=${encodeURIComponent(shareUrl)}`,
      linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
        shareUrl
      )}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(text)}`,
    };

    if (platform in urls) {
      window.open(urls[platform as keyof typeof urls], "_blank", "width=600,height=400");
    } else if (platform === "copy") {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
    // Save to local storage or call API
    toast.success(bookmarked ? "Removed from bookmarks" : "Added to bookmarks");
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

  if (!blog) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Blog Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The blog you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/blog")}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 mx-auto"
          >
            <ChevronLeft size={20} />
            Back to Blogs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/blog")}
              className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <ChevronLeft size={20} />
              Back to Blogs
            </button>
            <div className="flex items-center gap-4">
              <button
                onClick={handleBookmark}
                className={`p-2 rounded-lg transition-colors ${
                  bookmarked
                    ? "text-amber-500 hover:text-amber-600"
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
                title={bookmarked ? "Remove bookmark" : "Bookmark"}
              >
                <Bookmark fill={bookmarked ? "currentColor" : "none"} size={20} />
              </button>
              <button
                onClick={() => handleShare("copy")}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                title="Copy link"
              >
                <LinkIcon size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-8">
            <nav className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <button
                onClick={() => navigate("/")}
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Home
              </button>
              <ChevronRight size={14} />
              <button
                onClick={() => navigate("/blog")}
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Blog
              </button>
              <ChevronRight size={14} />
              {blog.category && (
                <>
                  <button
                    onClick={() => navigate(`/blog?category=${blog.category?.slug}`)}
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {blog.category.name}
                  </button>
                  <ChevronRight size={14} />
                </>
              )}
              <span className="text-gray-900 dark:text-white font-medium truncate">
                {blog.title}
              </span>
            </nav>
          </div>

          {/* Article Header */}
          <header className="mb-8">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              {blog.category && (
                <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium">
                  {blog.category.name}
                </span>
              )}
              {blog.is_featured && (
                <span className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full text-sm font-medium">
                  Featured
                </span>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              {blog.title}
            </h1>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div>
                  <div className="flex items-center gap-4">
                    {blog.user?.avatar_url && (
                      <img
                        src={blog.user.avatar_url}
                        alt={blog.user.name}
                        className="w-12 h-12 rounded-full"
                      />
                    )}
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {blog.user?.name || "Admin"}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          {formatDate(blog.created_at)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          {getTimeToRead(blog.content)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-gray-500">
                  <Eye size={20} />
                  <span className="font-medium">{blog.views_count || 0}</span>
                </div>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          {blog.image_url && (
            <div className="mb-8 rounded-2xl overflow-hidden">
              <img
                src={blog.image_url}
                alt={blog.title}
                className="w-full h-auto max-h-[600px] object-cover"
              />
            </div>
          )}

          <div className="my-4 text-2xl font-semibold text-gray-900 dark:text-white">
            Images
            <div className="w-full grid grid-cols-3 gap-4 mt-4">
              {blog.image && (
                <div className="mb-8 rounded-2xl overflow-hidden">
                  <img
                    src={`http://127.0.0.1:8000/storage/${blog.image}`}
                    alt={blog.title}
                    className="w-full h-auto max-h-[600px] object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Article Content */}
          <article className="prose prose-lg dark:prose-invert max-w-none mb-12">
            <div dangerouslySetInnerHTML={{ __html: blog.content }} className="blog-content" />
          </article>

          {/* Tags & Share */}
          <div className="border-t border-b border-gray-200 dark:border-gray-800 py-6 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Share this article:
                </h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleShare("facebook")}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    title="Share on Facebook"
                  >
                    <Facebook size={18} />
                  </button>
                  <button
                    onClick={() => handleShare("twitter")}
                    className="p-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                    title="Share on Twitter"
                  >
                    <Twitter size={18} />
                  </button>
                  <button
                    onClick={() => handleShare("linkedin")}
                    className="p-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
                    title="Share on LinkedIn"
                  >
                    <Linkedin size={18} />
                  </button>
                  <button
                    onClick={() => handleShare("copy")}
                    className="p-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    title="Copy link"
                  >
                    <LinkIcon size={18} />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Tags:</h3>
                <div className="flex flex-wrap gap-2">
                  {blog.meta_tags?.keywords?.split(",").map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                    >
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Author Bio */}
          {blog.user?.email && (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 mb-12">
              <div className="flex items-start gap-4">
                {blog.user.avatar_url && (
                  <img
                    src={blog.user.avatar_url}
                    alt={blog.user.name}
                    className="w-15 h-15 rounded-full"
                  />
                )}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    About {blog.user.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">{blog.user.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Related Articles */}
          {relatedBlogs.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Related Articles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedBlogs.slice(0, 3).map((relatedBlog) => (
                  <article
                    key={relatedBlog.id}
                    onClick={() => navigate(`/blog/${relatedBlog.slug}`)}
                    className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
                  >
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={relatedBlog.image_url || "/assets/no_image_found.jpg"}
                        alt={relatedBlog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
                        <Calendar size={12} />
                        {formatDate(relatedBlog.created_at)}
                      </div>
                      <h3 className="font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                        {relatedBlog.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                        {relatedBlog.excerpt?.replace(/<[^>]*>/g, "").substring(0, 100) || ""}...
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Comments Section */}
          <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-12">
            <div className="flex items-center gap-2 mb-6">
              <MessageCircle className="text-gray-500" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Comments ({comments.length})
              </h2>
            </div>

            {/* Comment form */}
            <div className="mb-8">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  {currentUser ? (
                    currentUser.avatar_url ? (
                      <img
                        src={currentUser.avatar_url || "/default-avatar.png"}
                        alt={currentUser.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span>{currentUser.avatar_url}</span>
                    )
                  ) : (
                    <User size={20} />
                  )}
                </div>
                <div className="flex-1">
                  <textarea
                    placeholder="Share your thoughts..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={3}
                    disabled={submittingComment}
                  />
                  <div className="flex justify-end mt-3">
                    <button
                      onClick={handleSubmitComment}
                      disabled={!newComment.trim() || submittingComment}
                      className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                    >
                      {submittingComment ? (
                        <>
                          <Loader2 className="animate-spin" size={16} />
                          Posting...
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          Post Comment
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments list */}
            <div className="space-y-6">
              {loadingComments && comments.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="animate-spin text-blue-500" size={24} />
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="mx-auto text-gray-400 mb-3" size={32} />
                  <p className="text-gray-500 dark:text-gray-400">
                    No comments yet. Be the first to share your thoughts!
                  </p>
                </div>
              ) : (
                <>
                  {comments.map((comment) => {
                    const isOwner = currentUser && comment.user_id === currentUser.id;
                    const commentUser = comment.user || { 
                      id: comment.user_id, 
                      name: "User", 
                      avatar_url: null 
                    };

                    return (
                      <div
                        key={comment.id}
                        className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0 group"
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                              {commentUser.avatar_url ? (
                                <img
                                  src={commentUser.avatar_url}
                                  alt={commentUser.name}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <span>{commentUser.name.charAt(0).toUpperCase()}</span>
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 dark:text-white">
                                {commentUser.name}
                                {comment.user_id === blog.user?.id && (
                                  <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
                                    Author
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {formatDate(comment.created_at)}
                                {comment.updated_at !== comment.created_at && (
                                  <span className="ml-2 text-xs italic">(edited)</span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Comment actions - only show for owner */}
                          {isOwner && (
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              {editingCommentId === comment.id ? (
                                <>
                                  <button
                                    onClick={() => handleSaveEdit(comment.id)}
                                    className="p-1 text-green-600 hover:text-green-700 transition-colors"
                                    title="Save changes"
                                  >
                                    <Check size={14} />
                                  </button>
                                  <button
                                    onClick={handleCancelEdit}
                                    className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                                    title="Cancel"
                                  >
                                    <X size={14} />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleStartEdit(comment)}
                                    className="p-1 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                    title="Edit comment"
                                  >
                                    <Edit size={14} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteComment(comment.id)}
                                    className="p-1 text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                    title="Delete comment"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>

                        {editingCommentId === comment.id ? (
                          <div className="mt-3">
                            <textarea
                              value={editCommentText}
                              onChange={(e) => setEditCommentText(e.target.value)}
                              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                              rows={3}
                            />
                          </div>
                        ) : (
                          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {comment.comment}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SingleBlogPage;