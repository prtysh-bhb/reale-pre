// src/pages/agent/leads/ViewLead.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getInquiryById,
  updateInquiryStage,
  addInquiryNote,
  getInquiryHistory,
} from "@/api/agent/inquiry";
import AdminLayout from "@/components/layout/admin/AdminLayout";
import { toast } from "sonner";
import {
  Loader2,
  Send,
  Clock,
  MapPin,
  Phone,
  Mail,
  User,
  Home,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const stages = [
  "new",
  "contacted",
  "qualified",
  "negotiation",
  "closed_won",
  "closed_lost",
];

const stageColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-yellow-100 text-yellow-700",
  qualified: "bg-teal-100 text-teal-700",
  negotiation: "bg-orange-100 text-orange-700",
  closed_won: "bg-green-100 text-green-700",
  closed_lost: "bg-red-100 text-red-700",
};

const ViewLead = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lead, setLead] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [note, setNote] = useState("");

  const fetchLead = async () => {
    try {
      const data = await getInquiryById(Number(id));
      setLead(data);
      const historyData = await getInquiryHistory(Number(id));
      setHistory(historyData);
    } catch {
      toast.error("Failed to load lead details");
    } finally {
      setLoading(false);
    }
  };

  const handleStageChange = async (e: any) => {
    const newStage = e.target.value;
    setUpdating(true);
    try {
      await updateInquiryStage(Number(id), newStage, note);
      toast.success("Lead stage updated");
      fetchLead();
    } catch {
      toast.error("Failed to update stage");
    } finally {
      setUpdating(false);
    }
  };

  const handleAddNote = async () => {
    if (!note.trim()) return toast.error("Enter a note first");
    setUpdating(true);
    try {
      await addInquiryNote(Number(id), note);
      toast.success("Note added");
      setNote("");
      fetchLead();
    } catch {
      toast.error("Failed to add note");
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchLead();
  }, [id]);

  if (loading)
    return (
      <AdminLayout>
        <div className="p-6 text-gray-500 flex items-center justify-center">
          <Loader2 className="animate-spin mr-2" /> Loading lead details...
        </div>
      </AdminLayout>
    );

  // Build query params to prefill create appointment form
  const openCreateAppointment = () => {
    const params = new URLSearchParams();
    // prefer explicit ids if present
    if (lead?.customer_id) params.set("customer_id", String(lead.customer_id));
    // fallback to email or name so frontend can match
    else if (lead?.customer_email) params.set("customer_email", lead.customer_email);
    else if (lead?.customer_name) params.set("customer_name", lead.customer_name);

    if (lead?.property?.id) params.set("property_id", String(lead.property.id));
    else if (lead?.property?.title) params.set("property_title", lead.property.title);

    navigate(`/agent/appointments?${params.toString()}`);
  };

  return (
    <AdminLayout>
      <div className="mx-auto space-y-8">
        <div className="flex items-center mb-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium hover:underline hover:translate-x-[-2px] transition-transform cursor-pointer"
          >
            <ArrowLeft size={18} /> Back
          </button>
        </div>

        {/* Top Section - Lead Info */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Lead Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300">
                <User size={22} />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 capitalize">
                  {lead?.customer_name || "Unnamed Lead"}
                </h1>
                <p className="text-gray-500 text-sm">
                  ID #{lead?.id} — Created on{" "}
                  {new Date(lead?.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-gray-600 dark:text-gray-300 text-sm">
              <p className="flex items-center gap-2">
                <Mail size={16} className="text-indigo-500" />
                {lead?.customer_email || "No email"}
              </p>
              <p className="flex items-center gap-2">
                <Phone size={16} className="text-green-500" />
                {lead?.customer_phone || "No phone"}
              </p>
              <p className="flex items-center gap-2">
                <MapPin size={16} className="text-pink-500" />
                {lead?.property?.location || "No location"}
              </p>
              <p className="flex items-center gap-2">
                <Home size={16} className="text-gray-500" />
                {lead?.property?.title || "No property linked"}
              </p>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <span
                className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                  stageColors[lead?.stage] || "bg-gray-100 text-gray-700"
                }`}
              >
                {lead?.stage?.replace("_", " ").toUpperCase()}
              </span>

              {/* New button: Create appointment for this lead */}
              <Button
                onClick={openCreateAppointment}
                className="ml-3 bg-gradient-to-r from-blue-600 to-emerald-600 text-white"
              >
                Create Appointment
              </Button>
            </div>
          </div>

          {/* Actions Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
              Update Lead
            </h3>

            {/* Stage Select */}
            <label className="text-gray-600 text-sm font-medium mb-2 block">
              Lead Stage
            </label>
            <select
              value={lead?.stage || ""}
              onChange={handleStageChange}
              className="border border-gray-300 cursor-pointer dark:border-gray-600 rounded-md p-2 text-sm w-full bg-gray-50 dark:bg-gray-700 dark:text-gray-100 mb-5 focus:ring-2 focus:ring-indigo-400"
            >
              {stages.map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ").toUpperCase()}
                </option>
              ))}
            </select>

            {/* Add Note */}
            <label className="text-gray-600 text-sm font-medium mb-2 block">
              Add a Note
            </label>
            <textarea
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-3 text-sm bg-gray-50 dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-400"
              placeholder="Add a note..."
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <Button
              onClick={handleAddNote}
              disabled={updating}
              className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 cursor-pointer"
            >
              {updating ? <Loader2 className="animate-spin mr-2" /> : <Send size={16} />}
              Add Note
            </Button>
          </div>
        </div>

        {/* Lead History */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
            Lead History
          </h2>

          {history.length === 0 ? (
            <p className="text-sm text-gray-500">No history available.</p>
          ) : (
            <div className="space-y-5">
              {history.map((h, i) => (
                <div key={i} className="relative border-l-4 border-indigo-500 pl-4 pb-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      <Clock size={14} className="inline mr-1" /> {new Date(h.changed_at).toLocaleString()}
                    </span>
                    <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                      {h.from_stage?.toUpperCase()} → {h.to_stage?.toUpperCase()}
                    </span>
                  </div>
                  {h.note && <p className="text-gray-700 dark:text-gray-300 text-sm mt-1">{h.note}</p>}
                  <p className="text-xs text-gray-500 mt-1">By: {h.changed_by}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default ViewLead;
