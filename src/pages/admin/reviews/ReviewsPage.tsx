import { useState } from "react";
import AdminLayout from "@/components/layout/admin/AdminLayout";
import { MessageSquare, Search, Star, Eye, Trash2, Filter } from "lucide-react";

const ReviewsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRating, setFilterRating] = useState("all");

  // Mock data - replace with actual API call
  const reviews = [
    {
      id: 1,
      customerName: "Alice Brown",
      propertyTitle: "Luxury Penthouse",
      rating: 5,
      comment: "Absolutely stunning property! The views are breathtaking and the amenities are top-notch. Highly recommend!",
      date: "2024-01-15",
      status: "published"
    },
    {
      id: 2,
      customerName: "Bob Taylor",
      propertyTitle: "Beach House",
      rating: 4,
      comment: "Great location and beautiful property. The only minor issue was the WiFi speed, but overall fantastic experience.",
      date: "2024-01-12",
      status: "published"
    },
    {
      id: 3,
      customerName: "Carol White",
      propertyTitle: "Downtown Apartment",
      rating: 5,
      comment: "Perfect for city living! Close to everything we needed. The property manager was very responsive.",
      date: "2024-01-10",
      status: "pending"
    },
    {
      id: 4,
      customerName: "David Green",
      propertyTitle: "Suburban House",
      rating: 3,
      comment: "Good property but needs some maintenance. The garden could use more attention.",
      date: "2024-01-08",
      status: "published"
    },
  ];

  const filteredReviews = reviews.filter(r => {
    const matchesSearch = r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         r.propertyTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         r.comment.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterRating === "all" || r.rating.toString() === filterRating;
    return matchesSearch && matchesFilter;
  });

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        size={16}
        className={index < rating ? "text-amber-500 fill-amber-500" : "text-gray-300 dark:text-gray-600"}
      />
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "pending":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const averageRating = (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-xl">
                <MessageSquare className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-semibold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                  Reviews
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Manage customer reviews and ratings
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 shadow-sm hover:border-blue-400 dark:hover:border-emerald-600 transition-all">
                <Search size={16} className="text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Search reviews..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent outline-none text-sm text-gray-900 dark:text-white w-48 placeholder-gray-500"
                />
              </div>

              <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 shadow-sm">
                <Filter size={16} className="text-gray-400 mr-2" />
                <select
                  value={filterRating}
                  onChange={(e) => setFilterRating(e.target.value)}
                  className="bg-transparent outline-none text-sm text-gray-700 dark:text-gray-200 cursor-pointer"
                >
                  <option value="all">All Ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-emerald-50 dark:from-blue-950/20 dark:to-emerald-950/20 p-6 rounded-xl border border-blue-100 dark:border-blue-900/50">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Reviews</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{reviews.length}</p>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-emerald-50 dark:from-amber-950/20 dark:to-emerald-950/20 p-6 rounded-xl border border-amber-100 dark:border-amber-900/50">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Average Rating</p>
            <div className="flex items-center gap-2">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{averageRating}</p>
              <div className="flex">{renderStars(Math.round(parseFloat(averageRating)))}</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-950/20 dark:to-blue-950/20 p-6 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Pending Approval</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {reviews.filter(r => r.status === "pending").length}
            </p>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div
              key={review.id}
              className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white font-bold">
                    {review.customerName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{review.customerName}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{review.propertyTitle}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex">{renderStars(review.rating)}</div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(review.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(review.status)}`}>
                    {review.status.toUpperCase()}
                  </span>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-4">{review.comment}</p>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-sm transition-all">
                  <Eye size={14} />
                  View Details
                </button>
                {review.status === "pending" && (
                  <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-sm transition-all">
                    Approve
                  </button>
                )}
                <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 text-sm transition-all">
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default ReviewsPage;
