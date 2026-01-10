// src/types/appointments.ts
export type Property = {
  id: number;
  title: string;
  address?: string;
  image?: string | null;
};

export type Customer = {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  is_active?: boolean;
};

export type Appointment = {
  id: number;
  property_id: number;
  property?: Property;
  customer?: Customer;
  type: "visit" | "call";
  scheduled_at: string; // ISO
  duration_minutes: number;
  status: string;
  notes?: string;
  location?: string;
  phone_number?: string;
};
