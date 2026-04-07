// Retailer API client placeholder
import axiosInstance from '@/lib/api/axiosConfig';

export interface CreateRetailerPayload {
  retailerId: string;
  name: string;
  address: string;
  city: string;
  pincode: string;
  contactNumber?: string;
}

export const createRetailerBusiness = async (payload: CreateRetailerPayload) => {
  const response = await axiosInstance.post('/api/retailer-business/create', payload);

  return response.data;
};

