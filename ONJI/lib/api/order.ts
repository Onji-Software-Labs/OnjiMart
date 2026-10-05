import axiosInstance from './axiosConfig';
export const submitOrder = async (cartId: string, deliveryDate: string, deliveryTimeSlot: string) => {
  try {
    const res = await axiosInstance.post(`/api/orders/submit`, {
      cartId: cartId,
      deliveryDate: deliveryDate,
      deliveryTimeSlot: deliveryTimeSlot,
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

export const getOrderDetails = async (orderId: string) => {
  try {
    const res = await axiosInstance.get(`/api/orders/${orderId}`);

    return res.data;
  } catch (error: any) {
    console.error(
      "Get Order Details error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export type DeliveryTimeSlot = "MORNING" | "AFTERNOON" | "EVENING";

// Local date as YYYY-MM-DD (toISOString() can shift the day because of the timezone)
export const toLocalDateString = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

// The next `count` days, starting today
export const buildDays = (count = 7) => {
  const today = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    return {
      value: toLocalDateString(d),
      day: d.toLocaleDateString("en-US", { weekday: "short" }),
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      available: true,
    };
  });
};

export const timeSlots: {
  value: DeliveryTimeSlot;
  label: string;
  time: string;
  available: boolean;
}[] = [
  { value: "MORNING", label: "Morning", time: "7 am – 12 pm", available: true },
  { value: "AFTERNOON", label: "Afternoon", time: "12 pm – 3 pm", available: false },
  { value: "EVENING", label: "Evening", time: "3 pm – 6 pm", available: true },
];

export const updateCartDelivery = async (
  cartId: string,
  deliveryDate: string, // "YYYY-MM-DD"
  deliveryTimeSlot: DeliveryTimeSlot
) => {
  const res = await axiosInstance.patch(`/api/carts/${cartId}/delivery`, {
    deliveryDate,
    deliveryTimeSlot,
  });
  return res.data;
};

export const markOrderAsProcessing = async (orderId: string) => {
  try {
    const res = await axiosInstance.put(`/api/orders/${orderId}/view`);
    return res.data;
  } catch (error: any) {
    console.error("Mark processing error:", error.response?.data || error.message);
    throw error;
  }
};

export const generateInvoice = async (
  supplierId: string,
  orderId: string,
  deliveryCharge?: number
) => {
  const res = await axiosInstance.post("/api/invoices/generate", null, {
    params: {
      supplierId,
      orderId,
      ...(deliveryCharge != null ? { deliveryCharge } : {}),
    },
  });
  return res.data; // InvoiceDTO
};