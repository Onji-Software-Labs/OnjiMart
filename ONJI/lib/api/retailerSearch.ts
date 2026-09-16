import axiosInstance from '@/lib/api/axiosConfig';

export type SearchType = 'PRODUCT' | 'SUPPLIER';

export interface SearchHistoryItem {
  id: string;
  searchText: string;
  searchedId: string;
  type: SearchType;
  searchedAt: string;
  retailerId: string;
}

export interface SuggestionItem {
  id: string;
  name: string;
  type: SearchType;
}

export interface CreateSearchPayload {
  retailerId: string;
  searchText: string;
  searchedId: string;
  type: SearchType;
}

export interface ProductSearchResult {
  productId: string;
  name: string;
  description?: string;
  price?: number;
  stockQuantity?: number;
  quantityType?: string;
  unitValue?: string;
  minOrderQuantity?: number;
  imageUrl?: string;
}

export interface SupplierSearchResult {
  businessId: string;
  supplierId: string;
  name: string;
  address?: string;
  city?: string;
  pincode?: string;
  contactNumber?: string;
  profilePicture?: string;
}

export async function getSearchHistory(
  retailerId: string,
): Promise<SearchHistoryItem[]> {
  const response = await axiosInstance.get<SearchHistoryItem[]>(
    '/api/retailerSearch/searchHistory',
    { params: { retailerId } },
  );

  return response.data;
}

export async function getSuggestions(
  keyword: string,
): Promise<SuggestionItem[]> {
  const response = await axiosInstance.get<SuggestionItem[]>(
    '/api/retailerSearch/suggestions',
    { params: { keyword } },
  );

  return response.data;
}

export async function createSearchHistory(
  payload: CreateSearchPayload,
): Promise<SearchHistoryItem> {
  const response = await axiosInstance.post<SearchHistoryItem>(
    '/api/retailerSearch/create',
    payload,
  );

  return response.data;
}

/** Loads the item that was selected from retailer search suggestions. */
export async function getSearchResult(
  searchedId: string,
  type: SearchType,
): Promise<ProductSearchResult | SupplierSearchResult> {
  const endpoint =
    type === 'PRODUCT'
      ? `/api/products/${searchedId}`
      : `/api/supplier-business/${searchedId}`;
  const response = await axiosInstance.get<ProductSearchResult | SupplierSearchResult>(
    endpoint,
  );

  return response.data;
}
