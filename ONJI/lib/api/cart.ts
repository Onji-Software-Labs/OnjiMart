import axiosInstance from './axiosConfig';

// ─── API Response Types (from Swagger) ───────────────────────────────────────

export interface ICartItemDTO {
  id: string;
  productId: string;
  productName: string;
  quantity: number;   // ← actual field name from GET /api/carts/{shopId}
}

/**
 * Represents one cart returned by GET /api/carts/{shopId}.
 * Each CartDTO belongs to one shop and contains a flat list of items.
 * Note: The backend does not split carts by supplier at this endpoint.
 */
export interface ICartDTO {
  id: string;          // cartId
  supplierId?: string;
  shopId: string;
  shopName?: string;   // not returned by GET /api/carts — optional
  retailerId?: string;
  status?: string;
  items: ICartItemDTO[];
}

// ─── API Functions ────────────────────────────────────────────────────────────

/**
 * Fetches all carts for the given shop.
 * GET /api/carts/{shopId}
 *
 * JWT token is injected automatically by the axiosInstance interceptor.
 */
// cart.ts
export interface ICartItemDTO {
  id: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  totalPrice: number;
}

export interface ICartDTO {
  id: string;
  shopId: string;
  items: ICartItemDTO[];
}

export const getCartByShopId = async (shopId: string): Promise<ICartDTO[]> => {
  const response = await axiosInstance.get<ICartDTO[]>(`/api/carts/${shopId}`);
  return response.data;
};



export const getCartItemsBySupplier = async (
  shopId: string,
  supplierId: string
): Promise<ICartItemDTO[]> => {
  const response = await axiosInstance.get<ICartItemDTO[]>(
    `/api/carts/${shopId}/${supplierId}/items`
  );
  return response.data;
};