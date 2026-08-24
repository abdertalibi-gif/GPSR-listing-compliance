import fs from "fs";
import path from "path";

export const ALLOWED_TYPES = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "image/jpeg", "image/png", "image/webp"];
export const ALLOWED_EXTS = [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png", ".webp"];
export const MAX_SIZE = 10 * 1024 * 1024;

export function validateFile(file: File): { ok: true } | { ok: false; error: string } {
  if (file.size > MAX_SIZE) return { ok: false, error: "File exceeds the 10 MB limit." };
  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXTS.includes(ext)) return { ok: false, error: `Unsupported file type ${ext}. Allowed: PDF, DOC, DOCX, JPG, PNG, WebP.` };
  if (!ALLOWED_TYPES.includes(file.type)) {
    // Some browsers send empty type for .doc, allow by ext
    if (file.type && file.type !== "") return { ok: false, error: `Unsupported MIME ${file.type}. Allowed: PDF, DOC, DOCX, JPG, PNG, WebP.` };
  }
  // Extension/MIME mismatch is informational; ext check already covers it
  void file.type;
  return { ok: true };
}

export async function saveFile(buffer: Buffer, fileName: string, folder: string): Promise<string> {
  const endpoint = process.env.STORAGE_ENDPOINT;
  if (endpoint && process.env.STORAGE_ACCESS_KEY) {
    // In production, upload to S3/R2 — placeholder: would use AWS SDK
    // For now, fallback to local
    console.warn("[storage] STORAGE_ENDPOINT configured but S3 not implemented, falling back to local");
  }
  const uploadsDir = path.join(process.cwd(), "uploads", folder);
  await fs.promises.mkdir(uploadsDir, { recursive: true });
  const key = `${folder}/${Date.now()}-${fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const fullPath = path.join(process.cwd(), "uploads", key);
  await fs.promises.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.promises.writeFile(fullPath, buffer);
  return key;
}

export async function deleteFile(storageKey: string): Promise<void> {
  const fullPath = path.join(process.cwd(), "uploads", storageKey);
  try { await fs.promises.unlink(fullPath); } catch {}
}
