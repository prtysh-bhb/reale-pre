/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { getAnalytics, type AnalyticsData } from "@/api/admin/analytics";
import Loader from "@/components/ui/Loader";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Users,
  Building2,
  MessageCircle,
  Eye,
  DollarSign,
  Award,
  Calendar,
  BarChart3,
} from "lucide-react";

const COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f97316", // orange
];

const AdminAnalyticsDashboardPage = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const data = await getAnalytics(period);
      setAnalytics(data);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !analytics) {
    return (
      <AdminLayout>
        <div className="min-h-screen dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-950 bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center">
          <Loader />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-950 bg-gradient-to-br from-slate-50 to-blue-50/30 min-h-screen">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-600 to-emerald-600 py-6 px-8 rounded-2xl shadow-2xl dark:shadow-black/30 border-0 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10 dark:bg-black/20"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>

          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <BarChart3 className="w-8 h-8" />
                  <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
                </div>
                <p className="text-blue-100/90 text-lg">Visual insights and performance trends</p>
              </div>

              {/* Period Selector */}
              <div className="flex gap-2">
                {[7, 30, 90, 365].map((days) => (
                  <button
                    key={days}
                    onClick={() => setPeriod(days)}
                    className={`px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
                      period === days
                        ? "bg-white text-blue-600 shadow-lg"
                        : "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/30"
                    }`}
                  >
                    {days === 365 ? "1 Year" : `${days} Days`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Conversion Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:bg-gradient-to-br dark:from-gray-800/70 dark:to-gray-800/50 border border-blue-100 dark:border dark:border-blue-900/30 dark:border-gray-700/50 rounded-2xl p-6 shadow-xl dark:shadow-black/30 hover:shadow-2xl dark:hover:shadow-black/40 transition-all duration-300 hover:-translate-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-300 text-sm font-semibold">
                  Total Views
                </p>
                <p className="text-gray-900 dark:text-white text-3xl font-bold mt-2">
                  {analytics.conversion_metrics.total_views.toLocaleString()}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br dark:from-blue-600 dark:to-cyan-600 from-blue-500 to-cyan-500 text-white shadow-lg dark:shadow-black/30">
                <Eye className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:bg-gradient-to-br dark:from-gray-800/70 dark:to-gray-800/50 border border-emerald-100 dark:border dark:border-emerald-900/30 dark:border-gray-700/50 rounded-2xl p-6 shadow-xl dark:shadow-black/30 hover:shadow-2xl dark:hover:shadow-black/40 transition-all duration-300 hover:-translate-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-300 text-sm font-semibold">
                  Total Inquiries
                </p>
                <p className="text-gray-900 dark:text-white text-3xl font-bold mt-2">
                  {analytics.conversion_metrics.total_inquiries.toLocaleString()}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br dark:from-emerald-600 dark:to-green-600 from-emerald-500 to-green-500 text-white shadow-lg dark:shadow-black/30">
                <MessageCircle className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-violet-50 to-purple-50 dark:bg-gradient-to-br dark:from-gray-800/70 dark:to-gray-800/50 border border-violet-100 dark:border dark:border-violet-900/30 dark:border-gray-700/50 rounded-2xl p-6 shadow-xl dark:shadow-black/30 hover:shadow-2xl dark:hover:shadow-black/40 transition-all duration-300 hover:-translate-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-300 text-sm font-semibold">
                  Closed Inquiries
                </p>
                <p className="text-gray-900 dark:text-white text-3xl font-bold mt-2">
                  {analytics.conversion_metrics.closed_inquiries.toLocaleString()}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br dark:from-violet-600 dark:to-purple-600 from-violet-500 to-purple-500 text-white shadow-lg dark:shadow-black/30">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:bg-gradient-to-br dark:from-gray-800/70 dark:to-gray-800/50 border border-amber-100 dark:border dark:border-amber-900/30 dark:border-gray-700/50 rounded-2xl p-6 shadow-xl dark:shadow-black/30 hover:shadow-2xl dark:hover:shadow-black/40 transition-all duration-300 hover:-translate-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-300 text-sm font-semibold">
                  View → Inquiry
                </p>
                <p className="text-gray-900 dark:text-white text-3xl font-bold mt-2">
                  {analytics.conversion_metrics.view_to_inquiry_rate}%
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br dark:from-amber-600 dark:to-yellow-600 from-amber-500 to-yellow-500 text-white shadow-lg dark:shadow-black/30">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:bg-gradient-to-br dark:from-gray-800/70 dark:to-gray-800/50 border border-teal-100 dark:border dark:border-teal-900/30 dark:border-gray-700/50 rounded-2xl p-6 shadow-xl dark:shadow-black/30 hover:shadow-2xl dark:hover:shadow-black/40 transition-all duration-300 hover:-translate-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-300 text-sm font-semibold">
                  Inquiry → Close
                </p>
                <p className="text-gray-900 dark:text-white text-3xl font-bold mt-2">
                  {analytics.conversion_metrics.inquiry_to_close_rate}%
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br dark:from-teal-600 dark:to-emerald-600 from-teal-500 to-emerald-500 text-white shadow-lg dark:shadow-black/30">
                <Award className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* User Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Registrations */}
          <Card className="dark:bg-gray-800/50 bg-white border border-gray-100 dark:border-gray-700/50 shadow-xl dark:shadow-black/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <h3 className="dark:text-white text-gray-900 text-xl font-bold">
                  User Registrations Over Time
                </h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.user_trends.registrations}>
                  <CartesianGrid strokeDasharray="3 3" className="dark:opacity-30" />
                  <XAxis dataKey="date" className="dark:text-gray-400 text-gray-600" />
                  <YAxis className="dark:text-gray-400 text-gray-600" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "none",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stackId="1"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    name="Total"
                  />
                  <Area
                    type="monotone"
                    dataKey="agents"
                    stackId="2"
                    stroke="#10b981"
                    fill="#10b981"
                    name="Agents"
                  />
                  <Area
                    type="monotone"
                    dataKey="customers"
                    stackId="2"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                    name="Customers"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* User Role Distribution */}
          <Card className="dark:bg-gray-800/50 bg-white border border-gray-100 dark:border-gray-700/50 shadow-xl dark:shadow-black/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <h3 className="dark:text-white text-gray-900 text-xl font-bold">
                  User Distribution by Role
                </h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.user_trends.role_distribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.role}: ${entry.count}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analytics.user_trends.role_distribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "none",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Property Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Property Listings */}
          <Card className="dark:bg-gray-800/50 bg-white border border-gray-100 dark:border-gray-700/50 shadow-xl dark:shadow-black/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <h3 className="dark:text-white text-gray-900 text-xl font-bold">
                  Property Listings Trend
                </h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.property_trends.listings}>
                  <CartesianGrid strokeDasharray="3 3" className="dark:opacity-30" />
                  <XAxis dataKey="date" className="dark:text-gray-400 text-gray-600" />
                  <YAxis className="dark:text-gray-400 text-gray-600" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "none",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Total"
                  />
                  <Line
                    type="monotone"
                    dataKey="published"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Published"
                  />
                  <Line
                    type="monotone"
                    dataKey="sold"
                    stroke="#ef4444"
                    strokeWidth={2}
                    name="Sold"
                  />
                  <Line
                    type="monotone"
                    dataKey="rented"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    name="Rented"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Property Status Distribution */}
          <Card className="dark:bg-gray-800/50 bg-white border border-gray-100 dark:border-gray-700/50 shadow-xl dark:shadow-black/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-rose-500 to-pink-500 rounded-lg">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <h3 className="dark:text-white text-gray-900 text-xl font-bold">
                  Properties by Status
                </h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.property_trends.status_summary}>
                  <CartesianGrid strokeDasharray="3 3" className="dark:opacity-30" />
                  <XAxis dataKey="status" className="dark:text-gray-400 text-gray-600" />
                  <YAxis className="dark:text-gray-400 text-gray-600" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "none",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="count" fill="#3b82f6" name="Count" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Inquiry and View Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Inquiry Trends */}
          <Card className="dark:bg-gray-800/50 bg-white border border-gray-100 dark:border-gray-700/50 shadow-xl dark:shadow-black/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <h3 className="dark:text-white text-gray-900 text-xl font-bold">Inquiry Trends</h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.inquiry_trends.trends}>
                  <CartesianGrid strokeDasharray="3 3" className="dark:opacity-30" />
                  <XAxis dataKey="date" className="dark:text-gray-400 text-gray-600" />
                  <YAxis className="dark:text-gray-400 text-gray-600" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "none",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="new"
                    stackId="1"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    name="New"
                  />
                  <Area
                    type="monotone"
                    dataKey="contacted"
                    stackId="1"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                    name="Contacted"
                  />
                  <Area
                    type="monotone"
                    dataKey="closed"
                    stackId="1"
                    stroke="#10b981"
                    fill="#10b981"
                    name="Closed"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Property Views */}
          <Card className="dark:bg-gray-800/50 bg-white border border-gray-100 dark:border-gray-700/50 shadow-xl dark:shadow-black/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-lg">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                <h3 className="dark:text-white text-gray-900 text-xl font-bold">
                  Property Views Over Time
                </h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.view_trends.trends}>
                  <CartesianGrid strokeDasharray="3 3" className="dark:opacity-30" />
                  <XAxis dataKey="date" className="dark:text-gray-400 text-gray-600" />
                  <YAxis className="dark:text-gray-400 text-gray-600" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "none",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    name="Views"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Financial Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Revenue */}
          <Card className="dark:bg-gray-800/50 bg-white border border-gray-100 dark:border-gray-700/50 shadow-xl dark:shadow-black/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <h3 className="dark:text-white text-gray-900 text-xl font-bold">
                  Payment Revenue Trend
                </h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.financial_trends.payments}>
                  <CartesianGrid strokeDasharray="3 3" className="dark:opacity-30" />
                  <XAxis dataKey="date" className="dark:text-gray-400 text-gray-600" />
                  <YAxis className="dark:text-gray-400 text-gray-600" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "none",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="total_amount"
                    stroke="#10b981"
                    fill="#10b981"
                    name="Revenue ($)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Subscriptions */}
          <Card className="dark:bg-gray-800/50 bg-white border border-gray-100 dark:border-gray-700/50 shadow-xl dark:shadow-black/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <h3 className="dark:text-white text-gray-900 text-xl font-bold">
                  New Subscriptions
                </h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.financial_trends.subscriptions}>
                  <CartesianGrid strokeDasharray="3 3" className="dark:opacity-30" />
                  <XAxis dataKey="date" className="dark:text-gray-400 text-gray-600" />
                  <YAxis className="dark:text-gray-400 text-gray-600" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "none",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="count" fill="#8b5cf6" name="Subscriptions" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Agent Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Agents by Properties */}
          <Card className="dark:bg-gray-800/50 bg-white border border-gray-100 dark:border-gray-700/50 shadow-xl dark:shadow-black/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <h3 className="dark:text-white text-gray-900 text-xl font-bold">
                  Top Agents by Properties
                </h3>
              </div>
              <div className="space-y-3">
                {analytics.agent_performance.by_properties.slice(0, 5).map((agent, index) => (
                  <div
                    key={agent.id}
                    className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:bg-gradient-to-br dark:from-gray-800/70 dark:to-gray-800/50 dark:border-gray-700/50 border border-gray-100 rounded-xl p-4 shadow-sm dark:shadow-black/20 hover:shadow-md dark:hover:shadow-black/30 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-full flex items-center justify-center font-bold shadow-md dark:shadow-black/30">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-gray-900 dark:text-white font-semibold">
                            {agent.name}
                          </p>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">{agent.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          {agent.properties_count}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Properties</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Agents by Inquiries */}
          <Card className="dark:bg-gray-800/50 bg-white border border-gray-100 dark:border-gray-700/50 shadow-xl dark:shadow-black/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <h3 className="dark:text-white text-gray-900 text-xl font-bold">
                  Top Agents by Inquiries
                </h3>
              </div>
              <div className="space-y-3">
                {analytics.agent_performance.by_inquiries.slice(0, 5).map((agent, index) => (
                  <div
                    key={agent.id}
                    className="bg-gradient-to-br from-emerald-50 to-green-50 dark:bg-gradient-to-br dark:from-gray-800/70 dark:to-gray-800/50 dark:border-gray-700/50 border border-gray-100 rounded-xl p-4 shadow-sm dark:shadow-black/20 hover:shadow-md dark:hover:shadow-black/30 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-500 text-white rounded-full flex items-center justify-center font-bold shadow-md dark:shadow-black/30">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-gray-900 dark:text-white font-semibold">
                            {agent.name}
                          </p>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">{agent.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                          {agent.inquiries_count}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Inquiries</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Rated Agents */}
          <Card className="dark:bg-gray-800/50 bg-white border border-gray-100 dark:border-gray-700/50 shadow-xl dark:shadow-black/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-lg">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <h3 className="dark:text-white text-gray-900 text-xl font-bold">
                  Top Rated Agents
                </h3>
              </div>
              <div className="space-y-3">
                {analytics.agent_performance.top_rated.slice(0, 5).map((agent, index) => (
                  <div
                    key={agent.id}
                    className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:bg-gradient-to-br dark:from-gray-800/70 dark:to-gray-800/50 dark:border-gray-700/50 border border-gray-100 rounded-xl p-4 shadow-sm dark:shadow-black/20 hover:shadow-md dark:hover:shadow-black/30 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-yellow-500 text-white rounded-full flex items-center justify-center font-bold shadow-md dark:shadow-black/30">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-gray-900 dark:text-white font-semibold">
                            {agent.name}
                          </p>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">
                            {agent.review_count} reviews
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                          {Number(agent.avg_rating).toFixed(1)} ★
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Rating</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Property Type Distribution */}
        <Card className="dark:bg-gray-800/50 bg-white border border-gray-100 dark:border-gray-700/50 shadow-xl dark:shadow-black/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <h3 className="dark:text-white text-gray-900 text-xl font-bold">
                Properties by Type
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.property_trends.type_distribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="dark:opacity-30" />
                <XAxis type="number" className="dark:text-gray-400 text-gray-600" />
                <YAxis
                  dataKey="type"
                  type="category"
                  width={100}
                  className="dark:text-gray-400 text-gray-600"
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px" }}
                />
                <Legend />
                <Bar dataKey="count" fill="#3b82f6" name="Count" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Viewed Properties */}
        <Card className="dark:bg-gray-800/50 bg-white border border-gray-100 dark:border-gray-700/50 shadow-xl dark:shadow-black/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <h3 className="dark:text-white text-gray-900 text-xl font-bold">
                Most Viewed Properties
              </h3>
            </div>
            <div className="space-y-3">
              {analytics.view_trends.top_properties.slice(0, 10).map((item, index) => (
                <div
                  key={item.property_id}
                  className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:bg-gradient-to-br dark:from-gray-800/70 dark:to-gray-800/50 dark:border-gray-700/50 border border-gray-100 rounded-xl p-4 shadow-sm dark:shadow-black/20 hover:shadow-md dark:hover:shadow-black/30 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-full flex items-center justify-center font-bold shadow-md dark:shadow-black/30">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-gray-900 dark:text-white font-semibold">
                          {item.property?.title || `Property #${item.property_id}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                        {item.view_count.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Views</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalyticsDashboardPage;
