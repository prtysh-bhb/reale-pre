/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trash2,
  AlertTriangle,
  Filter,
  Clock,
  Grid3x3,
  List,
  Plus,
  Edit3,
  Bell,
  Calendar,
  User,
  Home,
  MessageCircle,
  Zap,
  CheckCircle,
  XCircle,
  RefreshCw,
  X,
  Eye
} from "lucide-react";
import AdminLayout from "@/components/layout/admin/AdminLayout";
import { toast } from "sonner";
import Loader from "@/components/ui/Loader";
import DeleteModal from "../components/DeleteModal";
import { completeReminder, deleteReminder, getAgentReminders, Reminder, setSnoozeReminder } from "@/api/agent/reminders";
import { formatReadableDate } from "@/helpers/customer_helper";

const RemindersList = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [filter, setFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [showCompletePopup, setShowCompletePopup] = useState(false);
  const [showSnoozePopup, setShowSnoozePopup] = useState(false);
  const [note, setNote] = useState("");
  const [time, setTime] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const navigate = useNavigate();

  const openCompletePopup = (reminder: Reminder) => {
    setSelectedReminder(reminder);
    setNote("");
    setShowCompletePopup(true);
  };

  const openSnoozePopup = (reminder: Reminder) => {
    setSelectedReminder(reminder);
    setTime("");
    setShowSnoozePopup(true);
  };

  useEffect(() => {
    fetchReminders();
  }, [filter, statusFilter, priorityFilter, typeFilter]);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filter !== 'all') params.append('filter', filter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (priorityFilter !== 'all') params.append('priority', priorityFilter);
      if (typeFilter !== 'all') params.append('type', typeFilter);
      
      const response = await getAgentReminders(params);

      if (response.success) {
        setReminders(response.data.reminders.data || []);
      } else {
        setError("Failed to fetch reminders.");
      }
    } catch (error: any) {
      setError("Failed to fetch reminders.");
      toast.error("Error loading reminders: " + (error.message || ""));
    } finally {
      setLoading(false);
    }
  };

  const deleteModal = (reminder: Reminder) => {
    setSelectedReminder(reminder);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!selectedReminder) return;
    
    try {
      setDeleting(true);
      const response = await deleteReminder(selectedReminder.id);
      
      if (response.success) {
        toast.success("Reminder deleted successfully");
        fetchReminders();
      } else {
        toast.error("Failed to delete reminder");
      }
    } catch (error: any) {
      toast.error("Error deleting reminder: " + (error.message || ""));
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const markAsCompleted = async () => {
    try {
      const response = await completeReminder(selectedReminder!.id, note);
      
      if (response.success) {
        toast.success("Reminder marked as completed");
        fetchReminders();
      } else {
        toast.error("Failed to complete reminder");
      }
    } catch (error: any) {
      toast.error("Error completing reminder: " + (error.message || ""));
    } finally {
      setShowCompletePopup(false);
    }
  };

  const snoozeReminder = async () => {
    try {
      const response = await setSnoozeReminder(selectedReminder!.id, time);
      
      if (response.success) {
        toast.success(`Reminder snoozed for hours`);
        fetchReminders();
      } else {
        toast.error("Failed to snooze reminder");
      }
    } catch (error: any) {
      toast.error("Error snoozing reminder: " + (error.response.data.message || ""));
    } finally {
      setShowSnoozePopup(false);
    }
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      urgent: { color: 'bg-red-100 text-red-700 dark:bg-red-700/20 dark:text-red-400', icon: Zap },
      high: { color: 'bg-amber-100 text-amber-700 dark:bg-amber-700/20 dark:text-amber-400', icon: AlertTriangle },
      medium: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-700/20 dark:text-blue-400', icon: Clock },
      low: { color: 'bg-gray-100 text-gray-700 dark:bg-gray-700/20 dark:text-gray-400', icon: Bell }
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.low;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-amber-100 text-amber-700 dark:bg-amber-700/20 dark:text-amber-400', icon: Clock },
      completed: { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-700/20 dark:text-emerald-400', icon: CheckCircle },
      snoozed: { color: 'bg-purple-100 text-purple-700 dark:bg-purple-700/20 dark:text-purple-400', icon: RefreshCw },
      cancelled: { color: 'bg-red-100 text-red-700 dark:bg-red-700/20 dark:text-red-400', icon: XCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getTypeIcon = (type: string) => {
    const typeIcons = {
      appointment: Calendar,
      follow_up: User,
      property: Home,
      inquiry: MessageCircle,
      payment: Bell,
      general: Bell
    };

    const Icon = typeIcons[type as keyof typeof typeIcons] || Bell;
    return <Icon className="w-4 h-4" />;
  };

  const getTypeColor = (type: string) => {
    const typeColors = {
      appointment: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
      follow_up: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30',
      property: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
      inquiry: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30',
      payment: 'text-red-600 bg-red-100 dark:bg-red-900/30',
      general: 'text-gray-600 bg-gray-100 dark:bg-gray-900/30'
    };

    return typeColors[type as keyof typeof typeColors] || typeColors.general;
  };

  const isOverdue = (remindAt: string) => {
    return new Date(remindAt) < new Date();
  };

  const isDueToday = (remindAt: string) => {
    const today = new Date();
    const remindDate = new Date(remindAt);
    return remindDate.toDateString() === today.toDateString();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-xl">
                <Bell className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-semibold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                  Reminders
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Manage your reminders and stay organized
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* View Mode Toggle */}
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

              {/* Quick Filters */}
              <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 shadow-sm hover:border-blue-400 dark:hover:border-emerald-600 transition-all">
                <Filter size={16} className="text-gray-400 mr-2" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="bg-transparent outline-none text-sm text-gray-700 dark:text-gray-200 cursor-pointer"
                >
                  <option value="all">All Reminders</option>
                  <option value="today">Due Today</option>
                  <option value="overdue">Overdue</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 shadow-sm hover:border-blue-400 dark:hover:border-emerald-600 transition-all">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent outline-none text-sm text-gray-700 dark:text-gray-200 cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="snoozed">Snoozed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Priority Filter */}
              <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 shadow-sm hover:border-blue-400 dark:hover:border-emerald-600 transition-all">
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="bg-transparent outline-none text-sm text-gray-700 dark:text-gray-200 cursor-pointer"
                >
                  <option value="all">All Priority</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              {/* Type Filter */}
              <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 shadow-sm hover:border-blue-400 dark:hover:border-emerald-600 transition-all">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="bg-transparent outline-none text-sm text-gray-700 dark:text-gray-200 cursor-pointer"
                >
                  <option value="all">All Types</option>
                  <option value="appointment">Appointment</option>
                  <option value="follow_up">Follow Up</option>
                  <option value="property">Property</option>
                  <option value="inquiry">Inquiry</option>
                  <option value="payment">Payment</option>
                  <option value="general">General</option>
                </select>
              </div>

              {/* New Reminder Button */}
              <button
                onClick={() => navigate("/agent/reminders/new")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white transition-all text-sm shadow-md hover:shadow-lg font-medium"
              >
                <Plus size={16} />
                <span>New Reminder</span>
              </button>
            </div>
          </div>
        </div>

        {/* Loading / Error */}
        {loading && <Loader />}
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
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 text-gray-700 dark:text-gray-200">
                        <th className="py-4 px-6 text-left font-semibold">Reminder</th>
                        <th className="py-4 px-6 text-left font-semibold">Type</th>
                        <th className="py-4 px-6 text-left font-semibold">Related To</th>
                        <th className="py-4 px-6 text-left font-semibold">Due Date</th>
                        <th className="py-4 px-6 text-left font-semibold">Priority</th>
                        <th className="py-4 px-6 text-left font-semibold">Status</th>
                        <th className="py-4 px-6 text-center font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900">
                      {reminders.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="py-12 text-center text-gray-500 dark:text-gray-400"
                          >
                            <div className="flex flex-col items-center gap-3">
                              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                <Bell className="text-gray-400" size={24} />
                              </div>
                              <p className="font-medium">No reminders found</p>
                              <p className="text-sm">Try adjusting your search criteria</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        reminders.map((reminder, index) => (
                          <tr
                            key={reminder.id}
                            className={`border-b border-gray-100 dark:border-gray-800 hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-all group ${
                              index % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50/50 dark:bg-gray-800/50"
                            } ${isOverdue(reminder.remind_at) && reminder.status === 'pending' ? 'bg-red-50/50 dark:bg-red-900/10' : ''}`}
                          >
                            <td className="py-4 px-6">
                              <div className="flex items-start gap-3">
                                <div className={`w-10 h-10 rounded-xl ${getTypeColor(reminder.type)} flex items-center justify-center flex-shrink-0 mt-1`}>
                                  {getTypeIcon(reminder.type)}
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900 dark:text-white">
                                    {reminder.title}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                    {reminder.description}
                                  </p>
                                  {reminder.notes && (
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                      Note: {reminder.notes}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 capitalize">
                                {reminder.type.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <div className="space-y-1 text-xs">
                                {reminder.customer && (
                                  <div className="flex items-center gap-2">
                                    <User className="w-3 h-3 text-gray-400" />
                                    <span className="text-gray-600 dark:text-gray-400">{reminder.customer.name}</span>
                                  </div>
                                )}
                                {reminder.property && (
                                  <div className="flex items-center gap-2">
                                    <Home className="w-3 h-3 text-gray-400" />
                                    <span className="text-gray-600 dark:text-gray-400">{reminder.property.title}</span>
                                  </div>
                                )}
                                {reminder.appointment && (
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-3 h-3 text-gray-400" />
                                    <span className="text-gray-600 dark:text-gray-400">Appointment</span>
                                  </div>
                                )}
                                {!reminder.customer && !reminder.property && !reminder.appointment && (
                                  <span className="text-gray-400 dark:text-gray-500">-</span>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="space-y-1">
                                <span className={`text-sm font-medium ${
                                  isOverdue(reminder.remind_at) && reminder.status === 'pending' 
                                    ? 'text-red-600 dark:text-red-400' 
                                    : 'text-gray-900 dark:text-white'
                                }`}>
                                  {formatReadableDate(reminder.remind_at, true)}
                                </span>
                                {isOverdue(reminder.remind_at) && reminder.status === 'pending' && (
                                  <span className="text-xs text-red-500 font-medium">Overdue</span>
                                )}
                                {isDueToday(reminder.remind_at) && reminder.status === 'pending' && (
                                  <span className="text-xs text-amber-500 font-medium">Due Today</span>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              {getPriorityBadge(reminder.priority)}
                            </td>
                            <td className="py-4 px-6">
                              {getStatusBadge(reminder.status)}
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                {reminder.status === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => openCompletePopup(reminder)}
                                      className="p-2 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 transition-all hover:scale-110"
                                      title="Mark Complete"
                                    >
                                      <CheckCircle size={18} />
                                    </button>
                                    <button
                                      onClick={() => openSnoozePopup(reminder)}
                                      className="p-2 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-600 dark:text-amber-400 transition-all hover:scale-110"
                                      title="Snooze 1 Hour"
                                    >
                                      <RefreshCw size={18} />
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={() => navigate(`/agent/reminders/${reminder.id}/edit`)}
                                  className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-all hover:scale-110"
                                  title="Edit Reminder"
                                >
                                  <Edit3 size={18} />
                                </button>
                                <button
                                  onClick={() => navigate(`/agent/reminders/${reminder.id}`)}
                                  className="p-2 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400 transition-all hover:scale-110"
                                  title="View Reminder"
                                >
                                  <Eye size={18} />
                                </button>
                                <button
                                  onClick={() => deleteModal(reminder)}
                                  className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-all hover:scale-110"
                                  title="Delete Reminder"
                                >
                                  <Trash2 size={18} />
                                </button>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reminders.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                        <Bell className="text-gray-400" size={24} />
                      </div>
                      <p className="font-medium text-gray-500 dark:text-gray-400">No reminders found</p>
                      <p className="text-sm text-gray-400">Try adjusting your search criteria</p>
                    </div>
                  </div>
                ) : (
                  reminders.map((reminder) => (
                    <div
                      key={reminder.id}
                      className={`bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-lg hover:border-purple-200 dark:hover:border-purple-800 transition-all hover:-translate-y-1 group ${
                        isOverdue(reminder.remind_at) && reminder.status === 'pending' 
                          ? 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10' 
                          : ''
                      }`}
                    >
                      {/* Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl ${getTypeColor(reminder.type)} flex items-center justify-center`}>
                            {getTypeIcon(reminder.type)}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">
                              {reminder.title}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                              {reminder.type.replace('_', ' ')}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {getPriorityBadge(reminder.priority)}
                          {getStatusBadge(reminder.status)}
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                        {reminder.description}
                      </p>

                      {/* Related Information */}
                      {(reminder.customer || reminder.property || reminder.appointment) && (
                        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Related To:</p>
                          <div className="space-y-1">
                            {reminder.customer && (
                              <div className="flex items-center gap-2 text-xs">
                                <User className="w-3 h-3 text-gray-400" />
                                <span className="text-gray-600 dark:text-gray-400">{reminder.customer.name}</span>
                              </div>
                            )}
                            {reminder.property && (
                              <div className="flex items-center gap-2 text-xs">
                                <Home className="w-3 h-3 text-gray-400" />
                                <span className="text-gray-600 dark:text-gray-400">{reminder.property.title}</span>
                              </div>
                            )}
                            {reminder.appointment && (
                              <div className="flex items-center gap-2 text-xs">
                                <Calendar className="w-3 h-3 text-gray-400" />
                                <span className="text-gray-600 dark:text-gray-400">
                                  {new Date(reminder.appointment.scheduled_at).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Due Date */}
                      <div className={`mb-4 p-3 rounded-lg ${
                        isOverdue(reminder.remind_at) && reminder.status === 'pending'
                          ? 'bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800'
                          : 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-semibold ${
                            isOverdue(reminder.remind_at) && reminder.status === 'pending'
                              ? 'text-red-700 dark:text-red-400'
                              : 'text-blue-700 dark:text-blue-400'
                          }`}>
                            Due Date
                          </span>
                          {isOverdue(reminder.remind_at) && reminder.status === 'pending' && (
                            <span className="text-xs font-bold text-red-600 dark:text-red-400">OVERDUE</span>
                          )}
                        </div>
                        <p className={`text-sm ${
                          isOverdue(reminder.remind_at) && reminder.status === 'pending'
                            ? 'text-red-600 dark:text-red-300'
                            : 'text-gray-600 dark:text-gray-300'
                        }`}>
                          {formatReadableDate(reminder.remind_at, true)}
                        </p>
                      </div>

                      {/* Notes */}
                      {reminder.notes && (
                        <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/30 rounded-lg border border-amber-200 dark:border-amber-800">
                          <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">Note:</p>
                          <p className="text-sm text-amber-600 dark:text-amber-300 line-clamp-2">
                            {reminder.notes}
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                        {reminder.status === 'pending' && (
                          <>
                            <button
                              onClick={() => openCompletePopup(reminder)}
                              className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 transition-all font-medium text-sm"
                            >
                              <CheckCircle size={16} />
                              <span>Complete</span>
                            </button>
                            <button
                              onClick={() => openSnoozePopup(reminder)}
                              className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-600 dark:text-amber-400 transition-all font-medium text-sm"
                            >
                              <RefreshCw size={16} />
                              <span>Snooze</span>
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => navigate(`/agent/reminders/${reminder.id}/edit`)}
                          className="p-2.5 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-all"
                          title="Edit"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => navigate(`/agent/reminders/${reminder.id}`)}
                          className="p-2.5 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400 transition-all"
                          title="View"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => deleteModal(reminder)}
                          className="p-2.5 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-all"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}

        {/* Delete Modal */}
        {showDeleteModal && (
          <DeleteModal
            show={showDeleteModal}
            title="Delete Reminder"
            message="Are you sure you want to delete this reminder? This action cannot be undone."
            onClose={() => setShowDeleteModal(false)}
            onConfirm={handleDelete}
            loading={deleting}
            confirmText="Delete"
            cancelText="Cancel"
          />
        )}

        {/* Complete Popup */}
        {showCompletePopup && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-[90%] max-w-md border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-100">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <CheckCircle className="text-green-600 dark:text-green-400" size={20} />
                  </div>
                  Complete Reminder
                </h4>
                <button
                  onClick={() => setShowCompletePopup(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Completion note
              </p>

              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-green-400 dark:focus:ring-green-500 focus:border-green-400 dark:focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 mb-4 transition-all"
                placeholder="Enter note..."
              ></textarea>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowCompletePopup(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={markAsCompleted}
                  className="px-4 py-2 rounded-lg text-sm bg-green-600 hover:bg-green-700 text-white font-medium transition-all shadow-md hover:shadow-lg"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Snooze Popup */}
        {showSnoozePopup && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-[90%] max-w-md border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-100">
                  <div className="p-2 bg-amber-100 dark:bg-green-900/30 rounded-lg">
                    <CheckCircle className="text-amber-600 dark:text-amber-400" size={20} />
                  </div>
                  Snooze Reminder
                </h4>
                <button
                  onClick={() => setShowSnoozePopup(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Snooze Time
              </p>

              <input
                type="date"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-amber-400 dark:focus:ring-amber-500 focus:border-amber-400 dark:focus:border-amber-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 mb-4 transition-all"
              ></input>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowSnoozePopup(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={snoozeReminder}
                  className="px-4 py-2 rounded-lg text-sm bg-amber-600 hover:bg-amber-700 text-white font-medium transition-all shadow-md hover:shadow-lg"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default RemindersList;