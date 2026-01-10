/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { getPropertyStats } from "@/api/admin/property";
import { Card, CardContent } from "@/components/ui/card";
import AdminLayout from "@/components/layout/admin/AdminLayout";
import {
  Loader2,
  Home,
  BarChart3,
  Building2,
  CheckCircle2,
  XCircle,
  Clock4,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const PropertyStats = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPropertyStats()
      .then((data) => setStats(data))
      .catch(() => console.error("Failed to load stats"))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <AdminLayout>
        <div className="flex justify-center items-center min-h-[70vh]">
          <div className="text-center space-y-4">
            <Loader2 className="w-16 h-16 text-blue-600 dark:text-emerald-400 animate-spin mx-auto" />
            <p className="text-gray-500 dark:text-gray-400">Loading statistics...</p>
          </div>
        </div>
      </AdminLayout>
    );

  if (!stats)
    return (
      <AdminLayout>
        <div className="flex flex-col justify-center items-center min-h-[70vh] text-gray-500 dark:text-gray-400">
          <Home className="w-16 h-16 mb-3 text-gray-400" />
          <p className="font-medium">No statistics available.</p>
        </div>
      </AdminLayout>
    );

  const statItems = [
    {
      label: "Total Properties",
      value: stats.total,
      icon: Building2,
      bgColor: "bg-blue-500/10 dark:bg-blue-500/20",
      iconColor: "text-blue-600 dark:text-blue-400",
      borderColor: "border-blue-200 dark:border-blue-800",
      change: "+12%",
      trend: "up",
    },
    {
      label: "Published",
      value: stats.published,
      icon: CheckCircle2,
      bgColor: "bg-emerald-500/10 dark:bg-emerald-500/20",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      borderColor: "border-emerald-200 dark:border-emerald-800",
      change: "+8%",
      trend: "up",
    },
    {
      label: "Pending Approval",
      value: stats.pending_approval,
      icon: Clock4,
      bgColor: "bg-amber-500/10 dark:bg-amber-500/20",
      iconColor: "text-amber-600 dark:text-amber-400",
      borderColor: "border-amber-200 dark:border-amber-800",
      change: "-5%",
      trend: "down",
    },
    {
      label: "Approved",
      value: stats.approved,
      icon: TrendingUp,
      bgColor: "bg-teal-500/10 dark:bg-teal-500/20",
      iconColor: "text-teal-600 dark:text-teal-400",
      borderColor: "border-teal-200 dark:border-teal-800",
      change: "+15%",
      trend: "up",
    },
    {
      label: "Rejected",
      value: stats.rejected,
      icon: XCircle,
      bgColor: "bg-red-500/10 dark:bg-red-500/20",
      iconColor: "text-red-600 dark:text-red-400",
      borderColor: "border-red-200 dark:border-red-800",
      change: "-3%",
      trend: "down",
    },
    {
      label: "Sold",
      value: stats.sold,
      icon: DollarSign,
      bgColor: "bg-purple-500/10 dark:bg-purple-500/20",
      iconColor: "text-purple-600 dark:text-purple-400",
      borderColor: "border-purple-200 dark:border-purple-800",
      change: "+22%",
      trend: "up",
    },
    {
      label: "Rented",
      value: stats.rented,
      icon: BarChart3,
      bgColor: "bg-indigo-500/10 dark:bg-indigo-500/20",
      iconColor: "text-indigo-600 dark:text-indigo-400",
      borderColor: "border-indigo-200 dark:border-indigo-800",
      change: "+18%",
      trend: "up",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3 mr-auto">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-xl">
                <Building2 className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-semibold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                  Property Statistics
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Overview of all property metrics and performance
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-950/30 dark:to-emerald-950/30 rounded-lg border border-blue-100 dark:border-emerald-900/50">
              <BarChart3 className="text-blue-600 dark:text-emerald-400" size={16} />
              <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                Live Stats
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {statItems.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.label}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-800 transition-all group overflow-hidden"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`p-3 rounded-xl ${item.bgColor} group-hover:scale-110 transition-transform`}
                    >
                      <Icon className={`${item.iconColor}`} size={24} />
                    </div>
                    <div
                      className={`flex items-center gap-0.5 text-xs font-semibold ${
                        item.trend === "up"
                          ? "text-emerald-600 dark:text-emerald-500"
                          : "text-red-600 dark:text-red-500"
                      }`}
                    >
                      {item.trend === "up" ? (
                        <ArrowUpRight size={14} />
                      ) : (
                        <ArrowDownRight size={14} />
                      )}
                      <span>{item.change}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      {item.label}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {item.value?.toLocaleString() || 0}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Summary Card */}
        <Card className="bg-gradient-to-br from-blue-50 to-emerald-50 dark:from-blue-950/20 dark:to-emerald-950/20 border border-blue-100 dark:border-blue-900/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-md">
                <TrendingUp className="text-blue-600 dark:text-emerald-400" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Performance Summary
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Overall property portfolio health
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Approval Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}%
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Sold/Rented</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(stats.sold + stats.rented)?.toLocaleString() || 0}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Active Listings</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.published?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default PropertyStats;
