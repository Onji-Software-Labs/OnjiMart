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

export const editOrder = async (
  orderId: string,
  items: {
    itemId: string;
    fulfilledQuantity: number;
    unitPrice: number;
  }[]
) => {
  try {
    const res = await axiosInstance.put(
      `/api/orders/${orderId}/edit`,
      { items }
    );

    return res.data;
  } catch (error: any) {
    console.error("Edit Order error:", error.response?.data || error.message);
    throw error;
  }
};

export const fulfillOrder = async (orderId: string) => {
  try {
    const res = await axiosInstance.put(
      `/api/orders/${orderId}/fulfill`
    );

    return res.data;
  } catch (error: any) {
    console.error(
      "Fulfill Order error:",
      error.response?.data || error.message
    );
    throw error;
  }
};