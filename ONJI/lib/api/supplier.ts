// Supplier API client placeholder
// Retailer API client placeholder
import axiosInstance from '@/lib/api/axiosConfig';

export interface BusinessSupplier {
  supplierId: string;
  businessId: string;
  name: string;
  address: string;
  city: string;
  pincode: string;
  contactNumber?: string;
  categoryIds: string[];
  subCategoryIds: string[];
}
export const createSupplierBusiness = async (payload: BusinessSupplier) => {
  const response = await axiosInstance.post('/api/supplier-business/create-full', payload);

  return response.data;
};
// api.ts
export const getCategories = async () => {
  const response = await axiosInstance.get('/api/categories');
  return response.data; // parent categories
};

export const getSubCategories = async () => {
  const response = await axiosInstance.get('/api/subcategories'); // adjust endpoint
  return response.data; // shape you shared above
};

/**
 * Fetches all suppliers not yet associated with the current retailer.
 * JWT token is injected automatically by the axiosInstance interceptor.
 */
export const getAllSuppliers = async (): Promise<BusinessSupplier[]> => {
  const response = await axiosInstance.get<BusinessSupplier[]>('/api/supplier-business/all');
  return response.data;
};
