"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Quote, LineItem } from "@/types/quote";
import { generateQuotePdf } from "@/lib/generatePdf";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { validateQuote, sanitizeText } from "@/lib/validate";
import {
  loadDraft,
  saveDraft,
  loadBusinessDefaults,
  saveBusinessDefaults,
  loadClients,
  saveClient,
  loadBusinessLogo,
  saveBusinessLogo,
  clearBusinessLogo,
} from "@/lib/storage";
import * as ui from "@/styles/formClasses";

const emptyItem: LineItem = { description: "", quantity: 1, unitPrice: 0 };
const emptyQuote: Quote = {
  businessName: "",
  businessPhone: "",
  clientName: "",
  clientPhone: "",
  items: [{ ...emptyItem }],
  notes: "",
};

const MAX_LOGO_BYTES = 1_000_000; // 1MB cap on uploaded logos

export default function QuoteForm() {
  const [quote, setQuote] = useState<Quote>(emptyQuote);
  const [errors, setErrors] = useState<string[]>([]);
  const [clients, setClients] = useState(loadClients());
  const [logo, setLogo] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const draft = loadDraft();
    const defaults = loadBusinessDefaults();
    const savedLogo = loadBusinessLogo();

    if (draft) {
      setQuote(draft);
    } else if (defaults) {
      setQuote((q) => ({
        ...q,
        businessName: defaults.businessName,
        businessPhone: defaults.businessPhone,
      }));
    }
    if (savedLogo) setLogo(savedLogo);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveDraft(quote);
  }, [quote, loaded]);

  const total = quote.items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );

  function updateField(field: keyof Quote, value: string) {
    setQuote({ ...quote, [field]: sanitizeText(value, 100) });
  }

  function updateItem(index: number, field: keyof LineItem, value: string) {
    const items = [...quote.items];
    if (field === "description") {
      items[index] = { ...items[index], description: sanitizeText(value, 150) };
    } else {
      const num = Number(value);
      items[index] = { ...items[index], [field]: isNaN(num) ? 0 : num };
    }
    setQuote({ ...quote, items });
  }

  function addItem() {
    setQuote({ ...quote, items: [...quote.items, { ...emptyItem }] });
  }

  function removeItem(index: number) {
    setQuote({ ...quote, items: quote.items.filter((_, i) => i !== index) });
  }

  function onClientNameChange(value: string) {
    const match = clients.find((c) => c.name === value);
    setQuote({
      ...quote,
      clientName: sanitizeText(value, 100),
      clientPhone: match ? match.phone : quote.clientPhone,
    });
  }

  function onLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setLogoError(null);
    if (!file) return;

    if (!["image/png", "image/jpeg"].includes(file.type)) {
      setLogoError("Logo must be a PNG or JPG image.");
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      setLogoError("Logo must be under 1MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setLogo(base64);
      saveBusinessLogo(base64);
    };
    reader.readAsDataURL(file);
  }

  function removeLogo() {
    setLogo(null);
    clearBusinessLogo();
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function persistBeforeAction(): boolean {
    const foundErrors = validateQuote(quote);
    setErrors(foundErrors);
    if (foundErrors.length > 0) return false;

    saveBusinessDefaults({
      businessName: quote.businessName,
      businessPhone: quote.businessPhone,
    });
    saveClient({ name: quote.clientName, phone: quote.clientPhone });
    setClients(loadClients());
    return true;
  }

  async function handleDownload() {
    if (!persistBeforeAction()) return;
    await generateQuotePdf(quote, total, logo);
  }

  function handleWhatsAppClick(e: React.MouseEvent) {
    if (!persistBeforeAction()) {
      e.preventDefault();
    }
  }

  return (
    <div className={ui.card}>
      <div className="text-center space-y-2">
        <Image
          src={logo || "/logox.png"}
          alt="Business logo"
          width={60}
          height={60}
          unoptimized
          className="mx-auto rounded"
        />
        <h1 className="text-2xl font-bold rcw-gradient-text">Create a Quote</h1>
      </div>

      {errors.length > 0 && (
        <div className={ui.errorBox}>
          {errors.map((err, i) => (
            <div key={i}>• {err}</div>
          ))}
        </div>
      )}

      <section className="space-y-2">
        <h2 className={ui.sectionTitle}>Your Business</h2>
        <div className={ui.inputRow}>
          <input
            className={ui.input}
            placeholder="Business name"
            maxLength={100}
            value={quote.businessName}
            onChange={(e) => updateField("businessName", e.target.value)}
          />
          <input
            className={ui.input}
            placeholder="Phone number"
            maxLength={30}
            value={quote.businessPhone}
            onChange={(e) => updateField("businessPhone", e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg"
            onChange={onLogoUpload}
            className="text-sm text-gray-400"
          />
          {logo && (
            <button
              onClick={removeLogo}
              type="button"
              className="text-red-500 text-sm"
            >
              Remove logo
            </button>
          )}
        </div>
        {logoError && <p className="text-red-400 text-sm">{logoError}</p>}
        <p className="text-gray-500 text-xs">
          Upload your own logo to brand your quotes (PNG or JPG, max 1MB).
        </p>
      </section>

      <section className="space-y-2">
        <h2 className={ui.sectionTitle}>Client</h2>
        <div className={ui.inputRow}>
          <input
            list="clients-list"
            className={ui.input}
            placeholder="Client name"
            maxLength={100}
            value={quote.clientName}
            onChange={(e) => onClientNameChange(e.target.value)}
          />
          <datalist id="clients-list">
            {clients.map((c, i) => (
              <option key={i} value={c.name} />
            ))}
          </datalist>
          <input
            className={ui.input}
            placeholder="WhatsApp number (e.g. 27821234567)"
            maxLength={30}
            value={quote.clientPhone}
            onChange={(e) => updateField("clientPhone", e.target.value)}
          />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className={ui.sectionTitle}>Items</h2>
        {quote.items.map((item, index) => (
          <div key={index} className={ui.itemRow}>
            <input
              className={`${ui.input} col-span-2 sm:flex-1`}
              placeholder="Description"
              maxLength={150}
              value={item.description}
              onChange={(e) => updateItem(index, "description", e.target.value)}
            />
            <input
              className={`${ui.input} sm:w-20`}
              type="number"
              min={1}
              value={item.quantity}
              onChange={(e) => updateItem(index, "quantity", e.target.value)}
            />
            <div className="flex gap-2">
              <input
                className={`${ui.input} sm:w-28`}
                type="number"
                min={0}
                placeholder="Unit price"
                value={item.unitPrice}
                onChange={(e) => updateItem(index, "unitPrice", e.target.value)}
              />
              <button
                onClick={() => removeItem(index)}
                className="text-red-500 px-2 shrink-0"
                type="button"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
        <button onClick={addItem} type="button" className={ui.linkText}>
          + Add item
        </button>
      </section>

      <textarea
        className={`${ui.input} min-h-[80px]`}
        placeholder="Notes (optional)"
        maxLength={500}
        value={quote.notes}
        onChange={(e) => updateField("notes", e.target.value)}
      />

      <div className="text-xl font-bold border border-gray-700 rounded p-3 text-center">
        Total: R{total.toFixed(2)}
      </div>

      <div className="flex gap-3 justify-center">
        <button
          onClick={handleDownload}
          className={ui.gradientButton}
          type="button"
        >
          Download PDF
        </button>
        <a
          href={buildWhatsAppLink(quote, total)}
          onClick={handleWhatsAppClick}
          target="_blank"
          rel="noopener noreferrer"
          className={ui.whatsappButton}
        >
          Share on WhatsApp
        </a>
      </div>
    </div>
  );
}
