import { z } from "zod";

export const BusinessInfoSchema = z.object({
  businessName: z.string().min(2, "Business name is required"),
  ownerName: z.string().min(2, "Owner name is required"),
  phone: z.string().min(11, "Valid phone number required"),
  whatsapp: z.string().optional(),
  email: z.string().email("Valid email required"),
  category: z.string().min(1, "Category is required"),
  district: z.string().min(1, "District is required"),
  address: z.string().optional(),
  socialLinks: z.string().optional(),
  businessDescription: z.string().min(10, "Brief description is required"),
  businessGoals: z.array(z.string()).default([]),
});

export const PackageSchema = z.object({
  package: z.enum(["starter", "business", "premium"]),
  domainStatus: z.enum(["has_one", "needs_new", "needs_help"]).optional(),
  domainName: z.string().optional(),
  hostingStatus: z.enum(["has_one", "needs", "needs_help"]).optional(),
  hostingProvider: z.string().optional(),
});

export const FeaturesSchema = z.object({
  pages: z.array(z.string()).default([]),
  features: z.array(z.string()).default([]),
});

export const DesignSchema = z.object({
  designStyles: z.array(z.string()).default([]),
  colorPreferences: z.string().optional(),
  referenceUrls: z.string().optional(),
});

export const UploadedFileSchema = z.object({
  name: z.string(),
  url: z.string(),
  type: z.string().optional(),
  size: z.number().optional(),
});
export type UploadedFile = z.infer<typeof UploadedFileSchema>;

export const ContentSchema = z.object({
  contentReadiness: z.string().optional(),
  availableAssets: z.array(z.string()).default([]),
  uploadedFiles: z.array(UploadedFileSchema).default([]),
  launchDate: z.string().optional(),
  budgetRange: z.string().optional(),
  additionalNotes: z.string().optional(),
});

export type Lead = {
  id: string;
  referenceId: string;
  businessName: string;
  ownerName: string;
  phone: string;
  whatsapp?: string;
  email: string;
  category: string;
  district: string;
  address?: string;
  socialLinks?: string;
  businessDescription: string;
  businessGoals: string[];
  
  package: string;
  domainStatus?: string;
  domainName?: string;
  hostingStatus?: string;
  hostingProvider?: string;
  
  pages: string[];
  features: string[];
  
  designStyles: string[];
  colorPreferences?: string;
  referenceUrls?: string;
  
  contentReadiness?: string;
  availableAssets: string[];
  uploadedFiles: UploadedFile[];
  launchDate?: string;
  budgetRange?: string;
  additionalNotes?: string;
  
  status: string;
  priority: string;
  createdAt: number;
  
  adminNotes?: { note: string; addedAt: number }[];
  quotation?: {
    basePrice: number;
    domainCost: number;
    hostingCost: number;
    additionalCost: number;
    discount: number;
    finalTotal: number;
    paymentTerms?: string;
    estimatedDelivery?: string;
  };
};
