import api from "@/api/axios"; 

export interface Reminder {
  id: number;
  agent_id: number;
  customer_id: number;
  inquiry_id: number;
  property_id: number;
  appointment_id: number;
  title: string;
  description: string;
  type: "inquiry_followup" | "appointment_followup" | "general";
  priority: 'low' | 'medium' | 'high' | 'urgent';
  remind_at: string;
  status: 'pending' | 'completed' | 'snoozed' | 'cancelled';
  completed_at: string | null;
  snoozed_until: string | null;
  notes: string | null;
  email_sent: boolean;
  notification_sent: boolean;
  email_status: string | null;
  email_error: string | null;
  created_at: string;
  updated_at: string;
  customer?: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
  property?: {
    id: number;
    title: string;
    address: string;
  };
  inquiry?: {
    id: number;
    message: string;
  };
  appointment?: {
    id: number;
    type: string;
    scheduled_at: string;
  };
}

export interface RemindersListResponse {
  success: boolean;
  message: string;
  data: {
    reminders: {
      total: number;
      per_page: number;
      current_page: number;
      last_page: number;
      data: Reminder[]
    }
  };
}

export interface ReminderResponse {
  success: boolean;
  message: string;
  data: {
    reminder: Reminder;
  };
}

export interface ReminderFormData {
  agent_id?: number;
  customer_id: number | null;
  inquiry_id: number | null;
  property_id: number | null;
  appointment_id: number | null;
  title: string;
  description?: string | null;
  type: "inquiry_followup" | "appointment_followup" | "general";
  priority: "low" | "medium" | "high" | 'urgent';
  remind_at: string;
  notes?: string | null;
  status?: "pending" | "completed";
}

// Get all agent inquiries (with filters)
export const getAgentReminders = async (params = {}) => {
  const res = await api.get<RemindersListResponse>("/agent/reminders", { params });
  return res.data;
};

// Get reminder details
export const getReminderById = async (id: number) => {
  const res = await api.get<ReminderResponse>(`/agent/reminders/${id}`);
  return res.data;
};

// Add reminder
export const storeReminder = async (formData: ReminderFormData) => {
  const res = await api.post<ReminderResponse>(`/agent/reminders`, formData);
  return res.data;
};

// Update reminder
export const updateReminder = async (id: number, formData: ReminderFormData) => {
  const res = await api.put<ReminderResponse>(`/agent/reminders/${id}`, formData);
  return res.data;
};

// Delete reminder
export const deleteReminder = async (id: number) => {
  const res = await api.delete<ReminderResponse>(`/agent/reminders/${id}`);
  return res.data;
};

// Complete reminder
export const completeReminder = async (id: number, notes: string) => {
  const res = await api.post<ReminderResponse>(`/agent/reminders/${id}/complete`, { notes });
  return res.data;
};

// Complete reminder
export const setSnoozeReminder = async (id: number, time: string) => {
  const res = await api.post<ReminderResponse>(`/agent/reminders/${id}/snooze`, { snooze_until: time });
  return res.data;
};
