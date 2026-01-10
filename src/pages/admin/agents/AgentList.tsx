/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Eye, UserPlus, Grid3x3, List, Users, Shield, UserCheck, UserX } from "lucide-react";
import AdminLayout from "@/components/layout/admin/AdminLayout";
import { getAgents, Agent } from "@/api/agent/agentList";
import { Button } from "@/components/ui/button";

const AgentList = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const debounceRef = useRef<number | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const navigate = useNavigate();

  useEffect(() => {
    const loadAgents = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getAgents(page, search);

        if (data.success) {
          setAgents(data.data.agents || []);
          setTotalPages(data.data.pagination.last_page || 1);
        } else {
          setError("Failed to fetch agents.");
        }
      } catch (err: any) {
        console.error(err);
        setError("Failed to fetch agents.");
      } finally {
        setLoading(false);
      }
    };

    loadAgents();
  }, [page, search]);

  const badge = (isActive: boolean) =>
    isActive
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-700/20 dark:text-emerald-400"
      : "bg-red-100 text-red-700 dark:bg-red-700/20 dark:text-red-400";

  return (
    <AdminLayout>
      {/* Make sure parent allows children to control height and scrolling */}
      <div className="space-y-6 min-h-0 pb-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-xl">
                <Users className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Agents
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Manage all registered agents
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 shadow-sm hover:border-blue-400 dark:hover:border-emerald-600 transition-all w-full sm:w-auto">
                <Search size={16} className="text-gray-400 mr-2 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search agents..."
                  value={searchTerm}
                  onChange={(e) => {
                    const v = e.target.value;
                    setSearchTerm(v);
                    setPage(1);
                    // clear previous timer
                    if (debounceRef.current) window.clearTimeout(debounceRef.current);
                    debounceRef.current = window.setTimeout(() => {
                      setSearch(v.trim());
                    }, 350); // 350ms debounce
                  }}
                  className="bg-transparent outline-none text-sm text-gray-900 dark:text-white w-full sm:w-48 placeholder-gray-500"
                />
              </div>

              <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === "grid"
                      ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-emerald-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                  title="Grid View"
                >
                  <Grid3x3 size={18} />
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === "table"
                      ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-emerald-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                  title="Table View"
                >
                  <List size={18} />
                </button>
              </div>

              <Button
                onClick={() => navigate("/admin/agents/new")}
                className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white shadow-md hover:shadow-lg w-full sm:w-auto"
              >
                <UserPlus size={18} />
                <span>Add Agent</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-5 rounded-xl border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Total Agents
                  </p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                    {agents.length}
                  </p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <Users className="text-blue-600 dark:text-blue-400" size={20} />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 p-5 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                    Active Agents
                  </p>
                  <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 mt-1">
                    {agents.filter((a) => a.status).length}
                  </p>
                </div>
                <div className="p-3 bg-emerald-500/10 rounded-lg">
                  <UserCheck className="text-emerald-600 dark:text-emerald-400" size={20} />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-5 rounded-xl border border-red-200 dark:border-red-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-700 dark:text-red-300">
                    Inactive Agents
                  </p>
                  <p className="text-2xl font-bold text-red-900 dark:text-red-100 mt-1">
                    {agents.filter((a) => !a.status).length}
                  </p>
                </div>
                <div className="p-3 bg-red-500/10 rounded-lg">
                  <UserX className="text-red-600 dark:text-red-400" size={20} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading / Error */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 border-4 border-blue-500 dark:border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-500 dark:text-gray-400">Loading agents...</p>
            </div>
          </div>
        )}
        {error && (
          <div className="text-center py-20">
            <p className="text-red-500 font-medium">{error}</p>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            {/* Table View */}
            {viewMode === "table" && (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden min-h-0">
                {/* ensure table container can scroll horizontally on small screens */}
                <div className="overflow-x-auto w-full">
                  <table className="min-w-full w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 text-gray-700 dark:text-gray-200">
                        <th className="py-4 px-4 sm:px-6 text-left font-semibold">Agent</th>
                        <th className="py-4 px-4 sm:px-6 text-left font-semibold hidden sm:table-cell">
                          Contact
                        </th>
                        <th className="py-4 px-4 sm:px-6 text-left font-semibold hidden md:table-cell">
                          Security
                        </th>
                        <th className="py-4 px-4 sm:px-6 text-left font-semibold hidden lg:table-cell">
                          Joined
                        </th>
                        <th className="py-4 px-4 sm:px-6 text-left font-semibold">Status</th>
                        <th className="py-4 px-4 sm:px-6 text-center font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900">
                      {agents.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="py-12 text-center text-gray-500 dark:text-gray-400"
                          >
                            <div className="flex flex-col items-center gap-3">
                              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                <Search className="text-gray-400" size={24} />
                              </div>
                              <p className="font-medium">No agents found</p>
                              <p className="text-sm">Try adjusting your search criteria</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        agents.map((agent, index) => (
                          <tr
                            key={agent.id}
                            className={`border-b border-gray-100 dark:border-gray-800 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all group ${
                              index % 2 === 0
                                ? "bg-white dark:bg-gray-900"
                                : "bg-gray-50/50 dark:bg-gray-800/50"
                            }`}
                          >
                            <td className="py-4 px-4 sm:px-6">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
                                  <img src={agent?.avatar ?? ""} alt={agent.name} className="w-full h-full object-cover rounded-full" onError={(e) => {
                                    e.currentTarget.src = "/assets/user.jpg";
                                  }} />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-semibold text-gray-900 dark:text-white truncate">
                                    {agent.name}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    ID: {agent.id}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="py-4 px-4 sm:px-6 hidden sm:table-cell">
                              <p className="text-gray-700 dark:text-gray-300 truncate">
                                {agent.email}
                              </p>
                            </td>

                            <td className="py-4 px-4 sm:px-6 hidden md:table-cell">
                              <span
                                className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${
                                  agent.two_factor_enabled
                                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                                    : "bg-red-100 dark:bg-gray-800 text-red-700 dark:text-gray-400"
                                }`}
                              >
                                <Shield className="mr-1" size={14} />
                                {agent.two_factor_enabled ? "2FA Enabled" : "2FA Disabled"}
                              </span>
                            </td>

                            <td className="py-4 px-4 sm:px-6 text-gray-600 dark:text-gray-400 hidden lg:table-cell">
                              {new Date(agent.joined).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </td>

                            <td className="py-4 px-4 sm:px-6">
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${badge(
                                  agent.status
                                )}`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                    agent.status
                                      ? "bg-emerald-600 dark:bg-emerald-400"
                                      : "bg-red-600 dark:bg-red-400"
                                  }`}
                                ></span>
                                {agent.status ? "Active" : "Inactive"}
                              </span>
                            </td>

                            <td className="py-4 px-4 sm:px-6">
                              <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-all hover:scale-110 cursor-pointer"
                                  onClick={() => navigate(`/admin/agents/${agent.id}`)}
                                  title="View Details"
                                >
                                  <Eye size={18} />
                                </button>
                                {/* <button
                                  className="p-2 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 transition-all hover:scale-110"
                                  title="Edit Agent"
                                >
                                  <Edit size={18} />
                                </button> */}
                                {/* <button
                                  className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-all hover:scale-110"
                                  title="Delete Agent"
                                >
                                  <Trash2 size={18} />
                                </button> */}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Grid View */}
            {viewMode === "grid" && (
              <div className="min-h-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {agents.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                          <Search className="text-gray-400" size={24} />
                        </div>
                        <p className="font-medium text-gray-500 dark:text-gray-400">
                          No agents found
                        </p>
                        <p className="text-sm text-gray-400">Try adjusting your search criteria</p>
                      </div>
                    </div>
                  ) : (
                    agents.map((agent) => (
                      <div
                        key={agent.id}
                        className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-800 transition-all hover:-translate-y-1 group min-h-0"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0">
                              <img src={agent.avatar ?? "/assets/user.jpg"} alt={agent.name} className="w-full h-full object-cover rounded-xl" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                {agent.name}
                              </h3>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {agent.email}
                              </p>
                              <span
                                className={`inline-flex items-center mt-1 px-3 py-0.5 rounded-full text-xs font-semibold ${
                                  agent.two_factor_enabled
                                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                                    : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                                }`}
                              >
                                  <Shield className="mr-1" size={14} />
                                {agent.two_factor_enabled ? "2FA On" : "2FA Off"}
                              </span>
                            </div>
                          </div>
                          <span
                            className={`px-2.5 py-1 text-xs font-bold rounded-full ${badge(
                              agent.status
                            )}`}
                          >
                            {agent.status ? "Active" : "Inactive"}
                          </span>
                        </div>

                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                          Joined:{" "}
                          {new Date(agent.joined).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                          <button
                            onClick={() => navigate(`/admin/agents/${agent.id}`)}
                            className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-all font-medium text-sm cursor-pointer"
                          >
                            <Eye size={16} />
                            <span>View</span>
                          </button>
                          {/* <button className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 transition-all font-medium text-sm cursor-pointer">
                            <Edit size={16} />
                            <span>Edit</span>
                          </button> */}
                          {/* <button className="p-2.5 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-all cursor-pointer">
                            <Trash2 size={16} />
                          </button> */}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Showing page{" "}
                <span className="text-blue-600 dark:text-emerald-400 font-bold">{page}</span> of{" "}
                <span className="font-bold">{totalPages}</span>
              </p>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex-1 sm:flex-none px-5 py-2.5 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-500 dark:hover:border-emerald-500 text-gray-700 dark:text-gray-300 transition-all"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex-1 sm:flex-none px-5 py-2.5 text-sm font-medium rounded-lg bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-all shadow-md hover:shadow-lg"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AgentList;
