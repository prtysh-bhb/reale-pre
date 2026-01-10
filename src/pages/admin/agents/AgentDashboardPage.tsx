/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import api from "@/api/axios";
import { getProfile } from "@/api/admin/profileApi";
import { 
  BarChart3, 
  Building2, 
  CheckCircle2, 
  XCircle, 
  Clock4, 
  DollarSign, 
  NotebookPen,
  Users,
  MessageCircle,
  Home,
  TrendingUp,
  Eye,
  Calendar,
  Target,
  Award,
  Rocket,
  ArrowRight,
  Clock
} from "lucide-react";
import { formatAmount, formatReadableDate } from "@/helpers/customer_helper";
import { Link } from "react-router-dom";
import Loader from "@/components/ui/Loader";

export interface DashboardResponse {
  success: boolean;
  role: string;
  message: string;
  data: {
    stats: {
      properties: {
        total: number;
        published: number;
        draft: number;
        sold: number;
        rented: number;
        pending_approval: number;
        approved: number;
        rejected: number;
        this_month: number;
      };
      inquiries: {
        total: number;
        new: number;
        contacted: number;
        closed: number;
        recent: number;
        this_month: number;
      };
    };
    recent_properties: RecentProperty[];
    recent_inquiries: RecentInquiry[];
    top_properties: TopProperty[];
  };
}

export interface RecentProperty {
  id: number;
  title: string;
  price: number;
  status: string;
  approval_status: string;
  created_at: string;
}

export interface RecentInquiry {
  id: number;
  property_id: number;
  customer_id: number;
  status: string;
  created_at: string;
  property: {
    id: number;
    title: string;
  };
  customer: {
    id: number;
    name: string;
    email: string;
  };
}

export interface TopProperty {
  id: number;
  title: string;
  price: number;
  status: string;
  inquiries_count: number;
}

const AgentDashboardPage = () => {
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);

        const profileRes = await getProfile();
        const user = profileRes.data.data.user;
        setProfile(user);

        const res = await api.get<DashboardResponse>("/agent/dashboard");
        setDashboardData(res.data);

      } catch (err: any) {
        console.error("Error fetching dashboard:", err);
        if (err.response?.status === 403) {
          setError("Access denied. You are not authorized to view this dashboard.");
        } else {
          setError("Failed to fetch dashboard data.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const stats = dashboardData?.data.stats;
  const recentProperties = dashboardData?.data.recent_properties || [];
  const recentInquiries = dashboardData?.data.recent_inquiries || [];
  const topProperties = dashboardData?.data.top_properties || [];

  // Property Statistics Cards with vibrant colors (dark mode compatible)
  const propertyStats = [
    { 
      label: "Total Properties", 
      value: stats?.properties?.total ?? 0, 
      icon: Building2, 
      color: "dark:text-blue-300 text-blue-600", 
      bgColor: "dark:from-blue-600 dark:to-cyan-600 from-blue-500 to-cyan-500",
      cardGradientLight: "from-blue-50 to-cyan-50",
      cardGradientDark: "dark:from-gray-800/70 dark:to-gray-800/50 dark:border-gray-700/50",
      borderColorLight: "border-blue-100",
      borderColorDark: "dark:border-blue-900/30"
    },
    { 
      label: "Published", 
      value: stats?.properties?.published ?? 0, 
      icon: CheckCircle2, 
      color: "dark:text-emerald-300 text-emerald-600", 
      bgColor: "dark:from-emerald-600 dark:to-green-600 from-emerald-500 to-green-500",
      cardGradientLight: "from-emerald-50 to-green-50",
      cardGradientDark: "dark:from-gray-800/70 dark:to-gray-800/50 dark:border-gray-700/50",
      borderColorLight: "border-emerald-100",
      borderColorDark: "dark:border-emerald-900/30"
    },
    { 
      label: "Pending Approval", 
      value: stats?.properties?.pending_approval ?? 0, 
      icon: Clock4, 
      color: "dark:text-amber-300 text-amber-600", 
      bgColor: "dark:from-amber-600 dark:to-orange-600 from-amber-500 to-orange-500",
      cardGradientLight: "from-amber-50 to-orange-50",
      cardGradientDark: "dark:from-gray-800/70 dark:to-gray-800/50 dark:border-gray-700/50",
      borderColorLight: "border-amber-100",
      borderColorDark: "dark:border-amber-900/30"
    },
    { 
      label: "Approved", 
      value: stats?.properties?.approved ?? 0, 
      icon: BarChart3, 
      color: "dark:text-teal-300 text-teal-600", 
      bgColor: "dark:from-teal-600 dark:to-cyan-600 from-teal-500 to-cyan-500",
      cardGradientLight: "from-teal-50 to-cyan-50",
      cardGradientDark: "dark:from-gray-800/70 dark:to-gray-800/50 dark:border-gray-700/50",
      borderColorLight: "border-teal-100",
      borderColorDark: "dark:border-teal-900/30"
    },
    { 
      label: "Sold", 
      value: stats?.properties?.sold ?? 0, 
      icon: DollarSign, 
      color: "dark:text-violet-300 text-violet-600", 
      bgColor: "dark:from-violet-600 dark:to-purple-600 from-violet-500 to-purple-500",
      cardGradientLight: "from-violet-50 to-purple-50",
      cardGradientDark: "dark:from-gray-800/70 dark:to-gray-800/50 dark:border-gray-700/50",
      borderColorLight: "border-violet-100",
      borderColorDark: "dark:border-violet-900/30"
    },
    { 
      label: "Rented", 
      value: stats?.properties?.rented ?? 0, 
      icon: Home, 
      color: "dark:text-indigo-300 text-indigo-600", 
      bgColor: "dark:from-indigo-600 dark:to-blue-600 from-indigo-500 to-blue-500",
      cardGradientLight: "from-indigo-50 to-blue-50",
      cardGradientDark: "dark:from-gray-800/70 dark:to-gray-800/50 dark:border-gray-700/50",
      borderColorLight: "border-indigo-100",
      borderColorDark: "dark:border-indigo-900/30"
    },
  ];

  // Inquiry Statistics Cards with vibrant colors (dark mode compatible)
  const inquiryStats = [
    { 
      label: "Total Inquiries", 
      value: stats?.inquiries?.total ?? 0, 
      icon: MessageCircle, 
      color: "dark:text-rose-300 text-rose-600", 
      bgColor: "dark:from-rose-600 dark:to-pink-600 from-rose-500 to-pink-500",
      cardGradientLight: "from-rose-50 to-pink-50",
      cardGradientDark: "dark:from-gray-800/70 dark:to-gray-800/50 dark:border-gray-700/50",
      borderColorLight: "border-rose-100",
      borderColorDark: "dark:border-rose-900/30"
    },
    { 
      label: "New Inquiries", 
      value: stats?.inquiries?.new ?? 0, 
      icon: Users, 
      color: "dark:text-fuchsia-300 text-fuchsia-600", 
      bgColor: "dark:from-fuchsia-600 dark:to-purple-600 from-fuchsia-500 to-purple-500",
      cardGradientLight: "from-fuchsia-50 to-purple-50",
      cardGradientDark: "dark:from-gray-800/70 dark:to-gray-800/50 dark:border-gray-700/50",
      borderColorLight: "border-fuchsia-100",
      borderColorDark: "dark:border-fuchsia-900/30"
    },
    { 
      label: "Contacted", 
      value: stats?.inquiries?.contacted ?? 0, 
      icon: CheckCircle2, 
      color: "dark:text-lime-300 text-lime-600", 
      bgColor: "dark:from-lime-600 dark:to-green-600 from-lime-500 to-green-500",
      cardGradientLight: "from-lime-50 to-green-50",
      cardGradientDark: "dark:from-gray-800/70 dark:to-gray-800/50 dark:border-gray-700/50",
      borderColorLight: "border-lime-100",
      borderColorDark: "dark:border-lime-900/30"
    },
    { 
      label: "Closed", 
      value: stats?.inquiries?.closed ?? 0, 
      icon: NotebookPen, 
      color: "dark:text-slate-300 text-slate-600", 
      bgColor: "dark:from-slate-600 dark:to-gray-600 from-slate-500 to-gray-500",
      cardGradientLight: "from-slate-50 to-gray-50",
      cardGradientDark: "dark:from-gray-800/70 dark:to-gray-800/50 dark:border-gray-700/50",
      borderColorLight: "border-slate-100",
      borderColorDark: "dark:border-slate-900/30"
    },
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { color: string; bgColor: string; gradient: string } } = {
      published: { 
        color: 'dark:text-emerald-300 text-emerald-700', 
        bgColor: 'dark:bg-emerald-900/40 bg-emerald-100', 
        gradient: 'dark:from-emerald-900/40 dark:to-emerald-800/30 from-emerald-100 to-emerald-50' 
      },
      draft: { 
        color: 'dark:text-amber-300 text-amber-700', 
        bgColor: 'dark:bg-amber-900/40 bg-amber-100', 
        gradient: 'dark:from-amber-900/40 dark:to-amber-800/30 from-amber-100 to-amber-50' 
      },
      sold: { 
        color: 'dark:text-violet-300 text-violet-700', 
        bgColor: 'dark:bg-violet-900/40 bg-violet-100', 
        gradient: 'dark:from-violet-900/40 dark:to-violet-800/30 from-violet-100 to-violet-50' 
      },
      rented: { 
        color: 'dark:text-blue-300 text-blue-700', 
        bgColor: 'dark:bg-blue-900/40 bg-blue-100', 
        gradient: 'dark:from-blue-900/40 dark:to-blue-800/30 from-blue-100 to-blue-50' 
      },
      new: { 
        color: 'dark:text-rose-300 text-rose-700', 
        bgColor: 'dark:bg-rose-900/40 bg-rose-100', 
        gradient: 'dark:from-rose-900/40 dark:to-rose-800/30 from-rose-100 to-rose-50' 
      },
      contacted: { 
        color: 'dark:text-blue-300 text-blue-700', 
        bgColor: 'dark:bg-blue-900/40 bg-blue-100', 
        gradient: 'dark:from-blue-900/40 dark:to-blue-800/30 from-blue-100 to-blue-50' 
      },
      closed: { 
        color: 'dark:text-slate-300 text-slate-700', 
        bgColor: 'dark:bg-slate-900/40 bg-slate-100', 
        gradient: 'dark:from-slate-900/40 dark:to-slate-800/30 from-slate-100 to-slate-50' 
      },
      pending: { 
        color: 'dark:text-amber-300 text-amber-700', 
        bgColor: 'dark:bg-amber-900/40 bg-amber-100', 
        gradient: 'dark:from-amber-900/40 dark:to-amber-800/30 from-amber-100 to-amber-50' 
      },
      approved: { 
        color: 'dark:text-emerald-300 text-emerald-700', 
        bgColor: 'dark:bg-emerald-900/40 bg-emerald-100', 
        gradient: 'dark:from-emerald-900/40 dark:to-emerald-800/30 from-emerald-100 to-emerald-50' 
      },
      rejected: { 
        color: 'dark:text-rose-300 text-rose-700', 
        bgColor: 'dark:bg-rose-900/40 bg-rose-100', 
        gradient: 'dark:from-rose-900/40 dark:to-rose-800/30 from-rose-100 to-rose-50' 
      },
    };

    const config = statusConfig[status] || { 
      color: 'dark:text-gray-300 text-gray-700', 
      bgColor: 'dark:bg-gray-800/50 bg-gray-100', 
      gradient: 'dark:from-gray-800/50 dark:to-gray-700/40 from-gray-100 to-gray-50' 
    };
    
    return (
      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r ${config.gradient} ${config.color} border dark:border-white/10 border-white/20 shadow-sm dark:shadow-black/20`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-950 bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center">
          <Loader />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="min-h-screen dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-950 bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center">
          <div className="text-center dark:text-rose-400 text-rose-500 p-8 dark:bg-gray-800/50 bg-white rounded-2xl shadow-xl dark:border-gray-700/50 border">
            <XCircle className="w-16 h-16 mx-auto mb-4" />
            <p className="text-lg font-semibold">{error}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!profile) {
    return (
      <AdminLayout>
        <div className="min-h-screen dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-950 bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center">
          <div className="text-center dark:text-gray-300 text-gray-500 p-8 dark:bg-gray-800/50 bg-white rounded-2xl shadow-xl dark:border-gray-700/50 border">
            <Users className="w-16 h-16 mx-auto mb-4" />
            <p className="text-lg font-semibold">No profile data found.</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const userName = profile.name || "Agent";

  return (
    <AdminLayout>
      <div className="p-6 space-y-6 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-950 bg-gradient-to-br from-slate-50 to-blue-50/30 min-h-screen">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-600 to-emerald-600 p-8 rounded-2xl shadow-xl dark:shadow-black/30 border-0 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10 dark:bg-black/20"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold">Welcome back, {userName}!</h1>
                </div>
                <p className="text-blue-100/90 text-lg">
                  Here's what's happening with your {profile.role} account today
                </p>
              </div>
              <div className="hidden md:flex items-center gap-3 px-4 py-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 dark:border-white/20">
                <Calendar className="text-white" size={20} />
                <span className="font-semibold">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { 
              label: "Properties This Month", 
              value: stats?.properties.this_month || 0, 
              icon: Target, 
              gradient: "dark:from-blue-600 dark:to-cyan-600 from-blue-500 to-cyan-500",
              bgGradientLight: "from-blue-50 to-cyan-50",
              bgGradientDark: "dark:from-gray-800/70 dark:to-gray-800/50 dark:border-gray-700/50"
            },
            { 
              label: "Inquiries This Month", 
              value: stats?.inquiries.this_month || 0, 
              icon: TrendingUp, 
              gradient: "dark:from-emerald-600 dark:to-green-600 from-emerald-500 to-green-500",
              bgGradientLight: "from-emerald-50 to-green-50",
              bgGradientDark: "dark:from-gray-800/70 dark:to-gray-800/50 dark:border-gray-700/50"
            },
            { 
              label: "Recent Inquiries", 
              value: stats?.inquiries.recent || 0, 
              icon: Eye, 
              gradient: "dark:from-amber-600 dark:to-orange-600 from-amber-500 to-orange-500",
              bgGradientLight: "from-amber-50 to-orange-50",
              bgGradientDark: "dark:from-gray-800/70 dark:to-gray-800/50 dark:border-gray-700/50"
            },
            { 
              label: "Success Rate", 
              value: stats?.inquiries.total ? 
                Math.round((stats.inquiries.closed / stats.inquiries.total) * 100) : 0, 
              icon: Award, 
              gradient: "dark:from-violet-600 dark:to-purple-600 from-violet-500 to-purple-500",
              bgGradientLight: "from-violet-50 to-purple-50",
              bgGradientDark: "dark:from-gray-800/70 dark:to-gray-800/50 dark:border-gray-700/50"
            },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className={`bg-gradient-to-br ${stat.bgGradientLight} dark:bg-gradient-to-br ${stat.bgGradientDark} rounded-2xl p-6 border border-gray-100 dark:border-gray-700/50 shadow-lg hover:shadow-xl dark:hover:shadow-black/30 transition-all duration-300 hover:-translate-y-1`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">{stat.label}</p>
                    <p className="text-gray-900 dark:text-white text-3xl font-bold mt-2">{stat.value}{stat.label === "Success Rate" ? "%" : ""}</p>
                  </div>
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} text-white shadow-lg dark:shadow-black/30`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Statistics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Property Statistics */}
          <div className="space-y-6 mt-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <h2 className="dark:text-white text-gray-900 text-3xl font-bold">Property Statistics</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {propertyStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.label} className={`bg-gradient-to-br ${stat.cardGradientLight} dark:bg-gradient-to-br ${stat.cardGradientDark} border border-gray-100 dark:border-gray-700/50 shadow-lg hover:shadow-xl dark:hover:shadow-black/30 transition-all duration-300 hover:-translate-y-1`}>
                    <CardContent className="p-5">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.bgColor} text-white shadow-lg dark:shadow-black/30`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-300 text-sm font-semibold">{stat.label}</p>
                          <p className="text-gray-900 dark:text-white text-2xl font-bold">{stat.value}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Inquiry Statistics */}
          <div className="space-y-6 mt-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-rose-500 to-pink-500 rounded-lg">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <h2 className="dark:text-white text-gray-900 text-3xl font-bold">Inquiry Statistics</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {inquiryStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.label} className={`bg-gradient-to-br ${stat.cardGradientLight} dark:bg-gradient-to-br ${stat.cardGradientDark} border border-gray-100 dark:border-gray-700/50 shadow-lg hover:shadow-xl dark:hover:shadow-black/30 transition-all duration-300 hover:-translate-y-1`}>
                    <CardContent className="p-5">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.bgColor} text-white shadow-lg dark:shadow-black/30`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-300 text-sm font-semibold">{stat.label}</p>
                          <p className="text-gray-900 dark:text-white text-2xl font-bold">{stat.value}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Properties */}
          <Card className="lg:col-span-2 dark:bg-gray-800/50 bg-white border border-gray-100 dark:border-gray-700/50 shadow-xl dark:shadow-black/30">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg shadow-lg">
                    <Rocket className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="dark:text-white text-gray-900 text-xl font-bold">Recent Properties</h3>
                    <p className="dark:text-gray-400 text-gray-500 text-sm mt-1 hidden sm:block">
                      Latest property listings and their status
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 dark:bg-blue-900/40 bg-blue-50 rounded-full dark:border-blue-800/50 border-blue-100 border">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="dark:text-blue-300 text-blue-700 text-sm font-medium">
                    {recentProperties.length} properties
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {recentProperties.map((property) => (
                  <Link 
                    to={'/agent/properties/'+property.id} 
                    key={property.id} 
                    className="block dark:bg-gradient-to-br dark:from-gray-800/50 dark:to-blue-900/20 bg-gradient-to-br from-white to-blue-50/70 dark:border-blue-800/50 border-blue-100 border rounded-xl p-4 hover:shadow-xl dark:hover:shadow-black/30 transition-all duration-300 hover:-translate-y-1 group hover:dark:border-blue-700/50 hover:border-blue-200"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                      {/* Property Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3">
                          <div className="hidden sm:flex flex-shrink-0 w-10 h-10 dark:bg-gradient-to-br dark:from-blue-900/40 dark:to-cyan-900/30 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg items-center justify-center dark:border-blue-800/50 border-blue-200 border">
                            <Building2 className="w-5 h-5 dark:text-blue-400 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="dark:text-white text-gray-900 font-semibold truncate group-hover:dark:text-blue-400 group-hover:text-blue-600 transition-colors text-sm sm:text-base">
                              {property.title}
                            </h4>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
                              <span className="dark:text-blue-300 text-blue-600 dark:bg-blue-900/40 bg-blue-50 text-sm font-bold px-2 py-1 rounded-lg dark:border-blue-800/50 border-blue-100 border">
                                {formatAmount(property.price)}
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {getStatusBadge(property.status)}
                                {getStatusBadge(property.approval_status)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Date and Actions */}
                      <div className="flex items-center justify-between lg:justify-end gap-4 lg:gap-6">
                        <div className="text-right">
                          <p className="hidden sm:flex dark:text-gray-400 text-gray-500 text-xs sm:text-sm font-medium whitespace-nowrap">
                            {formatReadableDate(property.created_at)}
                          </p>
                          <div className="hidden sm:flex items-center gap-1 mt-1 dark:text-gray-500 text-gray-400 text-xs">
                            <Clock className="w-3 h-3" />
                            Added recently
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Mobile Status Row */}
                    <div className="sm:hidden flex items-center justify-between mt-3 pt-3 dark:border-gray-700/50 border-gray-100 border-t">
                      <div className="flex items-center gap-1 dark:text-gray-500 text-gray-500 text-xs">
                        <Clock className="w-3 h-3" />
                        {formatReadableDate(property.created_at)}
                      </div>
                      <div className="dark:text-blue-400 text-blue-600 text-xs font-medium">
                        View Details →
                      </div>
                    </div>
                  </Link>
                ))}

                {/* Empty State */}
                {recentProperties.length === 0 && (
                  <div className="text-center py-12 px-4 dark:bg-gradient-to-br dark:from-gray-800/50 dark:to-blue-900/20 bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-2xl border-2 border-dashed dark:border-blue-800/50 border-blue-200">
                    <div className="w-20 h-20 dark:bg-gradient-to-br dark:from-blue-900/40 dark:to-cyan-900/30 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4 dark:border-blue-800/50 border-blue-200 border">
                      <Building2 className="w-8 h-8 dark:text-blue-400 text-blue-400" />
                    </div>
                    <h4 className="dark:text-gray-300 text-gray-700 text-lg font-semibold mb-2">No Properties Yet</h4>
                    <p className="dark:text-gray-400 text-gray-500 mb-4 max-w-sm mx-auto">
                      Start building your portfolio by adding your first property listing
                    </p>
                    <Link 
                      to="/agent/properties/new"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg dark:hover:shadow-black/30 transition-all duration-300 hover:scale-105"
                    >
                      <Rocket className="w-4 h-4" />
                      Add First Property
                    </Link>
                  </div>
                )}

                {/* View All Link */}
                {recentProperties.length > 0 && (
                  <div className="pt-4 dark:border-gray-700/50 border-gray-100 border-t">
                    <Link 
                      to="/agent/properties"
                      className="flex items-center justify-center gap-2 w-full py-3 dark:text-blue-400 text-blue-600 hover:dark:text-blue-300 hover:text-blue-700 font-semibold dark:hover:bg-blue-900/30 hover:bg-blue-50 rounded-xl transition-all duration-300 group"
                    >
                      <span>View All Properties</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Inquiries */}
          <Card className="dark:bg-gray-800/50 bg-white border border-gray-100 dark:border-gray-700/50 shadow-lg dark:shadow-black/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-rose-500 to-pink-500 rounded-lg">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="dark:text-white text-gray-900 text-xl font-bold">Recent Inquiries</h3>
                </div>
              </div>
              <div className="space-y-4">
                {recentInquiries.map((inquiry) => (
                  <div 
                    key={inquiry.id} 
                    className="dark:bg-gradient-to-br dark:from-gray-800/50 dark:to-rose-900/20 bg-gradient-to-br from-white to-rose-50/50 dark:border-rose-800/50 border-rose-100 border rounded-xl p-4 hover:shadow-lg dark:hover:shadow-black/30 transition-all duration-300 hover:-translate-y-1 group"
                  >
                    <Link to={'/agent/leads/'+inquiry.id}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="dark:text-white text-gray-900 font-semibold group-hover:dark:text-rose-400 group-hover:text-rose-600 transition-colors">
                            {inquiry.customer.name}
                          </h4>
                          <p className="dark:text-gray-400 text-gray-600 text-sm truncate">{inquiry.customer.email}</p>
                          <p className="dark:text-gray-300 text-gray-700 text-sm mt-2 font-medium">{inquiry.property.title}</p>
                        </div>
                        {getStatusBadge(inquiry.status)}
                      </div>
                    </Link>
                    <p className="dark:text-gray-500 text-gray-500 text-xs mt-3 font-medium">
                      {formatReadableDate(inquiry.created_at)}
                    </p>
                  </div>
                ))}
                {recentInquiries.length === 0 && (
                  <div className="text-center py-12 dark:text-gray-400 text-gray-500 dark:bg-gradient-to-br dark:from-gray-800/50 dark:to-gray-900/30 bg-gradient-to-br from-slate-50 to-gray-100 rounded-2xl border border-dashed dark:border-gray-700/50 border-gray-200">
                    <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50 dark:text-rose-400 text-rose-400" />
                    <p className="text-lg font-semibold">No inquiries found</p>
                    <p className="text-sm mt-1">Inquiries will appear here</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Performing Properties */}
        <Card className="dark:bg-gray-800/50 bg-white border border-gray-100 dark:border-gray-700/50 shadow-lg dark:shadow-black/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <h3 className="dark:text-white text-gray-900 text-xl font-bold">Top Performing Properties</h3>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topProperties.map((property) => (
                <Link 
                  to={'/agent/properties/'+property.id} 
                  key={property.id} 
                  className="dark:bg-gradient-to-br dark:from-gray-800/50 dark:to-emerald-900/20 bg-gradient-to-br from-white to-emerald-50/50 dark:border-emerald-800/50 border-emerald-100 border rounded-xl p-5 hover:shadow-xl dark:hover:shadow-black/30 transition-all duration-300 hover:-translate-y-2 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="dark:text-white text-gray-900 font-bold line-clamp-2 group-hover:dark:text-emerald-400 group-hover:text-emerald-600 transition-colors">
                      {property.title}
                    </h4>
                    {getStatusBadge(property.status)}
                  </div>
                  <p className="dark:text-blue-400 text-blue-600 text-xl font-bold mb-3">{formatAmount(property.price)}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 dark:text-gray-400 text-gray-600">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm font-semibold">{property.inquiries_count} inquiries</span>
                    </div>
                    <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                      property.inquiries_count > 5 
                        ? 'dark:bg-gradient-to-r dark:from-emerald-900/40 dark:to-emerald-800/30 bg-gradient-to-r from-emerald-100 to-emerald-50 dark:text-emerald-300 text-emerald-700 dark:border-emerald-800/50 border-emerald-200 border'
                        : property.inquiries_count > 2
                        ? 'dark:bg-gradient-to-r dark:from-amber-900/40 dark:to-amber-800/30 bg-gradient-to-r from-amber-100 to-amber-50 dark:text-amber-300 text-amber-700 dark:border-amber-800/50 border-amber-200 border'
                        : 'dark:bg-gradient-to-r dark:from-slate-900/40 dark:to-slate-800/30 bg-gradient-to-r from-slate-100 to-slate-50 dark:text-slate-300 text-slate-700 dark:border-slate-800/50 border-slate-200 border'
                    }`}>
                      {property.inquiries_count > 5 ? '🔥 Hot' : property.inquiries_count > 2 ? '⭐ Warm' : '💤 Cold'}
                    </div>
                  </div>
                </Link>
              ))}
              {topProperties.length === 0 && (
                <div className="col-span-full text-center py-12 dark:text-gray-400 text-gray-500 dark:bg-gradient-to-br dark:from-gray-800/50 dark:to-gray-900/30 bg-gradient-to-br from-slate-50 to-gray-100 rounded-2xl border border-dashed dark:border-gray-700/50 border-gray-200">
                  <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-50 dark:text-emerald-400 text-emerald-400" />
                  <p className="text-lg font-semibold">No performance data available</p>
                  <p className="text-sm mt-1">Properties with inquiries will appear here</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AgentDashboardPage;