// Supplier API client placeholder
// Retailer API client placeholder
import axiosInstance from '@/lib/api/axiosConfig';

export interface CreateRetailerPayload {
  supplierId: string;
  name: string;
  address: string;
  city: string;
  pincode: string;
  contactNumber?: string;
  categoryIds: string[];
  subCategoryIds: string[];
}
export const createSupplierBusiness = async (payload: CreateRetailerPayload) => {
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