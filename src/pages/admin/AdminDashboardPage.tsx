/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import api from "@/api/axios";
import { getProfile } from "@/api/admin/profileApi";
import {
  Users,
  Building2,
  MessageCircle,
  Eye,
  UserCheck,
  UserX,
  CheckCircle2,
  Clock4,
  XCircle,
  TrendingUp,
  BarChart3,
  Home,
  Shield,
  Mail,
  Calendar,
  Award,
  Star,
  LayoutDashboard,
} from "lucide-react";
import { formatAmount, formatReadableDate } from "@/helpers/customer_helper";
import { PageHeader, StatsCard } from "@/components/admin";
import { SkeletonPage } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface DashboardResponse {
  success: boolean;
  message: string;
  role: string;
  data: {
    stats: {
      users: {
        total: number;
        agents: number;
        customers: number;
        admins: number;
        active: number;
        deactivated: number;
        this_month: number;
      };
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
      views: {
        total: number;
        this_month: number;
        today: number;
      };
    };
    recent_users: Array<{
      id: number;
      name: string;
      email: string;
      role: string;
      created_at: string;
    }>;
    recent_properties: Array<{
      id: number;
      title: string;
      price: number;
      status: string;
      approval_status: string;
      agent_id: number;
      created_at: string;
      agent: {
        id: number;
        name: string;
        email: string;
      };
    }>;
    pending_approvals: Array<{
      id: number;
      title: string;
      price: number;
      agent_id: number;
      created_at: string;
      agent: {
        id: number;
        name: string;
        email: string;
      };
    }>;
    top_agents_by_properties: Array<{
      id: number;
      name: string;
      email: string;
      properties_count: number;
    }>;
    top_agents_by_inquiries: Array<{
      id: number;
      name: string;
      email: string;
      inquiries_count: number;
    }>;
    properties_by_type: Array<{
      type: string;
      count: number;
    }>;
  };
}

const AdminDashboardPage = () => {
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
        const res = await api.get<DashboardResponse>("/admin/dashboard");
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

  const stats = dashboardData?.data?.stats;
  const recentUsers = dashboardData?.data?.recent_users || [];
  const recentProperties = dashboardData?.data?.recent_properties || [];
  const pendingApprovals = dashboardData?.data?.pending_approvals || [];
  const topAgentsByProperties = dashboardData?.data?.top_agents_by_properties || [];
  const topAgentsByInquiries = dashboardData?.data?.top_agents_by_inquiries || [];
  const propertiesByType = dashboardData?.data?.properties_by_type || [];

  const getRoleBadge = (role: string) => {
    const variant = role === 'admin' ? 'default' : role === 'agent' ? 'info' : 'success';
    return <Badge variant={variant}>{role.toUpperCase()}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "success" | "warning" | "destructive" | "info" | "secondary"> = {
      published: 'success',
      draft: 'warning',
      sold: 'info',
      rented: 'info',
      pending: 'warning',
      approved: 'success',
      rejected: 'destructive',
    };
    return <Badge variant={variants[status] || 'secondary'}>{status.replace('_', ' ').toUpperCase()}</Badge>;
  };

  if (loading) {
    return (
      <AdminLayout>
        <SkeletonPage />
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <EmptyState
            title="Error loading dashboard"
            description={error}
            action={{ label: "Try Again", onClick: () => window.location.reload() }}
          />
        </div>
      </AdminLayout>
    );
  }

  if (!profile) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <EmptyState
            title="No profile data found"
            description="Unable to load your profile information"
            variant="users"
          />
        </div>
      </AdminLayout>
    );
  }

  const userName = profile.name || "Admin";

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header with Welcome */}
        <PageHeader
          title={`Welcome back, ${userName}!`}
          description={`System overview and performance analytics for your ${profile.role} dashboard`}
          icon={LayoutDashboard}
          iconColor="primary"
          actions={
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
          }
        />

        {/* Overview Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Users"
            value={stats?.users.total || 0}
            icon={Users}
            variant="info"
            trend={{ value: stats?.users.this_month || 0, label: "this month", isPositive: true }}
          />
          <StatsCard
            title="Total Properties"
            value={stats?.properties.total || 0}
            icon={Building2}
            variant="success"
            trend={{ value: stats?.properties.this_month || 0, label: "this month", isPositive: true }}
          />
          <StatsCard
            title="Total Inquiries"
            value={stats?.inquiries.total || 0}
            icon={MessageCircle}
            variant="warning"
            trend={{ value: stats?.inquiries.this_month || 0, label: "this month", isPositive: true }}
          />
          <StatsCard
            title="Property Views"
            value={stats?.views.total || 0}
            icon={Eye}
            variant="primary"
            trend={{ value: stats?.views.this_month || 0, label: "this month", isPositive: true }}
          />
        </div>

        {/* Detailed Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Statistics */}
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">User Statistics</h3>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Agents', value: stats?.users.agents || 0, icon: Users },
                  { label: 'Customers', value: stats?.users.customers || 0, icon: UserCheck },
                  { label: 'Admins', value: stats?.users.admins || 0, icon: Shield },
                  { label: 'Active Users', value: stats?.users.active || 0, icon: UserCheck },
                  { label: 'Deactivated', value: stats?.users.deactivated || 0, icon: UserX },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <stat.icon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">{stat.label}</span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">{stat.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Property Statistics */}
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Property Statistics</h3>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Published', value: stats?.properties.published || 0, icon: CheckCircle2 },
                  { label: 'Draft', value: stats?.properties.draft || 0, icon: Clock4 },
                  { label: 'Sold', value: stats?.properties.sold || 0, icon: TrendingUp },
                  { label: 'Rented', value: stats?.properties.rented || 0, icon: Home },
                  { label: 'Pending Approval', value: stats?.properties.pending_approval || 0, icon: Clock4 },
                  { label: 'Approved', value: stats?.properties.approved || 0, icon: CheckCircle2 },
                  { label: 'Rejected', value: stats?.properties.rejected || 0, icon: XCircle },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <stat.icon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">{stat.label}</span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">{stat.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Inquiry Statistics */}
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Inquiry Statistics</h3>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'New', value: stats?.inquiries.new || 0, icon: Mail },
                  { label: 'Contacted', value: stats?.inquiries.contacted || 0, icon: MessageCircle },
                  { label: 'Closed', value: stats?.inquiries.closed || 0, icon: CheckCircle2 },
                  { label: 'Recent (7d)', value: stats?.inquiries.recent || 0, icon: Calendar },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <stat.icon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">{stat.label}</span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">{stat.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Users */}
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Users</h3>
              </div>
              <div className="space-y-4">
                {recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {getRoleBadge(user.role)}
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatReadableDate(user.created_at)}</p>
                    </div>
                  </div>
                ))}
                {recentUsers.length === 0 && (
                  <EmptyState title="No recent users" variant="users" />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Properties */}
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Properties</h3>
              </div>
              <div className="space-y-4">
                {recentProperties.map((property) => (
                  <div key={property.id} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1 flex-1 pr-2">{property.title}</h4>
                      {getStatusBadge(property.status)}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-primary-600 dark:text-primary-400">{formatAmount(property.price)}</span>
                      <span className="text-gray-500 dark:text-gray-400">{property.agent.name}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      {getStatusBadge(property.approval_status)}
                      <span className="text-xs text-gray-500 dark:text-gray-400">{formatReadableDate(property.created_at)}</span>
                    </div>
                  </div>
                ))}
                {recentProperties.length === 0 && (
                  <EmptyState title="No recent properties" variant="properties" />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pending Approvals */}
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pending Approvals</h3>
                <Badge variant="warning">{pendingApprovals.length}</Badge>
              </div>
              <div className="space-y-4">
                {pendingApprovals.map((property) => (
                  <div key={property.id} className="p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 line-clamp-2">{property.title}</h4>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-amber-600 dark:text-amber-400">{formatAmount(property.price)}</span>
                      <span className="text-gray-500 dark:text-gray-400">{property.agent.name}</span>
                    </div>
                  </div>
                ))}
                {pendingApprovals.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-emerald-500" />
                    <p className="font-medium">All caught up!</p>
                    <p className="text-sm">No pending approvals</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Performers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Agents by Properties */}
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Agents (Properties)</h3>
              </div>
              <div className="space-y-3">
                {topAgentsByProperties.map((agent, index) => (
                  <div key={agent.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        index === 0 ? 'bg-amber-400' :
                        index === 1 ? 'bg-gray-300' :
                        index === 2 ? 'bg-amber-600' :
                        'bg-primary-500'
                      }`}>
                        {index < 3 ? (
                          <Award className="w-4 h-4 text-white" />
                        ) : (
                          <span className="text-xs font-bold text-white">{index + 1}</span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{agent.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{agent.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">{agent.properties_count}</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">properties</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Agents by Inquiries */}
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Agents (Inquiries)</h3>
              </div>
              <div className="space-y-3">
                {topAgentsByInquiries.map((agent, index) => (
                  <div key={agent.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        index === 0 ? 'bg-amber-400' :
                        index === 1 ? 'bg-gray-300' :
                        index === 2 ? 'bg-amber-600' :
                        'bg-purple-500'
                      }`}>
                        {index < 3 ? (
                          <Star className="w-4 h-4 text-white" />
                        ) : (
                          <span className="text-xs font-bold text-white">{index + 1}</span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{agent.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{agent.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">{agent.inquiries_count}</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">inquiries</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Property Types Distribution */}
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                <Home className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Properties by Type</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {propertiesByType.map((type) => (
                <div key={type.type} className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-1">
                    {type.count}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 capitalize">{type.type || 'Unknown'}</div>
                </div>
              ))}
              {propertiesByType.length === 0 && (
                <div className="col-span-full">
                  <EmptyState title="No property type data available" variant="properties" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;
