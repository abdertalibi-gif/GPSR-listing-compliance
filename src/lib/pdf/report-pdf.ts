import { jsPDF } from "jspdf";
import { getPdfT, formatDateForPdf, type PdfLocale } from "./translations";
import fs from "fs";
import path from "path";

type PdfReportData = {
  reportId: string;
  title: string;
  createdAt: Date;
  product: {
    name: string;
    brand?: string | null;
    sku?: string | null;
    modelNumber?: string | null;
    gtin?: string | null;
    category?: string | null;
    countryOfOrigin?: string | null;
    manufacturer?: { name?: string | null; street?: string | null; city?: string | null; postalCode?: string | null; country?: string | null; email?: string | null; phone?: string | null } | null;
    responsiblePerson?: { company?: string | null; street?: string | null; city?: string | null; postalCode?: string | null; country?: string | null; email?: string | null; phone?: string | null; isRequired?: boolean } | null;
    documentsCount?: number;
  };
  check: {
    score: number;
    status: string;
    summary?: string | null;
    createdAt: Date;
  } | null;
  issues: Array<{
    title: string;
    code: string;
    category: string;
    severity: string;
    description: string;
    recommendation?: string | null;
    field?: string | null;
  }>;
  passedChecks?: Array<{ label: string; rule: string }>;
};

const ORANGE = { r: 234, g: 88, b: 12 };
const NAVY = { r: 20, g: 33, b: 61 }; // #14213D
const LIGHT_ORANGE: [number, number, number] = [255, 247, 237]; // #FFF7ED
const GRAY: [number, number, number] = [100, 116, 139];
const BORDER: [number, number, number] = [231, 236, 243];

export function generateReportPdf(data: PdfReportData, locale: PdfLocale = "en"): Buffer {
  const t = (key: string) => getPdfT(locale, key);
  const isRTL = locale === "ar";
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let y = 0;

  // Arabic font handling
  let fontName = "helvetica";
  if (isRTL) {
    try {
      const fontPath = path.join(process.cwd(), "public", "fonts", "Amiri-Regular.ttf");
      if (fs.existsSync(fontPath)) {
        const fontData = fs.readFileSync(fontPath);
        const base64 = fontData.toString("base64");
        doc.addFileToVFS("Amiri-Regular.ttf", base64);
        doc.addFont("Amiri-Regular.ttf", "Amiri", "normal");
        doc.addFont("Amiri-Regular.ttf", "Amiri", "bold");
        fontName = "Amiri";
      }
    } catch {}
  }

  const addPageIfNeeded = (needed: number) => {
    if (y + needed > pageHeight - 18) {
      doc.addPage();
      y = 14;
      drawFooter();
    }
  };

  const drawFooter = () => {
    const footerY = pageHeight - 10;
    doc.setFontSize(7);
    doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
    doc.setFont(fontName, "normal");
    const footerText = t("footer");
    if (isRTL) doc.text(footerText, pageWidth - margin, footerY, { align: "right" } as never);
    else doc.text(footerText, margin, footerY);
  };

  const drawHeader = () => {
    doc.setFillColor(ORANGE.r, ORANGE.g, ORANGE.b);
    doc.rect(0, 0, pageWidth, 22, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont(fontName, "bold");
    doc.setFontSize(11);
    if (isRTL) doc.text(t("headerTitle"), pageWidth - margin, 9, { align: "right" } as never);
    else doc.text(t("headerTitle"), margin, 9);
    doc.setFont(fontName, "normal");
    doc.setFontSize(7);
    if (isRTL) doc.text(t("headerSubtitle"), pageWidth - margin, 14.5, { align: "right" } as never);
    else doc.text(t("headerSubtitle"), margin, 14.5);
    doc.setFontSize(6);
    if (isRTL) {
      doc.text(t("headerTagline2"), margin, 9);
      doc.text(t("headerTagline1"), margin, 14.5);
    } else {
      doc.text(t("headerTagline1"), pageWidth - margin, 9, { align: "right" } as never);
      doc.text(t("headerTagline2"), pageWidth - margin, 14.5, { align: "right" } as never);
    }
    y = 28;
  };

  drawHeader();
  drawFooter();

  // Title
  doc.setTextColor(NAVY.r, NAVY.g, NAVY.b);
  doc.setFont(fontName, "bold");
  doc.setFontSize(13);
  const titleText = t("reportTitle");
  if (isRTL) doc.text(titleText, pageWidth - margin, y, { align: "right" } as never);
  else doc.text(titleText, margin, y);
  // Also show original title if different (product name already in it)
  y += 6;
  doc.setFont(fontName, "normal");
  doc.setFontSize(8);
  doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
  const metaLine = `${t("reportId")}: ${data.reportId}  •  ${t("generated")}: ${formatDateForPdf(data.createdAt, locale)}  •  ${t("check")}: ${data.check ? formatDateForPdf(data.check.createdAt, locale) : "—"}`;
  if (isRTL) doc.text(metaLine, pageWidth - margin, y, { align: "right" } as never);
  else doc.text(metaLine, margin, y);
  y += 8;

  // Product Information
  addPageIfNeeded(28);
  doc.setFillColor(LIGHT_ORANGE[0], LIGHT_ORANGE[1], LIGHT_ORANGE[2]);
  doc.setDrawColor(BORDER[0], BORDER[1], BORDER[2]);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 6, 1, 1, "FD");
  doc.setFont(fontName, "bold");
  doc.setFontSize(8);
  doc.setTextColor(NAVY.r, NAVY.g, NAVY.b);
  const prodTitle = t("productInfo");
  if (isRTL) doc.text(prodTitle, pageWidth - margin - 3, y + 4, { align: "right" } as never);
  else doc.text(prodTitle, margin + 3, y + 4);
  y += 10;

  const notProvided = t("notProvided");
  const notRequired = t("notRequired");
  const productRows: Array<[string, string]> = [];
  productRows.push([t("productName"), data.product.name || notProvided]);
  productRows.push([t("brand"), data.product.brand || notProvided]);
  productRows.push([t("sku"), data.product.sku || notProvided]);
  productRows.push([t("gtin"), data.product.gtin || notProvided]);
  productRows.push([t("model"), data.product.modelNumber || notProvided]);
  productRows.push([t("category"), data.product.category || notProvided]);
  productRows.push([t("origin"), data.product.countryOfOrigin || notProvided]);
  const mfg = data.product.manufacturer;
  productRows.push([t("manufacturer"), mfg?.name || notProvided]);
  productRows.push([t("manufacturerAddress"), mfg ? [mfg.street, mfg.city, mfg.postalCode, mfg.country].filter(Boolean).join(", ") || notProvided : notProvided]);
  productRows.push([t("manufacturerContact"), (mfg?.email || mfg?.phone) ? [mfg?.email, mfg?.phone].filter(Boolean).join(" / ")! : notProvided]);
  const rp = data.product.responsiblePerson;
  productRows.push([t("responsiblePerson"), rp?.isRequired ? rp.company || notProvided : notRequired]);
  productRows.push([t("responsiblePersonAddress"), rp?.isRequired ? ([rp.street, rp.city, rp.postalCode, rp.country].filter(Boolean).join(", ") || notProvided) : notRequired]);
  productRows.push([t("documentStatus"), typeof data.product.documentsCount === "number" ? (data.product.documentsCount > 0 ? `${data.product.documentsCount} document(s)` : notProvided) : notProvided]);

  doc.setFont(fontName, "normal");
  doc.setFontSize(7.5);
  for (const [label, value] of productRows) {
    addPageIfNeeded(6);
    doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
    doc.setFont(fontName, "bold");
    const labelText = `${label}:`;
    if (isRTL) {
      const valLines = doc.splitTextToSize(value, pageWidth - margin * 2 - doc.getTextWidth(labelText) - 4) as string[];
      // For RTL, label on right, value on left? Simplify: label right, value left
      doc.text(labelText, pageWidth - margin, y, { align: "right" } as never);
      doc.setFont(fontName, "normal");
      doc.setTextColor(NAVY.r, NAVY.g, NAVY.b);
      // value to the left of label
      const labelW = doc.getTextWidth(labelText);
      doc.text(valLines[0] ?? "—", pageWidth - margin - labelW - 2, y, { align: "right" } as never);
      if (valLines.length > 1) {
        for (let i = 1; i < valLines.length; i++) {
          y += 4;
          addPageIfNeeded(4);
          doc.text(valLines[i], pageWidth - margin - labelW - 2, y, { align: "right" } as never);
        }
      }
    } else {
      doc.text(labelText, margin, y);
      const labelW = doc.getTextWidth(labelText);
      doc.setFont(fontName, "normal");
      doc.setTextColor(NAVY.r, NAVY.g, NAVY.b);
      const lines = doc.splitTextToSize(value, pageWidth - margin * 2 - labelW - 2) as string[];
      doc.text(lines[0] ?? "—", margin + labelW + 1, y);
      if (lines.length > 1) {
        for (let i = 1; i < lines.length; i++) {
          y += 4;
          addPageIfNeeded(4);
          doc.text(lines[i], margin + labelW + 1, y);
        }
      }
    }
    y += 5;
  }
  y += 2;

  // Report Summary
  addPageIfNeeded(22);
  doc.setFillColor(NAVY.r, NAVY.g, NAVY.b);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 6, 1, 1, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont(fontName, "bold");
  doc.setFontSize(8);
  const summaryTitle = t("reportSummary");
  if (isRTL) doc.text(summaryTitle, pageWidth - margin - 3, y + 4, { align: "right" } as never);
  else doc.text(summaryTitle, margin + 3, y + 4);
  y += 10;

  const score = data.check?.score ?? 0;
  const status = data.check?.status ?? "UNKNOWN";
  const scoreColor: [number, number, number] = score >= 90 ? [16, 185, 129] : score >= 70 ? [245, 158, 11] : [239, 68, 68];

  addPageIfNeeded(18);
  doc.setDrawColor(BORDER[0], BORDER[1], BORDER[2]);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 16, 2, 2, "FD");
  doc.setFont(fontName, "bold");
  doc.setFontSize(9);
  doc.setTextColor(NAVY.r, NAVY.g, NAVY.b);
  const scoreText = `${t("score")}: ${score} / 100`;
  const statusText = `${t("status")}: ${status.replace("_", " ")}`;
  if (isRTL) {
    doc.text(statusText, margin + 4, y + 11);
    doc.text(scoreText, pageWidth - margin - 4, y + 6, { align: "right" } as never);
  } else {
    doc.text(scoreText, margin + 4, y + 6);
    doc.setFontSize(7);
    doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    doc.text(statusText, margin + 4, y + 11);
  }
  if (!isRTL) {
    doc.setFontSize(7);
    doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    // already drawn
  } else {
    doc.setFontSize(7);
    doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  }
  doc.setFont(fontName, "normal");
  doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
  const summaryText = `${t("reportId")} ${data.reportId} • ${productRows.length} ${t("productInfo").toLowerCase()} • ${data.issues.length} ${t("issues").toLowerCase()}`;
  if (isRTL) doc.text(summaryText, margin + 4, y + 6);
  else doc.text(summaryText, pageWidth - margin - doc.getTextWidth(summaryText), y + 6);
  y += 22;

  // Compliance summary
  const critical = data.issues.filter((i) => i.severity === "CRITICAL").length;
  const failed = data.issues.length;
  addPageIfNeeded(14);
  doc.setFont(fontName, "bold");
  doc.setFontSize(7);
  doc.setTextColor(NAVY.r, NAVY.g, NAVY.b);
  const compTitle = t("complianceSummary");
  if (isRTL) doc.text(compTitle, pageWidth - margin, y, { align: "right" } as never);
  else doc.text(compTitle, margin, y);
  y += 5;
  doc.setFont(fontName, "normal");
  doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
  const compLine = `${t("totalIssues")}: ${failed}  •  ${t("critical")}: ${critical}  •  ${t("warnings")}: ${Math.max(0, failed - critical)}`;
  if (isRTL) doc.text(compLine, pageWidth - margin, y, { align: "right" } as never);
  else doc.text(compLine, margin, y);
  y += 7;

  // Passed Checks
  if (data.passedChecks && data.passedChecks.length > 0) {
    addPageIfNeeded(10);
    doc.setFont(fontName, "bold");
    doc.setTextColor(NAVY.r, NAVY.g, NAVY.b);
    const pcTitle = `${t("passedChecks")} (${data.passedChecks.length})`;
    if (isRTL) doc.text(pcTitle, pageWidth - margin, y, { align: "right" } as never);
    else doc.text(pcTitle, margin, y);
    y += 5;
    for (const pc of data.passedChecks) {
      const label = pc.label.length > 80 ? pc.label.slice(0, 77) + "..." : pc.label;
      addPageIfNeeded(8);
      doc.setFillColor(236, 253, 245);
      doc.setDrawColor(167, 243, 208);
      doc.roundedRect(margin, y, pageWidth - margin * 2, 7, 1, 1, "FD");
      doc.setFont(fontName, "normal");
      doc.setFontSize(7);
      doc.setTextColor(16, 185, 129);
      const checkText = `✓ ${label}`;
      if (isRTL) doc.text(checkText, pageWidth - margin - 3, y + 4.5, { align: "right" } as never);
      else doc.text(checkText, margin + 3, y + 4.5);
      y += 9;
    }
    y += 2;
  }

  // Issues
  addPageIfNeeded(10);
  doc.setFont(fontName, "bold");
  doc.setTextColor(NAVY.r, NAVY.g, NAVY.b);
  const issuesTitle = `${t("issues")} (${data.issues.length})`;
  if (isRTL) doc.text(issuesTitle, pageWidth - margin, y, { align: "right" } as never);
  else doc.text(issuesTitle, margin, y);
  y += 5;

  if (data.issues.length === 0) {
    addPageIfNeeded(10);
    doc.setFillColor(236, 253, 245);
    doc.setDrawColor(167, 243, 208);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 10, 2, 2, "FD");
    doc.setTextColor(16, 185, 129);
    doc.setFont(fontName, "bold");
    doc.setFontSize(7);
    const noIss = t("noIssues");
    if (isRTL) doc.text(noIss, pageWidth - margin - 4, y + 6, { align: "right" } as never);
    else doc.text(noIss, margin + 4, y + 6);
    y += 14;
  } else {
    for (const issue of data.issues) {
      const isCritical = issue.severity === "CRITICAL";
      const descLines = doc.splitTextToSize(issue.description || "", pageWidth - margin * 2 - 8) as string[];
      const recLines = issue.recommendation ? (doc.splitTextToSize(issue.recommendation, pageWidth - margin * 2 - 8) as string[]) : [];
      const blockH = 7 + 4 + descLines.length * 4 + (recLines.length ? 4 + recLines.length * 4 : 0) + 6;
      addPageIfNeeded(blockH + 4);

      if (isCritical) {
        doc.setFillColor(254, 242, 242);
        doc.setDrawColor(254, 202, 202);
      } else {
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(BORDER[0], BORDER[1], BORDER[2]);
      }
      const cardY = y;
      doc.setFont(fontName, "bold");
      doc.setFontSize(6);
      const sevText = issue.severity;
      const sevW = doc.getTextWidth(sevText) + 6;
      doc.roundedRect(margin, y, pageWidth - margin * 2, blockH, 2, 2, "FD");
      if (isCritical) {
        doc.setFillColor(239, 68, 68);
        doc.setTextColor(255, 255, 255);
      } else if (issue.severity === "HIGH") {
        doc.setFillColor(245, 158, 11);
        doc.setTextColor(255, 255, 255);
      } else {
        doc.setFillColor(ORANGE.r, ORANGE.g, ORANGE.b);
        doc.setTextColor(255, 255, 255);
      }
      // badge position RTL aware
      const badgeX = isRTL ? pageWidth - margin - 3 - sevW : margin + 3;
      doc.roundedRect(badgeX, y + 2, sevW, 4, 1, 1, "F");
      doc.text(sevText, badgeX + 3, y + 5);

      doc.setTextColor(NAVY.r, NAVY.g, NAVY.b);
      doc.setFont(fontName, "bold");
      doc.setFontSize(7.5);
      const titleX = isRTL ? margin + 3 : badgeX + sevW + 4;
      const titleW = isRTL ? pageWidth - titleX - margin - 3 - sevW - 4 : pageWidth - titleX - 3;
      // for RTL title should be right aligned near badge
      const titleLines = doc.splitTextToSize(issue.title, titleW) as string[];
      if (isRTL) doc.text(titleLines[0] ?? issue.title, pageWidth - margin - 3 - sevW - 4, y + 5, { align: "right" } as never);
      else doc.text(titleLines[0] ?? issue.title, titleX, y + 5);
      doc.setFont(fontName, "normal");
      doc.setFontSize(6);
      doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
      const subtitle = issue.field ? `${issue.category} • ${issue.field}` : issue.category;
      if (isRTL) doc.text(subtitle, pageWidth - margin - 3, y + 9, { align: "right" } as never);
      else doc.text(subtitle, margin + 3, y + 9);
      y += 12;
      doc.setFont(fontName, "normal");
      doc.setFontSize(7);
      doc.setTextColor(30, 41, 59);
      for (const line of descLines) {
        if (isRTL) doc.text(line, pageWidth - margin - 4, y, { align: "right" } as never);
        else doc.text(line, margin + 4, y);
        y += 4;
      }
      if (recLines.length) {
        y += 1;
        doc.setFont(fontName, "bold");
        doc.setFontSize(6.5);
        doc.setTextColor(NAVY.r, NAVY.g, NAVY.b);
        const recLabel = `${t("recommendation")}:`;
        if (isRTL) doc.text(recLabel, pageWidth - margin - 4, y, { align: "right" } as never);
        else doc.text(recLabel, margin + 4, y);
        y += 4;
        doc.setFont(fontName, "normal");
        doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
        for (const line of recLines) {
          if (isRTL) doc.text(line, pageWidth - margin - 4, y, { align: "right" } as never);
          else doc.text(line, margin + 4, y);
          y += 4;
        }
      }
      y = cardY + blockH + 4;
    }
  }

  // Recommendations
  if (data.issues.length > 0) {
    addPageIfNeeded(14);
    doc.setFont(fontName, "bold");
    doc.setTextColor(NAVY.r, NAVY.g, NAVY.b);
    const recTitle = t("recommendations");
    if (isRTL) doc.text(recTitle, pageWidth - margin, y, { align: "right" } as never);
    else doc.text(recTitle, margin, y);
    y += 6;
    doc.setFont(fontName, "normal");
    doc.setFontSize(7);
    doc.setTextColor(30, 41, 59);
    data.issues.forEach((iss, idx) => {
      const rec = iss.recommendation ?? "";
      const numPref = isRTL ? `${rec} :${idx + 1}` : `${idx + 1}. ${rec}`;
      const lines = doc.splitTextToSize(numPref, pageWidth - margin * 2 - 6) as string[];
      for (const line of lines) {
        addPageIfNeeded(5);
        if (isRTL) doc.text(line, pageWidth - margin - 4, y, { align: "right" } as never);
        else doc.text(line, margin + 4, y);
        y += 4;
      }
      y += 2;
    });
  }

  // Disclaimer
  addPageIfNeeded(22);
  doc.setFillColor(255, 251, 235);
  doc.setDrawColor(253, 230, 138);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 16, 2, 2, "FD");
  doc.setFont(fontName, "bold");
  doc.setFontSize(7);
  doc.setTextColor(120, 53, 15);
  const discTitle = t("disclaimerTitle");
  if (isRTL) doc.text(discTitle, pageWidth - margin - 4, y + 5, { align: "right" } as never);
  else doc.text(discTitle, margin + 4, y + 5);
  doc.setFont(fontName, "normal");
  doc.setFontSize(6.5);
  const disclaimer = t("disclaimer");
  const discLines = doc.splitTextToSize(disclaimer, pageWidth - margin * 2 - 8) as string[];
  let dy = y + 9;
  for (const line of discLines) {
    if (isRTL) doc.text(line, pageWidth - margin - 4, dy, { align: "right" } as never);
    else doc.text(line, margin + 4, dy);
    dy += 3.5;
  }
  y = dy + 4;

  // Page numbers
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFont(fontName, "normal");
    doc.setFontSize(6);
    doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
    const pageText = `${t("page")} ${i} ${t("of")} ${total}  •  ${data.reportId}  •  ${t("confidential")}`;
    if (isRTL) doc.text(pageText, margin, pageHeight - 5);
    else doc.text(pageText, pageWidth - margin, pageHeight - 5, { align: "right" } as never);
  }

  const arrayBuf = doc.output("arraybuffer") as ArrayBuffer;
  return Buffer.from(arrayBuf);
}
