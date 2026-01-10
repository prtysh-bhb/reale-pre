/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { getAgentInquiries } from "@/api/agent/inquiry";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/layout/admin/AdminLayout";
import {
  Loader2,
  User,
  Phone,
  Eye,
  MapPin,
  Home,
  DollarSign,
  ClipboardList,
  NotebookPen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const LeadList = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchLeads = async () => {
    try {
      const data = await getAgentInquiries();
      setLeads(data?.inquiries || []);
    } catch {
      toast.error("Failed to load leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const getStageColor = (stage: string) => {
    switch (stage?.toLowerCase()) {
      case "new":
        return "bg-blue-100 text-blue-700";
      case "contacted":
        return "bg-yellow-100 text-yellow-700";
      case "interested":
        return "bg-green-100 text-green-700";
      case "closed":
        return "bg-purple-100 text-purple-700";
      case "lost":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  if (loading)
    return (
      <AdminLayout>
        <div className="p-6 flex items-center justify-center text-gray-500">
          <Loader2 className="animate-spin mr-2" /> Loading leads...
        </div>
      </AdminLayout>
    );

  return (
    <AdminLayout>
      <div className="min-h-screen transition-colors">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3 mr-auto">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-xl">
              <NotebookPen className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-semibold text-gray-800">My Leads</h1>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {leads.length} lead{leads.length !== 1 && "s"}
          </span>
        </div>

        {/* Empty State */}
        {leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <ClipboardList size={50} className="text-gray-400 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No leads found
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className="relative bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:-translate-y-1 transition-all duration-200 group"
              >
                {/* Customer Info */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300">
                    <User size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100 capitalize">
                      {lead.customer_name || "Unnamed"}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {lead.customer_email || "No email"}
                    </p>
                  </div>
                </div>

                {/* Contact */}
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-3 flex items-center">
                  <Phone className="inline mr-2 text-blue-500" size={14} />
                  {lead.customer_phone || "No phone"}
                </div>

                {/* Property Info */}
                {lead.property && (
                  <div className="border-t border-gray-100 dark:border-gray-700 pt-3 mt-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mb-1">
                      <Home size={14} className="text-indigo-500" />
                      <span>{lead.property.title}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mb-1">
                      <MapPin size={14} className="text-pink-500" />
                      <span>{lead.property.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <DollarSign size={14} className="text-green-500" />
                      <span>${Number(lead.property.price).toLocaleString()}</span>
                    </div>
                  </div>
                )}

                {/* Stage */}
                <div className="mt-4 flex items-center justify-between">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${getStageColor(
                      lead.stage
                    )}`}
                  >
                    {lead.stage || "unknown"}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer transition-all"
                    onClick={() =>
                      navigate(`/agent/leads/${lead.id}`)
                    }
                  >
                    <Eye size={15} />
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default LeadList;
