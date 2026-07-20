// constants/storageKeys.ts
export const STORAGE_KEYS = {
  CART_ID: "cartId",
  SHOP_ID: "shopId",
  SUPPLIER_ID: "supplierId",
  CACHED_PRODUCTS: "cachedProducts",
  CART_ITEMS: "cartItems",
  AUTH_TOKEN: "authToken",
  USER_PHONE: "userPhone",
};

// types/shop.ts (or wherever you keep shared types)
export interface Shop {
  id: string;
  retailerId: string;
  name: string;
  location: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  latitude: number;
  longitude: number;
  contactNumber: string;
  openingHours: string[];
  isActive: boolean;
}