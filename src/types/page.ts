// Fixed types to match Laravel backend exactly

export interface Page {
  id: number;
  title: string;
  slug: string;
  content: string;
  status: "draft" | "published"; // Fixed: was number, now string
  show_in_footer: boolean; // Fixed: was number, now boolean
  footer_order: number | null;
  meta_title: string | null;
  meta_description: string | null;
  published_at: string | null;
  can_deleted: boolean
  created_at: string;
  updated_at: string;
}

export interface PageFormData {
  title: string;
  content: string;
  status: "draft" | "published"; // Fixed: was number, now string
  show_in_footer: boolean; // Fixed: was number, now boolean
  footer_order: number | null;
  meta_title?: string;
  meta_description?: string;
}

export interface FooterPage {
  title: string;
  slug: string;
}