import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchAgentProfile, AgentProfile } from "@/api/agent/agentProfile";
import AdminLayout from "@/components/layout/admin/AdminLayout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AgentDetailsTab from "@/pages/admin/agents/components/AgentDetailsTab";
import AgentActivityLogsTab from "@/pages/admin/agents/components/AgentActivityLogsTab";
import AgentPerformanceTab from "@/pages/admin/agents/components/AgentPerformanceTab";
import { Phone, MapPin, Mail, Calendar, XCircle } from "lucide-react";

const AgentProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const [agent, setAgent] = useState<AgentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const data = await fetchAgentProfile(id!);

        if (data.success) setAgent(data.data.agent ?? null);
        else setError("Failed to load agent profile");
      } catch (err) {
        console.error(err);
        setError("Error fetching profile");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [id]);

  if (loading)
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-500 dark:text-gray-400">Loading profile...</p>
          </div>
        </div>
      </AdminLayout>
    );

  if (error)
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-3">
            <XCircle className="w-16 h-16 text-red-500 mx-auto" />
            <p className="text-red-500 font-medium">{error}</p>
          </div>
        </div>
      </AdminLayout>
    );

  return (
    <AdminLayout>
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Cover Banner with Gradient Overlay */}
        <div className="relative h-52 sm:h-60 md:h-72 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-48 translate-x-48"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-32 -translate-x-32"></div>
          <img
            src={agent?.avatar || undefined}
            alt="cover"
            className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay"
          />
        </div>

        {/* Agent Header */}
        <div className="relative -mt-20 sm:-mt-24 px-4 sm:px-8 md:px-10">
          <div className="flex flex-col sm:flex-row sm:items-end gap-6">
            {/* Avatar with Status Badge */}
            <div className="relative flex-shrink-0 self-center sm:self-start">
              <div className="relative group">
                <img
                  src={agent?.avatar || "/assets/user.jpg"}
                  alt={agent?.name || "Agent"}
                  className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl border-4 border-white dark:border-gray-900 shadow-2xl object-cover ring-4 ring-blue-500/20"
                />
                {agent?.status && (
                  <div className="absolute -bottom-2 -right-2 bg-green-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg flex items-center gap-1">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                    Online
                  </div>
                )}
              </div>
            </div>

            {/* Agent Info Card */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-5 sm:p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col lg:flex-row lg:justify-between gap-4">
                {/* Left - Name & Email */}
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                      {agent?.name || "Unnamed Agent"}
                    </h1>
                    <div className="flex gap-2">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                          agent?.status
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                            : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                        }`}
                      >
                        {agent?.status ? "Active" : "Inactive"}
                      </span>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          agent?.two_factor_enabled
                            ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                            : "bg-red-100 dark:bg-gray-700 text-red-700 dark:text-gray-400"
                        }`}
                      >
                        {agent?.two_factor_enabled ? "2FA On" : "2FA Off"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <Mail size={16} className="text-gray-400" />
                    <span className="break-all">{agent?.email || "Not available"}</span>
                  </div>
                </div>

                {/* Right - Meta Info Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 lg:gap-3 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded-lg">
                    <Phone size={16} className="text-blue-500" />
                    <span>{agent?.phone || undefined}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded-lg">
                    <MapPin size={16} className="text-red-500" />
                    <span>{agent?.city || "Unknown"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded-lg col-span-2 sm:col-span-1">
                    <Calendar size={16} className="text-green-500" />
                    <span>
                      {agent?.joined
                        ? new Date(agent.joined).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "N/A"}
                    </span>
                  </div>  
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Property Management Actions */}
        {/* <div className="mt-6 px-4 sm:px-8 md:px-10">
          <div className="bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-950/20 dark:to-emerald-950/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                  <Building2 className="text-blue-600 dark:text-blue-400" size={20} />
                  Property Management
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage properties for {agent?.name || "this agent"}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => navigate(`/admin/agents/${id}/properties`)}
                  variant="outline"
                  className="flex items-center gap-2 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 cursor-pointer"
                >
                  <Building2 size={18} />
                  <span>View Properties</span>
                </Button>
                <Button
                  onClick={() => navigate(`/admin/agents/${id}/properties/new`)}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white shadow-md hover:shadow-lg cursor-pointer"
                >
                  <Plus size={18} />
                  <span>Add Property</span>
                </Button>
              </div>
            </div>
          </div>
        </div> */}

        {/* Tabs Section */}
        <div className="mt-6 px-4 sm:px-8 md:px-10 pb-8">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="flex flex-wrap justify-start gap-2 sm:gap-4 bg-gray-100 dark:bg-gray-800 p-2 rounded-xl mb-6">
              <TabsTrigger
                value="details"
                className="px-4 sm:px-6 py-2.5 rounded-lg font-medium transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-md text-gray-600 dark:text-gray-400 cursor-pointer"
              >
                Details
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                className="px-4 sm:px-6 py-2.5 rounded-lg font-medium transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-md text-gray-600 dark:text-gray-400 cursor-pointer"
              >
                Activity Logs
              </TabsTrigger>
              <TabsTrigger
                value="performance"
                className="px-4 sm:px-6 py-2.5 rounded-lg font-medium transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-md text-gray-600 dark:text-gray-400 cursor-pointer"
              >
                Performance
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <AgentDetailsTab agent={agent!} />
            </TabsContent>

            <TabsContent value="activity">
              <AgentActivityLogsTab agentId={agent!.id} />
            </TabsContent>

            <TabsContent value="performance">
              <AgentPerformanceTab agentId={agent!.id} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AgentProfilePage;
