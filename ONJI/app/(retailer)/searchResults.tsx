import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  getSearchResult,
  type ProductSearchResult,
  type SearchType,
  type SupplierSearchResult,
} from '@/lib/api/retailerSearch';

type SearchResult = ProductSearchResult | SupplierSearchResult;

const isProduct = (result: SearchResult): result is ProductSearchResult =>
  'productId' in result;

export default function SearchResultsScreen() {
  const router = useRouter();
  const { searchText, searchedId, type } = useLocalSearchParams<{
    searchText?: string;
    searchedId?: string;
    type?: SearchType;
  }>();
  const [result, setResult] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!searchedId || (type !== 'PRODUCT' && type !== 'SUPPLIER')) {
      setError('This search is missing its selection details.');
      setIsLoading(false);
      return;
    }

    const loadResult = async () => {
      try {
        setIsLoading(true);
        setResult(await getSearchResult(searchedId, type));
      } catch (requestError: any) {
        console.warn('Unable to load search result:', requestError?.message ?? requestError);
        setError('We could not load this result. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadResult();
  }, [searchedId, type]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity accessibilityLabel="Go back" onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Search results</Text>
          <Text style={styles.subtitle} numberOfLines={1}>Results for “{searchText ?? ''}”</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {isLoading && <ActivityIndicator size="large" color="#2E7D32" />}
        {error && <Text style={styles.message}>{error}</Text>}
        {result && isProduct(result) && <ProductCard product={result} />}
        {result && !isProduct(result) && <SupplierCard supplier={result} router={router} />}
      </ScrollView>
    </SafeAreaView>
  );
}

function ProductCard({ product }: { product: ProductSearchResult }) {
  return (
    <View style={styles.card}>
      {product.imageUrl ? <Image source={{ uri: product.imageUrl }} style={styles.image} /> : <Ionicons name="cube-outline" size={52} color="#2E7D32" />}
      <Text style={styles.cardTitle}>{product.name}</Text>
      {!!product.description && <Text style={styles.description}>{product.description}</Text>}
      {typeof product.price === 'number' && <Text style={styles.price}>₹{product.price}</Text>}
      {!!product.unitValue && <Text style={styles.detail}>Unit: {product.unitValue}</Text>}
      {typeof product.stockQuantity === 'number' && <Text style={styles.detail}>Available: {product.stockQuantity}</Text>}
    </View>
  );
}

function SupplierCard({ supplier, router }: { supplier: SupplierSearchResult; router: ReturnType<typeof useRouter> }) {
  return (
    <View style={styles.card}>
      {supplier.profilePicture ? <Image source={{ uri: supplier.profilePicture }} style={styles.image} /> : <Ionicons name="storefront-outline" size={52} color="#2E7D32" />}
      <Text style={styles.cardTitle}>{supplier.name}</Text>
      {!!supplier.address && <Text style={styles.description}>{supplier.address}</Text>}
      {!!supplier.city && <Text style={styles.detail}>{supplier.city}{supplier.pincode ? ` · ${supplier.pincode}` : ''}</Text>}
      {!!supplier.contactNumber && <Text style={styles.detail}>{supplier.contactNumber}</Text>}
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push({ pathname: '/(retailer)/connectScreen', params: { supplierId: supplier.supplierId, businessId: supplier.businessId } })}
      >
        <Text style={styles.buttonText}>View supplier</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 20, backgroundColor: '#FFFFFF' },
  title: { color: '#111827', fontSize: 20, fontWeight: '700' },
  subtitle: { color: '#6B7280', fontSize: 13, marginTop: 2, maxWidth: 280 },
  content: { padding: 16, flexGrow: 1, justifyContent: 'center' },
  card: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 },
  image: { width: 112, height: 112, borderRadius: 12, marginBottom: 18 },
  cardTitle: { color: '#111827', fontSize: 22, fontWeight: '700', textAlign: 'center' },
  description: { color: '#4B5563', fontSize: 15, lineHeight: 22, marginTop: 10, textAlign: 'center' },
  price: { color: '#2E7D32', fontSize: 20, fontWeight: '700', marginTop: 14 },
  detail: { color: '#6B7280', fontSize: 14, marginTop: 8, textAlign: 'center' },
  message: { color: '#6B7280', fontSize: 16, textAlign: 'center' },
  button: { backgroundColor: '#2E7D32', borderRadius: 10, marginTop: 22, paddingHorizontal: 20, paddingVertical: 12 },
  buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
});
