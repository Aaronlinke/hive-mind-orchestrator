// 🛡️ Frontend Input Validation mit Zod
import { z } from "zod";

// Chat Message Schema
export const chatMessageSchema = z.object({
  content: z.string()
    .min(1, "Nachricht darf nicht leer sein")
    .max(10000, "Nachricht ist zu lang (max. 10.000 Zeichen)"),
  aiNodeId: z.string().optional(),
});

// Image Generation Schema
export const imageGenerationSchema = z.object({
  prompt: z.string()
    .min(1, "Prompt darf nicht leer sein")
    .max(5000, "Prompt ist zu lang (max. 5.000 Zeichen)"),
  aiNodeId: z.string().optional(),
});

// Workflow Schema
export const workflowSchema = z.object({
  name: z.string()
    .min(1, "Name ist erforderlich")
    .max(200, "Name ist zu lang (max. 200 Zeichen)"),
  description: z.string()
    .max(1000, "Beschreibung ist zu lang (max. 1.000 Zeichen)")
    .optional(),
  steps: z.array(z.any()).min(1, "Mindestens ein Schritt erforderlich"),
});

// User Preferences Schema
export const userPreferencesSchema = z.object({
  theme: z.object({
    mode: z.enum(["dark", "light"]),
    primary: z.string(),
  }),
  dashboardWidgets: z.array(z.string()),
  layoutPreset: z.string().optional(),
});

// Generic Validation Function
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.issues.map(err => `${err.path.join(".")}: ${err.message}`),
      };
    }
    return { success: false, errors: ["Unbekannter Validierungsfehler"] };
  }
}

// Sanitize HTML (XSS Prevention)
export function sanitizeHtml(html: string): string {
  const div = document.createElement("div");
  div.textContent = html;
  return div.innerHTML;
}

// Escape Code Blocks for Safe Display
export function escapeCodeBlock(code: string): string {
  return code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
