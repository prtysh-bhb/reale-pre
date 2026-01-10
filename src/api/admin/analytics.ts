/* eslint-disable @typescript-eslint/no-explicit-any */

import api from "@/api/axios";

export interface UserTrends {
  registrations: Array<{
    date: string;
    total: number;
    agents: number;
    customers: number;
  }>;
  role_distribution: Array<{
    role: string;
    count: number;
  }>;
  active_status: Array<{
    date: string;
    active: number;
    inactive: number;
  }>;
}

export interface PropertyTrends {
  listings: Array<{
    date: string;
    total: number;
    published: number;
    draft: number;
    sold: number;
    rented: number;
  }>;
  approvals: Array<{
    date: string;
    pending: number;
    approved: number;
    rejected: number;
  }>;
  type_distribution: Array<{
    type: string;
    count: number;
  }>;
  status_summary: Array<{
    status: string;
    count: number;
  }>;
}

export interface InquiryTrends {
  trends: Array<{
    date: string;
    total: number;
    new: number;
    contacted: number;
    closed: number;
  }>;
  funnel: Array<{
    status: string;
    count: number;
  }>;
}

export interface ViewTrends {
  trends: Array<{
    date: string;
    count: number;
  }>;
  top_properties: Array<{
    property_id: number;
    view_count: number;
    property: {
      id: number;
      title: string;
    };
  }>;
}

export interface FinancialTrends {
  payments: Array<{
    date: string;
    count: number;
    total_amount: number;
  }>;
  subscriptions: Array<{
    date: string;
    count: number;
  }>;
  credit_transactions: Array<{
    date: string;
    credits: number;
    debits: number;
  }>;
  payment_status: Array<{
    status: string;
    count: number;
  }>;
}

export interface AgentPerformance {
  by_properties: Array<{
    id: number;
    name: string;
    email: string;
    properties_count: number;
  }>;
  by_inquiries: Array<{
    id: number;
    name: string;
    email: string;
    inquiries_count: number;
  }>;
  top_rated: Array<{
    id: number;
    name: string;
    email: string;
    avg_rating: number;
    review_count: number;
  }>;
}

export interface ConversionMetrics {
  total_views: number;
  total_inquiries: number;
  closed_inquiries: number;
  view_to_inquiry_rate: number;
  inquiry_to_close_rate: number;
}

export interface DistributionData {
  users_by_role: Array<{
    role: string;
    count: number;
  }>;
  properties_by_type: Array<{
    type: string;
    count: number;
  }>;
  properties_by_status: Array<{
    status: string;
    count: number;
  }>;
}

export interface AnalyticsData {
  user_trends: UserTrends;
  property_trends: PropertyTrends;
  inquiry_trends: InquiryTrends;
  view_trends: ViewTrends;
  financial_trends: FinancialTrends;
  agent_performance: AgentPerformance;
  conversion_metrics: ConversionMetrics;
  distribution_data: DistributionData;
}

export const getAnalytics = async (period: number = 30): Promise<AnalyticsData> => {
  const res = await api.get<{ data: AnalyticsData }>(`/admin/analytics?period=${period}`);
  return res.data.data;
};
