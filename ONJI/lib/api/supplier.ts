import axiosInstance from './axiosConfig';

export interface ISupplierResponse {
  supplierId: string;
  name: string;
  address: string;
  city: string;
  pincode: string;
  contactNumber: string;
  categoryIds: string[];
  subCategoryIds: string[];
}

/**
 * Fetches all suppliers not yet associated with the current retailer.
 * JWT token is injected automatically by the axiosInstance interceptor.
 */
export const getAllSuppliers = async (): Promise<ISupplierResponse[]> => {
  const response = await axiosInstance.get<ISupplierResponse[]>('/api/supplier-business/all');
  return response.data;
};
