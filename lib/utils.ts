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