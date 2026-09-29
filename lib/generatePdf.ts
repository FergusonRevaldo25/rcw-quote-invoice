import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Quote } from "@/types/quote";

export function generateQuotePdf(quote: Quote, total: number) {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text(quote.businessName, 14, 20);
  doc.setFontSize(11);
  doc.text(quote.businessPhone, 14, 27);

  doc.setFontSize(14);
  doc.text(`Quote for: ${quote.clientName}`, 14, 40);
  doc.setFontSize(10);
  doc.text(quote.clientPhone, 14, 46);

  autoTable(doc, {
    startY: 55,
    head: [["Description", "Qty", "Unit Price", "Total"]],
    body: quote.items.map((item) => [
      item.description,
      item.quantity.toString(),
      `R${item.unitPrice.toFixed(2)}`,
      `R${(item.quantity * item.unitPrice).toFixed(2)}`,
    ]),
  });

  const finalY = (doc as any).lastAutoTable.finalY || 70;
  doc.setFontSize(12);
  doc.text(`Total: R${total.toFixed(2)}`, 14, finalY + 10);

  if (quote.notes) {
    doc.setFontSize(10);
    doc.text(`Notes: ${quote.notes}`, 14, finalY + 20);
  }

  doc.save(`Quote-${quote.clientName || "client"}.pdf`);
}
