/* eslint-disable @typescript-eslint/no-explicit-any */
// src/api/customer/appointments.ts
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
});

function resolvedUri(relative: string) {
  try {
    return api({ url: relative });
  } catch {
    return `${api.defaults.baseURL || ""}${relative}`;
  }
}

export async function listCustomerAppointments(token: string | null, page = 1, perPage = 12) {
  if (!token) throw new Error("No auth token");
  const url = "/customer/appointments";
  if (process.env.NODE_ENV === "development") console.debug("GET", resolvedUri(url), { page, per_page: perPage });
  const resp = await api.get(url, {
    params: { page, per_page: perPage },
    headers: { Authorization: `Bearer ${token}` },
  });
  return resp.data;
}

export async function getCustomerAppointment(id: number, token: string | null) {
  if (!token) throw new Error("No auth token");
  const url = `/customer/appointments/${id}`;
  if (process.env.NODE_ENV === "development") console.debug("GET", resolvedUri(url));
  const resp = await api.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return resp.data;
}

async function postWithFallback(primary: string, fallback: string | null, body: any, token: string | null) {
  if (!token) throw new Error("No auth token");
  try {
    if (process.env.NODE_ENV === "development") console.debug("POST", resolvedUri(primary), body);
    const r = await api.post(primary, body, { headers: { Authorization: `Bearer ${token}` } });
    return r.data;
  } catch (e: any) {
    const status = e?.response?.status;
    if (status === 404 && fallback) {
      if (process.env.NODE_ENV === "development") console.debug("Primary returned 404, trying fallback:", resolvedUri(fallback));
      const r2 = await api.post(fallback, body, { headers: { Authorization: `Bearer ${token}` } });
      return r2.data;
    }
    console.error("postWithFallback error", e?.response?.data ?? e);
    throw e;
  }
}

export async function confirmCustomerAppointment(id: number, token: string | null) {
  if (!token) throw new Error("No auth token");
  const primary = `/customer/appointments/${id}/confirm`;
  const fallback = `/appointments/${id}/confirm`;
  return postWithFallback(primary, fallback, null, token);
}

export async function declineCustomerAppointment(id: number, reason: string, token: string | null) {
  if (!token) throw new Error("No auth token");
  const primary = `/customer/appointments/${id}/decline`;
  const fallback = `/appointments/${id}/decline`;
  return postWithFallback(primary, fallback, { reason }, token);
}

/**
 * IMPORTANT - named export createCustomerAppointment (matching import in your component)
 * Signature kept compatible with your earlier code (positional args).
 */
export async function createCustomerAppointment(
  propertyId: number,
  agentId: number | null,
  scheduledAt: string, // ISO 8601
  type: "visit" | "call" = "visit",
  durationMinutes: number = 30,
  customerNotes: string | null = null,
  phoneNumber: string | null = null,
  location: string | null = null,
  status: string = "scheduled",
  token: string | null
) {
  if (!token) throw new Error("No auth token");

  const body = {
    property_id: propertyId,
    agent_id: agentId,
    scheduled_at: scheduledAt,
    type,
    duration_minutes: durationMinutes,
    customer_notes: customerNotes,
    phone_number: phoneNumber,
    location,
    status,
  };

  const url = "/customer/appointments";
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.debug("POST", resolvedUri(url), body);
  }

  const resp = await api.post(url, body, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return resp.data;
}

// default-export axios instance for convenience if needed elsewhere
export default api;
