export interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Quote {
  businessName: string;
  businessPhone: string;
  clientName: string;
  clientPhone: string;
  items: LineItem[];
  notes?: string;
}
