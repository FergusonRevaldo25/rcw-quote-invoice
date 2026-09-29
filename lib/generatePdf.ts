import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Quote } from "@/types/quote";

async function loadImageAsBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function generateQuotePdf(
  quote: Quote,
  total: number,
  customLogo?: string | null,
) {
  const doc = new jsPDF();
  const logo = customLogo || (await loadImageAsBase64("/logox.png"));

  let cursorY = 20;

  if (logo) {
    doc.addImage(logo, "PNG", 150, 10, 30, 30);
  }
  // ...rest of the function stays exactly the same

  doc.setFontSize(18);
  doc.text(quote.businessName, 14, cursorY);
  cursorY += 7;
  doc.setFontSize(11);
  doc.text(quote.businessPhone, 14, cursorY);
  cursorY += 15;

  doc.setFontSize(14);
  doc.text(`Quote for: ${quote.clientName}`, 14, cursorY);
  cursorY += 6;
  doc.setFontSize(10);
  doc.text(quote.clientPhone, 14, cursorY);
  cursorY += 10;

  autoTable(doc, {
    startY: cursorY,
    head: [["Description", "Qty", "Unit Price", "Total"]],
    body: quote.items
      .filter((item) => item.description.trim())
      .map((item) => [
        item.description,
        item.quantity.toString(),
        `R${item.unitPrice.toFixed(2)}`,
        `R${(item.quantity * item.unitPrice).toFixed(2)}`,
      ]),
  });

  const finalY = (doc as any).lastAutoTable.finalY || cursorY + 20;
  doc.setFontSize(12);
  doc.text(`Total: R${total.toFixed(2)}`, 14, finalY + 10);

  if (quote.notes) {
    doc.setFontSize(10);
    doc.text(`Notes: ${quote.notes}`, 14, finalY + 20);
  }

  doc.save(`Quote-${quote.clientName || "client"}.pdf`);
}
