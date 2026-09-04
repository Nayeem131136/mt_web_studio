import { Lead } from "@/types";

/** Converts a raw Supabase/Postgres row (snake_case) into the app's Lead type (camelCase). */
export function rowToLead(row: any): Lead {
  return {
    id: row.id,
    referenceId: row.reference_id,
    businessName: row.business_name,
    ownerName: row.owner_name,
    phone: row.phone,
    whatsapp: row.whatsapp || "",
    email: row.email,
    category: row.category,
    district: row.district,
    address: row.address || "",
    socialLinks: row.social_links || "",
    businessDescription: row.business_description,
    businessGoals: row.business_goals || [],
    package: row.package,
    domainStatus: row.domain_status,
    domainName: row.domain_name,
    hostingStatus: row.hosting_status,
    hostingProvider: row.hosting_provider,
    pages: row.pages || [],
    features: row.features || [],
    designStyles: row.design_styles || [],
    colorPreferences: row.color_preferences,
    referenceUrls: row.reference_urls,
    contentReadiness: row.content_readiness,
    availableAssets: row.available_assets || [],
    uploadedFiles: row.uploaded_files || [],
    launchDate: row.launch_date,
    budgetRange: row.budget_range,
    additionalNotes: row.additional_notes,
    status: row.status,
    priority: row.priority,
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    adminNotes: row.admin_notes || [],
    quotation: row.quotation || undefined,
  };
}

/** Converts the app's Lead type (camelCase) into a Postgres insert/update payload (snake_case). */
export function leadToRow(lead: Partial<Lead>): Record<string, any> {
  const row: Record<string, any> = {};
  if (lead.referenceId !== undefined) row.reference_id = lead.referenceId;
  if (lead.businessName !== undefined) row.business_name = lead.businessName;
  if (lead.ownerName !== undefined) row.owner_name = lead.ownerName;
  if (lead.phone !== undefined) row.phone = lead.phone;
  if (lead.whatsapp !== undefined) row.whatsapp = lead.whatsapp;
  if (lead.email !== undefined) row.email = lead.email;
  if (lead.category !== undefined) row.category = lead.category;
  if (lead.district !== undefined) row.district = lead.district;
  if (lead.address !== undefined) row.address = lead.address;
  if (lead.socialLinks !== undefined) row.social_links = lead.socialLinks;
  if (lead.businessDescription !== undefined) row.business_description = lead.businessDescription;
  if (lead.businessGoals !== undefined) row.business_goals = lead.businessGoals;
  if (lead.package !== undefined) row.package = lead.package;
  if (lead.domainStatus !== undefined) row.domain_status = lead.domainStatus;
  if (lead.domainName !== undefined) row.domain_name = lead.domainName;
  if (lead.hostingStatus !== undefined) row.hosting_status = lead.hostingStatus;
  if (lead.hostingProvider !== undefined) row.hosting_provider = lead.hostingProvider;
  if (lead.pages !== undefined) row.pages = lead.pages;
  if (lead.features !== undefined) row.features = lead.features;
  if (lead.designStyles !== undefined) row.design_styles = lead.designStyles;
  if (lead.colorPreferences !== undefined) row.color_preferences = lead.colorPreferences;
  if (lead.referenceUrls !== undefined) row.reference_urls = lead.referenceUrls;
  if (lead.contentReadiness !== undefined) row.content_readiness = lead.contentReadiness;
  if (lead.availableAssets !== undefined) row.available_assets = lead.availableAssets;
  if (lead.uploadedFiles !== undefined) row.uploaded_files = lead.uploadedFiles;
  if (lead.launchDate !== undefined) row.launch_date = lead.launchDate;
  if (lead.budgetRange !== undefined) row.budget_range = lead.budgetRange;
  if (lead.additionalNotes !== undefined) row.additional_notes = lead.additionalNotes;
  if (lead.status !== undefined) row.status = lead.status;
  if (lead.priority !== undefined) row.priority = lead.priority;
  if (lead.adminNotes !== undefined) row.admin_notes = lead.adminNotes;
  if (lead.quotation !== undefined) row.quotation = lead.quotation;
  return row;
}
