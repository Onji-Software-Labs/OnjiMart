import api from "./axiosConfig";

// 1. Updated interface aligned with backend schema
export interface InvoiceItem {
  id: string;
  shopId?: string | null;
  retailerId?: string | null;
  supplierId?: string | null;
  invoiceDate: string;
  totalPrice: number;
  deliveryCharge: number;
  status: string;
  supplierBusinessName?: string | null;
  retailerBusinessName?: string | null;
}

// 2. Order item details
export interface InvoiceOrderItem {
  id: string;
  productId: string | null;
  productName: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  orderItemId: string | null;
}

// 3. Detailed invoice response matching Swagger schema
export interface InvoiceDetailsResponse extends InvoiceItem {
  invoiceOrderItems: InvoiceOrderItem[];
  dateEntered?: string | null;
  dateModified?: string | null;
  modifiedUserId?: string | null;
}

// Fetch list of invoices for a Retailer
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

// Fetch list of invoices for a Supplier
export const getSupplierInvoices = async (
  supplierId: string
): Promise<InvoiceItem[]> => {
  try {
    const response = await api.get<InvoiceItem[]>(
      `/api/invoices/supplier/${supplierId}`
    );
    return response.data || [];
  } catch (error) {
    console.error("Error fetching supplier invoices:", error);
    return [];
  }
};

// Fetch single invoice by ID
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