import axiosInstance from '@/lib/api/axiosConfig';

export interface CreateRetailerPayload {
  retailerId: string;
  name: string;
  address: string;
  city: string;
  pincode: string;
  contactNumber?: string;
  userType: string;
  profileImageUrl?: string;
}

export const createRetailerBusiness = async (payload: CreateRetailerPayload) => {
  const response = await axiosInstance.post('/api/retailer-business/create', payload);
  return response.data;
};

// API call to fetch retailer business details
export const getRetailerBusiness = async (retailerId: string) => {
  const response = await axiosInstance.get(`/api/retailer-business/${retailerId}`);
  return response.data;
};