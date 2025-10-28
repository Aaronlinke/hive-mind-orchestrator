import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function copyToClipboard(
  text: string,
  onSuccess?: () => void,
  onError?: (error: Error) => void
): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    onSuccess?.();
    return true;
  } catch (error) {
    console.error("Copy failed:", error);
    onError?.(error instanceof Error ? error : new Error("Copy failed"));
    return false;
  }
}

export function formatJSON(data: any): string {
  try {
    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error("JSON formatting failed:", error);
    return String(data);
  }
}
