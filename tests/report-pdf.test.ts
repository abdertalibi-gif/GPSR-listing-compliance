import { describe, it, expect } from "vitest";
import { generateReportPdf } from "@/lib/pdf/report-pdf";

describe("report PDF generation", () => {
  const sample = {
    reportId: "cmt7hbkww0013unf02xg02m6b",
    title: "GPSR Report — nn",
    createdAt: new Date("2026-08-24T17:57:34"),
    product: {
      name: "nn",
      brand: null,
      sku: null,
      modelNumber: null,
      gtin: null,
      category: null,
      countryOfOrigin: null,
      manufacturer: null,
      responsiblePerson: null,
      documentsCount: 0,
    },
    check: { score: 88, status: "NEEDS_REVIEW", summary: "GPSR Listing Check — NEEDS_REVIEW (88/100)", createdAt: new Date("2026-08-24T17:57:34") },
    issues: [
      {
        title: "Brand information missing",
        code: "BASIC_BRAND_MISSING",
        category: "GENERAL",
        severity: "LOW",
        description: "Brand helps traceability and should be provided.",
        recommendation: "Consider adding brand information for traceability.",
      },
      {
        title: "Product identifier missing",
        code: "ID_SKU_MISSING",
        category: "IDENTIFICATION",
        severity: "CRITICAL",
        description: "At least one identifier (SKU, Model, GTIN, Barcode, Serial/Batch) is required.",
        recommendation: "Add at least one identifier: SKU, Model number, GTIN, Barcode, or Batch/Serial.",
      },
    ],
    passedChecks: [
      { label: "Product name", rule: "BASIC_NAME_MISSING" },
      { label: "Manufacturer name", rule: "MFG_NAME_MISSING" },
      { label: "Manufacturer address", rule: "MFG_ADDRESS_MISSING" },
    ],
  };

  it("generates valid PDF with correct magic and headers", () => {
    const buf = generateReportPdf(sample);
    expect(buf.length).toBeGreaterThan(1000);
    expect(buf.slice(0, 4).toString()).toBe("%PDF");
    // filename
    const filename = `gpsr-report-${sample.reportId}.pdf`;
    expect(filename).toMatch(/\.pdf$/);
    expect(filename).toContain(sample.reportId);
  });

  it("contains product name, score, status, issues, disclaimer and no raw JSON", () => {
    const buf = generateReportPdf(sample as never, "en");
    const text = buf.toString("utf8");
    expect(text).toContain("nn");
    expect(text).toContain("88");
    expect(text).toContain("NEEDS");
    expect(text).toContain("Brand information missing");
    expect(text).toContain("Product identifier missing");
    expect(text).not.toContain("BASIC_BRAND_MISSING");
    expect(text).not.toContain("ID_SKU_MISSING");
    expect(text).toContain("CRITICAL");
    expect(text).toContain("Disclaimer");
    expect(text).toContain(sample.reportId);
    expect(text).toContain("GPSR Listing Compliance");
    expect(text).toContain("Passed Checks");
    expect(text).toContain("Product name");
    expect(text).not.toContain('"score":');
    expect(text).not.toContain('"issues":');
    expect(text).not.toContain("undefined");
    expect(text).not.toContain("[object Object]");
  });

  it("generates French PDF correctly", () => {
    const buf = generateReportPdf(sample as never, "fr");
    const text = buf.toString("utf8");
    // French uses WinAnsi, check without accent
    expect(text).toContain("Conformit");
    expect(text).toContain("Rapport");
    expect(text).toContain("Informations Produit");
    expect(buf.slice(0, 4).toString()).toBe("%PDF");
  });

  it("generates Arabic PDF with RTL and embedded font", () => {
    const buf = generateReportPdf(sample as never, "ar");
    const text = buf.toString("utf8");
    expect(buf.slice(0, 4).toString()).toBe("%PDF");
    expect(text).toContain("Amiri");
    expect(buf.length).toBeGreaterThan(50000); // Arabic embedded font makes it larger
    expect(text).not.toContain("undefined");
  });

  it("handles critical severity prominently and supports multi-page", () => {
    // create many issues to force multi-page
    const many = Array.from({ length: 20 }, (_, i) => ({
      title: `Issue ${i + 1} — ${i % 3 === 0 ? "CRITICAL example" : "Minor"}`,
      code: `CODE_${i}`,
      category: "GENERAL",
      severity: i % 5 === 0 ? "CRITICAL" : "LOW",
      description: "This is a long description that should wrap across multiple lines to test pagination and ensure the PDF correctly handles page breaks without cutting off content. ".repeat(2),
      recommendation: "Recommendation text that also wraps and should appear correctly on the page without overflow.",
    }));
    const buf = generateReportPdf({ ...sample, issues: many });
    expect(buf.length).toBeGreaterThan(10000);
    expect(buf.slice(0, 4).toString()).toBe("%PDF");
    const text = buf.toString("utf8");
    expect(text).toContain("Page 2");
  });

  it("generates READY status correctly without overriding engine", () => {
    const ready = generateReportPdf({ ...sample, check: { ...sample.check, score: 100, status: "READY" }, issues: [] });
    const text = ready.toString("utf8");
    expect(text).toContain("READY");
    expect(text).toContain("100");
  });
});
