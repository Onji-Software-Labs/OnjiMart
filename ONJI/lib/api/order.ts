import axiosInstance from './axiosConfig';
export const submitOrder = async (cartId: string,date: string,time: string) => {
  try {
    const res = await axiosInstance.post(`/api/orders/submit`, {
      cartId: cartId,
      date: date,
      time: time
    });
    return res.data;
  } catch (error: any) {
    console.error("Order error:", error.response?.data || error.message);
    throw error;
  }
};