import { describe, it, expect } from "vitest";
import { validateGpsrProduct } from "@/services/gpsr/gpsr-validator";

describe("GPSR validator", () => {
  it("returns READY for complete product", () => {
    const result = validateGpsrProduct({
      name: "Test Product",
      brand: "Acme",
      sku: "SKU-123",
      gtin: "4006381333931",
      manufacturer: { name: "Acme Corp", street: "Str 1", city: "Berlin", postalCode: "10115", country: "Germany", email: "info@acme.de" },
      responsiblePerson: { isRequired: false },
      safetyInfo: { warnings: "Keep away from children", instructions: "Use as directed" },
      documents: [{ id: "1", type: "MANUAL" }],
    });
    expect(result.status).toBe("READY");
    expect(result.score).toBe(100);
    expect(result.issues.length).toBe(0);
  });

  it("flags missing manufacturer", () => {
    const result = validateGpsrProduct({
      name: "Test Product",
      sku: "SKU-123",
      manufacturer: null,
      safetyInfo: { warnings: "warn", instructions: "inst" },
      documents: [{ id: "1", type: "MANUAL" }],
    });
    expect(result.issues.some((i) => i.code === "MFG_NAME_MISSING")).toBe(true);
    expect(result.issues.some((i) => i.code === "MFG_ADDRESS_MISSING")).toBe(true);
  });

  it("requires RP when isRequired", () => {
    const result = validateGpsrProduct({
      name: "Test",
      sku: "SKU-1",
      manufacturer: { name: "Mfg", street: "s", city: "c", postalCode: "1", country: "CN", email: "a@b.c" },
      responsiblePerson: { isRequired: true, company: "", street: "", city: "", postalCode: "", country: "", email: "" },
      safetyInfo: { warnings: "w", instructions: "i" },
      documents: [{ id: "1", type: "MANUAL" }],
    });
    expect(result.issues.some((i) => i.code === "RP_REQUIRED_MISSING")).toBe(true);
    expect(result.issues.some((i) => i.code === "RP_ADDRESS_MISSING")).toBe(true);
  });

  it("flags missing identifier", () => {
    const result = validateGpsrProduct({
      name: "Test",
      manufacturer: { name: "M", street: "s", city: "c", postalCode: "p", country: "DE", email: "a@b.c" },
      safetyInfo: { warnings: "w", instructions: "i" },
      documents: [{ id: "1", type: "MANUAL" }],
    });
    expect(result.issues.some((i) => i.code === "ID_SKU_MISSING")).toBe(true);
  });

  it("flags missing safety warnings", () => {
    const result = validateGpsrProduct({
      name: "Test",
      sku: "SKU-1",
      manufacturer: { name: "M", street: "s", city: "c", postalCode: "p", country: "DE", email: "a@b.c" },
      safetyInfo: { warnings: "", instructions: "" },
      documents: [{ id: "1", type: "MANUAL" }],
    });
    expect(result.issues.some((i) => i.code === "SAFETY_WARNINGS_MISSING")).toBe(true);
  });

  it("score is transparent and explainable", () => {
    const result = validateGpsrProduct({ name: "" });
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.missingFields.length).toBeGreaterThan(0);
  });
});
