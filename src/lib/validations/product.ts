import * as z from "zod";

export const productBasicSchema = z.object({
  name: z.string().trim().min(1, "Product name is required").max(200),
  description: z.string().trim().max(5000).optional().or(z.literal("")),
  brand: z.string().trim().max(100).optional().or(z.literal("")),
  category: z.string().trim().max(100).optional().or(z.literal("")),
  productType: z.string().trim().max(100).optional().or(z.literal("")),
  sku: z.string().trim().max(50).optional().or(z.literal("")),
  modelNumber: z.string().trim().max(50).optional().or(z.literal("")),
  gtin: z.string().trim().max(30).optional().or(z.literal("")),
  countryOfOrigin: z.string().trim().max(50).optional().or(z.literal("")),
});

export const manufacturerSchema = z.object({
  name: z.string().trim().min(1, "Manufacturer name is required").max(200),
  tradeName: z.string().trim().max(200).optional().or(z.literal("")),
  companyName: z.string().trim().max(200).optional().or(z.literal("")),
  street: z.string().trim().min(1, "Street is required").max(300),
  city: z.string().trim().min(1, "City is required").max(100),
  postalCode: z.string().trim().min(1, "Postal code is required").max(30),
  country: z.string().trim().min(1, "Country is required").max(100),
  email: z.string().trim().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().trim().max(50).optional().or(z.literal("")),
  website: z.string().trim().url("Invalid URL").optional().or(z.literal("")),
});

export const responsiblePersonSchema = z.object({
  isRequired: z.boolean().default(false),
  company: z.string().trim().max(200).optional().or(z.literal("")),
  street: z.string().trim().max(200).optional().or(z.literal("")),
  city: z.string().trim().max(100).optional().or(z.literal("")),
  postalCode: z.string().trim().max(30).optional().or(z.literal("")),
  country: z.string().trim().max(100).optional().or(z.literal("")),
  email: z.string().trim().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().trim().max(50).optional().or(z.literal("")),
  website: z.string().trim().url("Invalid URL").optional().or(z.literal("")),
}).superRefine((data, ctx) => {
  if (data.isRequired) {
    if (!data.company || data.company.trim() === "") ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Company is required when manufacturer is outside EU", path: ["company"] });
    if (!data.street || data.street.trim() === "") ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Street is required for EU Responsible Person", path: ["street"] });
    if (!data.city || data.city.trim() === "") ctx.addIssue({ code: z.ZodIssueCode.custom, message: "City is required", path: ["city"] });
    if (!data.postalCode || data.postalCode.trim() === "") ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Postal code is required", path: ["postalCode"] });
    if (!data.country || data.country.trim() === "") ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Country is required", path: ["country"] });
    if ((!data.email || data.email.trim() === "") && (!data.phone || data.phone.trim() === "")) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Email or phone is required for Responsible Person", path: ["email"] });
  }
});

export const safetyInfoSchema = z.object({
  warnings: z.string().trim().max(5000).optional().or(z.literal("")),
  instructions: z.string().trim().max(5000).optional().or(z.literal("")),
  ageRestrictions: z.string().trim().max(2000).optional().or(z.literal("")),
  usageRestrictions: z.string().trim().max(2000).optional().or(z.literal("")),
  assemblyInstructions: z.string().trim().max(5000).optional().or(z.literal("")),
  storageInstructions: z.string().trim().max(2000).optional().or(z.literal("")),
  disposalInstructions: z.string().trim().max(2000).optional().or(z.literal("")),
  otherInfo: z.string().trim().max(5000).optional().or(z.literal("")),
});

export const productSchema = z.object({
  basic: productBasicSchema,
  manufacturer: manufacturerSchema,
  responsiblePerson: responsiblePersonSchema,
  safety: safetyInfoSchema,
  documents: z.array(z.object({ id: z.string(), name: z.string(), mimeType: z.string().optional(), size: z.number().optional(), documentType: z.string().optional(), type: z.string().optional(), url: z.string().optional() }).passthrough()).optional().default([]),
});

export type ProductFormData = z.infer<typeof productSchema>;
