
export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  twitter?: string;
  youtube?: string;
}

export interface SiteMeta {
  site_name?: string;
  site_status?: "active" | "inactive" | "maintenance";
  site_description?: string;
  contact_address?: string;
  contact_email?: string;
  contact_phone?: string;
  socials: SocialLinks;
}

export interface SiteMetaResponse {
  success: boolean;
  message?: string;
  data: SiteMeta;
}
