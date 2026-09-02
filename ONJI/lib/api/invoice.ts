import axiosInstance from '@/lib/api/axiosConfig';

export interface InvoiceItem {
  id: string;
  shopId: string;
  retailerId: string;
  supplierId: string;
  invoiceDate: string;
  totalPrice: number;
  deliveryCharge: number;
  status: string; // e.g., "PENDING", "APPROVED", "DELIVERED"
}

export const getRetailerInvoices = async (retailerId: string): Promise<InvoiceItem[]> => {
  try {
    const response = await axiosInstance.get(`/api/invoices/retailer/${retailerId}`);
    return response.data.content || response.data || [];
  } catch (error) {
    console.warn("Failed to fetch retailer invoices from backend:", error);
    return [];
  }
};