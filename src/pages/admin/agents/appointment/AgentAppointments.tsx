/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* ========================================================= */
import React, { useEffect, useState, useCallback } from "react";
import moment from "moment-timezone";
import { useLocation } from "react-router-dom";
import AdminLayout from "@/components/layout/admin/AdminLayout";
import { toast } from "sonner";
import {
  fetchAgentCustomers,
  fetchAppointments,
  fetchAppointment,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  checkAvailability,
} from "@/api/agent/appointment";
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  User,
  Home,
  Search,
  Filter,
  X,
  Edit,
  Eye,
  Check,
  Slash,
  House,
  ClipboardClock,
} from "lucide-react";
import { getAgentProperties } from "@/api/agent/property";
import { Customer } from "@/types/appointment";
import { Button } from "@/components/ui/button";
import { handleKeyPress } from "@/helpers/customer_helper";

/**
 * Note: This component uses a safeApiCall helper to handle functions that may
 * accept a `token` param or may not. That avoids runtime signature errors if
 * different API helpers expect different argument lists.
 */

function resolveImageUrl(API_BASE: string, img?: string | null) {
  if (!img) return null;
  if (img.startsWith("http://") || img.startsWith("https://")) return img;
  if (img.startsWith("/")) return `${API_BASE.replace(/\/api\/?$/, "")}${img}`;
  return `${API_BASE.replace(/\/api\/?$/, "")}/${img}`.replace(/([^:]\/)\/+/, "$1");
}

/** Try calling fn(...args). If it throws due to unexpected extra arg (e.g. token),
 * try calling again with trailing arg removed. This is defensive to support
 * mixed function signatures across your API helpers.
 */
async function safeApiCall(fn: (...a: any[]) => Promise<any>, ...args: any[]) {
  try {
    return await fn(...args);
  } catch (err: any) {
    // If there was a token as the last arg, try without it
    if (args.length > 0) {
      try {
        const argsWithoutLast = args.slice(0, -1);
        return await fn(...argsWithoutLast);
      } catch (err2) {
        throw err; // original error
      }
    }
    throw err;
  }
}

export default function AgentAppointments({ token }: { token?: string | null }) {
  const API_BASE = import.meta.env.VITE_API_URL || "";
  const location = useLocation();

  const [properties, setProperties] = useState<any[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const [slots, setSlots] = useState<any[]>([]);
  const [checkingSlots, setCheckingSlots] = useState(false);
  const [creating, setCreating] = useState(false);

  const [selected, setSelected] = useState<any | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [form, setForm] = useState<any>({
    id: undefined,
    property_id: "",
    customer_id: "",
    inquiry_id: "",
    type: "visit",
    date: "",
    slot: "",
    duration_minutes: 30,
    location: "",
    phone_number: "",
    notes: "",
  });

  // Decline modal state
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineTarget, setDeclineTarget] = useState<any | null>(null);
  const [declineReason, setDeclineReason] = useState("");

  // Loading states for individual actions to prevent multiple clicks
  const [actionLoading, setActionLoading] = useState<{ [key: number]: string }>({});

  // prefill customer via ?customer_id=
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const cid = q.get("customer_id");
    if (cid) {
      setForm((s: any) => ({ ...s, customer_id: cid }));
      setShowCreate(true);
    }
  }, [location.search]);

  // helper to normalize API results (small safety wrapper)
  const toArray = (resp: any): any[] => {
    if (!resp) return [];
    if (Array.isArray(resp)) return resp;
    if (Array.isArray(resp.data)) return resp.data;
    if (Array.isArray(resp.appointments)) return resp.appointments;
    if (Array.isArray(resp.appointments?.data)) return resp.appointments.data;
    if (Array.isArray(resp.properties)) return resp.properties;
    if (Array.isArray(resp.customers)) return resp.customers;
    return [];
  };

  const loadProperties = useCallback(async () => {
    try {
      const data = await safeApiCall(getAgentProperties, token);
      const items = data && data.data ? data.data : toArray(data);
      setProperties(items.map((p: any) => ({ ...p, image: resolveImageUrl(API_BASE, p.image) })));
    } catch (e) {
      console.error("loadProperties", e);
      setProperties([]);
    }
  }, [token, API_BASE]);

  const loadCustomers = useCallback(async () => {
    try {
      const data = await safeApiCall(fetchAgentCustomers, token);
      const items = toArray(data);
      setCustomers(items);
    } catch (e) {
      console.error("loadCustomers", e);
      setCustomers([]);
    }
  }, [token]);

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await safeApiCall(fetchAppointments, 12, token);
      // handle multiple shapes
      const items = toArray(data?.appointments ?? data);
      setAppointments(
        items.map((a: any) => ({
          ...a,
          property: a.property
            ? { ...a.property, image: resolveImageUrl(API_BASE, a.property?.image) }
            : a.property,
        }))
      );
    } catch (e) {
      console.error("loadAppointments", e);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [token, API_BASE]);

  useEffect(() => {
    loadProperties();
    loadCustomers();
    loadAppointments();
  }, [loadProperties, loadCustomers, loadAppointments]);

  const handleCheckAvailability = async (date: string) => {
    if (!date) return;
    setCheckingSlots(true);
    try {
      // call checkAvailability(date[, token]) safely
      const data = await safeApiCall(checkAvailability, date, token);
      const items = data?.time_slots ?? data?.data?.time_slots ?? data ?? [];
      const normalized = (Array.isArray(items) ? items : []).map((it: any) => ({
        datetime: it.datetime ?? `${date}T${it.start_time ?? "09:00"}:00`,
        is_available:
          typeof it.is_available === "boolean" ? it.is_available : !(it.booked ?? false),
      }));
      setSlots(normalized);
    } catch (e) {
      console.error("checkAvailability", e);
      setSlots([]);
      toast.error("Failed to load availability");
    } finally {
      setCheckingSlots(false);
    }
  };

  const handleOpenCreate = () => {
    setForm({
      id: undefined,
      property_id: "",
      customer_id: "",
      inquiry_id: "",
      type: "visit",
      date: "",
      slot: "",
      duration_minutes: 30,
      location: "",
      phone_number: "",
      notes: "",
    });
    setShowCreate(true);
    setShowEdit(false);
    setSlots([]);
  };

  const handleOpenEdit = async (appt: any) => {
    try {
      const data = await safeApiCall(fetchAppointment, appt.id, token);
      // data might be wrapper or direct
      const row = data?.appointment ?? data;
      setForm({
        id: row.id,
        property_id: row.property_id?.toString() ?? "",
        customer_id: row.customer_id?.toString() ?? "",
        inquiry_id: row.inquiry_id?.toString() ?? "",
        type: row.type,
        date: moment.utc(row.scheduled_at).tz("Asia/Kolkata").format("YYYY-MM-DD"),
        slot: moment.utc(row.scheduled_at).tz("Asia/Kolkata").format("HH:mm"),
        duration_minutes: row.duration_minutes ?? 30,
        location: row.location ?? "",
        phone_number: row.phone_number ?? "",
        notes: row.notes ?? "",
      });
      // fetch availability for the date so agent can change slot
      await handleCheckAvailability(
        moment.utc(row.scheduled_at).tz("Asia/Kolkata").format("YYYY-MM-DD")
      );
      setShowCreate(true);
      setShowEdit(true);
    } catch (e) {
      console.error("handleOpenEdit", e);
      toast.error("Failed to open appointment for edit");
    }
  };

  const handleSubmit = async () => {
    if (!form.property_id) return toast.error("Select property");
    if (!form.customer_id) return toast.error("Select customer");
    if (!form.date) return toast.error("Select date");
    if (!form.slot) return toast.error("Pick a slot");
    if (form.type === "visit" && !form.location) return toast.error("Enter visit location");
    if (form.type === "call" && !form.phone_number)
      return toast.error("Enter phone number for call");

    setCreating(true);
    try {
      // combine local date + time with Asia/Kolkata tz
      const combinedDateSlot = moment
        .tz(`${form.date} ${form.slot}`, "YYYY-MM-DD HH:mm", "Asia/Kolkata")
        .toISOString();

      const payload: any = {
        property_id: form.property_id,
        customer_id: form.customer_id,
        type: form.type,
        scheduled_at: combinedDateSlot,
        duration_minutes: Number(form.duration_minutes) || 30,
        notes: form.notes || undefined,
      };
      if (form.location) payload.location = form.location;
      if (form.phone_number) payload.phone_number = form.phone_number;
      if (form.inquiry_id) payload.inquiry_id = form.inquiry_id;

      if (showEdit && form.id) {
        // update
        await safeApiCall(updateAppointment, form.id, payload, token);
        toast.success("Appointment updated");
      } else {
        await safeApiCall(createAppointment, payload, token);
        toast.success("Appointment created");
      }

      setShowCreate(false);
      setShowEdit(false);
      setForm({
        id: undefined,
        property_id: "",
        customer_id: "",
        inquiry_id: "",
        type: "visit",
        date: "",
        slot: "",
        duration_minutes: 30,
        location: "",
        phone_number: "",
        notes: "",
      });

      await loadAppointments();
      if (form.date) await handleCheckAvailability(form.date);
    } catch (err: any) {
      console.error("handleSubmit", err);
      toast.error(err?.response?.data?.message ?? "Failed to save appointment");
    } finally {
      setCreating(false);
    }
  };

  // Only allow cancel when appointment.status === "scheduled"
  const handleOpenCancel = (appt: any) => {
    if (!appt) return;
    if (appt.status !== "scheduled") {
      toast.error("Only scheduled appointments can be cancelled");
      return;
    }
    setSelected(appt);
    setCancelReason("");
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!selected) return;
    if (!cancelReason.trim()) return toast.error("Cancellation reason required");
    setActionLoading((prev) => ({ ...prev, [selected.id]: "cancelling" }));
    try {
      await safeApiCall(
        cancelAppointment,
        selected.id,
        { cancellation_reason: cancelReason },
        token
      );
      toast.success("Appointment cancelled");

      // Update local state quickly
      setAppointments((prev) =>
        prev.map((a) => (a.id === selected.id ? { ...a, status: "cancelled" } : a))
      );
      setSelected((prev: any) => (prev ? { ...prev, status: "cancelled" } : prev));

      setShowCancelModal(false);
      await loadAppointments();
    } catch (e) {
      console.error("handleConfirmCancel", e);
      toast.error("Cancel failed");
    } finally {
      setActionLoading((prev) => {
        const newState = { ...prev };
        delete newState[selected.id];
        return newState;
      });
    }
  };

  const openDetails = async (id: number) => {
    try {
      const data = await safeApiCall(fetchAppointment, id, token);
      const row = data?.appointment ?? data;
      setSelected(row);
    } catch (e) {
      console.error("openDetails", e);
      toast.error("Failed to load appointment");
    }
  };

  const canCreate = () => {
    if (!form.property_id || !form.customer_id || !form.date || !form.slot) return false;
    if (form.type === "visit" && !form.location) return false;
    if (form.type === "call" && !form.phone_number) return false;
    return true;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border dark:border-emerald-800/50";
      case "cancelled":
        return "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 dark:border dark:border-rose-800/50";
      case "completed":
        return "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 dark:border dark:border-blue-800/50";
      case "approved":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border dark:border-emerald-800/50";
      case "declined":
        return "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 dark:border dark:border-rose-800/50";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400 dark:border dark:border-gray-700/50";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "visit":
        return "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 dark:border dark:border-purple-800/50";
      case "call":
        return "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 dark:border dark:border-amber-800/50";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400 dark:border dark:border-gray-700/50";
    }
  };

  // Check if appointment can be approved/declined
  const canTakeAction = (appt: any) => {
    return appt.status === "scheduled" && !actionLoading[appt.id];
  };

  // Agent actions: Approve
  const handleApprove = async (appt: any) => {
    if (!appt || !canTakeAction(appt)) return;

    setActionLoading((prev) => ({ ...prev, [appt.id]: "approving" }));
    try {
      await safeApiCall(updateAppointment, appt.id, { status: "approved" }, token);
      toast.success("Appointment approved");

      setAppointments((prev) =>
        prev.map((a) => (a.id === appt.id ? { ...a, status: "approved" } : a))
      );
      if (selected?.id === appt.id) setSelected((s: any) => ({ ...s, status: "approved" }));

      // refresh list
      await loadAppointments();
    } catch (e: any) {
      console.error("handleApprove", e);
      toast.error(e?.response?.data?.message ?? "Failed to approve appointment");
    } finally {
      setActionLoading((prev) => {
        const newState = { ...prev };
        delete newState[appt.id];
        return newState;
      });
    }
  };

  // Decline modal flow
  const openDeclineModal = (appt: any) => {
    if (!appt || !canTakeAction(appt)) {
      if (appt?.status !== "scheduled") {
        toast.error("Only scheduled appointments can be declined");
      }
      return;
    }
    setDeclineTarget(appt);
    setDeclineReason("");
    setShowDeclineModal(true);
  };

  const confirmDecline = async () => {
    if (!declineTarget) return;
    if (!declineReason.trim()) {
      toast.error("Please enter a reason");
      return;
    }

    setActionLoading((prev) => ({ ...prev, [declineTarget.id]: "declining" }));
    try {
      await safeApiCall(
        updateAppointment,
        declineTarget.id,
        {
          status: "declined",
          decline_reason: declineReason,
        },
        token
      );

      toast.success("Appointment declined");
      setAppointments((prev) =>
        prev.map((a) => (a.id === declineTarget.id ? { ...a, status: "declined" } : a))
      );
      if (selected?.id === declineTarget.id)
        setSelected((s: any) => ({ ...s, status: "declined", decline_reason: declineReason }));

      setShowDeclineModal(false);
      setDeclineTarget(null);
      await loadAppointments();
    } catch (e: any) {
      console.error("confirmDecline", e);
      toast.error(e?.response?.data?.message ?? "Failed to decline appointment");
    } finally {
      setActionLoading((prev) => {
        const newState = { ...prev };
        if (declineTarget) delete newState[declineTarget.id];
        return newState;
      });
    }
  };

  // Filter appointments based on search and status
  // IMPORTANT: default behaviour = hide cancelled appointments (unless user selects 'cancelled' filter)
  const filteredAppointments = appointments.filter((appointment) => {
    // hide cancelled by default
    if (statusFilter === "all" && appointment.status === "cancelled") return false;
    // if other filter selected, obey it
    if (statusFilter !== "all" && appointment.status !== statusFilter) return false;

    const matchesSearch =
      searchTerm === "" ||
      (appointment.property?.title ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (appointment.customer?.name ?? "").toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  return (
    <AdminLayout>
      <div className="min-h-screen">
        <div className="mx-auto py-6 px-4">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3 mr-auto">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-emerald-500 dark:from-blue-600 dark:to-emerald-600 rounded-xl">
                <ClipboardClock className="text-white" size={24} />
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Appointments</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Manage and schedule customer appointments
                </p>
              </div>
            </div>
            <div>
              <Button
                onClick={handleOpenCreate}
                disabled={false}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-gradient-to-r dark:from-blue-600 dark:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800 text-white px-4 py-2.5 rounded-xl font-medium shadow-lg dark:shadow-blue-900/20"
              >
                Create Appointment
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-900/50 dark:backdrop-blur-sm rounded-2xl p-6 shadow-sm dark:shadow-lg border border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Appointments</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{appointments.length}</p>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 dark:border dark:border-blue-800/30 rounded-xl">
                  <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3">
                <span className="text-sm text-green-600 dark:text-emerald-400 font-medium">+12.5%</span>
                <span className="text-sm text-gray-500 dark:text-gray-500">from last month</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900/50 dark:backdrop-blur-sm rounded-2xl p-6 shadow-sm dark:shadow-lg border border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Scheduled</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {appointments.filter((a) => a.status === "scheduled").length}
                  </p>
                </div>
                <div className="p-3 bg-green-50 dark:bg-emerald-900/30 dark:border dark:border-emerald-800/30 rounded-xl">
                  <Clock className="w-6 h-6 text-green-600 dark:text-emerald-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900/50 dark:backdrop-blur-sm rounded-2xl p-6 shadow-sm dark:shadow-lg border border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {appointments.filter((a) => a.status === "completed").length}
                  </p>
                </div>
                <div className="p-3 bg-emerald-50 dark:bg-blue-900/30 dark:border dark:border-blue-800/30 rounded-xl">
                  <Home className="w-6 h-6 text-emerald-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900/50 dark:backdrop-blur-sm rounded-2xl p-6 shadow-sm dark:shadow-lg border border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Cancelled</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {appointments.filter((a) => a.status === "cancelled").length}
                  </p>
                </div>
                <div className="p-3 bg-red-50 dark:bg-rose-900/30 dark:border dark:border-rose-800/30 rounded-xl">
                  <X className="w-6 h-6 text-red-600 dark:text-rose-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-900/50 dark:backdrop-blur-sm rounded-2xl shadow-sm dark:shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden">
                {/* Header with Filters */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Search appointments..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent"
                        />
                      </div>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent"
                      >
                        <option value="all">All Status (hide cancelled)</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="approved">Approved</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="declined">Declined</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => loadAppointments()}
                        className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors w-full sm:w-auto justify-center flex"
                      >
                        <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Appointments List */}
                <div className="p-6">
                  {loading ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : filteredAppointments.length === 0 ? (
                    <div className="text-center py-12">
                      <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No appointments found</p>
                      <p className="text-gray-400 dark:text-gray-600 text-sm mt-1">
                        {searchTerm || statusFilter !== "all"
                          ? "Try adjusting your filters"
                          : "No appointments available"}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredAppointments.map((appointment) => {
                        const canAction = canTakeAction(appointment);
                        const isActionLoading = actionLoading[appointment.id];

                        return (
                          <div
                            key={appointment.id}
                            className="flex-1 md:flex items-center gap-5 p-5 rounded-xl border border-gray-100 dark:border-gray-800 hover:shadow-md dark:hover:bg-gray-800/50 transition-all duration-200 bg-white dark:bg-gray-900/30"
                          >
                            <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 dark:border dark:border-blue-800/30 flex items-center justify-center">
                              {appointment.type === "visit" ? (
                                <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                              ) : (
                                <Phone className="w-6 h-6 text-green-600 dark:text-emerald-400" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex-1 md:flex gap-3 items-start justify-between">
                                <div>
                                  <h3 className="font-semibold text-gray-900 dark:text-white truncate text-[22px] lg:text-3xl">
                                    {appointment.property?.title ||
                                      `Property #${appointment.property_id}`}
                                  </h3>
                                  <div className="flex items-center gap-2 mt-1">
                                    <User className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                    <span className="text-sm text-gray-600 dark:text-gray-300">
                                      {appointment.customer?.name || "Unknown Customer"}
                                    </span>

                                    <div className="flex items-center gap-2 ml-3">
                                      <button
                                        onClick={() => openDetails(appointment.id)}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                        title="View details"
                                      >
                                        <Eye className="w-4 h-4 text-gray-400 dark:hover:text-gray-300" />
                                      </button>

                                      <button
                                        onClick={() => handleOpenEdit(appointment)}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                        title="Edit appointment"
                                      >
                                        <Edit className="w-4 h-4 text-gray-400 dark:hover:text-gray-300" />
                                      </button>

                                      {/* Approve / Decline (agent actions) */}
                                      <button
                                        onClick={() => handleApprove(appointment)}
                                        disabled={!canAction}
                                        title={
                                          !canAction
                                            ? "Only scheduled appointments can be approved"
                                            : "Approve appointment"
                                        }
                                        className={`ml-2 inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                          !canAction
                                            ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                                            : "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-800/30 dark:border dark:border-emerald-800/50"
                                        }`}
                                      >
                                        {isActionLoading === "approving" ? (
                                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600 dark:border-emerald-400"></div>
                                        ) : (
                                          <Check className="w-4 h-4" />
                                        )}
                                        {isActionLoading === "approving"
                                          ? "Approving..."
                                          : "Approve"}
                                      </button>

                                      <button
                                        onClick={() => openDeclineModal(appointment)}
                                        disabled={!canAction}
                                        title={
                                          !canAction
                                            ? "Only scheduled appointments can be declined"
                                            : "Decline appointment"
                                        }
                                        className={`ml-2 inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                          !canAction
                                            ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                                            : "bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-800/30 dark:border dark:border-rose-800/50"
                                        }`}
                                      >
                                        <Slash className="w-4 h-4" />
                                        Decline
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-3">
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                  <span className="text-sm text-gray-600 dark:text-gray-300">
                                    {moment
                                      .utc(appointment.scheduled_at)
                                      .tz("Asia/Kolkata")
                                      .format("MMM D, YYYY")}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                  <span className="text-sm text-gray-600 dark:text-gray-300">
                                    {moment
                                      .utc(appointment.scheduled_at)
                                      .tz("Asia/Kolkata")
                                      .format("h:mm A")}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                      appointment.status
                                    )}`}
                                  >
                                    {appointment.status}
                                  </span>
                                  <span
                                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${getTypeColor(
                                      appointment.type
                                    )}`}
                                  >
                                    {appointment.type}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white dark:bg-gray-900/50 dark:backdrop-blur-sm rounded-2xl p-6 shadow-sm dark:shadow-lg border border-gray-100 dark:border-gray-800">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center gap-3 p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="p-2 bg-green-100 dark:bg-emerald-900/30 dark:border dark:border-emerald-800/30 rounded-lg">
                      <Calendar className="w-4 h-4 text-green-600 dark:text-emerald-400" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900 dark:text-white">View Calendar</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">See all scheduled events</div>
                    </div>
                  </button>

                  <button
                    onClick={() => loadAppointments()}
                    className="w-full flex items-center gap-3 p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 dark:border dark:border-gray-700 rounded-lg">
                      <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900 dark:text-white">Refresh List</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Fetch latest appointments</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Appointment Details */}
              {selected && (
                <div className="bg-white dark:bg-gray-900/50 dark:backdrop-blur-sm rounded-2xl p-6 shadow-sm dark:shadow-lg border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Appointment Details</h3>
                    <button
                      onClick={() => setSelected(null)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Property</label>
                      <p className="text-gray-900 dark:text-white font-medium mt-1">{selected.property?.title}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Customer</label>
                      <p className="text-gray-900 dark:text-white font-medium mt-1">{selected.customer?.name}</p>
                      {selected.customer?.email && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{selected.customer.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Date & Time</label>
                      <p className="text-gray-900 dark:text-white font-medium mt-1">
                        {moment(selected.scheduled_at)
                          .tz("Asia/Kolkata")
                          .format("MMMM D, YYYY [at] h:mm A")}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          selected.status
                        )}`}
                      >
                        {selected.status}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(
                          selected.type
                        )}`}
                      >
                        {selected.type}
                      </span>
                    </div>

                    {selected.notes && (
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Notes</label>
                        <p className="text-gray-700 dark:text-gray-300 mt-1 text-sm">{selected.notes}</p>
                      </div>
                    )}

                    {selected.decline_reason && selected.status === "declined" && (
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Decline Reason</label>
                        <p className="text-gray-700 dark:text-gray-300 mt-1 text-sm">{selected.decline_reason}</p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleApprove(selected)}
                        disabled={!canTakeAction(selected)}
                        className={`px-4 py-2.5 rounded-xl ${
                          !canTakeAction(selected)
                            ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                            : "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-800/30 dark:border dark:border-emerald-800/50"
                        } font-medium transition-colors`}
                      >
                        {actionLoading[selected.id] === "approving" ? "Approving..." : "Approve"}
                      </button>

                      <button
                        onClick={() => openDeclineModal(selected)}
                        disabled={!canTakeAction(selected)}
                        className={`px-4 py-2.5 rounded-xl ${
                          !canTakeAction(selected)
                            ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                            : "bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-800/30 dark:border dark:border-rose-800/50"
                        } font-medium transition-colors`}
                      >
                        Decline
                      </button>

                      <button
                        onClick={() => handleOpenCancel(selected)}
                        disabled={selected.status !== "scheduled"}
                        className={`px-4 py-2.5 rounded-xl ${
                          selected.status !== "scheduled"
                            ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                            : "bg-red-50 dark:bg-rose-900/30 text-red-600 dark:text-rose-400 hover:bg-red-100 dark:hover:bg-rose-800/30 dark:border dark:border-rose-800/50"
                        } font-medium transition-colors`}
                      >
                        Cancel
                      </button>

                      <button
                        onClick={() => setSelected(null)}
                        className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Create / Edit Modal */}
          {showCreate && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/40 dark:bg-black/60" onClick={() => setShowCreate(false)} />
              <div className="relative w-full max-w-4xl bg-white dark:bg-gray-900 dark:border dark:border-gray-800 rounded-2xl shadow-xl dark:shadow-2xl p-6 z-10 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {showEdit ? "Edit Appointment" : "Create New Appointment"}
                  </h3>
                  <button
                    onClick={() => setShowCreate(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                        Property
                      </label>
                      <select
                        value={form.property_id}
                        onChange={(e) =>
                          setForm((s: any) => ({ ...s, property_id: e.target.value }))
                        }
                        className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent"
                      >
                        <option value="">Select property</option>
                        {properties.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                        Customer
                      </label>
                      <select
                        value={form.customer_id}
                        onChange={(e) =>
                          setForm((s: any) => ({ ...s, customer_id: e.target.value }))
                        }
                        className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent"
                      >
                        <option value="">Select customer</option>
                        {customers.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} {c.email ? `(${c.email})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                        Appointment Type
                      </label>
                      <select
                        value={form.type}
                        onChange={(e) => setForm((s: any) => ({ ...s, type: e.target.value }))}
                        className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent"
                      >
                        <option value="visit">Property Visit</option>
                        <option value="call">Phone Call</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">Date</label>
                      <input
                        type="date"
                        value={form.date}
                        onChange={(e) =>
                          setForm((s: any) => ({ ...s, date: e.target.value, slot: "" }))
                        }
                        className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                        Duration (minutes)
                      </label>
                      <input
                        type="number"
                        min={15}
                        max={480}
                        value={form.duration_minutes}
                        onChange={(e) =>
                          setForm((s: any) => ({ ...s, duration_minutes: Number(e.target.value) }))
                        }
                        className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                        {form.type === "call" ? "Phone Number" : "Meeting Location"}
                      </label>
                      <input
                        maxLength={form.type === "call" ? 15 : 50}
                        value={form.type === "call" ? form.phone_number : form.location}
                        onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) =>
                                                handleKeyPress(e, /[0-9()+-\s]/, false)
                                              }
                        onChange={(e) =>
                          form.type === "call"
                            ? setForm((s: any) => ({ ...s, phone_number: e.target.value }))
                            : setForm((s: any) => ({ ...s, location: e.target.value }))
                        }
                        className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent"
                        placeholder={
                          form.type === "call"
                            ? "Enter phone number"
                            : "Enter address or meeting spot"
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                        Inquiry ID (optional)
                      </label>
                      <input
                        value={form.inquiry_id}
                        onChange={(e) =>
                          setForm((s: any) => ({ ...s, inquiry_id: e.target.value }))
                        }
                        className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent"
                        placeholder="Link an inquiry ID"
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <button
                          onClick={() => handleCheckAvailability(form.date)}
                          disabled={!form.date}
                          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-gradient-to-r dark:from-blue-600 dark:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Check Availability
                        </button>
                        <span className="text-sm text-gray-500 dark:text-gray-500">Find available time slots</span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {checkingSlots ? (
                          <div className="text-sm text-gray-500 dark:text-gray-400">Checking available slots...</div>
                        ) : slots.length === 0 ? (
                          <div className="text-sm text-gray-400 dark:text-gray-500">
                            Select a date to see available slots
                          </div>
                        ) : (
                          slots.map((slot: any) => {
                            const isAvailable = slot.is_available !== false;
                            const hhmm = moment(slot.datetime).tz("Asia/Kolkata").format("HH:mm");
                            return (
                              <button
                                key={slot.datetime}
                                onClick={() =>
                                  isAvailable && setForm((f: any) => ({ ...f, slot: hhmm }))
                                }
                                disabled={!isAvailable}
                                className={`px-4 py-2 rounded-xl border-2 transition-all ${
                                  form.slot === hhmm
                                    ? "border-blue-600 bg-blue-600 text-white"
                                    : isAvailable
                                    ? "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                    : "border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-600 line-through cursor-not-allowed"
                                }`}
                              >
                                {moment(slot.datetime).tz("Asia/Kolkata").format("h:mm A")}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">Notes</label>
                      <textarea
                        value={form.notes}
                        onChange={(e) => setForm((s: any) => ({ ...s, notes: e.target.value }))}
                        className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent h-24"
                        placeholder="Additional notes about the appointment..."
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
                  <button
                    onClick={() => setShowCreate(false)}
                    className="px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={creating || !canCreate()}
                    className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                      creating || !canCreate()
                        ? "bg-gray-300 dark:bg-gray-800 text-gray-500 dark:text-gray-500 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700 dark:bg-gradient-to-r dark:from-emerald-600 dark:to-emerald-700 dark:hover:from-emerald-700 dark:hover:to-emerald-800 text-white"
                    }`}
                  >
                    {creating ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        {showEdit ? "Updating..." : "Creating..."}
                      </div>
                    ) : showEdit ? (
                      "Save Changes"
                    ) : (
                      "Create Appointment"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Cancel Modal */}
          {showCancelModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div
                className="absolute inset-0 bg-black/40 dark:bg-black/60"
                onClick={() => setShowCancelModal(false)}
              />
              <div className="relative w-full max-w-md bg-white dark:bg-gray-900 dark:border dark:border-gray-800 rounded-2xl shadow-xl dark:shadow-2xl p-6 z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-100 dark:bg-rose-900/30 dark:border dark:border-rose-800/30 rounded-lg">
                    <X className="w-5 h-5 text-red-600 dark:text-rose-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Cancel Appointment</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">This action cannot be undone</p>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                    Cancellation Reason <span className="text-red-500 dark:text-rose-500">*</span>
                  </label>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-red-500 dark:focus:ring-rose-600 focus:border-transparent h-28"
                    placeholder="Please provide a reason for cancellation..."
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowCancelModal(false)}
                    className="px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Keep Appointment
                  </button>
                  <button
                    onClick={handleConfirmCancel}
                    disabled={!cancelReason.trim()}
                    className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                      !cancelReason.trim()
                        ? "bg-gray-300 dark:bg-gray-800 text-gray-500 dark:text-gray-500 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700 dark:bg-gradient-to-r dark:from-rose-600 dark:to-rose-700 dark:hover:from-rose-700 dark:hover:to-rose-800 text-white"
                    }`}
                  >
                    Confirm Cancellation
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Decline Modal */}
          {showDeclineModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div
                className="absolute inset-0 bg-black/40 dark:bg-black/60"
                onClick={() => setShowDeclineModal(false)}
              />
              <div className="relative w-full max-w-md bg-white dark:bg-gray-900 dark:border dark:border-gray-800 rounded-2xl shadow-xl dark:shadow-2xl p-6 z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-rose-100 dark:bg-rose-900/30 dark:border dark:border-rose-800/30 rounded-lg">
                    <Slash className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Decline Appointment</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Provide a reason for declining this appointment
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                    Decline Reason <span className="text-red-500 dark:text-rose-500">*</span>
                  </label>
                  <textarea
                    value={declineReason}
                    onChange={(e) => setDeclineReason(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-rose-500 dark:focus:ring-rose-600 focus:border-transparent h-28"
                    placeholder="Please provide a reason for declining..."
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowDeclineModal(false)}
                    className="px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDecline}
                    disabled={!declineReason.trim()}
                    className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                      !declineReason.trim()
                        ? "bg-gray-300 dark:bg-gray-800 text-gray-500 dark:text-gray-500 cursor-not-allowed"
                        : "bg-rose-600 hover:bg-rose-700 dark:bg-gradient-to-r dark:from-rose-600 dark:to-rose-700 dark:hover:from-rose-700 dark:hover:to-rose-800 text-white"
                    }`}
                  >
                    Confirm Decline
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}