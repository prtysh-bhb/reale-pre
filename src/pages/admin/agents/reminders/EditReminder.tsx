/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  Bell, 
  Calendar, 
  Clock, 
  User, 
  Home, 
  MessageCircle,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Save,
  RefreshCw,
  Eye
} from "lucide-react";
import AdminLayout from "@/components/layout/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getReminderById, Reminder, ReminderFormData, updateReminder } from "@/api/agent/reminders";
import { convertUTCToLocalInput, formatReadableDate } from "@/helpers/customer_helper";

interface Errors {
  title?: string;
  description?: string;
  type?: string;
  priority?: string;
  remind_at?: string;
  agent_id?: string;
  customer_id?: string;
  inquiry_id?: string;
  property_id?: string;
  appointment_id?: string;
  notes?: string;
  status?: string;
}

const EditReminder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reminder, setReminder] = useState<Reminder | null>(null);

  const [formData, setFormData] = useState<ReminderFormData>({
    title: '',
    description: '',
    type: 'general',
    priority: 'medium',
    remind_at: '',
    customer_id: null,
    inquiry_id: null,
    property_id: null,
    appointment_id: null,
    notes: ''
  });

  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (id) {
      fetchReminder();
    }
  }, [id]);

  const fetchReminder = async () => {
    try {
      setLoading(true);
      const response = await getReminderById(Number(id));

      if (response.success && response.data.reminder) {
        const reminderData = response.data.reminder;
        setReminder(reminderData);
        setFormData({
          title: reminderData.title,
          description: reminderData.description || '',
          type: reminderData.type || "general",
          priority: reminderData.priority,
          remind_at: reminderData.remind_at ? convertUTCToLocalInput(reminderData.remind_at) : '',
          notes: reminderData.notes || '',
          customer_id: reminderData.customer?.id || null,
          agent_id: reminderData.agent_id || undefined,
          inquiry_id: reminderData.inquiry?.id || null,
          property_id: reminderData.property?.id || null,
          appointment_id: reminderData.appointment?.id || null,
        });
      } else {
        toast.error("Failed to fetch reminder");
        navigate('/agent/reminders');
      }
    } catch (error: any) {
      toast.error("Error loading reminder: " + (error.message || ""));
      navigate('/agent/reminders');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Errors = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length > 100) {
      newErrors.title = "Title must be less than 100 characters";
    }

    // Description validation
    if (formData?.description && formData?.description.length > 1000) {
      newErrors.description = "Description must be less than 1000 characters";
    }

    // Type validation
    if (!formData.type) {
      newErrors.type = "Type is required";
    }

    // Remind at validation
    if (!formData.remind_at) {
      newErrors.remind_at = "Reminder date and time is required";
    }

    // Notes validation
    if (formData.notes && formData.notes.length > 500) {
      newErrors.notes = "Notes must be less than 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof ReminderFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const getTypeConfig = (type: string) => {
    const typeConfig = {
      inquiry_followup: { 
        icon: MessageCircle, 
        color: 'from-amber-500 to-orange-500',
        darkColor: 'dark:from-amber-600 dark:to-orange-600',
        bgColor: 'from-amber-50 to-orange-50',
        darkBgColor: 'dark:from-amber-900/30 dark:to-orange-900/30',
        borderColor: 'border-amber-200',
        darkBorderColor: 'dark:border-amber-800/50',
        label: 'Inquiry Follow-up'
      },
      appointment_followup: { 
        icon: Calendar, 
        color: 'from-blue-500 to-cyan-500',
        darkColor: 'dark:from-blue-600 dark:to-cyan-600',
        bgColor: 'from-blue-50 to-cyan-50',
        darkBgColor: 'dark:from-blue-900/30 dark:to-cyan-900/30',
        borderColor: 'border-blue-200',
        darkBorderColor: 'dark:border-blue-800/50',
        label: 'Appointment Follow-up'
      },
      general: { 
        icon: Bell, 
        color: 'from-purple-500 to-violet-500',
        darkColor: 'dark:from-purple-600 dark:to-violet-600',
        bgColor: 'from-purple-50 to-violet-50',
        darkBgColor: 'dark:from-purple-900/30 dark:to-violet-900/30',
        borderColor: 'border-purple-200',
        darkBorderColor: 'dark:border-purple-800/50',
        label: 'General'
      },
    };

    return typeConfig[type as keyof typeof typeConfig] || typeConfig.general;
  };

  const getPriorityConfig = (priority: string) => {
    const priorityConfig = {
      low: { 
        color: 'text-gray-600 bg-gray-100', 
        darkColor: 'dark:text-gray-300 dark:bg-gray-800', 
        icon: Bell 
      },
      medium: { 
        color: 'text-blue-600 bg-blue-100', 
        darkColor: 'dark:text-blue-400 dark:bg-blue-900/30', 
        icon: Clock 
      },
      high: { 
        color: 'text-amber-600 bg-amber-100', 
        darkColor: 'dark:text-amber-400 dark:bg-amber-900/30', 
        icon: AlertTriangle 
      },
      urgent: { 
        color: 'text-red-600 bg-red-100', 
        darkColor: 'dark:text-red-400 dark:bg-red-900/30', 
        icon: Zap 
      }
    };

    return priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { 
        color: 'bg-amber-100 text-amber-700', 
        darkColor: 'dark:bg-amber-900/30 dark:text-amber-400', 
        icon: Clock 
      },
      completed: { 
        color: 'bg-emerald-100 text-emerald-700', 
        darkColor: 'dark:bg-emerald-900/30 dark:text-emerald-400', 
        icon: CheckCircle 
      },
      snoozed: { 
        color: 'bg-purple-100 text-purple-700', 
        darkColor: 'dark:bg-purple-900/30 dark:text-purple-400', 
        icon: RefreshCw 
      },
      cancelled: { 
        color: 'bg-red-100 text-red-700', 
        darkColor: 'dark:bg-red-900/30 dark:text-red-400', 
        icon: XCircle 
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} ${config.darkColor} px-3 py-1 text-sm font-semibold`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the form errors before submitting");
      return;
    }

    setSaving(true);
    try {
      formData.remind_at = new Date(formData.remind_at).toISOString();
      
      const response = await updateReminder(Number(id), formData);

      if (response.success) {
        toast.success("Reminder updated successfully!");
        navigate('/agent/reminders');
      } else {
        toast.error(response.message || "Failed to update reminder");
      }
    } catch (error: any) {
      toast.error("Error updating reminder: " + (error.response.data.message || ""));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading reminder...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!reminder) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <Bell className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Reminder not found</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const isOverdue = new Date(reminder.remind_at) < new Date() && reminder.status === 'pending';

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 dark:from-blue-700 dark:via-purple-700 dark:to-emerald-700 p-8 rounded-2xl shadow-2xl border-0 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10 dark:bg-black/20"></div>
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-2xl border border-white/30 dark:border-white/20">
                  <Bell className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-2">Edit Reminder</h1>
                  <p className="text-blue-100 dark:text-blue-200 text-lg">
                    Update reminder details and settings
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => navigate(`/agent/reminders/${reminder.id}`)}
                  variant="outline"
                  className="bg-white/20 dark:bg-white/10 backdrop-blur-sm hover:bg-white/30 dark:hover:bg-white/20 border border-white/30 dark:border-white/20 text-white"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
                <Button
                  onClick={() => navigate('/agent/reminders')}
                  variant="outline"
                  className="bg-white/20 dark:bg-white/10 backdrop-blur-sm hover:bg-white/30 dark:hover:bg-white/20 border border-white/30 dark:border-white/20 text-white"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Reminders
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="bg-white dark:bg-gray-900/50 dark:backdrop-blur-sm border-2 border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl">
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 dark:from-blue-600 dark:to-cyan-600 rounded-xl">
                        <Bell className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reminder Details</h2>
                    </div>

                    {/* Current Status */}
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 border-2 border-blue-200 dark:border-blue-800/50 rounded-2xl p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{reminder.title}</h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Current Status</p>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(reminder.status)}
                          {isOverdue && (
                            <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-3 py-1 text-sm font-semibold">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Overdue
                            </Badge>
                          )}
                        </div>
                      </div>
                      {reminder.completed_at && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                          Completed on: {formatReadableDate(reminder.completed_at, true)}
                        </p>
                      )}
                    </div>

                    {/* Title */}
                    <div>
                      <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">
                        Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 ${
                          errors.title 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-blue-500 dark:focus:border-blue-600'
                        } rounded-xl text-gray-900 dark:text-white dark:placeholder:text-gray-400 transition-all`}
                        placeholder="Enter reminder title..."
                        maxLength={100}
                      />
                      {errors.title && (
                        <p className="mt-2 text-sm text-red-600 font-medium">{errors.title}</p>
                      )}
                      <div className="flex justify-between mt-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Brief and descriptive title</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{formData.title.length}/100</p>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">
                        Description
                      </label>
                      <textarea
                        value={formData?.description ?? ''}
                        onChange={(e) => handleChange('description', e.target.value)}
                        rows={4}
                        className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 ${
                          errors.description 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-blue-500 dark:focus:border-blue-600'
                        } rounded-xl text-gray-900 dark:text-white dark:placeholder:text-gray-400 resize-none transition-all`}
                        placeholder="Add detailed description about the reminder..."
                        maxLength={1000}
                      />
                      {errors.description && (
                        <p className="mt-2 text-sm text-red-600 font-medium">{errors.description}</p>
                      )}
                      <div className="flex justify-between mt-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Optional detailed description</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{formData?.description?.length ?? 0}/1000</p>
                      </div>
                    </div>

                    {/* Type and Priority */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Type */}
                      <div>
                        <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">
                          Type <span className="text-red-500">*</span>
                        </label>
                        <div className="space-y-3">
                          {[
                            { value: 'inquiry_followup', label: 'Inquiry Follow-up' },
                            { value: 'appointment_followup', label: 'Appointment Follow-up' },
                            { value: 'general', label: 'General' },
                          ].map((type) => {
                            const config = getTypeConfig(type.value);
                            const Icon = config.icon;
                            
                            return (
                              <label
                                key={type.value}
                                className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                  formData.type === type.value
                                    ? `${config.borderColor} ${config.darkBorderColor} bg-gradient-to-r ${config.bgColor} ${config.darkBgColor} shadow-md dark:shadow-lg`
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="type"
                                  value={type.value}
                                  checked={formData.type === type.value}
                                  onChange={(e) => handleChange('type', e.target.value)}
                                  className="hidden"
                                />
                                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${config.color} ${config.darkColor} flex items-center justify-center flex-shrink-0`}>
                                  <Icon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900 dark:text-white">{type.label}</p>
                                </div>
                                {formData.type === type.value && (
                                  <CheckCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400 ml-auto" />
                                )}
                              </label>
                            );
                          })}
                        </div>
                        {errors.type && (
                          <p className="mt-2 text-sm text-red-600 font-medium">{errors.type}</p>
                        )}
                      </div>

                      {/* Priority */}
                      <div>
                        <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">
                          Priority
                        </label>
                        <div className="space-y-3">
                          {[
                            { value: 'low', label: 'Low' },
                            { value: 'medium', label: 'Medium' },
                            { value: 'high', label: 'High' },
                            { value: 'urgent', label: 'Urgent' }
                          ].map((priority) => {
                            const config = getPriorityConfig(priority.value);
                            const Icon = config.icon;
                            
                            return (
                              <label
                                key={priority.value}
                                className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                  formData.priority === priority.value
                                    ? 'border-blue-200 dark:border-blue-800/50 bg-blue-50 dark:bg-blue-900/30 shadow-md dark:shadow-lg'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="priority"
                                  value={priority.value}
                                  checked={formData.priority === priority.value}
                                  onChange={(e) => handleChange('priority', e.target.value)}
                                  className="hidden"
                                />
                                <div className={`w-10 h-10 rounded-lg ${config.color} ${config.darkColor} flex items-center justify-center flex-shrink-0`}>
                                  <Icon className="w-5 h-5" />
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900 dark:text-white">{priority.label}</p>
                                </div>
                                {formData.priority === priority.value && (
                                  <CheckCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400 ml-auto" />
                                )}
                              </label>
                            );
                          })}
                        </div>
                        {errors.priority && (
                          <p className="mt-2 text-sm text-red-600 font-medium">{errors.priority}</p>
                        )}
                      </div>
                    </div>

                    {/* Reminder Time */}
                    <div>
                      <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">
                        Remind At <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                        <input
                          type="datetime-local"
                          value={formData.remind_at}
                          onChange={(e) => handleChange('remind_at', e.target.value)}
                          className={`w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 ${
                            errors.remind_at 
                              ? 'border-red-500 focus:ring-red-500' 
                              : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-blue-500 dark:focus:border-blue-600'
                          } rounded-xl text-gray-900 dark:text-white transition-all`}
                        />
                      </div>
                      {errors.remind_at && (
                        <p className="mt-2 text-sm text-red-600 font-medium">{errors.remind_at}</p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Set the date and time when you want to be reminded
                      </p>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">
                        Additional Notes
                      </label>
                      <textarea
                        value={formData?.notes ?? ""}
                        onChange={(e) => handleChange('notes', e.target.value)}
                        rows={3}
                        className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 ${
                          errors.notes 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-blue-500 dark:focus:border-blue-600'
                        } rounded-xl text-gray-900 dark:text-white dark:placeholder:text-gray-400 resize-none transition-all`}
                        placeholder="Add any additional notes or context..."
                        maxLength={500}
                      />
                      {errors.notes && (
                        <p className="mt-2 text-sm text-red-600 font-medium">{errors.notes}</p>
                      )}
                      <div className="flex justify-between mt-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Optional notes for context</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{formData?.notes?.length ?? 0}/500</p>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-800">
                    <Button
                      type="submit"
                      disabled={saving}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 dark:from-blue-700 dark:to-emerald-700 dark:hover:from-blue-800 dark:hover:to-emerald-800 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Updating Reminder...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5 mr-2" />
                          Update Reminder
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => navigate('/agent/reminders')}
                      variant="outline"
                      className="border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold py-3 rounded-xl transition-all duration-300"
                    >
                      <XCircle className="w-5 h-5 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Actions & Info */}
          <div className="space-y-6">
            {/* Reminder Information */}
            <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/30 dark:to-violet-900/30 border-2 border-purple-200 dark:border-purple-800/50 rounded-2xl shadow-xl">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  Reminder Information
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Created:</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {formatReadableDate(reminder?.created_at, true)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Last Updated:</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {formatReadableDate(reminder.updated_at, true)}
                    </span>
                  </div>

                  {/* Related Entities */}
                  {(reminder.customer || reminder.property || reminder.inquiry || reminder.appointment) && (
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Related To:</h4>
                      <div className="space-y-2">
                        {reminder.customer && (
                          <div className="flex items-center gap-2 text-sm">
                            <User className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                            <span className="text-gray-600 dark:text-gray-400">{reminder.customer.name}</span>
                          </div>
                        )}
                        {reminder.property && (
                          <div className="flex items-center gap-2 text-sm">
                            <Home className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                            <span className="text-gray-600 dark:text-gray-400">{reminder.property.title}</span>
                          </div>
                        )}
                        {reminder.inquiry && (
                          <div className="flex items-center gap-2 text-sm">
                            <MessageCircle className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                            <span className="text-gray-600 dark:text-gray-400">Inquiry #{reminder.inquiry.id}</span>
                          </div>
                        )}
                        {reminder.appointment && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                            <span className="text-gray-600 dark:text-gray-400">Appointment #{reminder.appointment.id}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Help Card */}
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 border-2 border-blue-200 dark:border-blue-800/50 rounded-2xl shadow-xl">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Editing Tips
                </h3>
                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Update the reminder time if it needs to be rescheduled</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Change priority if the urgency level has changed</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Use notes to add additional context or updates</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default EditReminder;