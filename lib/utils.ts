import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { CustomAttribute } from "@/types"
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function getSpecialPrice(
  customAttributes: CustomAttribute[]
): string | null {
  if (!Array.isArray(customAttributes)) return null;

  const attr = customAttributes.find(
    (item) => item.attribute_code === "special_price"
  );

  return attr ? String(attr.value) : null;
}

export default function getSlugFromMagentoUrl(url: string): string {
  if (!url) return "";
  const last = url.split("/").pop() ?? "";
  return last.replace(".html", "");
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
    .replace(/\-\-+/g, '-')      // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start of text
    .replace(/-+$/, '');         // Trim - from end of text
}

export function splitPrice(price: number): { whole: string; decimal: string } {
  const [whole, decimal = "00"] = price.toFixed(2).split(".");
  return {
    whole,
    decimal: `.${decimal}`,
  };
}
