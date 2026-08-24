import { GPSR_RULES, type GpsrRuleDefinition } from "./rules";

export type GpsrProductInput = {
  name?: string | null;
  description?: string | null;
  brand?: string | null;
  sku?: string | null;
  modelNumber?: string | null;
  gtin?: string | null;
  barcode?: string | null;
  serialNumber?: string | null;
  batchNumber?: string | null;
  productIdentifier?: string | null;
  manufacturer?: {
    name?: string | null;
    street?: string | null;
    city?: string | null;
    postalCode?: string | null;
    country?: string | null;
    email?: string | null;
    phone?: string | null;
    website?: string | null;
  } | null;
  responsiblePerson?: {
    isRequired?: boolean | null;
    company?: string | null;
    street?: string | null;
    city?: string | null;
    postalCode?: string | null;
    country?: string | null;
    email?: string | null;
    phone?: string | null;
    website?: string | null;
  } | null;
  safetyInfo?: {
    warnings?: string | null;
    instructions?: string | null;
    ageRestrictions?: string | null;
    usageRestrictions?: string | null;
  } | null;
  documents?: { id: string; type: string }[];
};

export type GpsrIssueResult = {
  code: string;
  title: string;
  description: string;
  severity: GpsrRuleDefinition["severity"];
  category: GpsrRuleDefinition["category"];
  field?: string;
  recommendation: string;
  weight: number;
};

export type GpsrValidationResult = {
  status: "READY" | "NEEDS_REVIEW" | "INCOMPLETE" | "DRAFT";
  score: number;
  missingFields: string[];
  warnings: GpsrIssueResult[];
  recommendations: string[];
  checks: { rule: string; passed: boolean }[];
  issues: GpsrIssueResult[];
};

function isEmpty(v?: string | null) {
  return !v || v.trim().length === 0;
}

export function validateGpsrProduct(product: GpsrProductInput): GpsrValidationResult {
  const issues: GpsrIssueResult[] = [];
  const checks: { rule: string; passed: boolean }[] = [];

  function evaluate(rule: GpsrRuleDefinition, passed: boolean) {
    checks.push({ rule: rule.code, passed });
    if (!passed && rule.enabled) {
      issues.push({
        code: rule.code,
        title: rule.title,
        description: rule.description,
        severity: rule.severity,
        category: rule.category,
        field: rule.field,
        recommendation: getRecommendation(rule.code),
        weight: rule.weight,
      });
    }
  }

  const mfg = product.manufacturer;
  const rp = product.responsiblePerson;
  const safety = product.safetyInfo;

  // BASIC_NAME_MISSING
  evaluate(
    GPSR_RULES.find((r) => r.code === "BASIC_NAME_MISSING")!,
    !isEmpty(product.name)
  );
  evaluate(
    GPSR_RULES.find((r) => r.code === "BASIC_BRAND_MISSING")!,
    !isEmpty(product.brand)
  );
  // MFG_NAME_MISSING
  evaluate(
    GPSR_RULES.find((r) => r.code === "MFG_NAME_MISSING")!,
    !isEmpty(mfg?.name)
  );
  // MFG_ADDRESS_MISSING: need street+city+postalCode+country
  evaluate(
    GPSR_RULES.find((r) => r.code === "MFG_ADDRESS_MISSING")!,
    !isEmpty(mfg?.street) && !isEmpty(mfg?.city) && !isEmpty(mfg?.postalCode) && !isEmpty(mfg?.country)
  );
  // MFG_CONTACT_MISSING
  evaluate(
    GPSR_RULES.find((r) => r.code === "MFG_CONTACT_MISSING")!,
    !isEmpty(mfg?.email) || !isEmpty(mfg?.phone) || !isEmpty(mfg?.website)
  );
  // RP_REQUIRED_MISSING: if isRequired then company must exist
  const rpRule = GPSR_RULES.find((r) => r.code === "RP_REQUIRED_MISSING")!;
  if (rp?.isRequired) {
    evaluate(rpRule, !isEmpty(rp?.company));
  } else {
    checks.push({ rule: rpRule.code, passed: true });
  }
  // RP_ADDRESS_MISSING: only if isRequired
  const rpAddrRule = GPSR_RULES.find((r) => r.code === "RP_ADDRESS_MISSING")!;
  if (rp?.isRequired) {
    evaluate(
      rpAddrRule,
      !isEmpty(rp?.street) && !isEmpty(rp?.city) && !isEmpty(rp?.postalCode) && !isEmpty(rp?.country)
    );
  } else {
    checks.push({ rule: rpAddrRule.code, passed: true });
  }
  // RP_CONTACT_MISSING
  const rpContactRule = GPSR_RULES.find((r) => r.code === "RP_CONTACT_MISSING")!;
  if (rp?.isRequired) {
    evaluate(rpContactRule, !isEmpty(rp?.email) || !isEmpty(rp?.phone));
  } else {
    checks.push({ rule: rpContactRule.code, passed: true });
  }
  // ID_SKU_MISSING
  evaluate(
    GPSR_RULES.find((r) => r.code === "ID_SKU_MISSING")!,
    !isEmpty(product.sku) ||
      !isEmpty(product.modelNumber) ||
      !isEmpty(product.gtin) ||
      !isEmpty(product.barcode) ||
      !isEmpty(product.serialNumber) ||
      !isEmpty(product.batchNumber) ||
      !isEmpty(product.productIdentifier)
  );
  // ID_GTIN_FORMAT
  const gtinRule = GPSR_RULES.find((r) => r.code === "ID_GTIN_FORMAT")!;
  if (!isEmpty(product.gtin)) {
    const digits = product.gtin!.replace(/\D/g, "");
    const valid = [8, 12, 13, 14].includes(digits.length) && digits === product.gtin!.trim();
    evaluate(gtinRule, valid);
  } else {
    checks.push({ rule: gtinRule.code, passed: true });
  }
  // SAFETY_WARNINGS_MISSING
  evaluate(
    GPSR_RULES.find((r) => r.code === "SAFETY_WARNINGS_MISSING")!,
    !isEmpty(safety?.warnings)
  );
  // SAFETY_INSTRUCTIONS_MISSING
  evaluate(
    GPSR_RULES.find((r) => r.code === "SAFETY_INSTRUCTIONS_MISSING")!,
    !isEmpty(safety?.instructions)
  );
  // DOC_MISSING
  evaluate(
    GPSR_RULES.find((r) => r.code === "DOC_MISSING")!,
    (product.documents?.length ?? 0) > 0
  );

  const totalWeight = GPSR_RULES.filter((r) => r.enabled).reduce((s, r) => s + r.weight, 0);
  const failedWeight = issues.reduce((s, i) => s + i.weight, 0);
  const score = Math.max(0, Math.round(100 - (failedWeight / totalWeight) * 100));

  let status: GpsrValidationResult["status"] = "INCOMPLETE";
  if (score >= 100) status = "READY";
  else if (score >= 50) status = "NEEDS_REVIEW";
  else if (score === 0 && isEmpty(product.name)) status = "DRAFT";
  else status = "INCOMPLETE";

  // READY requires no CRITICAL issues
  const hasCritical = issues.some((i) => i.severity === "CRITICAL");
  if (hasCritical && status === "READY") status = "NEEDS_REVIEW";

  return {
    status,
    score,
    missingFields: issues.map((i) => i.field ?? i.code),
    warnings: issues,
    recommendations: issues.map((i) => i.recommendation),
    checks,
    issues,
  };
}

function getRecommendation(code: string): string {
  const map: Record<string, string> = {
    MFG_NAME_MISSING: "Add the manufacturer's legal name and trade name as registered.",
    MFG_ADDRESS_MISSING: "Provide a complete postal address: street, city, postal code, and country.",
    MFG_CONTACT_MISSING: "Add at least one contact: email, phone, or website for the manufacturer.",
    RP_REQUIRED_MISSING: "If the manufacturer is outside the EU, add the EU Responsible Person's company name.",
    RP_ADDRESS_MISSING: "Provide the Responsible Person's full EU postal address.",
    RP_CONTACT_MISSING: "Provide email or phone for the Responsible Person.",
    ID_SKU_MISSING: "Add at least one identifier: SKU, Model number, GTIN, Barcode, or Batch/Serial.",
    ID_GTIN_FORMAT: "Ensure GTIN contains only digits and is 8, 12, 13 or 14 characters long.",
    SAFETY_WARNINGS_MISSING: "Add safety warnings that comply with GPSR labelling requirements.",
    SAFETY_INSTRUCTIONS_MISSING: "Add clear safety and usage instructions.",
    DOC_MISSING: "Upload a supporting document (manual, safety sheet, or certificate).",
    BASIC_NAME_MISSING: "Provide a clear product name and description.",
    BASIC_BRAND_MISSING: "Consider adding brand information for traceability.",
  };
  return map[code] ?? "Review and provide the missing information.";
}
