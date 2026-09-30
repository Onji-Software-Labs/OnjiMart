import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  ActivityIndicator,
  Linking,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axiosInstance from '@/lib/api/axiosConfig';
import { secureStorage } from '@/lib/secureStorage';

// ---------------------------------------------------------------------------
// Design System Color Tokens
// ---------------------------------------------------------------------------
const COLORS = {
  primaryDefault: '#2E7D32',
  primary900: '#204724',
  primary100: '#E2F6E3',
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ApiProduct {
  productId: string;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  quantityType: 'COUNT' | 'WEIGHT' | string;
  unitValue: string;
  minOrderQuantity: number;
  imageUrl: string;
  categoryId: string;
  subCategoryId: string;
}

interface ApiSubCategory {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  /** Every backend id that was merged into this one (same name). `id` is the first. */
  aliasIds?: string[];
}

interface ApiCategory {
  id: string;
  name: string;
  description: string;
  subCategories: ApiSubCategory[];
  /** Every backend id that was merged into this one (same name). `id` is the first. */
  aliasIds?: string[];
}

/** GET /api/supplier-business/{businessId} */
interface SupplierBusiness {
  businessId: string;
  supplierId: string;
  name: string;
  address: string;
  city: string;
  pincode: string;
  contactNumber: string;
  profilePicture: string;
  categoryIds: string[];
  subCategoryIds: string[];
  userType: string;
}

/** Only the harmless bits of GET /api/users/{id} (that response also contains a password field — never store it) */
interface OwnerInfo {
  fullName?: string;
  active?: boolean;
  rating?: number;
  ratingCount?: number;
}

/** Fields collected by the "Edit Business Information" sheet */
interface BusinessInfoFormValues {
  name: string;
  address: string;
  contactNumber: string;
  city: string;
  pincode: string;
}

/** Fields collected by "create a new category" */
interface NewCategoryFormValues {
  name: string;
  description: string;
}

/** Fields collected by "Add new Items" AND by "Edit Item" (same shape, reused) */
interface NewProductFormValues {
  name: string;
  description: string;
  price: string;
  stockQuantity: string;
  quantityType: 'COUNT' | 'WEIGHT';
  unitValue: string;
  minOrderQuantity: string;
  imageUrl: string;
  categoryId: string;
  subCategoryId: string;
  /** Set when the supplier typed a brand-new subcategory name instead of picking an existing chip. */
  newSubCategoryName?: string;
}

// Stable empty array so effects/props don't see a "new" array every render
const EMPTY_SUBS: ApiSubCategory[] = [];

const NO_SUPPLIER_ID_MESSAGE =
  'Could not determine your supplier ID from your login, so your store cannot be loaded.';

// ---------------------------------------------------------------------------
// Alerts that also work on web
// ---------------------------------------------------------------------------
// Alert.alert does nothing on react-native-web (you're running `expo start --web`),
// so errors and validation messages would silently disappear there.
function notify(title: string, message?: string) {
  if (Platform.OS === 'web') {
    // eslint-disable-next-line no-alert
    window.alert(message ? `${title}\n\n${message}` : title);
  } else {
    Alert.alert(title, message);
  }
}

/** Same idea as notify(), but for a Yes/No confirmation before a destructive action. */
function confirmDestructive(title: string, message: string): Promise<boolean> {
  if (Platform.OS === 'web') {
    // eslint-disable-next-line no-alert
    return Promise.resolve(window.confirm(`${title}\n\n${message}`));
  }
  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
      { text: 'Delete', style: 'destructive', onPress: () => resolve(true) },
    ]);
  });
}

// ---------------------------------------------------------------------------
// Who is logged in? (supplierId)
// ---------------------------------------------------------------------------
// Confirmed from the login logs: the JWT token carries a `userId` claim, and
// otpverify.tsx also saves that same id to secure storage (as the user id and
// as the businessId). For suppliers it is the supplier's id, so it is used for
// every call on this screen.
//
// To test with a different account without logging in, paste an id here:
const DEV_SUPPLIER_ID_OVERRIDE: string | undefined = undefined;

function decodeBase64Url(input: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  const b64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
  let out = '';
  for (let i = 0; i < padded.length; i += 4) {
    const e = [0, 1, 2, 3].map((j) => chars.indexOf(padded[i + j]));
    const n = (e[0] << 18) | (e[1] << 12) | ((e[2] & 63) << 6) | (e[3] & 63);
    out += String.fromCharCode((n >> 16) & 255);
    if (e[2] !== 64) out += String.fromCharCode((n >> 8) & 255);
    if (e[3] !== 64) out += String.fromCharCode(n & 255);
  }
  return out;
}

async function resolveSupplierId(): Promise<string | undefined> {
  if (DEV_SUPPLIER_ID_OVERRIDE) return DEV_SUPPLIER_ID_OVERRIDE;

  // 1) An id saved at login (these key names are guesses — harmless if absent)
  for (const key of ['supplierId', 'userId', 'businessId']) {
    try {
      const value = await secureStorage.getItem(key);
      if (value) return String(value);
    } catch {
      /* ignore */
    }
  }

  // 2) An id inside the JWT token
  try {
    const token = await secureStorage.getItem('token');
    const payloadPart = token?.split('.')[1];
    if (payloadPart) {
      const payload = JSON.parse(decodeBase64Url(payloadPart));
      if (__DEV__) console.log('[auth] token field names:', Object.keys(payload));
      for (const claim of ['supplierId', 'userId', 'uid', 'id', 'sub']) {
        if (payload[claim]) return String(payload[claim]);
      }
    }
  } catch (err) {
    console.error('[auth] could not read the token:', err);
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// API layer
// ---------------------------------------------------------------------------
// Everything below comes from your Swagger screenshots.
//
// - Confirmed from the supplier-controller page: every /suppliers/... route
//   (categories, categories/{id}/subcategories, categories-subcategories,
//   retailers, rating/{rating}) genuinely has NO /api prefix, unlike the rest
//   of the API. This isn't a guess anymore — no fallback needed for these.
// - There is no "get business by supplierId" endpoint. The code first tries
//   GET /api/supplier-business/{supplierId}; if that isn't found it falls back
//   to GET /api/supplier-business/all and picks the business whose supplierId
//   matches. Ask the backend team for GET /api/supplier-business/by-supplier/{id}
//   — the fallback downloads every business.
// - /api/subcategories now has full CRUD (GET list, GET/{id}, POST, PUT/{id},
//   DELETE/{id}) per the latest Swagger. POST /api/subcategories is what
//   createSubCategoryApi already calls below, so no path change was needed
//   there — DELETE/{id} is intentionally NOT used to "remove a subcategory
//   from my store", because that endpoint deletes it from the shared catalog
//   for every supplier. Removing it from just this store still goes through
//   the supplier link-replace endpoint (unlinkSubCategoryFromSupplier).

const API = {
  // supplier-business-controller
  businessById: (id: string) => `/api/supplier-business/${id}`,
  allBusinesses: '/api/supplier-business/all',
  // user-controller
  userById: (id: string) => `/api/users/${id}`,
  // supplier-controller (see note above about the /api prefix)
  supplierCategories: (supplierId: string) => `/suppliers/${supplierId}/categories`,
  // shared catalog
  categories: '/api/categories',
  createCategory: '/api/categories/create',
  createSubCategory: '/api/subcategories',
  // products
  productsBySupplier: (supplierId: string) => `/api/products/by-supplier/${supplierId}`,
  createProduct: '/api/products/create',
  mapProductsToSupplier: '/api/products/map-products-to-supplier',
  updateProduct: (id: string) => `/api/products/${id}`, // PUT, full body
  deleteProduct: (id: string) => `/api/products/${id}`,
};

/**
 * Backends aren't always consistent about which key holds a freshly created
 * row's id (`id` vs `productId` vs `subCategoryId`, etc). This tries the
 * likely candidates instead of assuming one, so a creation call doesn't
 * silently "succeed" with no usable id and quietly do nothing after.
 */
function extractId(obj: any): string | undefined {
  if (!obj || typeof obj !== 'object') return undefined;
  // IMPORTANT: only the row's OWN key. A created subcategory also carries its
  // parent's `categoryId`, and a product carries `categoryId`/`subCategoryId`
  // — reading those here would return the PARENT's id by mistake.
  for (const key of ['id', '_id']) {
    if (obj[key]) return String(obj[key]);
  }
  return undefined;
}

/** Products use `productId` as their own key (with `id` as a fallback). */
function extractProductId(obj: any): string | undefined {
  if (!obj || typeof obj !== 'object') return undefined;
  for (const key of ['productId', 'id', '_id']) {
    if (obj[key]) return String(obj[key]);
  }
  return undefined;
}

/**
 * Every backend id behind one merged category/subcategory. The backend has
 * ended up with several records that share a name (two "Fruits", "Apple" and
 * "apple", ...). The screen shows ONE of each, but products may be filed
 * under any of the underlying ids — so anything that compares ids has to
 * look at all of them, not just `id`.
 */
function idsOf(x: { id: string; aliasIds?: string[] }): string[] {
  return x.aliasIds && x.aliasIds.length > 0 ? x.aliasIds : [x.id];
}

function findCategoryByAnyId(list: ApiCategory[], id: string | null | undefined): ApiCategory | undefined {
  if (!id) return undefined;
  return list.find((c) => idsOf(c).includes(id));
}

/**
 * Drops the (large) nested `products` from category/subcategory responses — the screen doesn't use them.
 *
 * Duplicates are MERGED, never discarded:
 *   - categories with the same name (case-insensitive) become one entry;
 *   - subcategories with the same name inside it become one entry;
 *   - every original id is kept in `aliasIds`, so products filed under ANY of
 *     them still show up (previously the duplicate ids were thrown away and
 *     their products vanished from the pill they belonged to).
 */
function normalizeCategories(list: any[] | undefined): ApiCategory[] {
  const byKey = new Map<string, ApiCategory>();
  const subIndexByCat = new Map<string, Map<string, ApiSubCategory>>();

  for (const c of list ?? []) {
    if (!c?.id) continue;
    const key = (c.name ?? '').trim().toLowerCase() || `id:${c.id}`;

    let cat = byKey.get(key);
    if (!cat) {
      cat = {
        id: c.id,
        name: c.name,
        description: c.description ?? '',
        aliasIds: [c.id],
        subCategories: [],
      };
      byKey.set(key, cat);
    } else if (!cat.aliasIds!.includes(c.id)) {
      cat.aliasIds!.push(c.id);
    }

    let subIndex = subIndexByCat.get(key);
    if (!subIndex) {
      subIndex = new Map();
      subIndexByCat.set(key, subIndex);
    }

    for (const s of c.subCategories ?? []) {
      if (!s?.id) continue;
      const sKey = (s.name ?? '').trim().toLowerCase() || `id:${s.id}`;
      const found = subIndex.get(sKey);
      if (found) {
        if (!found.aliasIds!.includes(s.id)) found.aliasIds!.push(s.id);
      } else {
        const sub: ApiSubCategory = {
          id: s.id,
          name: s.name,
          description: s.description ?? '',
          categoryId: s.categoryId ?? c.id,
          aliasIds: [s.id],
        };
        subIndex.set(sKey, sub);
        cat.subCategories.push(sub);
      }
    }
  }

  return Array.from(byKey.values());
}

async function fetchBusinessBySupplierApi(supplierId: string): Promise<SupplierBusiness | undefined> {
  try {
    const res = await axiosInstance.get(API.businessById(supplierId));
    const data: SupplierBusiness | undefined = res.data;
    if (data && (!data.supplierId || data.supplierId === supplierId)) return data;
  } catch {
    /* not found by that id — fall back to the list below */
  }
  const res = await axiosInstance.get(API.allBusinesses);
  return (res.data as SupplierBusiness[]).find((b) => b.supplierId === supplierId);
}

/**
 * Returns the display info AND the raw record. The raw record is needed because
 * PUT /api/users/{id} replaces the whole user, so a status change has to send
 * everything back. It only ever lives in a ref (never in state, never rendered).
 */
async function fetchOwnerApi(userId: string): Promise<{ info: OwnerInfo; record: any }> {
  const res = await axiosInstance.get(API.userById(userId));
  const record = res.data ?? {};
  const active = typeof record.active === 'boolean' ? record.active : record.status === 'ACTIVE';
  const rating = typeof record.rating === 'number' ? record.rating : undefined;
  const ratingCount = [record.ratingCount, record.totalRatings, record.reviewCount].find(
    (v) => typeof v === 'number'
  ) as number | undefined;
  return { info: { fullName: record.fullName, active, rating, ratingCount }, record };
}

async function updateUserApi(userId: string, body: any): Promise<any> {
  const res = await axiosInstance.put(API.userById(userId), body);
  return res.data;
}

async function updateBusinessApi(business: SupplierBusiness): Promise<Partial<SupplierBusiness> | undefined> {
  const res = await axiosInstance.put(API.businessById(business.businessId), business);
  return res.data;
}

async function fetchSupplierCategoriesApi(supplierId: string): Promise<ApiCategory[]> {
  const res = await axiosInstance.get(API.supplierCategories(supplierId));
  return normalizeCategories(res.data);
}

/**
 * Confirmed from the supplier-controller Swagger page: POST
 * /suppliers/{supplierId}/categories-subcategories, no /api prefix, body
 * { categoryIds: string[], subCategoryIds: string[] }. No more guessing here.
 */
async function linkCategoriesApi(
  supplierId: string,
  payload: { categoryIds: string[]; subCategoryIds: string[] }
): Promise<void> {
  await axiosInstance.post(`/suppliers/${supplierId}/categories-subcategories`, payload);
}

/**
 * Confirmed from the supplier-controller Swagger page: GET
 * /suppliers/{supplierId}/categories/{categoryId}/subcategories. Not wired
 * into the UI yet (fetchSupplierCategoriesApi's nested subCategories already
 * covers what the screen needs) but here in case a category-scoped fetch is
 * useful later — e.g. refreshing just one category's chips without
 * re-fetching everything.
 */
async function fetchSupplierSubCategoriesApi(
  supplierId: string,
  categoryId: string
): Promise<ApiSubCategory[]> {
  const res = await axiosInstance.get(
    `/suppliers/${supplierId}/categories/${categoryId}/subcategories`
  );
  return (res.data ?? []).map((s: any) => ({
    id: s.id,
    name: s.name,
    description: s.description ?? '',
    categoryId: s.categoryId ?? categoryId,
  }));
}

/**
 * Confirmed from the supplier-controller Swagger page: POST
 * /suppliers/{supplierId}/rating/{rating}. Not wired into the UI — the
 * Ratings tab is still a placeholder — but here for when that tab gets built.
 */
async function rateSupplierApi(supplierId: string, rating: number): Promise<any> {
  const res = await axiosInstance.post(`/suppliers/${supplierId}/rating/${rating}`);
  return res.data;
}

async function fetchSharedCatalogApi(): Promise<ApiCategory[]> {
  const res = await axiosInstance.get(API.categories);
  return normalizeCategories(res.data);
}

async function createCategoryApi(payload: NewCategoryFormValues): Promise<ApiCategory> {
  const res = await axiosInstance.post(API.createCategory, { ...payload, subCategories: [] });
  return res.data;
}

async function createSubCategoryApi(payload: {
  name: string;
  description: string;
  categoryId: string;
}): Promise<ApiSubCategory> {
  const res = await axiosInstance.post(API.createSubCategory, { ...payload, products: [] });
  return res.data;
}

async function fetchSupplierProductsApi(supplierId: string): Promise<ApiProduct[]> {
  const res = await axiosInstance.get(API.productsBySupplier(supplierId));
  return res.data ?? [];
}

// ---------------------------------------------------------------------------
// The store's product list
// ---------------------------------------------------------------------------
// GET /api/products/by-supplier/{id} only lists what the backend has "linked"
// to this supplier, and that link keeps getting overwritten — each new item
// pushed the previous ones out of the list, even though the products
// themselves were created fine. So the store's list is built from three
// sources instead of trusting that one endpoint:
//   1. what the backend says is linked to this supplier,
//   2. a list of product ids this store has created/seen, remembered on this
//      device (the "registry"),
//   3. the catalog itself — GET /api/subcategories returns every subcategory
//      with its products, which is how registry products are found again.

const registryKey = (supplierId: string) => `storeProductIds:${supplierId}`;
const memoryRegistry = new Map<string, string[]>();

async function readStored(key: string): Promise<string | null> {
  try {
    const v = await secureStorage.getItem(key);
    if (v) return String(v);
  } catch {
    /* ignore */
  }
  if (Platform.OS === 'web') {
    try {
      return window.localStorage.getItem(key);
    } catch {
      /* ignore */
    }
  }
  return null;
}

async function writeStored(key: string, value: string): Promise<void> {
  const store: any = secureStorage;
  try {
    if (typeof store.setItem === 'function') {
      await store.setItem(key, value);
      return;
    }
  } catch {
    /* fall through */
  }
  if (Platform.OS === 'web') {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      /* ignore */
    }
  }
}

async function loadProductRegistry(supplierId: string): Promise<string[]> {
  const raw = await readStored(registryKey(supplierId));
  if (raw) {
    try {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return arr.map(String);
    } catch {
      /* ignore */
    }
  }
  return memoryRegistry.get(supplierId) ?? [];
}

async function saveProductRegistry(supplierId: string, ids: string[]): Promise<void> {
  const unique = Array.from(new Set(ids));
  memoryRegistry.set(supplierId, unique);
  await writeStored(registryKey(supplierId), JSON.stringify(unique));
}

async function addToProductRegistry(supplierId: string, ids: string[]): Promise<void> {
  const current = await loadProductRegistry(supplierId);
  await saveProductRegistry(supplierId, [...current, ...ids]);
}

async function removeFromProductRegistry(supplierId: string, ids: string[]): Promise<void> {
  const current = await loadProductRegistry(supplierId);
  await saveProductRegistry(
    supplierId,
    current.filter((id) => !ids.includes(id))
  );
}

/** Every product in the catalog (nested under its subcategory), from GET /api/subcategories. */
async function fetchAllCatalogProductsApi(): Promise<ApiProduct[]> {
  const res = await axiosInstance.get('/api/subcategories');
  const out: ApiProduct[] = [];
  for (const sc of res.data ?? []) {
    for (const prod of sc?.products ?? []) {
      if (!prod?.productId) continue;
      out.push({
        ...prod,
        categoryId: prod.categoryId ?? sc.categoryId ?? '',
        subCategoryId: prod.subCategoryId ?? sc.id ?? '',
      });
    }
  }
  return out;
}

/**
 * The store's products (linked ones + remembered ones that are still in the
 * catalog), plus the whole catalog list so the screen can offer to restore
 * items that lost their link.
 */
async function fetchStoreProductsApi(
  supplierId: string
): Promise<{ products: ApiProduct[]; catalogProducts: ApiProduct[] }> {
  const linked = await fetchSupplierProductsApi(supplierId);
  let catalogProducts: ApiProduct[] = [];
  try {
    catalogProducts = await fetchAllCatalogProductsApi();
  } catch (err) {
    describeApiError('Error loading catalog products', err);
  }
  const registry = await loadProductRegistry(supplierId);

  const byId = new Map<string, ApiProduct>();
  linked.forEach((prod) => byId.set(prod.productId, prod));
  const remembered = new Set(registry);
  catalogProducts.forEach((prod) => {
    if (remembered.has(prod.productId) && !byId.has(prod.productId)) byId.set(prod.productId, prod);
  });

  // Whatever the backend lists as linked is remembered from now on.
  await saveProductRegistry(supplierId, [...registry, ...linked.map((prod) => prod.productId)]);
  return { products: Array.from(byId.values()), catalogProducts };
}

async function createProductApi(payload: Omit<ApiProduct, 'productId'>): Promise<Partial<ApiProduct>> {
  const res = await axiosInstance.post(API.createProduct, payload);
  return res.data;
}

// Links already-created products to this supplier (body is an array of productIds).
// IMPORTANT: the server treats this list as the supplier's COMPLETE set of
// products — sending only the newest id makes it drop every other product
// from the store (each new item "replaced" the previous card). Callers must
// always pass everything that should stay linked, plus any new ids.
async function mapProductsToSupplierApi(supplierId: string, productIds: string[]): Promise<void> {
  await axiosInstance.post(API.mapProductsToSupplier, productIds, { params: { supplierId } });
}

// Edit uses PUT with the FULL product body (including productId)
async function updateProductApi(id: string, payload: ApiProduct): Promise<Partial<ApiProduct> | undefined> {
  const res = await axiosInstance.put(API.updateProduct(id), payload);
  return res.data;
}

async function deleteProductApi(id: string): Promise<void> {
  await axiosInstance.delete(API.deleteProduct(id));
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const CATEGORY_ICON_FALLBACK: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  Masala: 'shaker-outline',
  Masalas: 'shaker-outline',
  Vegetable: 'carrot',
  Vegetables: 'carrot',
  Fruits: 'food-apple-outline',
  Flowers: 'flower-outline',
  Fish: 'fish',
};

function iconForCategory(name: string): keyof typeof MaterialCommunityIcons.glyphMap {
  return CATEGORY_ICON_FALLBACK[name] ?? 'shape-outline';
}

function formatMinQuantity(product: ApiProduct): string {
  const unit = product.unitValue?.trim();
  return unit ? `${product.minOrderQuantity}${unit}` : `${product.minOrderQuantity}`;
}

function formatPricePerUnit(product: ApiProduct): string {
  const unit = product.unitValue?.trim() || (product.quantityType === 'COUNT' ? 'unit' : '');
  return unit ? `₹ ${product.price}/${unit}` : `₹ ${product.price}`;
}

/**
 * Pulls the useful bits out of an Axios error so failed calls are debuggable
 * instead of a silent generic alert. Logs status/URL/server message, and
 * returns a short string safe to show the user.
 */
function describeApiError(context: string, err: any): string {
  const status = err?.response?.status;
  const url = err?.config?.url;
  const method = err?.config?.method?.toUpperCase();
  const serverMessage =
    err?.response?.data?.message ?? err?.response?.data?.error ?? err?.response?.data;

  console.error(`${context}:`, {
    status,
    url,
    method,
    serverMessage,
    message: err?.message,
  });

  if (status) {
    return `Server responded ${status}${serverMessage ? ` — ${serverMessage}` : ''}. Check that ${method} ${url} is the correct endpoint.`;
  }
  return err?.message === 'Network Error'
    ? `Could not reach ${url ?? 'the server'}. Check the endpoint exists and the API base URL is correct.`
    : err?.message || 'Something went wrong.';
}

function SafeImage({
  uri,
  className,
  iconSize = 22,
}: {
  uri?: string;
  className: string;
  iconSize?: number;
}) {
  const [failed, setFailed] = useState(false);
  const isMissing = !uri || uri.trim().length === 0 || failed;

  if (isMissing) {
    return (
      <View className={`${className} bg-gray-100 items-center justify-center`}>
        <Feather name="image" size={iconSize} color="#9CA3AF" />
      </View>
    );
  }

  return <Image source={{ uri }} className={className} onError={() => setFailed(true)} />;
}

// ---------------------------------------------------------------------------
// Reusable form field
// ---------------------------------------------------------------------------

function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'phone-pad';
}) {
  return (
    <View className="mb-4">
      <Text style={{ color: COLORS.primaryDefault }} className="text-xs font-medium mb-1.5">
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        keyboardType={keyboardType}
        className="border border-gray-300 rounded-xl px-3 py-3 text-sm text-gray-900"
      />
    </View>
  );
}

/**
 * Reusable "select from drop list" control — used for Category and
 * Subcategory pickers. Renders a tappable field that expands into a list
 * of options below it.
 */
function DropdownField({
  label,
  displayValue,
  placeholder,
  isOpen,
  onToggle,
  options,
  onSelect,
  disabled = false,
  emptyMessage = 'No options available.',
}: {
  label: string;
  displayValue: string;
  placeholder: string;
  isOpen: boolean;
  onToggle: () => void;
  options: { id: string; name: string }[];
  onSelect: (id: string) => void;
  disabled?: boolean;
  emptyMessage?: string;
}) {
  return (
    <View className="mb-4">
      <Text style={{ color: COLORS.primaryDefault }} className="text-xs font-medium mb-1.5">
        {label}
      </Text>
      <TouchableOpacity
        className="border border-gray-300 rounded-xl px-3 py-3 flex-row items-center justify-between"
        onPress={onToggle}
        disabled={disabled}
        style={{ opacity: disabled ? 0.6 : 1 }}
      >
        <Text className={`text-sm ${displayValue ? 'text-gray-900' : 'text-gray-400'}`}>
          {displayValue || placeholder}
        </Text>
        <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={18} color="#6B7280" />
      </TouchableOpacity>

      {isOpen && (
        <View className="border border-gray-200 rounded-xl mt-1 overflow-hidden">
          {options.length === 0 ? (
            <Text className="px-3 py-3 text-xs text-gray-400">{emptyMessage}</Text>
          ) : (
            options.map((opt) => (
              <TouchableOpacity
                key={opt.id}
                className="px-3 py-3 border-b border-gray-100"
                onPress={() => onSelect(opt.id)}
              >
                <Text className="text-sm text-gray-800">{opt.name}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Edit Business Information — bottom sheet
// ---------------------------------------------------------------------------
// Only the fields the backend actually has: name, address, city, pincode,
// contact number. (There is no GST / delivery-duration field in the API.)

function EditBusinessModal({
  visible,
  initialValues,
  saving,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  initialValues: BusinessInfoFormValues;
  saving: boolean;
  onClose: () => void;
  onSubmit: (values: BusinessInfoFormValues) => void;
}) {
  const [values, setValues] = useState<BusinessInfoFormValues>(initialValues);

  // Pre-fill from whatever the backend currently has whenever the sheet opens
  useEffect(() => {
    if (visible) setValues(initialValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const setField = (key: keyof BusinessInfoFormValues) => (text: string) =>
    setValues((prev) => ({ ...prev, [key]: text }));

  const handleApply = () => {
    if (!values.name.trim()) {
      notify('Missing info', 'Business name is required.');
      return;
    }
    onSubmit(values);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 justify-end"
      >
        <TouchableOpacity className="flex-1 bg-black/40" activeOpacity={1} onPress={onClose} />

        <View className="bg-white rounded-t-3xl px-5 pt-5 pb-8 max-h-[88%]">
          <View className="w-10 h-1 bg-gray-300 rounded-full self-center mb-4" />
          <Text className="text-base font-bold text-gray-900 mb-4">Business Information</Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            <FormField
              label="Business name"
              value={values.name}
              onChangeText={setField('name')}
              placeholder="e.g. Sunways trading"
            />
            <FormField
              label="Business Address"
              value={values.address}
              onChangeText={setField('address')}
              placeholder="e.g. Ambalpady"
            />
            <FormField
              label="Business Phone number"
              value={values.contactNumber}
              onChangeText={setField('contactNumber')}
              placeholder="e.g. 7349322676"
              keyboardType="phone-pad"
            />

            <View className="flex-row" style={{ gap: 12 }}>
              <View className="flex-1">
                <FormField
                  label="City"
                  value={values.city}
                  onChangeText={setField('city')}
                  placeholder="e.g. udupi"
                />
              </View>
              <View className="flex-1">
                <FormField
                  label="Pincode"
                  value={values.pincode}
                  onChangeText={setField('pincode')}
                  placeholder="e.g. 576101"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </ScrollView>

          <TouchableOpacity
            style={{ backgroundColor: COLORS.primaryDefault }}
            className="rounded-xl py-4 items-center justify-center mt-2 flex-row"
            onPress={handleApply}
            disabled={saving}
          >
            {saving && <ActivityIndicator size="small" color="#FFFFFF" className="mr-2" />}
            <Text className="text-white font-bold text-sm">Apply changes</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Add category / subcategories to my store — bottom sheet
// ---------------------------------------------------------------------------
// The catalog is shared by all businesses. Here the supplier PICKS categories
// (and which of their subcategories) belong to THIS business — that choice is
// saved through POST /suppliers/{supplierId}/categories-subcategories.
// Creating a brand-new category is the fallback when it isn't in the list.

function AddCategoryModal({
  visible,
  catalog,
  catalogLoading,
  linkedCategoryIds,
  linkedSubCategoryIds,
  saving,
  onClose,
  onLink,
  onCreate,
  onDelete,
  onDeleteSubCategory,
}: {
  visible: boolean;
  catalog: ApiCategory[] | null;
  catalogLoading: boolean;
  linkedCategoryIds: string[];
  linkedSubCategoryIds: string[];
  saving: boolean;
  onClose: () => void;
  onLink: (categoryId: string, subCategoryIds: string[]) => void;
  onCreate: (values: NewCategoryFormValues) => void;
  onDelete: (categoryIds: string[]) => void;
  onDeleteSubCategory: (subCategoryIds: string[], name: string) => void;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pickedSubIds, setPickedSubIds] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (visible) {
      setExpandedId(null);
      setPickedSubIds([]);
      setName('');
      setDescription('');
    }
  }, [visible]);

  const toggleCategory = (id: string) => {
    setPickedSubIds([]);
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const toggleSub = (id: string) =>
    setPickedSubIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const expanded = catalog?.find((c) => c.id === expandedId);
  const expandedIsLinked = !!expanded && idsOf(expanded).some((id) => linkedCategoryIds.includes(id));
  // A category already in the store only needs a button if new subcategories were ticked
  const canLink = !!expanded && (!expandedIsLinked || pickedSubIds.length > 0);
  const canDelete = expandedIsLinked;

  const handleCreate = () => {
    if (!name.trim()) {
      notify('Missing info', 'Category name is required.');
      return;
    }
    onCreate({ name: name.trim(), description: description.trim() });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 justify-end"
      >
        <TouchableOpacity className="flex-1 bg-black/40" activeOpacity={1} onPress={onClose} />

        <View className="bg-white rounded-t-3xl px-5 pt-5 pb-8 max-h-[88%]">
          <View className="w-10 h-1 bg-gray-300 rounded-full self-center mb-4" />
          <Text className="text-base font-bold text-gray-900 mb-1">Add category</Text>
          <Text className="text-xs text-gray-400 mb-4">
            Pick a category (and its subcategories) to sell in.
          </Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {catalogLoading || !catalog ? (
              <ActivityIndicator size="small" color={COLORS.primaryDefault} className="my-6" />
            ) : catalog.length === 0 ? (
              <Text className="text-xs text-gray-400 mb-4">No categories in the catalog yet.</Text>
            ) : (
              catalog.map((cat) => {
                const linked = idsOf(cat).some((id) => linkedCategoryIds.includes(id));
                const isOpen = expandedId === cat.id;
                return (
                  <View
                    key={cat.id}
                    style={{ borderColor: isOpen ? COLORS.primaryDefault : '#E5E7EB' }}
                    className="border rounded-xl mb-2 overflow-hidden"
                  >
                    <TouchableOpacity
                      onPress={() => toggleCategory(cat.id)}
                      className="px-3 py-3 flex-row items-center justify-between"
                    >
                      <View className="flex-row items-center flex-1">
                        <Text className="text-sm text-gray-900">{cat.name}</Text>
                        {linked && (
                          <View
                            style={{ backgroundColor: COLORS.primary100 }}
                            className="rounded-full px-2 py-0.5 ml-2"
                          >
                            <Text style={{ color: COLORS.primaryDefault }} className="text-[10px] font-medium">
                              In your store
                            </Text>
                          </View>
                        )}
                      </View>
                      <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={16} color="#6B7280" />
                    </TouchableOpacity>

                    {isOpen && (
                      <View className="px-3 pb-3">
                        {cat.subCategories.length === 0 ? (
                          <Text className="text-xs text-gray-400">This category has no subcategories.</Text>
                        ) : (
                          <View className="flex-row flex-wrap" style={{ gap: 8 }}>
                            {cat.subCategories.map((sub) => {
                              const already = idsOf(sub).some((id) => linkedSubCategoryIds.includes(id));
                              const active = already || pickedSubIds.includes(sub.id);
                              return (
                                <View
                                  key={sub.id}
                                  style={{
                                    borderColor: active ? COLORS.primaryDefault : '#D1D5DB',
                                    backgroundColor: active ? COLORS.primary100 : 'transparent',
                                  }}
                                  className="border rounded-lg flex-row items-center overflow-hidden"
                                >
                                  <TouchableOpacity
                                    disabled={already}
                                    onPress={() => toggleSub(sub.id)}
                                    className="px-3 py-1.5"
                                  >
                                    <Text
                                      style={{ color: active ? COLORS.primaryDefault : '#6B7280' }}
                                      className="text-xs font-medium"
                                    >
                                      {sub.name}
                                    </Text>
                                  </TouchableOpacity>
                                  {/* Already in your store — offer to remove just this one */}
                                  {already && (
                                    <TouchableOpacity
                                      onPress={() => onDeleteSubCategory(idsOf(sub), sub.name)}
                                      hitSlop={{ top: 8, bottom: 8, left: 2, right: 8 }}
                                      className="pr-2 pl-0.5 py-1.5"
                                    >
                                      <Ionicons name="close-circle" size={14} color={COLORS.primaryDefault} />
                                    </TouchableOpacity>
                                  )}
                                </View>
                              );
                            })}
                          </View>
                        )}

                        <TouchableOpacity
                          style={{ backgroundColor: canLink ? COLORS.primaryDefault : '#9CA3AF' }}
                          className="rounded-xl py-3 items-center justify-center mt-3 flex-row"
                          onPress={() => onLink(cat.id, pickedSubIds)}
                          disabled={!canLink || saving}
                        >
                          {saving && <ActivityIndicator size="small" color="#FFFFFF" className="mr-2" />}
                          <Text className="text-white font-bold text-xs">
                            {expandedIsLinked ? 'Add selected subcategories' : 'Add to my store'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })
            )}

            <Text className="text-xs text-gray-400 mt-4 mb-3">
              Can't find it? Create a new category:
            </Text>
            <FormField
              label="Category name"
              value={name}
              onChangeText={setName}
              placeholder="e.g. Groceries"
            />
            <FormField
              label="Description (optional)"
              value={description}
              onChangeText={setDescription}
              placeholder="Short description"
            />
            <View className="flex-row mt-1" style={{ gap: 10 }}>
              {/* Removes the expanded category from your store — enabled only
                  when a category that is already "In your store" is open. */}
              <TouchableOpacity
                style={{ borderColor: canDelete ? '#DC2626' : '#D1D5DB' }}
                className="flex-1 border rounded-xl py-4 items-center justify-center"
                onPress={() => expandedIsLinked && expanded && onDelete(idsOf(expanded))}
                disabled={!canDelete || saving}
              >
                <Text
                  style={{ color: canDelete ? '#DC2626' : '#9CA3AF' }}
                  className="font-bold text-sm"
                >
                  Delete category
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ backgroundColor: COLORS.primaryDefault }}
                className="flex-1 rounded-xl py-4 items-center justify-center flex-row"
                onPress={handleCreate}
                disabled={saving}
              >
                {saving && <ActivityIndicator size="small" color="#FFFFFF" className="mr-2" />}
                <Text className="text-white font-bold text-sm">Create category</Text>
              </TouchableOpacity>
            </View>
            {!canDelete && (
              <Text className="text-[10px] text-gray-400 mt-2 text-center">
                Open a category above that's already "In your store" to delete it.
              </Text>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Auto subcategory detection
// ---------------------------------------------------------------------------
// Goal: "Grapes", "Green Grapes", "Black Grapes" should all end up filed
// under one "Grapes" subcategory automatically, and a genuinely new item
// (nothing like it exists yet) should get its own new subcategory created
// automatically — without the supplier having to remember to pick it.

function nameWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Loose match between two words so plurals and other simple spelling
 * variants still count as "the same thing" — "apple" vs "apples", "grape"
 * vs "grapes", "masala" vs "masalas" — without pulling in a real stemming
 * library. Two words match if they're identical, or one is a prefix of the
 * other (with a minimum length so short unrelated words like "a"/"an"
 * don't accidentally match everything).
 */
function wordsRoughlyMatch(a: string, b: string): boolean {
  if (a === b) return true;
  if (a.length < 3 || b.length < 3) return false;
  return a.startsWith(b) || b.startsWith(a);
}

/**
 * Finds the existing subcategory that best matches an item name — e.g. an
 * item called "Green Grapes" or "Grapes" (plural of an existing "Grape"
 * subcategory) matches because every word of the subcategory name is
 * roughly present in the item name. Returns undefined when nothing
 * overlaps, meaning this looks like a genuinely new variety.
 */
function findMatchingSubCategory(
  itemName: string,
  subCategories: ApiSubCategory[]
): ApiSubCategory | undefined {
  const itemWords = nameWords(itemName);
  if (itemWords.length === 0) return undefined;

  let best: { sub: ApiSubCategory; score: number } | undefined;
  for (const sub of subCategories) {
    const subWords = nameWords(sub.name);
    if (subWords.length === 0) continue;
    const matched = subWords.filter((sw) => itemWords.some((iw) => wordsRoughlyMatch(sw, iw))).length;
    if (matched === 0) continue;
    const score = matched / subWords.length; // how much of the subcategory name is covered
    if (!best || score > best.score) best = { sub, score };
  }
  return best?.sub;
}

/** The "common" name to use for a brand-new subcategory — the item's first word. */
function deriveSubCategoryName(itemName: string): string {
  return nameWordsPreserveCase(itemName)[0] ?? '';
}

function nameWordsPreserveCase(text: string): string[] {
  return text.trim().split(/\s+/).filter(Boolean);
}

// ---------------------------------------------------------------------------
// Add new Item — bottom sheet
// ---------------------------------------------------------------------------
// Subcategory chips are the subcategories of the selected category that THIS
// business has in its store. As the supplier types the item name, the
// subcategory is auto-detected (an existing match, or a brand-new one named
// after the item) — see findMatchingSubCategory / deriveSubCategoryName
// above. The supplier can still tap a chip or "+New" themselves at any time,
// which stops the auto-detection from overriding their choice.

function AddItemModal({
  visible,
  saving,
  category,
  subCategories,
  defaultSubCategoryId,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  saving: boolean;
  category?: ApiCategory;
  subCategories: ApiSubCategory[];
  defaultSubCategoryId?: string | null;
  onClose: () => void;
  onSubmit: (values: NewProductFormValues) => void;
}) {
  const buildEmptyValues = (): NewProductFormValues => ({
    name: '',
    description: '',
    price: '',
    stockQuantity: '',
    quantityType: 'WEIGHT',
    unitValue: '',
    minOrderQuantity: '',
    imageUrl: '',
    categoryId: category?.id ?? '',
    // Only a starting point — the subcategory-matching effect below takes
    // over as soon as the supplier types an item name, and may replace this.
    subCategoryId: defaultSubCategoryId ?? '',
  });

  const [values, setValues] = useState<NewProductFormValues>(buildEmptyValues);
  // Whether the "+ New subcategory" chip is active and its typed name
  const [isCreatingSub, setIsCreatingSub] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  // Once the supplier taps a chip, "+ New", or edits the new-subcategory
  // name themselves, auto-detection backs off and leaves their choice alone.
  const [subCategoryTouched, setSubCategoryTouched] = useState(false);

  // Reset the form each time the sheet opens
  useEffect(() => {
    if (visible) {
      setValues(buildEmptyValues());
      setIsCreatingSub(false);
      setNewSubName('');
      setSubCategoryTouched(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, category?.id]);

  // Auto-detect the subcategory from the item name as the supplier types it:
  // reuse a matching existing subcategory (e.g. "Green Grapes" -> "Grapes"),
  // or otherwise switch to "+ New" pre-filled with a sensible name for a
  // subcategory that doesn't exist yet. Only runs until the supplier makes
  // their own choice (subCategoryTouched).
  useEffect(() => {
    if (subCategoryTouched) return;
    const typedName = values.name.trim();
    if (!typedName) return;

    const match = findMatchingSubCategory(typedName, subCategories);
    if (match) {
      setIsCreatingSub(false);
      setNewSubName('');
      setValues((prev) => (prev.subCategoryId === match.id ? prev : { ...prev, subCategoryId: match.id }));
    } else {
      const suggested = deriveSubCategoryName(typedName);
      setIsCreatingSub(true);
      setNewSubName(suggested);
      setValues((prev) => (prev.subCategoryId === '' ? prev : { ...prev, subCategoryId: '' }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.name, subCategoryTouched, subCategories]);

  const setField = (key: keyof NewProductFormValues) => (text: string) =>
    setValues((prev) => ({ ...prev, [key]: text }));

  const pickSubCategory = (id: string) => {
    setSubCategoryTouched(true);
    setIsCreatingSub(false);
    setValues((prev) => ({ ...prev, subCategoryId: id }));
  };

  const startNewSubCategory = () => {
    setSubCategoryTouched(true);
    setIsCreatingSub(true);
    setValues((prev) => ({ ...prev, subCategoryId: '' }));
  };

  const handleNewSubNameChange = (text: string) => {
    setSubCategoryTouched(true);
    setNewSubName(text);
  };

  const handleCreate = () => {
    if (!values.name.trim()) {
      notify('Missing info', 'Item name is required.');
      return;
    }
    if (!values.categoryId) {
      notify('No category selected', 'Pick a category on the store screen first.');
      return;
    }
    if (isCreatingSub) {
      if (!newSubName.trim()) {
        notify('Missing info', 'Type a name for the new subcategory, or pick an existing one.');
        return;
      }
      onSubmit({ ...values, subCategoryId: '', newSubCategoryName: newSubName.trim() });
      return;
    }
    if (!values.subCategoryId && subCategories.length > 0) {
      notify('Missing info', 'Pick a subcategory, or use "+ New" to create one.');
      return;
    }
    onSubmit(values);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 justify-end"
      >
        <TouchableOpacity className="flex-1 bg-black/40" activeOpacity={1} onPress={onClose} />

        <View className="bg-white rounded-t-3xl px-5 pt-5 pb-8 max-h-[88%]">
          <View className="w-10 h-1 bg-gray-300 rounded-full self-center mb-4" />
          <Text className="text-base font-bold text-gray-900 mb-1">Add new Item</Text>
          {category && (
            <Text className="text-xs text-gray-400 mb-4">Category: {category.name}</Text>
          )}

          <ScrollView showsVerticalScrollIndicator={false}>
            <FormField
              label="Item name"
              value={values.name}
              onChangeText={setField('name')}
              placeholder="e.g. Onion"
            />
            <FormField
              label="Description (optional)"
              value={values.description}
              onChangeText={setField('description')}
              placeholder="Short description"
            />

            <View className="flex-row" style={{ gap: 12 }}>
              <View className="flex-1">
                <FormField
                  label="Price (₹)"
                  value={values.price}
                  onChangeText={setField('price')}
                  placeholder="e.g. 28"
                  keyboardType="numeric"
                />
              </View>
              <View className="flex-1">
                <FormField
                  label="Stock quantity"
                  value={values.stockQuantity}
                  onChangeText={setField('stockQuantity')}
                  placeholder="e.g. 100"
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Quantity type toggle */}
            <View className="mb-4">
              <Text style={{ color: COLORS.primaryDefault }} className="text-xs font-medium mb-1.5">
                Quantity type
              </Text>
              <View className="flex-row" style={{ gap: 10 }}>
                {(['WEIGHT', 'COUNT'] as const).map((type) => {
                  const active = values.quantityType === type;
                  return (
                    <TouchableOpacity
                      key={type}
                      onPress={() => setValues((prev) => ({ ...prev, quantityType: type }))}
                      style={{
                        borderColor: active ? COLORS.primaryDefault : '#D1D5DB',
                        backgroundColor: active ? COLORS.primary100 : 'transparent',
                      }}
                      className="border rounded-lg px-4 py-2"
                    >
                      <Text
                        style={{ color: active ? COLORS.primaryDefault : '#6B7280' }}
                        className="text-xs font-medium"
                      >
                        {type === 'WEIGHT' ? 'By weight' : 'By count'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View className="flex-row" style={{ gap: 12 }}>
              <View className="flex-1">
                <FormField
                  label={values.quantityType === 'WEIGHT' ? 'Unit (e.g. kg)' : 'Unit (e.g. pc)'}
                  value={values.unitValue}
                  onChangeText={setField('unitValue')}
                  placeholder="kg"
                />
              </View>
              <View className="flex-1">
                <FormField
                  label="Min order qty"
                  value={values.minOrderQuantity}
                  onChangeText={setField('minOrderQuantity')}
                  placeholder="e.g. 40"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View className="mb-4">
              <Text style={{ color: COLORS.primaryDefault }} className="text-xs font-medium mb-1.5">
                Subcategory
              </Text>
              {subCategories.length === 0 && !isCreatingSub && (
                <Text className="text-xs text-gray-400 mb-2">
                  This category has no subcategories in your store yet — create one below.
                </Text>
              )}
              <View className="flex-row flex-wrap" style={{ gap: 8 }}>
                {subCategories.map((sub) => {
                  const active = !isCreatingSub && values.subCategoryId === sub.id;
                  return (
                    <TouchableOpacity
                      key={sub.id}
                      onPress={() => pickSubCategory(sub.id)}
                      style={{
                        borderColor: active ? COLORS.primaryDefault : '#D1D5DB',
                        backgroundColor: active ? COLORS.primary100 : 'transparent',
                      }}
                      className="border rounded-lg px-3 py-1.5"
                    >
                      <Text
                        style={{ color: active ? COLORS.primaryDefault : '#6B7280' }}
                        className="text-xs font-medium"
                      >
                        {sub.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}

                {/* Creates a brand-new subcategory (saved to the backend and
                    added to this store) instead of picking an existing one. */}
                <TouchableOpacity
                  onPress={startNewSubCategory}
                  style={{
                    borderColor: isCreatingSub ? COLORS.primaryDefault : '#D1D5DB',
                    backgroundColor: isCreatingSub ? COLORS.primary100 : 'transparent',
                    borderStyle: 'dashed',
                    borderWidth:0.5,
                  }}
                  className="border rounded-lg px-3 py-1.5 flex-row items-center"
                >
                  <Ionicons
                    name="add"
                    size={13}
                    color={isCreatingSub ? COLORS.primaryDefault : '#6B7280'}
                  />
                  <Text
                    style={{ color: isCreatingSub ? COLORS.primaryDefault : '#6B7280' }}
                    className="text-xs font-medium ml-0.5"
                  >
                    New
                  </Text>
                </TouchableOpacity>
              </View>

              {isCreatingSub && (
                <View className="mt-2">
                  <FormField
                    label="New subcategory name"
                    value={newSubName}
                    onChangeText={handleNewSubNameChange}
                    placeholder="e.g. Carrot"
                  />
                  {!subCategoryTouched && (
                    <Text className="text-[10px] text-gray-400 mt-1">
                      No matching subcategory yet, so "{newSubName || '…'}" will be created
                      automatically. Tap a pill above, or edit the name, to change this.
                    </Text>
                  )}
                </View>
              )}
            </View>

            <FormField
              label="Image URL (optional)"
              value={values.imageUrl}
              onChangeText={setField('imageUrl')}
              placeholder="https://..."
            />
          </ScrollView>

          <TouchableOpacity
            style={{ backgroundColor: COLORS.primaryDefault }}
            className="rounded-xl py-4 items-center justify-center mt-2 flex-row"
            onPress={handleCreate}
            disabled={saving}
          >
            {saving && <ActivityIndicator size="small" color="#FFFFFF" className="mr-2" />}
            <Text className="text-white font-bold text-sm">Add item</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Edit Item — bottom sheet
// ---------------------------------------------------------------------------
// Tapping "Edit" on a product card opens a popup pre-filled with the
// product's info. The category / subcategory drop lists only offer the ones
// that belong to THIS business.

function EditItemModal({
  visible,
  saving,
  product,
  categories,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  saving: boolean;
  product: ApiProduct | null;
  categories: ApiCategory[];
  onClose: () => void;
  onSubmit: (productId: string, values: NewProductFormValues) => void;
}) {
  const emptyValues: NewProductFormValues = {
    name: '',
    description: '',
    price: '',
    stockQuantity: '',
    quantityType: 'WEIGHT',
    unitValue: '',
    minOrderQuantity: '',
    imageUrl: '',
    categoryId: '',
    subCategoryId: '',
  };

  const [values, setValues] = useState<NewProductFormValues>(emptyValues);
  const [isCategoryPickerOpen, setIsCategoryPickerOpen] = useState(false);
  const [isSubCategoryPickerOpen, setIsSubCategoryPickerOpen] = useState(false);

  // Pre-fill the form with the actual info of the product being edited
  // every time the sheet opens for a (possibly different) product.
  useEffect(() => {
    if (visible && product) {
      const editCat =
        categories.find((c) => idsOf(c).includes(product.categoryId)) ??
        categories.find((c) => c.subCategories.some((sc) => idsOf(sc).includes(product.subCategoryId)));
      const editSub = editCat?.subCategories.find((sc) => idsOf(sc).includes(product.subCategoryId));
      setValues({
        name: product.name,
        description: product.description ?? '',
        price: String(product.price ?? ''),
        stockQuantity: String(product.stockQuantity ?? ''),
        quantityType: (product.quantityType as 'COUNT' | 'WEIGHT') ?? 'WEIGHT',
        unitValue: product.unitValue ?? '',
        minOrderQuantity: String(product.minOrderQuantity ?? ''),
        imageUrl: product.imageUrl ?? '',
        // The product may be filed under any of the ids merged into a
        // category/subcategory — translate to the ones the pickers show.
        categoryId: editCat?.id ?? product.categoryId,
        subCategoryId: editSub?.id ?? product.subCategoryId,
      });
      setIsCategoryPickerOpen(false);
      setIsSubCategoryPickerOpen(false);
    }
  }, [visible, product]);

  const setField = (key: keyof NewProductFormValues) => (text: string) =>
    setValues((prev) => ({ ...prev, [key]: text }));

  const selectedCategory = categories.find((c) => c.id === values.categoryId);
  const subCategoryOptions = selectedCategory?.subCategories ?? EMPTY_SUBS;

  const handleCategorySelect = (id: string) => {
    const cat = categories.find((c) => c.id === id);
    setValues((prev) => ({
      ...prev,
      categoryId: id,
      // The old subcategory won't belong to the new category — default to its first.
      subCategoryId: cat?.subCategories?.[0]?.id ?? '',
    }));
    setIsCategoryPickerOpen(false);
  };

  const handleSave = () => {
    if (!product) return;
    if (!values.name.trim()) {
      notify('Missing info', 'Item name is required.');
      return;
    }
    if (!values.categoryId) {
      notify('Missing info', 'Please select a category.');
      return;
    }
    onSubmit(product.productId, values);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 justify-end"
      >
        <TouchableOpacity className="flex-1 bg-black/40" activeOpacity={1} onPress={onClose} />

        <View className="bg-white rounded-t-3xl px-5 pt-5 pb-8 max-h-[88%]">
          <View className="w-10 h-1 bg-gray-300 rounded-full self-center mb-4" />
          <Text className="text-base font-bold text-gray-900 mb-1">Edit Item</Text>
          {product && (
            <Text className="text-xs text-gray-400 mb-4">Editing: {product.name}</Text>
          )}

          <ScrollView showsVerticalScrollIndicator={false}>
            <FormField
              label="Item name"
              value={values.name}
              onChangeText={setField('name')}
              placeholder="e.g. Onion"
            />
            <FormField
              label="Description (optional)"
              value={values.description}
              onChangeText={setField('description')}
              placeholder="Short description"
            />

            <View className="flex-row" style={{ gap: 12 }}>
              <View className="flex-1">
                <FormField
                  label="Price (₹)"
                  value={values.price}
                  onChangeText={setField('price')}
                  placeholder="e.g. 28"
                  keyboardType="numeric"
                />
              </View>
              <View className="flex-1">
                <FormField
                  label="Stock quantity"
                  value={values.stockQuantity}
                  onChangeText={setField('stockQuantity')}
                  placeholder="e.g. 100"
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Quantity type toggle */}
            <View className="mb-4">
              <Text style={{ color: COLORS.primaryDefault }} className="text-xs font-medium mb-1.5">
                Quantity type
              </Text>
              <View className="flex-row" style={{ gap: 10 }}>
                {(['WEIGHT', 'COUNT'] as const).map((type) => {
                  const active = values.quantityType === type;
                  return (
                    <TouchableOpacity
                      key={type}
                      onPress={() => setValues((prev) => ({ ...prev, quantityType: type }))}
                      style={{
                        borderColor: active ? COLORS.primaryDefault : '#D1D5DB',
                        backgroundColor: active ? COLORS.primary100 : 'transparent',
                      }}
                      className="border rounded-lg px-4 py-2"
                    >
                      <Text
                        style={{ color: active ? COLORS.primaryDefault : '#6B7280' }}
                        className="text-xs font-medium"
                      >
                        {type === 'WEIGHT' ? 'By weight' : 'By count'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View className="flex-row" style={{ gap: 12 }}>
              <View className="flex-1">
                <FormField
                  label={values.quantityType === 'WEIGHT' ? 'Unit (e.g. kg)' : 'Unit (e.g. pc)'}
                  value={values.unitValue}
                  onChangeText={setField('unitValue')}
                  placeholder="kg"
                />
              </View>
              <View className="flex-1">
                <FormField
                  label="Min order qty"
                  value={values.minOrderQuantity}
                  onChangeText={setField('minOrderQuantity')}
                  placeholder="e.g. 40"
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Category — select from drop list */}
            <DropdownField
              label="Category"
              displayValue={selectedCategory?.name ?? ''}
              placeholder="Select category"
              isOpen={isCategoryPickerOpen}
              onToggle={() => {
                setIsCategoryPickerOpen((prev) => !prev);
                setIsSubCategoryPickerOpen(false);
              }}
              options={categories.map((c) => ({ id: c.id, name: c.name }))}
              onSelect={handleCategorySelect}
              emptyMessage="No categories in your store yet."
            />

            {/* Subcategory — select from drop list, scoped to chosen category */}
            <DropdownField
              label="Subcategory"
              displayValue={subCategoryOptions.find((s) => s.id === values.subCategoryId)?.name ?? ''}
              placeholder={subCategoryOptions.length === 0 ? 'No subcategories' : 'Select subcategory'}
              isOpen={isSubCategoryPickerOpen}
              onToggle={() => {
                if (subCategoryOptions.length === 0) return;
                setIsSubCategoryPickerOpen((prev) => !prev);
                setIsCategoryPickerOpen(false);
              }}
              options={subCategoryOptions.map((s) => ({ id: s.id, name: s.name }))}
              onSelect={(id) => {
                setValues((prev) => ({ ...prev, subCategoryId: id }));
                setIsSubCategoryPickerOpen(false);
              }}
              disabled={subCategoryOptions.length === 0}
              emptyMessage="This category has no subcategories."
            />

            <FormField
              label="Image URL (optional)"
              value={values.imageUrl}
              onChangeText={setField('imageUrl')}
              placeholder="https://..."
            />
          </ScrollView>

          <TouchableOpacity
            style={{ backgroundColor: COLORS.primaryDefault }}
            className="rounded-xl py-4 items-center justify-center mt-2 flex-row"
            onPress={handleSave}
            disabled={saving}
          >
            {saving && <ActivityIndicator size="small" color="#FFFFFF" className="mr-2" />}
            <Text className="text-white font-bold text-sm">Save changes</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Ratings tab
// ---------------------------------------------------------------------------
// Shows the store's best sellers, ranked from best to lowest, worked out from
// the daily aggregate orders: GET /api/aggregates/{supplierId}?date=YYYY-MM-DD

interface BestSeller {
  productId: string;
  name: string;
  quantity: number;
  revenue: number;
}

function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

async function fetchAggregatesForDate(supplierId: string, date: string): Promise<any[]> {
  const res = await axiosInstance.get(`/api/aggregates/${supplierId}`, { params: { date } });
  return Array.isArray(res.data) ? res.data : [];
}

/** Adds up every product's ordered quantity over the last `days` days (today included), best first. */
async function fetchBestSellersApi(supplierId: string, days: number): Promise<BestSeller[]> {
  const dates = Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return isoDate(d);
  });
  const results = await Promise.allSettled(dates.map((d) => fetchAggregatesForDate(supplierId, d)));

  const failures = results.filter((r): r is PromiseRejectedResult => r.status === 'rejected');
  // A day with no orders may answer 404 — that is "nothing sold", not an error.
  const realFailure = failures.find((f) => f.reason?.response?.status !== 404);
  if (failures.length === results.length && realFailure) throw realFailure.reason;

  const totals = new Map<string, BestSeller>();
  for (const r of results) {
    if (r.status !== 'fulfilled') continue;
    for (const order of r.value) {
      for (const pa of order?.productAggregates ?? []) {
        const key = pa.productId ?? pa.productName;
        if (!key) continue;
        const qty = Number(pa.totalQuantity) || 0;
        const price = Number(pa.unitPrice) || 0;
        const row = totals.get(key) ?? {
          productId: pa.productId ?? key,
          name: pa.productName ?? 'Unnamed product',
          quantity: 0,
          revenue: 0,
        };
        row.quantity += qty;
        row.revenue += qty * price;
        totals.set(key, row);
      }
    }
  }
  return Array.from(totals.values())
    .filter((row) => row.quantity > 0)
    .sort((a, b) => b.quantity - a.quantity || b.revenue - a.revenue);
}

function RatingsView({ supplierId, products }: { supplierId?: string; products: ApiProduct[] }) {
  const [period, setPeriod] = useState<'today' | 'week'>('week');
  const [sellers, setSellers] = useState<BestSeller[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!supplierId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const list = await fetchBestSellersApi(supplierId, period === 'today' ? 1 : 7);
        if (!cancelled) setSellers(list);
      } catch (err) {
        describeApiError('Error loading best sellers', err);
        if (!cancelled) {
          setSellers([]);
          setError('Could not load your best sellers. Please try again.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [supplierId, period, reloadKey]);

  const productById = new Map(products.map((p) => [p.productId, p]));
  const topQuantity = sellers[0]?.quantity ?? 1;
  const rankColors = ['#F59E0B', '#9CA3AF', '#B45309'];

  return (
    <View className="px-4 py-4">
      <Text className="text-base font-bold text-gray-900 mb-1">Best sellers</Text>
      <Text className="text-[11px] text-gray-500 mb-3">Most ordered products, from best to lowest.</Text>

      <View className="flex-row mb-3" style={{ gap: 8 }}>
        {(
          [
            ['today', 'Today'],
            ['week', 'Last 7 days'],
          ] as const
        ).map(([key, label]) => {
          const active = period === key;
          return (
            <TouchableOpacity
              key={key}
              onPress={() => setPeriod(key)}
              style={{
                backgroundColor: active ? COLORS.primaryDefault : 'transparent',
                borderColor: COLORS.primaryDefault,
              }}
              className="border rounded-full px-4 py-1.5"
            >
              <Text
                style={{ color: active ? '#FFFFFF' : COLORS.primaryDefault }}
                className="text-xs font-semibold"
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <ActivityIndicator size="small" color={COLORS.primaryDefault} className="my-8" />
      ) : error ? (
        <View className="items-center py-6">
          <Text className="text-xs text-red-500 text-center">{error}</Text>
          <TouchableOpacity
            onPress={() => setReloadKey((k) => k + 1)}
            style={{ borderColor: COLORS.primaryDefault }}
            className="border rounded-lg px-4 py-1.5 mt-3"
          >
            <Text style={{ color: COLORS.primaryDefault }} className="text-xs font-semibold">
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      ) : sellers.length === 0 ? (
        <Text className="text-xs text-gray-400 text-center py-8">
          No orders {period === 'today' ? 'today' : 'in the last 7 days'} yet — your best sellers will
          show up here, ranked from most to least ordered.
        </Text>
      ) : (
        sellers.map((row, index) => {
          const product = productById.get(row.productId);
          const pct = Math.max(6, Math.round((row.quantity / topQuantity) * 100));
          const badgeColor = rankColors[index] ?? '#D1D5DB';
          return (
            <View
              key={row.productId}
              className="bg-white border border-gray-100 rounded-2xl p-3 mb-3 shadow-sm"
            >
              <View className="flex-row items-center">
                <View
                  style={{ backgroundColor: badgeColor }}
                  className="w-6 h-6 rounded-full items-center justify-center mr-3"
                >
                  <Text className="text-[11px] font-bold text-white">{index + 1}</Text>
                </View>
                <SafeImage uri={product?.imageUrl} className="w-10 h-10 rounded-lg" iconSize={16} />
                <View className="flex-1 ml-3">
                  <Text className="text-xs font-bold text-gray-900 uppercase" numberOfLines={1}>
                    {row.name}
                  </Text>
                  <Text className="text-[10px] text-gray-500">
                    {row.quantity} ordered
                    {row.revenue > 0 ? ` · ₹ ${Math.round(row.revenue)}` : ''}
                  </Text>
                </View>
              </View>
              <View className="h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                <View
                  style={{ width: `${pct}%`, backgroundColor: COLORS.primaryDefault }}
                  className="h-1.5 rounded-full"
                />
              </View>
            </View>
          );
        })
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export default function SupplierStoreScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'product' | 'ratings'>('product');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string | null>(null); // null = "All"

  // Selection state
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  // -- Who is logged in ---------------------------------------------------------
  const [supplierId, setSupplierId] = useState<string | undefined>(undefined);
  const [resolvingId, setResolvingId] = useState(true);

  // -- Business card (all from the backend — no placeholder data) ---------------
  const [business, setBusiness] = useState<SupplierBusiness | null>(null);
  const [owner, setOwner] = useState<OwnerInfo | null>(null);
  const userRecordRef = useRef<any>(null); // full user record, needed to send a status change back
  const [togglingActive, setTogglingActive] = useState(false);
  const [businessLoading, setBusinessLoading] = useState(true);
  const [businessError, setBusinessError] = useState<string | null>(null);

  // -- This business's categories (with subcategories) and products -------------
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [supplierProducts, setSupplierProducts] = useState<ApiProduct[]>([]);
  // Every product in the catalog — used to find items that lost their link to this store
  const [catalogProducts, setCatalogProducts] = useState<ApiProduct[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  // Shared catalog — only downloaded when "Add category" is opened
  const [sharedCatalog, setSharedCatalog] = useState<ApiCategory[] | null>(null);
  const [sharedCatalogLoading, setSharedCatalogLoading] = useState(false);

  const [deleting, setDeleting] = useState(false);

  // Short confirmation banner ("Added X to Fruits › Apple") so it is obvious
  // where a new item's card went.
  const [flash, setFlash] = useState<string | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showFlash = (message: string) => {
    if (flashTimer.current) clearTimeout(flashTimer.current);
    setFlash(message);
    flashTimer.current = setTimeout(() => setFlash(null), 4000);
  };
  useEffect(
    () => () => {
      if (flashTimer.current) clearTimeout(flashTimer.current);
    },
    []
  );

  // Modal visibility + per-modal saving state
  const [isEditBusinessVisible, setIsEditBusinessVisible] = useState(false);
  const [isAddCategoryVisible, setIsAddCategoryVisible] = useState(false);
  const [isAddItemVisible, setIsAddItemVisible] = useState(false);
  const [isEditItemVisible, setIsEditItemVisible] = useState(false);
  const [savingBusinessInfo, setSavingBusinessInfo] = useState(false);
  const [savingCategory, setSavingCategory] = useState(false);
  const [creatingProduct, setCreatingProduct] = useState(false);
  const [savingProductEdit, setSavingProductEdit] = useState(false);

  // Which product the "Edit" popup is currently showing
  const [editingProduct, setEditingProduct] = useState<ApiProduct | null>(null);

  // -- 1. Who am I? ---------------------------------------------------------------
  const resolveId = useCallback(async () => {
    setResolvingId(true);
    const id = await resolveSupplierId();
    setSupplierId(id);
    setResolvingId(false);
  }, []);

  useEffect(() => {
    resolveId();
  }, [resolveId]);

  // -- 2a. Business card ------------------------------------------------------------
  const loadBusiness = useCallback(async () => {
    if (!supplierId) return;
    setBusinessLoading(true);
    setBusinessError(null);
    const [b, u] = await Promise.allSettled([
      fetchBusinessBySupplierApi(supplierId),
      fetchOwnerApi(supplierId),
    ]);

    if (b.status === 'fulfilled') {
      setBusiness(b.value ?? null);
      if (!b.value) setBusinessError('No business profile was found for this supplier.');
    } else {
      describeApiError('Error loading business', b.reason);
      setBusinessError('Could not load your business information.');
    }

    if (u.status === 'fulfilled') {
      setOwner(u.value.info);
      userRecordRef.current = u.value.record;
    }
    else describeApiError('Error loading owner', u.reason);

    setBusinessLoading(false);
  }, [supplierId]);

  // -- 2b. This business's categories + products --------------------------------------
  const loadCatalog = useCallback(async () => {
    if (!supplierId) return;
    setCatalogLoading(true);
    setCatalogError(null);
    const [c, p] = await Promise.allSettled([
      fetchSupplierCategoriesApi(supplierId),
      fetchStoreProductsApi(supplierId),
    ]);

    if (c.status === 'fulfilled') setCategories(c.value);
    else describeApiError('Error loading supplier categories', c.reason);

    if (p.status === 'fulfilled') {
      setSupplierProducts(p.value.products);
      setCatalogProducts(p.value.catalogProducts);
    }
    else describeApiError('Error loading supplier products', p.reason);

    if (c.status === 'rejected' || p.status === 'rejected') {
      setCatalogError('Could not load your store. Please try again.');
    }
    setCatalogLoading(false);
  }, [supplierId]);

  useEffect(() => {
    if (resolvingId) return;
    if (!supplierId) {
      setBusinessLoading(false);
      setCatalogLoading(false);
      setBusinessError(NO_SUPPLIER_ID_MESSAGE);
      setCatalogError(NO_SUPPLIER_ID_MESSAGE);
      return;
    }
    loadBusiness();
    loadCatalog();
  }, [resolvingId, supplierId, loadBusiness, loadCatalog]);

  const retryAll = () => {
    if (supplierId) {
      loadBusiness();
      loadCatalog();
    } else {
      setBusinessError(null);
      setCatalogError(null);
      setBusinessLoading(true);
      setCatalogLoading(true);
      resolveId();
    }
  };

  // -- Derived --------------------------------------------------------------------------
  const selectedCategoryObj = categories.find((c) => c.id === selectedCategoryId);
  const visibleSubCategories = selectedCategoryObj?.subCategories ?? EMPTY_SUBS;
  const selectedSubObj = visibleSubCategories.find((sc) => sc.id === selectedSubCategoryId);
  // A product belongs to the selected category if it is filed under ANY id
  // merged into it, or under one of its subcategories (the backend is not
  // consistent about which parent it stores). Same idea for the pill filter.
  const visibleProducts = supplierProducts.filter((p) => {
    if (!selectedCategoryObj) return false;
    const inCategory =
      idsOf(selectedCategoryObj).includes(p.categoryId) ||
      selectedCategoryObj.subCategories.some((sc) => idsOf(sc).includes(p.subCategoryId));
    if (!inCategory) return false;
    if (!selectedSubObj) return true;
    return idsOf(selectedSubObj).includes(p.subCategoryId);
  });
  const businessCategoryNames = categories.map((c) => c.name).join(', ');

  // Keep the selection valid as data changes
  useEffect(() => {
    if (catalogLoading) return;
    if (categories.length === 0) {
      if (selectedCategoryId !== null) setSelectedCategoryId(null);
      return;
    }
    if (!categories.some((c) => c.id === selectedCategoryId)) {
      setSelectedCategoryId(categories[0].id);
      setSelectedSubCategoryId(null);
    }
  }, [catalogLoading, categories, selectedCategoryId]);

  useEffect(() => {
    if (selectedSubCategoryId && !visibleSubCategories.some((s) => s.id === selectedSubCategoryId)) {
      setSelectedSubCategoryId(null);
    }
  }, [visibleSubCategories, selectedSubCategoryId]);

  // Selecting a category always resets the subcategory filter to "All"
  const handleSelectCategory = (id: string) => {
    if (id === selectedCategoryId) return;
    setSelectedCategoryId(id);
    setSelectedSubCategoryId(null);
  };

  const toggleSelectMode = () => {
    if (isSelectMode) {
      setIsSelectMode(false);
      setSelectedProducts([]);
    } else {
      setIsSelectMode(true);
    }
  };

  const toggleSelectProduct = (id: string) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // -- Store Activity: saves the account's `active` flag ---------------------------------
  // Optimistic: the switch moves immediately and snaps back if the server refuses.
  const handleToggleStoreActive = async (next: boolean) => {
    const record = userRecordRef.current;
    if (!supplierId || !record) {
      notify('Cannot change status', 'Your account details have not loaded yet.');
      return;
    }
    const previous = !!owner?.active;
    setOwner((prev) => ({ ...(prev ?? {}), active: next }));
    setTogglingActive(true);
    try {
      const body = {
        ...record,
        active: next,
        // Keep `status` in step only when it uses the ACTIVE/INACTIVE wording
        ...(record.status === 'ACTIVE' || record.status === 'INACTIVE'
          ? { status: next ? 'ACTIVE' : 'INACTIVE' }
          : {}),
      };
      const updated = await updateUserApi(supplierId, body);
      userRecordRef.current = { ...body, ...(updated && typeof updated === 'object' ? updated : {}) };
    } catch (err) {
      setOwner((prev) => ({ ...(prev ?? {}), active: previous }));
      notify('Could not change store status', describeApiError('Error updating store activity', err));
    } finally {
      setTogglingActive(false);
    }
  };

  const handleMakeCall = () => {
    if (business?.contactNumber) {
      Linking.openURL(`tel:${business.contactNumber}`).catch(() => {
        notify('Error', 'Unable to initiate call on this device.');
      });
    } else {
      notify('Notice', 'No phone number is available for this store.');
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedProducts.length === 0) return;

    setDeleting(true);
    try {
      const ids = [...selectedProducts];
      const results = await Promise.allSettled(ids.map((id) => deleteProductApi(id)));
      // Only remove the items the server actually deleted
      const deletedIds = ids.filter((_, i) => results[i].status === 'fulfilled');
      const failedCount = ids.length - deletedIds.length;

      setSupplierProducts((prev) => prev.filter((p) => !deletedIds.includes(p.productId)));
      if (supplierId) removeFromProductRegistry(supplierId, deletedIds).catch(() => {});

      if (failedCount > 0) {
        results.forEach((r) => {
          if (r.status === 'rejected') describeApiError('Error deleting product', r.reason);
        });
        notify(
          'Some items were not deleted',
          `${failedCount} item${failedCount > 1 ? 's' : ''} could not be deleted. Please try again.`
        );
      }
    } catch (err) {
      console.error('Error in deletion pipeline:', err);
    } finally {
      setSelectedProducts([]);
      setIsSelectMode(false);
      setDeleting(false);
    }
  };

  // -- Edit Business Information ---------------------------------------------------------
  // PUT needs the FULL business object, so start from the loaded one.
  const handleSaveBusinessInfo = async (values: BusinessInfoFormValues) => {
    if (!business) return;
    try {
      setSavingBusinessInfo(true);
      // The backend crashes (500) if categoryIds / subCategoryIds are null, and
      // this business came back with them null — so always send real lists,
      // falling back to the categories this supplier actually has.
      const payload: SupplierBusiness = {
        ...business,
        ...values,
        categoryIds: business.categoryIds ?? categories.flatMap((c) => idsOf(c)),
        subCategoryIds:
          business.subCategoryIds ?? categories.flatMap((c) => c.subCategories.flatMap((sc) => idsOf(sc))),
      };
      const updated = await updateBusinessApi(payload);
      const echoed = updated && typeof updated === 'object' ? updated : {};
      setBusiness({ ...payload, ...echoed });
      setIsEditBusinessVisible(false);
    } catch (err) {
      notify('Could not save changes', describeApiError('Error updating business info', err));
    } finally {
      setSavingBusinessInfo(false);
    }
  };

  // -- Add category (link catalog categories/subcategories to this business) ---------------
  const openAddCategory = async () => {
    setIsAddCategoryVisible(true);
    if (sharedCatalog) return;
    try {
      setSharedCatalogLoading(true);
      setSharedCatalog(await fetchSharedCatalogApi());
    } catch (err) {
      notify('Could not load the category list', describeApiError('Error loading catalog', err));
    } finally {
      setSharedCatalogLoading(false);
    }
  };

  // Saves the FULL set (existing + new) so it works whether the endpoint
  // replaces or appends, then reloads this business's categories. Returns the
  // fresh list so callers can work with up-to-date ids straight away.
  const linkToSupplier = async (categoryId: string, newSubCategoryIds: string[]): Promise<ApiCategory[]> => {
    if (!supplierId) throw new Error(NO_SUPPLIER_ID_MESSAGE);
    const categoryIds = Array.from(new Set([...categories.flatMap((c) => idsOf(c)), categoryId]));
    const subCategoryIds = Array.from(
      new Set([
        ...categories.flatMap((c) => c.subCategories.flatMap((sc) => idsOf(sc))),
        ...newSubCategoryIds,
      ])
    );
    await linkCategoriesApi(supplierId, { categoryIds, subCategoryIds });
    const fresh = await fetchSupplierCategoriesApi(supplierId);
    setCategories(fresh);
    setSelectedCategoryId(findCategoryByAnyId(fresh, categoryId)?.id ?? categoryId);
    setSelectedSubCategoryId(null);
    return fresh;
  };

  // Removes a category (and its subcategories) from THIS supplier's store only.
  // It does not touch the shared catalog, so other suppliers keep it. Assumes
  // POST .../categories-subcategories replaces the supplier's full set — if the
  // backend appends instead, ask them for a proper "unlink" endpoint.
  const unlinkCategoryFromSupplier = async (categoryIdsToRemove: string[]) => {
    if (!supplierId) throw new Error(NO_SUPPLIER_ID_MESSAGE);
    const removed = categories.filter((c) => idsOf(c).some((id) => categoryIdsToRemove.includes(id)));
    const removedIds = new Set(removed.flatMap((c) => idsOf(c)));
    const removedSubIds = new Set(removed.flatMap((c) => c.subCategories.flatMap((sc) => idsOf(sc))));
    const keep = categories.filter((c) => !removed.includes(c));
    const categoryIds = keep.flatMap((c) => idsOf(c));
    const subCategoryIds = keep
      .flatMap((c) => c.subCategories.flatMap((sc) => idsOf(sc)))
      .filter((id) => !removedSubIds.has(id));
    await linkCategoriesApi(supplierId, { categoryIds, subCategoryIds });
    const fresh = await fetchSupplierCategoriesApi(supplierId);
    setCategories(fresh);
    setSelectedCategoryId((prev) => (prev && removedIds.has(prev) ? null : prev));
    // Confirm the server actually dropped it — some endpoints only ever add
    // to the linked set and ignore removals, which would silently undo this.
    if (fresh.some((c) => idsOf(c).some((id) => removedIds.has(id)))) {
      throw new Error(
        'The server kept this category linked to your store even after being asked to remove it. It may only support adding categories, not removing them — ask the backend team for a real "unlink" endpoint.'
      );
    }
  };

  // Removes ONE subcategory from this supplier's store (its parent category
  // stays linked, even if this was its last subcategory). Same assumption as
  // unlinkCategoryFromSupplier: the endpoint replaces the full set.
  const unlinkSubCategoryFromSupplier = async (subCategoryIdsToRemove: string[]) => {
    if (!supplierId) throw new Error(NO_SUPPLIER_ID_MESSAGE);
    const removeIds = new Set(subCategoryIdsToRemove);
    const categoryIds = categories.flatMap((c) => idsOf(c));
    const subCategoryIds = categories
      .flatMap((c) => c.subCategories.flatMap((sc) => idsOf(sc)))
      .filter((id) => !removeIds.has(id));
    await linkCategoriesApi(supplierId, { categoryIds, subCategoryIds });
    const fresh = await fetchSupplierCategoriesApi(supplierId);
    setCategories(fresh);
    setSelectedSubCategoryId((prev) => (prev && removeIds.has(prev) ? null : prev));
    // Confirm the server actually dropped it — some endpoints only ever add
    // to the linked set and ignore removals, which would silently undo this.
    if (fresh.some((c) => c.subCategories.some((sc) => idsOf(sc).some((id) => removeIds.has(id))))) {
      throw new Error(
        'The server kept this subcategory linked to your store even after being asked to remove it. It may only support adding subcategories, not removing them — ask the backend team for a real "unlink" endpoint.'
      );
    }
  };

  const handleDeleteSubCategory = async (subCategoryIds: string[], name: string) => {
    const ok = await confirmDestructive(
      'Remove subcategory from your store?',
      `"${name}" will no longer show in your store. Products already using it will stay, but the filter pill disappears.`
    );
    if (!ok) return;
    try {
      setSavingCategory(true);
      await unlinkSubCategoryFromSupplier(subCategoryIds);
    } catch (err) {
      notify('Could not remove subcategory', describeApiError('Error unlinking subcategory', err));
    } finally {
      setSavingCategory(false);
    }
  };

  const handleDeleteCategory = async (categoryIds: string[]) => {
    const category = categories.find((c) => idsOf(c).some((id) => categoryIds.includes(id)));
    const ok = await confirmDestructive(
      'Remove category from your store?',
      `"${category?.name ?? 'This category'}" and its products will no longer show in your store. This does not delete it from the catalog.`
    );
    if (!ok) return;
    try {
      setSavingCategory(true);
      await unlinkCategoryFromSupplier(categoryIds);
    } catch (err) {
      notify('Could not remove category', describeApiError('Error unlinking category', err));
    } finally {
      setSavingCategory(false);
    }
  };

  const handleLinkCategory = async (categoryId: string, subCategoryIds: string[]) => {
    try {
      setSavingCategory(true);
      await linkToSupplier(categoryId, subCategoryIds);
      setIsAddCategoryVisible(false);
    } catch (err) {
      notify('Could not add to your store', describeApiError('Error linking category', err));
    } finally {
      setSavingCategory(false);
    }
  };

  // The category list is shared by every business, so an existing name is
  // never re-created.
  const handleCreateCategory = async (values: NewCategoryFormValues) => {
    const existing = sharedCatalog?.find(
      (c) => c.name.trim().toLowerCase() === values.name.trim().toLowerCase()
    );
    if (existing) {
      notify(
        'Category already exists',
        `"${existing.name}" is already in the list above — select it there instead of creating a duplicate.`
      );
      return;
    }
    try {
      setSavingCategory(true);
      const created = await createCategoryApi(values);
      const newCategoryId = extractId(created) ?? created.id;
      if (!newCategoryId) {
        notify('Could not create category', 'The server did not return the new category id.');
        return;
      }
      const category: ApiCategory = {
        ...created,
        id: newCategoryId,
        subCategories: created.subCategories ?? [],
      };
      setSharedCatalog((prev) => (prev ? [...prev, category] : prev));
      await linkToSupplier(category.id, []);
      setIsAddCategoryVisible(false);
    } catch (err) {
      notify('Could not create category', describeApiError('Error creating category', err));
    } finally {
      setSavingCategory(false);
    }
  };

  // -- Add new Item: create the product, then link it to this business ----------------------
  const handleCreateProduct = async (values: NewProductFormValues) => {
    if (!supplierId) {
      notify('Cannot add item', NO_SUPPLIER_ID_MESSAGE);
      return;
    }
    setCreatingProduct(true);
    try {
      let subCategoryId = values.subCategoryId;
      let latestCategories = categories;

      // A brand-new subcategory was typed. If one with this name already
      // exists in the category (case-insensitive), reuse it instead of
      // creating a duplicate chip in the backend — this is what was
      // producing the repeated "Chicken Masala" pills.
      if (values.newSubCategoryName?.trim()) {
        const typedName = values.newSubCategoryName.trim();
        const categoryNow = findCategoryByAnyId(categories, values.categoryId);
        const existingMatch = categoryNow?.subCategories.find(
          (s) => s.name.trim().toLowerCase() === typedName.toLowerCase()
        );

        if (existingMatch) {
          subCategoryId = existingMatch.id;
        } else {
          try {
            const createdSub = await createSubCategoryApi({
              name: typedName,
              description: '',
              categoryId: values.categoryId,
            });
            const newSubId = extractId(createdSub) ?? createdSub.id;
            if (!newSubId) {
              throw new Error('The server did not return the new subcategory id.');
            }
            latestCategories = await linkToSupplier(values.categoryId, [newSubId]);
            subCategoryId = newSubId;
          } catch (subErr) {
            notify('Could not create subcategory', describeApiError('Error creating subcategory', subErr));
            return;
          }
        }
      }

      // File the product under the subcategory's REAL parent when we know it —
      // that is what the backend itself associates with that subcategory.
      const categoryForProduct = findCategoryByAnyId(latestCategories, values.categoryId);
      const chosenSub = categoryForProduct?.subCategories.find((sc) => idsOf(sc).includes(subCategoryId));
      const productCategoryId =
        chosenSub?.categoryId && categoryForProduct && idsOf(categoryForProduct).includes(chosenSub.categoryId)
          ? chosenSub.categoryId
          : values.categoryId;

      const payload: Omit<ApiProduct, 'productId'> = {
        name: values.name,
        description: values.description,
        price: Number(values.price) || 0,
        stockQuantity: Number(values.stockQuantity) || 0,
        quantityType: values.quantityType,
        unitValue: values.unitValue,
        minOrderQuantity: Number(values.minOrderQuantity) || 0,
        imageUrl: values.imageUrl,
        categoryId: productCategoryId,
        subCategoryId,
      };

      // Step 1 — create the product
      const created = await createProductApi(payload);
      const productId = extractProductId(created);
      if (!productId) {
        throw new Error(
          'The server did not return the new product id, so it could not be linked to your store.'
        );
      }

      // Step 2 — link it to this business
      try {
        // Send the FULL set: what the server already has for this store, what
        // is on screen, and the new product — otherwise the new one replaces
        // all the others.
        let knownIds = supplierProducts.map((p) => p.productId);
        try {
          const current = await fetchSupplierProductsApi(supplierId);
          knownIds = [...current.map((p) => p.productId), ...knownIds];
        } catch {
          /* fall back to what is on screen */
        }
        const allIds = Array.from(new Set([...knownIds, productId]));
        await mapProductsToSupplierApi(supplierId, allIds);
      } catch (mapErr) {
        // The product exists and is remembered by this store (below), so it
        // still gets its card — but say that the backend link failed.
        notify(
          'Item created, but the backend link failed',
          describeApiError('Error mapping product to supplier', mapErr)
        );
      }

      // Remember this item as part of the store, whatever the backend link did.
      await addToProductRegistry(supplierId, [productId]);

      // Show the card right away with exactly what you typed — don't make you
      // wait on (or depend on) the server's response to see it.
      const optimisticProduct: ApiProduct = { ...payload, productId };
      setSupplierProducts((prev) => [
        ...prev.filter((p) => p.productId !== productId),
        optimisticProduct,
      ]);
      // Jump to exactly where the new card lives, using the freshest ids.
      setSelectedCategoryId(categoryForProduct?.id ?? values.categoryId);
      setSelectedSubCategoryId(chosenSub?.id ?? null);
      setIsAddItemVisible(false);
      showFlash(
        `Added "${values.name.trim()}" to ${categoryForProduct?.name ?? 'your store'}${
          chosenSub ? ` › ${chosenSub.name}` : ''
        }`
      );

      // Then reconcile with the server in the background — but ALWAYS keep
      // our own categoryId/subCategoryId/etc for the item we just created.
      // The backend has echoed this product back filed under a different
      // (often duplicate) category/subcategory record before, which made the
      // card silently vanish from the view the supplier was looking at even
      // though the item had, in fact, saved. Trusting our own placement here
      // avoids that.
      try {
        const fresh = await fetchStoreProductsApi(supplierId);
        const others = fresh.products.filter((p) => p.productId !== productId);
        setSupplierProducts([...others, optimisticProduct]);
        setCatalogProducts(fresh.catalogProducts);
      } catch (refreshErr) {
        describeApiError('Error refreshing products after create', refreshErr);
      }
    } catch (err) {
      notify('Could not add item', describeApiError('Error creating product', err));
    } finally {
      setCreatingProduct(false);
    }
  };

  // -- Edit Item ---------------------------------------------------------------------------
  const handleOpenEditItem = (product: ApiProduct) => {
    setEditingProduct(product);
    setIsEditItemVisible(true);
  };

  const handleCloseEditItem = () => {
    setIsEditItemVisible(false);
    setEditingProduct(null);
  };

  // PUT needs the FULL product, so start from the existing one and overlay the edits.
  const handleSaveProductEdit = async (productId: string, values: NewProductFormValues) => {
    const original = supplierProducts.find((p) => p.productId === productId);
    if (!original) return;
    const editCategory = findCategoryByAnyId(categories, values.categoryId);
    const editSub = editCategory?.subCategories.find((sc) => idsOf(sc).includes(values.subCategoryId));
    const editCategoryId =
      editSub?.categoryId && editCategory && idsOf(editCategory).includes(editSub.categoryId)
        ? editSub.categoryId
        : values.categoryId;
    const payload: ApiProduct = {
      ...original,
      productId,
      name: values.name,
      description: values.description,
      price: Number(values.price) || 0,
      stockQuantity: Number(values.stockQuantity) || 0,
      quantityType: values.quantityType,
      unitValue: values.unitValue,
      minOrderQuantity: Number(values.minOrderQuantity) || 0,
      imageUrl: values.imageUrl,
      categoryId: editCategoryId,
      subCategoryId: values.subCategoryId,
    };

    // Show the edit immediately, so the card reflects what you typed right away.
    setSupplierProducts((prev) => prev.map((p) => (p.productId === productId ? payload : p)));
    handleCloseEditItem();

    setSavingProductEdit(true);
    try {
      await updateProductApi(productId, payload);
      // Reconcile with the server in the background, but — same reasoning as
      // handleCreateProduct above — always keep OUR edited values for the
      // product placement (category/subcategory) rather than letting a
      // possibly-stale server echo move or hide the card.
      if (supplierId) {
        try {
          const fresh = await fetchStoreProductsApi(supplierId);
          const others = fresh.products.filter((p) => p.productId !== productId);
          setSupplierProducts([...others, payload]);
          setCatalogProducts(fresh.catalogProducts);
        } catch (refreshErr) {
          describeApiError('Error refreshing products after edit', refreshErr);
        }
      }
    } catch (err) {
      // The save itself failed — undo the optimistic change so the card
      // doesn't claim to be saved when it isn't.
      setSupplierProducts((prev) => prev.map((p) => (p.productId === productId ? original : p)));
      notify('Could not save changes', describeApiError('Error updating product', err));
    } finally {
      setSavingProductEdit(false);
    }
  };

  // -- Restore items that lost their backend link ----------------------------------------
  // Products sitting in this store's subcategories that are missing from the
  // store list — e.g. items pushed out by the old "one new item replaces the
  // last" problem. Restoring re-adds them (and remembers them).
  const storeSubIds = new Set(categories.flatMap((c) => c.subCategories.flatMap((sc) => idsOf(sc))));
  const storeProductIds = new Set(supplierProducts.map((p) => p.productId));
  const restorable = catalogProducts.filter(
    (p) => storeSubIds.has(p.subCategoryId) && !storeProductIds.has(p.productId)
  );

  const handleRestoreItems = async () => {
    if (!supplierId || restorable.length === 0) return;
    const names = restorable.map((p) => p.name).join(', ');
    const ok =
      Platform.OS === 'web'
        ? window.confirm(`Restore these items to your store?\n\n${names}`)
        : await new Promise<boolean>((resolve) =>
            Alert.alert('Restore these items to your store?', names, [
              { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
              { text: 'Restore', onPress: () => resolve(true) },
            ])
          );
    if (!ok) return;

    const restoredIds = restorable.map((p) => p.productId);
    await addToProductRegistry(supplierId, restoredIds);
    setSupplierProducts((prev) => [
      ...prev,
      ...restorable.filter((p) => !prev.some((x) => x.productId === p.productId)),
    ]);
    showFlash(`Restored ${restoredIds.length} item${restoredIds.length > 1 ? 's' : ''} to your store`);

    // Best effort: also re-link them on the backend.
    try {
      const allIds = Array.from(new Set([...supplierProducts.map((p) => p.productId), ...restoredIds]));
      await mapProductsToSupplierApi(supplierId, allIds);
    } catch (err) {
      describeApiError('Error re-linking restored products', err);
    }
  };

  const selectedCategoryName = selectedCategoryObj?.name ?? '';

  const handleBackToHome = () => {
    router.push('/(supplier)/(tabs)/dashboard');
  };

  const businessInfoFormValues: BusinessInfoFormValues = {
    name: business?.name ?? '',
    address: business?.address ?? '',
    contactNumber: business?.contactNumber ?? '',
    city: business?.city ?? '',
    pincode: business?.pincode ?? '',
  };

  return (
    <View className="flex-1 bg-white pt-10">
      {/* ------------------------------------------------------------- */}
      {/* Top Bar                                                       */}
      {/* ------------------------------------------------------------- */}
      <View className="flex-row items-center px-4 pb-2">
        <TouchableOpacity
          onPress={handleBackToHome}
          className="p-1 -ml-1 mr-1"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.primaryDefault} />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900">Store</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ------------------------------------------------------------- */}
        {/* Header Section / Business Info                                */}
        {/* ------------------------------------------------------------- */}
        <View className="px-4 py-3 bg-gray-50 border-b border-gray-100">
          <Text className="text-xs text-gray-500 font-medium mb-1">Business Information</Text>

          <View className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
            {resolvingId || businessLoading ? (
              <ActivityIndicator size="small" color={COLORS.primaryDefault} className="my-6" />
            ) : businessError || !business ? (
              <View className="items-center py-4">
                <Text className="text-xs text-red-500 text-center">
                  {businessError ?? 'No business information available.'}
                </Text>
                <TouchableOpacity
                  onPress={retryAll}
                  style={{ borderColor: COLORS.primaryDefault }}
                  className="border rounded-lg px-4 py-1.5 mt-3"
                >
                  <Text style={{ color: COLORS.primaryDefault }} className="text-xs font-semibold">
                    Retry
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View className="flex-row items-start justify-between">
                  <View className="flex-row items-start flex-1">
                    <SafeImage uri={business.profilePicture} className="w-14 h-14 rounded-full" />
                    <View className="ml-3 flex-1">
                      <Text className="text-base font-bold text-gray-900">{business.name}</Text>
                      {!!owner?.fullName && (
                        <Text className="text-xs text-gray-500">{owner.fullName}</Text>
                      )}
                      {!!businessCategoryNames && (
                        <Text className="text-xs text-gray-400">Category: {businessCategoryNames}</Text>
                      )}

                      {!!business.contactNumber && (
                        <View className="flex-row items-center mt-1">
                          <Ionicons name="call-outline" size={12} color="#6B7280" />
                          <Text className="text-[11px] text-gray-500 ml-1">{business.contactNumber}</Text>
                        </View>
                      )}

                      <View className="flex-row items-center mt-0.5">
                        <Ionicons name="location-outline" size={12} color="#6B7280" />
                        <Text className="text-[11px] text-gray-500 ml-1 flex-1">
                          {[business.address, business.city, business.pincode]
                            .filter(Boolean)
                            .join(', ')}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity onPress={() => setIsEditBusinessVisible(true)}>
                    <Text style={{ color: COLORS.primaryDefault }} className="font-semibold text-xs">
                      Edit
                    </Text>
                  </TouchableOpacity>
                </View>

                <View className="mt-3 pt-2 border-t border-gray-100 flex-row justify-end items-center">
                  <TouchableOpacity
                    style={{ backgroundColor: COLORS.primaryDefault }}
                    className="rounded-xl px-7 py-2.5 items-center justify-center"
                    onPress={handleMakeCall}
                  >
                    <Ionicons name="call-outline" size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>

          {/* Store address — the business address from the backend */}
          {!!business && (
            <>
              <View className="flex-row items-center justify-between mt-3 px-1">
                <View className="flex-row items-center flex-1 pr-2">
                  <View
                    style={{ borderStyle: 'dashed', borderWidth: 0.5 }}
                    className="border-gray-400 rounded-full px-2.5 py-0.5 mr-2"
                  >
                    <Text className="text-xs text-gray-500">Store 1</Text>
                  </View>
                  <Text className="text-xs text-gray-800 font-medium flex-1" numberOfLines={2}>
                    {[business.address, business.city, business.pincode].filter(Boolean).join(', ')}
                  </Text>
                </View>
                {/* The backend keeps ONE address per business, so "Change" edits it */}
                <TouchableOpacity onPress={() => setIsEditBusinessVisible(true)}>
                  <Text style={{ color: COLORS.primaryDefault }} className="text-xs font-semibold">
                    Change
                  </Text>
                </TouchableOpacity>
              </View>
              <View className="h-px bg-gray-200 mt-3" />
            </>
          )}

          {/* Store Activity — live from the account's `active` flag; the switch saves it */}
          <View className="flex-row items-center justify-between mt-3 px-1">
            <Text className="text-sm font-bold text-gray-900">Store Activity</Text>
            <View className="items-end">
              <Switch
                value={!!owner?.active}
                onValueChange={handleToggleStoreActive}
                disabled={!owner || togglingActive}
                trackColor={{ false: '#E5E7EB', true: COLORS.primary100 }}
                thumbColor={owner?.active ? COLORS.primaryDefault : '#D1D5DB'}
              />
              <Text className="text-[10px] text-gray-500 mt-0.5">
                {togglingActive ? 'Updating…' : owner ? (owner.active ? 'Active' : 'Inactive') : '—'}
              </Text>
            </View>
          </View>

          {/* Tabs: Product Listing vs Ratings */}
          <View className="flex-row bg-gray-200/70 p-1 rounded-xl mt-3">
            <TouchableOpacity
              className={`flex-1 py-2 rounded-lg items-center ${
                activeTab === 'product' ? 'bg-white shadow-sm' : ''
              }`}
              onPress={() => setActiveTab('product')}
            >
              <Text
                className={`text-xs font-semibold ${
                  activeTab === 'product' ? 'text-gray-900' : 'text-gray-500'
                }`}
              >
                Product listing
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-1 py-2 rounded-lg items-center ${
                activeTab === 'ratings' ? 'bg-white shadow-sm' : ''
              }`}
              onPress={() => setActiveTab('ratings')}
            >
              <Text
                style={{ color: activeTab === 'ratings' ? COLORS.primaryDefault : '#6B7280' }}
                className="text-xs font-semibold"
              >
                Ratings
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ------------------------------------------------------------- */}
        {/* Main Product / Category Section                               */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'ratings' ? (
          <RatingsView supplierId={supplierId} products={supplierProducts} />
        ) : (
          <View className="flex-row flex-1 min-h-[500px]">
            {/* Left Category Sidebar — this business's categories */}
            {isSidebarOpen && (
              <View className="w-24 bg-gray-50/50 border-r border-gray-200/60 p-2 items-center">
                <TouchableOpacity
                  className="w-full items-end pb-2"
                  onPress={() => setIsSidebarOpen(false)}
                >
                  <View style={{ backgroundColor: COLORS.primary100 }} className="p-1 rounded-md">
                    <Ionicons name="chevron-back" size={16} color={COLORS.primaryDefault} />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={openAddCategory}
                  style={{
                    backgroundColor: COLORS.primary100,
                    borderColor: COLORS.primaryDefault,
                    borderStyle: 'dashed',
                    borderWidth: 0.5,
                  }}
                  className="border border-0.5 rounded-xl p-2 items-center justify-center w-full mb-4 h-16"
                >
                  <Ionicons name="add-circle-outline" size={20} color={COLORS.primaryDefault} />
                  <Text
                    style={{ color: COLORS.primaryDefault }}
                    className="text-[10px] text-center font-medium mt-1"
                  >
                    Add category
                  </Text>
                </TouchableOpacity>

                {resolvingId || catalogLoading ? (
                  <ActivityIndicator size="small" color={COLORS.primaryDefault} className="mt-4" />
                ) : (
                  categories.map((cat) => {
                    const isActive = selectedCategoryId === cat.id;
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        className="items-center my-2 w-full relative py-1"
                        onPress={() => handleSelectCategory(cat.id)}
                      >
                        {isActive && (
                          <View
                            style={{ backgroundColor: COLORS.primaryDefault }}
                            className="absolute right-0 top-0 bottom-0 w-1 rounded-l-md"
                          />
                        )}
                        <MaterialCommunityIcons
                          name={iconForCategory(cat.name)}
                          size={26}
                          color="#374151"
                        />
                        <Text
                          className={`text-[11px] mt-1 text-center font-medium ${
                            isActive ? 'text-gray-900 font-bold' : 'text-gray-600'
                          }`}
                        >
                          {cat.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })
                )}
              </View>
            )}

            {/* Right Product Grid Area */}
            <View className="flex-1 p-3">
              {/* Category Header & Top Delete Trigger */}
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                  {!isSidebarOpen && (
                    <TouchableOpacity
                      onPress={() => setIsSidebarOpen(true)}
                      style={{ backgroundColor: COLORS.primary100 }}
                      className="p-1 rounded-md mr-2"
                    >
                      <Ionicons name="chevron-forward" size={16} color={COLORS.primaryDefault} />
                    </TouchableOpacity>
                  )}
                  <Text className="text-lg font-bold text-gray-900">
                    {selectedCategoryName || 'Products'}
                  </Text>
                </View>

                <TouchableOpacity className="items-center" onPress={toggleSelectMode}>
                  <Feather
                    name="trash-2"
                    size={18}
                    color={isSelectMode ? COLORS.primaryDefault : '#374151'}
                  />
                  <Text
                    style={{ color: isSelectMode ? COLORS.primaryDefault : '#6B7280' }}
                    className="text-[10px] font-medium"
                  >
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Subcategory Filter Pills — this business's subcategories of the selected category */}
              {visibleSubCategories.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="-mx-1"
                  style={{ flexGrow: 0, marginBottom: 12 }}
                  contentContainerStyle={{ paddingHorizontal: 4, alignItems: 'flex-start' }}
                >
                  <TouchableOpacity
                    onPress={() => setSelectedSubCategoryId(null)}
                    style={{
                      backgroundColor:
                        selectedSubCategoryId === null ? COLORS.primaryDefault : 'transparent',
                      borderColor: COLORS.primaryDefault,
                      alignSelf: 'flex-start',
                    }}
                    className="border rounded-full px-4 py-1.5 mx-1"
                  >
                    <Text
                      style={{
                        color: selectedSubCategoryId === null ? '#FFFFFF' : COLORS.primaryDefault,
                      }}
                      className="text-xs font-semibold"
                    >
                      All
                    </Text>
                  </TouchableOpacity>

                  {visibleSubCategories.map((sub) => {
                    const active = selectedSubCategoryId === sub.id;
                    return (
                      <View
                        key={sub.id}
                        style={{
                          backgroundColor: active ? COLORS.primaryDefault : 'transparent',
                          borderColor: COLORS.primaryDefault,
                          alignSelf: 'flex-start',
                        }}
                        className="border rounded-full pl-4 pr-1.5 py-1.5 mx-1 flex-row items-center"
                      >
                        <TouchableOpacity onPress={() => setSelectedSubCategoryId(sub.id)}>
                          <Text
                            style={{ color: active ? '#FFFFFF' : COLORS.primaryDefault }}
                            className="text-xs font-semibold"
                          >
                            {sub.name}
                          </Text>
                        </TouchableOpacity>
                        {/* Removes this subcategory pill from your store (not from the catalog) */}
                        <TouchableOpacity
                          onPress={() => handleDeleteSubCategory(idsOf(sub), sub.name)}
                          hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
                          className="ml-1.5"
                        >
                          <Ionicons
                            name="close-circle"
                            size={14}
                            color={active ? '#FFFFFF' : '#9CA3AF'}
                          />
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </ScrollView>
              )}

              {/* Items in this store's subcategories that are missing from the list */}
              {restorable.length > 0 && (
                <View className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
                  <Text className="text-xs text-amber-900">
                    {restorable.length} item{restorable.length > 1 ? 's' : ''} in your subcategories{' '}
                    {restorable.length > 1 ? 'are' : 'is'} missing from your store:{' '}
                    {restorable
                      .slice(0, 4)
                      .map((p) => p.name)
                      .join(', ')}
                    {restorable.length > 4 ? '…' : ''}
                  </Text>
                  <TouchableOpacity
                    onPress={handleRestoreItems}
                    style={{ borderColor: COLORS.primaryDefault }}
                    className="self-start border rounded-lg px-3 py-1 mt-2"
                  >
                    <Text style={{ color: COLORS.primaryDefault }} className="text-xs font-semibold">
                      Restore
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Confirmation after adding an item */}
              {!!flash && (
                <View style={{ backgroundColor: COLORS.primary100 }} className="rounded-lg px-3 py-2 mb-3">
                  <Text style={{ color: COLORS.primary900 }} className="text-xs font-medium">
                    ✓ {flash}
                  </Text>
                </View>
              )}

              {/* Add New Items Box */}
              <TouchableOpacity
                onPress={() => {
                  if (!selectedCategoryObj) {
                    notify('No category selected', 'Add or select a category first.');
                    return;
                  }
                  setIsAddItemVisible(true);
                }}
                style={{
                  backgroundColor: COLORS.primary100,
                  borderColor: COLORS.primaryDefault,
                  borderStyle: 'dashed',
                  borderWidth: 0.5,
                  borderRadius: 8,
                }}
                className="py-2.5 flex-row justify-center items-center mb-4"
              >
                <Ionicons name="add-circle-outline" size={18} color={COLORS.primaryDefault} />
                <Text style={{ color: COLORS.primaryDefault }} className="text-xs font-semibold ml-1.5">
                  Add new Items
                </Text>
              </TouchableOpacity>

              {/* Loader / Error / Empty / Grid */}
              {resolvingId || catalogLoading ? (
                <ActivityIndicator size="large" color={COLORS.primaryDefault} className="mt-10" />
              ) : catalogError ? (
                <View className="items-center mt-10 px-4">
                  <Text className="text-xs text-red-500 text-center">{catalogError}</Text>
                  <TouchableOpacity
                    onPress={retryAll}
                    style={{ borderColor: COLORS.primaryDefault }}
                    className="border rounded-lg px-4 py-1.5 mt-3"
                  >
                    <Text style={{ color: COLORS.primaryDefault }} className="text-xs font-semibold">
                      Retry
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : visibleProducts.length === 0 ? (
                <Text className="text-xs text-gray-400 text-center mt-10">
                  {categories.length === 0
                    ? 'No categories yet. Tap "Add category" to get started.'
                    : selectedSubCategoryId
                    ? 'No products in this subcategory yet.'
                    : 'No products in this category yet.'}
                </Text>
              ) : (
                <View className="flex-row flex-wrap justify-between">
                  {visibleProducts.map((item) => {
                    const isSelected = selectedProducts.includes(item.productId);
                    return (
                      <View
                        key={item.productId}
                        className="w-[48%] bg-white border border-gray-100 rounded-2xl p-2 mb-5 relative overflow-visible shadow-sm pb-4"
                      >
                        <View className="relative bg-purple-50/30 rounded-xl p-2 items-center">
                          <SafeImage uri={item.imageUrl} className="w-20 h-20 rounded-lg" />

                          {/* Selection Checkbox */}
                          {isSelectMode && (
                            <TouchableOpacity
                              className="absolute top-1 right-1 p-1"
                              onPress={() => toggleSelectProduct(item.productId)}
                              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                              <Ionicons
                                name={isSelected ? 'checkbox' : 'square-outline'}
                                size={20}
                                color={isSelected ? COLORS.primaryDefault : '#9CA3AF'}
                              />
                            </TouchableOpacity>
                          )}

                          {/* Min Quantity Tag */}
                          <View className="bg-indigo-100/80 px-2 py-0.5 rounded mt-2">
                            <Text className="text-[9px] text-indigo-900 font-medium">
                              Min quantity: {formatMinQuantity(item)}
                            </Text>
                          </View>
                        </View>

                        <Text className="font-bold text-gray-900 mt-2 text-xs uppercase">
                          {item.name}
                        </Text>
                        <Text className="text-[10px] text-gray-400" numberOfLines={1}>
                          {item.description || ' '}
                        </Text>

                        <View className="flex-row items-baseline mt-1 mb-2">
                          <Text className="font-bold text-xs text-gray-900">
                            {formatPricePerUnit(item)}
                          </Text>
                        </View>

                        {/* Floating Edit Button — opens the pre-filled Edit Item popup */}
                        <TouchableOpacity
                          onPress={() => handleOpenEditItem(item)}
                          style={{
                            borderColor: COLORS.primaryDefault,
                            borderWidth: 1,
                            backgroundColor: '#F2FBF3',
                          }}
                          className="absolute -bottom-3 self-center px-4 py-0.5 rounded-lg items-center justify-center shadow-xs"
                        >
                          <Text style={{ color: COLORS.primaryDefault }} className="text-xs font-medium">
                            Edit
                          </Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Delete Confirmation Floating Bar */}
      {isSelectMode && (
        <View className="absolute bottom-4 left-4 right-4 bg-transparent">
          <View className="bg-gray-100/95 rounded-2xl py-2.5 px-4 shadow-lg border border-gray-200/50 flex-row items-center justify-between">
            <TouchableOpacity
              className="flex-1 items-center justify-center py-2"
              onPress={toggleSelectMode}
              disabled={deleting}
            >
              <Text className="text-gray-700 font-semibold text-xs tracking-wider">CANCEL</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                backgroundColor: selectedProducts.length > 0 ? COLORS.primaryDefault : '#9CA3AF',
              }}
              className="flex-1 py-2.5 rounded-xl flex-row items-center justify-center ml-3"
              onPress={handleDeleteSelected}
              disabled={deleting || selectedProducts.length === 0}
            >
              {deleting && <ActivityIndicator size="small" color="#FFFFFF" className="mr-2" />}
              <Text className="text-white font-semibold text-xs">
                {selectedProducts.length > 0
                  ? `Delete ${selectedProducts.length} item${selectedProducts.length > 1 ? 's' : ''}`
                  : 'Delete'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ------------------------------------------------------------- */}
      {/* Modals                                                        */}
      {/* ------------------------------------------------------------- */}
      <EditBusinessModal
        visible={isEditBusinessVisible}
        initialValues={businessInfoFormValues}
        saving={savingBusinessInfo}
        onClose={() => setIsEditBusinessVisible(false)}
        onSubmit={handleSaveBusinessInfo}
      />

      <AddCategoryModal
        visible={isAddCategoryVisible}
        catalog={sharedCatalog}
        catalogLoading={sharedCatalogLoading}
        linkedCategoryIds={categories.flatMap((c) => idsOf(c))}
        linkedSubCategoryIds={categories.flatMap((c) => c.subCategories.flatMap((sc) => idsOf(sc)))}
        saving={savingCategory}
        onClose={() => setIsAddCategoryVisible(false)}
        onLink={handleLinkCategory}
        onCreate={handleCreateCategory}
        onDelete={handleDeleteCategory}
        onDeleteSubCategory={handleDeleteSubCategory}
      />

      <AddItemModal
        visible={isAddItemVisible}
        saving={creatingProduct}
        category={selectedCategoryObj}
        subCategories={visibleSubCategories}
        defaultSubCategoryId={selectedSubCategoryId}
        onClose={() => setIsAddItemVisible(false)}
        onSubmit={handleCreateProduct}
      />

      <EditItemModal
        visible={isEditItemVisible}
        saving={savingProductEdit}
        product={editingProduct}
        categories={categories}
        onClose={handleCloseEditItem}
        onSubmit={handleSaveProductEdit}
      />
    </View>
  );
}
