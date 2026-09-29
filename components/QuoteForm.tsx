"use client";

import { useState } from "react";
import { Quote, LineItem } from "@/types/quote";
import { generateQuotePdf } from "@/lib/generatePdf";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import Image from "next/image";

const emptyItem: LineItem = { description: "", quantity: 1, unitPrice: 0 };

export default function QuoteForm() {
  const [quote, setQuote] = useState<Quote>({
    businessName: "",
    businessPhone: "",
    clientName: "",
    clientPhone: "",
    items: [{ ...emptyItem }],
    notes: "",
  });

  const total = quote.items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );

  function updateItem(index: number, field: keyof LineItem, value: string) {
    const items = [...quote.items];
    items[index] = {
      ...items[index],
      [field]: field === "description" ? value : Number(value),
    };
    setQuote({ ...quote, items });
  }

  function addItem() {
    setQuote({ ...quote, items: [...quote.items, { ...emptyItem }] });
  }

  function removeItem(index: number) {
    setQuote({ ...quote, items: quote.items.filter((_, i) => i !== index) });
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Image
        src="/logox.png"
        alt="RCW"
        width={100}
        height={55}
        className="mx-auto"
      />
      <h1 className="text-2xl font-bold rcw-gradient-text">Create a Quote</h1>

      <div className="grid grid-cols-2 gap-4">
        <input
          className="border p-2 rounded"
          placeholder="Your business name"
          value={quote.businessName}
          onChange={(e) => setQuote({ ...quote, businessName: e.target.value })}
        />
        <input
          className="border p-2 rounded"
          placeholder="Your phone number"
          value={quote.businessPhone}
          onChange={(e) =>
            setQuote({ ...quote, businessPhone: e.target.value })
          }
        />
        <input
          className="border p-2 rounded"
          placeholder="Client name"
          value={quote.clientName}
          onChange={(e) => setQuote({ ...quote, clientName: e.target.value })}
        />
        <input
          className="border p-2 rounded"
          placeholder="Client WhatsApp number (e.g. 27821234567)"
          value={quote.clientPhone}
          onChange={(e) => setQuote({ ...quote, clientPhone: e.target.value })}
        />
      </div>

      <div className="space-y-3">
        <h2 className="font-semibold">Items</h2>
        {quote.items.map((item, index) => (
          <div key={index} className="flex gap-2 items-center">
            <input
              className="border p-2 rounded flex-1"
              placeholder="Description"
              value={item.description}
              onChange={(e) => updateItem(index, "description", e.target.value)}
            />
            <input
              className="border p-2 rounded w-20"
              type="number"
              min={1}
              value={item.quantity}
              onChange={(e) => updateItem(index, "quantity", e.target.value)}
            />
            <input
              className="border p-2 rounded w-28"
              type="number"
              min={0}
              placeholder="Unit price"
              value={item.unitPrice}
              onChange={(e) => updateItem(index, "unitPrice", e.target.value)}
            />
            <button
              onClick={() => removeItem(index)}
              className="text-red-500 px-2"
              type="button"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          onClick={addItem}
          type="button"
          className="rcw-gradient-text text-sm font-semibold"
        >
          + Add item
        </button>
      </div>

      <textarea
        className="border p-2 rounded w-full"
        placeholder="Notes (optional)"
        value={quote.notes}
        onChange={(e) => setQuote({ ...quote, notes: e.target.value })}
      />

      <div className="text-xl font-bold">Total: R{total.toFixed(2)}</div>

      <div className="flex gap-3">
        <button
          onClick={() => generateQuotePdf(quote, total)}
          className="rcw-gradient-bg rcw-glow text-white font-bold px-6 py-3 rounded-full"
          type="button"
        >
          Download PDF
        </button>
        <a
          href={buildWhatsAppLink(quote, total)}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-600 text-white font-bold px-6 py-3 rounded-full"
        >
          Share on WhatsApp
        </a>
      </div>
    </div>
  );
}
