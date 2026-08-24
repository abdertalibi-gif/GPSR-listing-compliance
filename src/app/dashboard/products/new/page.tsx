"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { productSchema, type ProductFormData } from "@/lib/validations/product";
import { Upload, FileText, Image as ImageIcon, X, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

export default function NewProductPage() {
  const { t, dir } = useI18n();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const steps = [
    t("create.basic"),
    t("create.manufacturer"),
    t("create.responsible"),
    t("create.safety"),
    t("create.documents"),
    t("create.review"),
  ] as const;

  const stepFields: Record<number, Array<string>> = {
    0: ["basic.name", "basic.description", "basic.brand", "basic.category", "basic.sku", "basic.modelNumber", "basic.gtin", "basic.countryOfOrigin"],
    1: ["manufacturer.name", "manufacturer.street", "manufacturer.city", "manufacturer.postalCode", "manufacturer.country", "manufacturer.email", "manufacturer.phone", "manufacturer.website"],
    2: ["responsiblePerson.isRequired", "responsiblePerson.company", "responsiblePerson.street", "responsiblePerson.city", "responsiblePerson.postalCode", "responsiblePerson.country", "responsiblePerson.email", "responsiblePerson.phone"],
    3: ["safety.warnings", "safety.instructions", "safety.ageRestrictions"],
    4: [],
    5: [],
  };

  const docTypes = [
    t("create.documents"),
    "Safety Instructions",
    "EU Declaration of Conformity",
    "Product Label",
    "Manufacturer Documentation",
    "Technical Documentation",
    "Test Report",
    "Compliance Certificate",
    "Other",
  ];

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema as unknown as never) as never,
    defaultValues: {
      basic: { name: "", description: "", brand: "", category: "", sku: "", modelNumber: "", gtin: "", countryOfOrigin: "" },
      manufacturer: { name: "", tradeName: "", companyName: "", street: "", city: "", postalCode: "", country: "", email: "", phone: "", website: "" },
      responsiblePerson: { isRequired: false, company: "", street: "", city: "", postalCode: "", country: "", email: "", phone: "", website: "" },
      safety: { warnings: "", instructions: "", ageRestrictions: "", usageRestrictions: "", assemblyInstructions: "", storageInstructions: "", disposalInstructions: "", otherInfo: "" },
      documents: [],
    },
    mode: "onBlur",
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const docs = form.watch("documents") ?? [];

  const uploadFiles = async (files: FileList | File[]) => {
    setUploadError(null);
    const arr = Array.from(files);
    for (const file of arr) {
      if (file.size > 10 * 1024 * 1024) { setUploadError(t("create.maxSize")); continue; }
      const ext = file.name.split(".").pop()?.toLowerCase();
      const allowed = ["pdf","doc","docx","jpg","jpeg","png","webp"];
      if (!ext || !allowed.includes(ext)) { setUploadError(t("create.validation.email")); continue; }
      setUploading(true);
      const fd = new FormData();
      fd.append("file", file);
      fd.append("documentType", "Other");
      try {
        const res = await fetch("/api/documents/staged", { method: "POST", body: fd });
        const json = await res.json();
        if (!res.ok) { setUploadError(json.error || t("create.toast.error")); continue; }
        const current = form.getValues("documents") ?? [];
        form.setValue("documents", [...current, { id: json.id, name: json.name, mimeType: json.mimeType, size: json.size, documentType: json.documentType, url: json.storageKey }], { shouldDirty: true });
      } catch {
        setUploadError(t("create.toast.error"));
      } finally { setUploading(false); }
    }
  };

  const removeDoc = async (id: string) => {
    try { await fetch(`/api/documents/staged?id=${id}`, { method: "DELETE" }); } catch {}
    const current = form.getValues("documents") ?? [];
    form.setValue("documents", current.filter((d) => (d as unknown as { id: string }).id !== id), { shouldDirty: true });
  };

  const next = async () => {
    const fields = stepFields[step] ?? [];
    if (fields.length > 0) {
      const valid = await form.trigger(fields as never, { shouldFocus: true });
      if (!valid) return;
    }
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    const payload = {
      name: data.basic.name,
      description: data.basic.description || undefined,
      brand: data.basic.brand || undefined,
      category: data.basic.category || undefined,
      sku: data.basic.sku || undefined,
      modelNumber: data.basic.modelNumber || undefined,
      gtin: data.basic.gtin || undefined,
      countryOfOrigin: data.basic.countryOfOrigin || undefined,
      manufacturer: {
        name: data.manufacturer.name,
        tradeName: data.manufacturer.tradeName || undefined,
        companyName: data.manufacturer.companyName || undefined,
        street: data.manufacturer.street,
        city: data.manufacturer.city,
        postalCode: data.manufacturer.postalCode,
        country: data.manufacturer.country,
        email: data.manufacturer.email || undefined,
        phone: data.manufacturer.phone || undefined,
        website: data.manufacturer.website || undefined,
      },
      responsiblePerson: {
        isRequired: data.responsiblePerson.isRequired,
        company: data.responsiblePerson.company || undefined,
        street: data.responsiblePerson.street || undefined,
        city: data.responsiblePerson.city || undefined,
        postalCode: data.responsiblePerson.postalCode || undefined,
        country: data.responsiblePerson.country || undefined,
        email: data.responsiblePerson.email || undefined,
        phone: data.responsiblePerson.phone || undefined,
        website: data.responsiblePerson.website || undefined,
      },
      safetyInfo: {
        warnings: data.safety.warnings || undefined,
        instructions: data.safety.instructions || undefined,
        ageRestrictions: data.safety.ageRestrictions || undefined,
        usageRestrictions: data.safety.usageRestrictions || undefined,
        assemblyInstructions: data.safety.assemblyInstructions || undefined,
        storageInstructions: data.safety.storageInstructions || undefined,
        disposalInstructions: data.safety.disposalInstructions || undefined,
        otherInfo: data.safety.otherInfo || undefined,
      },
      stagedDocumentIds: (data.documents ?? []).map((d) => (d as unknown as { id: string }).id).filter(Boolean),
    };

    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setIsSubmitting(false);
    if (res.ok) {
      const json = await res.json();
      router.push(`/dashboard/products/${json.id}`);
    } else {
      const err = await res.text();
      alert(t("create.toast.error") + ": " + err);
    }
  };

  // eslint-disable-next-line react-hooks/incompatible-library
  const watched = form.watch();

  return (
    <div className="mx-auto max-w-3xl space-y-6" dir={dir}>
      <h1 className="text-2xl font-bold text-[#14213D]">{t("create.title")}</h1>
      <div className="flex gap-2 flex-wrap">
        {steps.map((s, i) => (
          <div key={s} className={`flex-1 min-w-[100px] rounded-md px-3 py-2 text-center text-xs font-semibold border ${i === step ? "bg-[#EA580C] text-white border-[#EA580C]" : i < step ? "bg-white text-[#EA580C] border-[#EA580C]" : "bg-[#F7F9FC] text-[#64748B] border-[#E7ECF3]"}`}>{i < step ? "✓ " : ""}{i + 1}. {s}</div>
        ))}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {step === 0 && (
            <Card><CardHeader><CardTitle>{t("create.basic")}</CardTitle><CardDescription>{t("create.description")}</CardDescription></CardHeader><CardContent className="space-y-4">
              <FormField control={form.control} name="basic.name" render={({ field }) => (<FormItem><FormLabel>{t("create.productName")} *</FormLabel><FormControl><Input placeholder={t("create.placeholder.productName")} autoComplete="off" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="basic.description" render={({ field }) => (<FormItem><FormLabel>{t("create.description")}</FormLabel><FormControl><Textarea placeholder={t("create.placeholder.description")} {...field} /></FormControl><FormMessage /></FormItem>)} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField control={form.control} name="basic.brand" render={({ field }) => (<FormItem><FormLabel>{t("create.brand")}</FormLabel><FormControl><Input placeholder={t("create.placeholder.brand")} autoComplete="off" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="basic.category" render={({ field }) => (<FormItem><FormLabel>{t("create.category")}</FormLabel><FormControl><Input placeholder={t("create.placeholder.category")} autoComplete="off" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="basic.sku" render={({ field }) => (<FormItem><FormLabel>{t("create.sku")}</FormLabel><FormControl><Input placeholder={t("create.placeholder.sku")} autoComplete="off" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="basic.modelNumber" render={({ field }) => (<FormItem><FormLabel>{t("create.model")}</FormLabel><FormControl><Input placeholder={t("create.placeholder.model")} autoComplete="off" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="basic.gtin" render={({ field }) => (<FormItem><FormLabel>{t("create.gtin")}</FormLabel><FormControl><Input placeholder={t("create.placeholder.gtin")} autoComplete="off" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="basic.countryOfOrigin" render={({ field }) => (<FormItem><FormLabel>{t("create.origin")}</FormLabel><FormControl><Input placeholder={t("create.placeholder.origin")} autoComplete="off" {...field} /></FormControl><FormMessage /></FormItem>)} />
              </div>
            </CardContent></Card>
          )}

          {step === 1 && (
            <Card><CardHeader><CardTitle>{t("create.manufacturer")}</CardTitle></CardHeader><CardContent className="space-y-4">
              <FormField control={form.control} name="manufacturer.name" render={({ field }) => (<FormItem><FormLabel>{t("create.manufacturerName")} *</FormLabel><FormControl><Input placeholder={t("create.placeholder.manufacturerName")} autoComplete="organization" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField control={form.control} name="manufacturer.street" render={({ field }) => (<FormItem><FormLabel>{t("create.street")} *</FormLabel><FormControl><Input placeholder={t("create.placeholder.street")} autoComplete="street-address" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="manufacturer.city" render={({ field }) => (<FormItem><FormLabel>{t("create.city")} *</FormLabel><FormControl><Input placeholder={t("create.placeholder.city")} autoComplete="address-level2" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="manufacturer.postalCode" render={({ field }) => (<FormItem><FormLabel>{t("create.postalCode")} *</FormLabel><FormControl><Input placeholder={t("create.placeholder.postalCode")} autoComplete="postal-code" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="manufacturer.country" render={({ field }) => (<FormItem><FormLabel>{t("create.country")} *</FormLabel><FormControl><Input placeholder={t("create.placeholder.country")} autoComplete="country-name" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="manufacturer.email" render={({ field }) => (<FormItem><FormLabel>{t("create.email")}</FormLabel><FormControl><Input type="email" placeholder={t("create.placeholder.email")} autoComplete="off" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="manufacturer.phone" render={({ field }) => (<FormItem><FormLabel>{t("create.phone")}</FormLabel><FormControl><Input type="tel" placeholder={t("create.placeholder.phone")} autoComplete="off" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="manufacturer.website" render={({ field }) => (<FormItem><FormLabel>{t("create.website")}</FormLabel><FormControl><Input type="url" placeholder={t("create.placeholder.website")} autoComplete="off" {...field} /></FormControl><FormMessage /></FormItem>)} />
              </div>
            </CardContent></Card>
          )}

          {step === 2 && (
            <Card><CardHeader><CardTitle>{t("create.responsible")}</CardTitle></CardHeader><CardContent className="space-y-4">
              <FormField control={form.control} name="responsiblePerson.isRequired" render={({ field }) => (<FormItem className="flex flex-row items-center gap-2 space-y-0"><FormControl><input type="checkbox" checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} className="h-4 w-4 rounded border-[#CBD5E1] text-[#EA580C]" /></FormControl><FormLabel className="!mt-0">{t("create.helper.rp")}</FormLabel></FormItem>)} />
              {watched.responsiblePerson.isRequired && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FormField control={form.control} name="responsiblePerson.company" render={({ field }) => (<FormItem><FormLabel>{t("create.manufacturerName")} *</FormLabel><FormControl><Input placeholder={t("create.placeholder.manufacturerName")} autoComplete="off" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="responsiblePerson.email" render={({ field }) => (<FormItem><FormLabel>{t("create.email")}</FormLabel><FormControl><Input type="email" placeholder={t("create.placeholder.email")} autoComplete="off" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="responsiblePerson.street" render={({ field }) => (<FormItem><FormLabel>{t("create.street")} *</FormLabel><FormControl><Input placeholder={t("create.placeholder.street")} autoComplete="off" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="responsiblePerson.city" render={({ field }) => (<FormItem><FormLabel>{t("create.city")} *</FormLabel><FormControl><Input placeholder={t("create.placeholder.city")} autoComplete="off" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="responsiblePerson.postalCode" render={({ field }) => (<FormItem><FormLabel>{t("create.postalCode")} *</FormLabel><FormControl><Input placeholder={t("create.placeholder.postalCode")} autoComplete="off" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="responsiblePerson.country" render={({ field }) => (<FormItem><FormLabel>{t("create.country")} *</FormLabel><FormControl><Input placeholder={t("create.placeholder.country")} autoComplete="off" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="responsiblePerson.phone" render={({ field }) => (<FormItem><FormLabel>{t("create.phone")}</FormLabel><FormControl><Input placeholder={t("create.placeholder.phone")} autoComplete="off" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
              )}
              <p className="text-xs text-[#64748B]">{t("create.helper.rp")}</p>
            </CardContent></Card>
          )}

          {step === 3 && (
            <Card><CardHeader><CardTitle>{t("create.safety")}</CardTitle></CardHeader><CardContent className="space-y-4">
              <FormField control={form.control} name="safety.warnings" render={({ field }) => (<FormItem><FormLabel>{t("create.safetyWarnings")}</FormLabel><FormControl><Textarea placeholder={t("create.placeholder.warnings")} {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="safety.instructions" render={({ field }) => (<FormItem><FormLabel>{t("create.safetyInstructions")}</FormLabel><FormControl><Textarea placeholder={t("create.placeholder.instructions")} {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="safety.ageRestrictions" render={({ field }) => (<FormItem><FormLabel>{t("create.safetyInstructions")}</FormLabel><FormControl><Input placeholder={t("create.placeholder.age")} {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="safety.usageRestrictions" render={({ field }) => (<FormItem><FormLabel>{t("create.safetyInstructions")}</FormLabel><FormControl><Textarea placeholder={t("create.placeholder.instructions")} {...field} /></FormControl><FormMessage /></FormItem>)} />
            </CardContent></Card>
          )}

          {step === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>{t("create.documents")}</CardTitle>
                <CardDescription>{t("create.documentsDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files) uploadFiles(e.dataTransfer.files); }}
                  className={`flex flex-col items-center justify-center rounded-[12px] border-2 border-dashed p-8 text-center transition-colors ${dragOver ? "border-[#EA580C] bg-[#FFF7ED]" : "border-[#CBD5E1] bg-[#F7F9FC] hover:border-[#EA580C] hover:bg-[#FFF7ED]"}`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF7ED] text-[#EA580C]"><Upload className="h-6 w-6" /></div>
                  <p className="mt-3 text-sm font-medium text-[#14213D]">{t("create.dragDrop")}</p>
                  <p className="text-xs text-[#64748B]">{t("create.maxSize")}</p>
                  <Button type="button" variant="outline" className="mt-4" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                    {uploading ? <><Loader2 className="h-4 w-4 animate-spin" /> {t("common.loading")}</> : t("create.browseFiles")}
                  </Button>
                  <input ref={fileInputRef} type="file" multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp" className="hidden" onChange={(e) => { if (e.target.files) uploadFiles(e.target.files); e.target.value = ""; }} />
                  {uploading && <div className="mt-3 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-[#E7ECF3]"><div className="h-full w-3/4 animate-pulse rounded-full bg-[#EA580C]" /></div>}
                  {uploadError && <p className="mt-3 text-xs text-[#EF4444]">{uploadError}</p>}
                </div>

                {docs.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-[#14213D]">{docs.length} {t("create.documents")}</h4>
                    {docs.map((d) => {
                      const doc = d as unknown as { id: string; name: string; mimeType?: string; size?: number; documentType?: string; url?: string };
                      const isImage = doc.mimeType?.startsWith("image/");
                      return (
                        <div key={doc.id} className="flex items-center gap-3 rounded-lg border border-[#E7ECF3] bg-white p-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#FFF7ED] text-[#EA580C] flex-shrink-0">
                            {isImage ? <ImageIcon className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium text-[#14213D]">{doc.name}</div>
                            <div className="text-xs text-[#64748B]">{doc.mimeType?.split("/")[1]?.toUpperCase() ?? "FILE"} · {doc.size ? `${(doc.size / 1024 / 1024).toFixed(2)} MB` : ""} {doc.documentType ? `· ${doc.documentType}` : ""}</div>
                            <div className="text-xs text-[#10B981]">{t("create.upload.uploaded")}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <select
                              value={doc.documentType ?? "Other"}
                              onChange={(e) => {
                                const current = form.getValues("documents") ?? [];
                                const updated = current.map((x) => (x as unknown as { id: string }).id === doc.id ? { ...(x as object), documentType: e.target.value } as never : x);
                                form.setValue("documents", updated as never);
                              }}
                              className="rounded-md border border-[#CBD5E1] bg-white px-2 py-1 text-xs"
                            >
                              {docTypes.map((t2) => <option key={t2} value={t2}>{t2}</option>)}
                            </select>
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeDoc(doc.id)} className="text-[#EF4444] hover:bg-[#FEF2F2]"><X className="h-4 w-4" /> {t("create.upload.remove")}</Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {step === 5 && (
            <Card><CardHeader><CardTitle>{t("create.reviewTitle")}</CardTitle></CardHeader><CardContent className="space-y-4 text-sm">
              <div className="grid gap-4">
                <div className="rounded-lg bg-[#F7F9FC] border border-[#E7ECF3] p-3"><div className="font-semibold text-[#14213D]">{t("create.productName")}</div><div>{t("create.productName")}: {watched.basic.name || t("create.notProvided")} </div><div>{t("create.description")}: {watched.basic.description || t("create.notProvided")} </div><div>{t("create.brand")}: {watched.basic.brand || t("create.notProvided")} | {t("create.category")}: {watched.basic.category || t("create.notProvided")} | SKU: {watched.basic.sku || t("create.notProvided")} | GTIN: {watched.basic.gtin || t("create.notProvided")} | {t("create.origin")}: {watched.basic.countryOfOrigin || t("create.notProvided")}</div></div>
                <div className="rounded-lg bg-[#F7F9FC] border border-[#E7ECF3] p-3"><div className="font-semibold text-[#14213D]">{t("create.manufacturer")}</div><div>{t("create.manufacturerName")}: {watched.manufacturer.name || t("create.notProvided")}</div><div>{t("create.street")}: {watched.manufacturer.street || t("create.notProvided")}</div><div>{t("create.city")}: {watched.manufacturer.city || t("create.notProvided")}</div><div>{t("create.postalCode")}: {watched.manufacturer.postalCode || t("create.notProvided")}</div><div>{t("create.country")}: {watched.manufacturer.country || t("create.notProvided")}</div><div>{t("create.email")}: {watched.manufacturer.email || t("create.notProvided")}</div><div>{t("create.phone")}: {watched.manufacturer.phone || t("create.notProvided")}</div><div>{t("create.website")}: {watched.manufacturer.website || t("create.notProvided")}</div></div>
                <div className="rounded-lg bg-[#F7F9FC] border border-[#E7ECF3] p-3"><div className="font-semibold text-[#14213D]">{t("create.responsible")}</div><div>{watched.responsiblePerson.isRequired ? t("common.yes") || "Yes" : t("common.no") || "No"}</div>{watched.responsiblePerson.isRequired && (<><div>{t("create.manufacturerName")}: {watched.responsiblePerson.company || t("create.notProvided")}</div><div>{t("create.street")}: {watched.responsiblePerson.street || t("create.notProvided")}</div><div>{t("create.city")}: {watched.responsiblePerson.city || t("create.notProvided")}</div><div>{t("create.postalCode")}: {watched.responsiblePerson.postalCode || t("create.notProvided")}</div><div>{t("create.country")}: {watched.responsiblePerson.country || t("create.notProvided")}</div><div>{t("create.email")}: {watched.responsiblePerson.email || t("create.notProvided")}</div><div>{t("create.phone")}: {watched.responsiblePerson.phone || t("create.notProvided")}</div></> )}</div>
                <div className="rounded-lg bg-[#F7F9FC] border border-[#E7ECF3] p-3"><div className="font-semibold text-[#14213D]">{t("create.safety")}</div><div>{t("create.safetyWarnings")}: {watched.safety.warnings || t("create.notProvided")}</div><div>{t("create.safetyInstructions")}: {watched.safety.instructions || t("create.notProvided")}</div><div>{t("create.safetyInstructions")}: {watched.safety.ageRestrictions || t("create.notProvided")}</div></div>
                <div className="rounded-lg bg-[#F7F9FC] border border-[#E7ECF3] p-3">
                  <div className="font-semibold text-[#14213D]">{t("create.documents")}</div>
                  {(watched.documents?.length ?? 0) === 0 ? <div className="text-[#64748B]">{t("create.notProvided")}</div> : (
                    <div className="mt-2 space-y-2">
                      <div className="text-xs text-[#64748B]">{watched.documents?.length} {t("create.documents")}</div>
                      {watched.documents?.map((d) => {
                        const doc = d as unknown as { id: string; name: string; mimeType?: string; size?: number; documentType?: string };
                        return <div key={doc.id} className="flex items-center gap-2 rounded border border-[#E7ECF3] bg-white px-3 py-2 text-xs"><span className="text-[#10B981]">✓</span> {doc.documentType ?? "Other"} — {doc.name} · {doc.mimeType?.split("/")[1]?.toUpperCase()} · {doc.size ? `${(doc.size/1024/1024).toFixed(2)} MB` : ""}</div>;
                      })}
                    </div>
                  )}
                </div>
              </div>
            </CardContent></Card>
          )}

          <div className="flex justify-between">
            <Button type="button" variant="outline" disabled={step === 0} onClick={back}>{t("common.back")}</Button>
            {step < 5 ? <Button type="button" onClick={next}>{t("common.next")}</Button> : <Button type="submit" disabled={isSubmitting}>{isSubmitting ? t("common.loading") : t("create.review")}</Button>}
          </div>
        </form>
      </Form>
    </div>
  );
}
