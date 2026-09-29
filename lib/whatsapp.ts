import { Quote } from "@/types/quote";

export function buildWhatsAppLink(quote: Quote, total: number): string {
  const lines = quote.items
    .map(
      (item) =>
        `- ${item.description} x${item.quantity} = R${(
          item.quantity * item.unitPrice
        ).toFixed(2)}`,
    )
    .join("\n");

  const message = `Quote from ${quote.businessName}\n\nHi ${quote.clientName},\n\n${lines}\n\nTotal: R${total.toFixed(
    2,
  )}\n\n${quote.notes ? `Notes: ${quote.notes}\n\n` : ""}Thank you!`;

  const encoded = encodeURIComponent(message);
  const phone = quote.clientPhone.replace(/\D/g, "");

  return `https://wa.me/${phone}?text=${encoded}`;
}
