import { Quote } from "@/types/quote";

export function sanitizeText(value: string, maxLength = 200): string {
  return value.replace(/[\x00-\x1F\x7F]/g, "").slice(0, maxLength);
}

export function validateQuote(quote: Quote): string[] {
  const errors: string[] = [];

  if (!quote.businessName.trim()) errors.push("Business name is required.");
  if (!quote.clientName.trim()) errors.push("Client name is required.");

  const hasRealItem = quote.items.some((i) => i.description.trim());
  if (!hasRealItem) errors.push("Add at least one item with a description.");

  quote.items.forEach((item, i) => {
    if (!item.description.trim()) return;
    if (item.quantity <= 0)
      errors.push(`Item ${i + 1}: quantity must be greater than 0.`);
    if (item.unitPrice < 0)
      errors.push(`Item ${i + 1}: price can't be negative.`);
  });

  return errors;
}
