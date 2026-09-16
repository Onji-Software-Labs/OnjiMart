import api from "./axiosConfig";

// 1. This export fixes the red underline on line 12
export interface InvoiceItem {
  id: string;
  shopId: string;
  retailerId: string;
  supplierId: string;
  invoiceDate: string;
  totalPrice: number;
  deliveryCharge: number;
  status: string;
  supplierBusinessName?: string;
}

// 2. Order item details
export interface InvoiceOrderItem {
  id: string;
  productId: string | null;
  productName: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  orderItemId: string;
}

// 3. Detailed invoice response
export interface InvoiceDetailsResponse extends InvoiceItem {
  invoiceOrderItems: InvoiceOrderItem[];
  dateEntered?: string;
  dateModified?: string;
  modifiedUserId?: string;
}

// Fetch list of invoices
export const getRetailerInvoices = async (
  retailerId: string
): Promise<InvoiceItem[]> => {
  try {
    const response = await api.get<InvoiceItem[]>(
      `/api/invoices/retailer/${retailerId}`
    );
    return response.data || [];
  } catch (error) {
    console.error("Error fetching retailer invoices:", error);
    return [];
  }
};

// Fetch single invoice
export const getInvoiceById = async (
  invoiceId: string
): Promise<InvoiceDetailsResponse | null> => {
  try {
    const response = await api.get<InvoiceDetailsResponse>(
      `/api/invoices/${invoiceId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching invoice by ID:", error);
    return null;
  }
};