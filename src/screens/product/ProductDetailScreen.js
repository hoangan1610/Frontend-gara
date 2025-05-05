import React, { useState, useRef, useEffect } from 'react';
import { 
  View, Text, ActivityIndicator, TouchableOpacity, Alert, StyleSheet, FlatList, Image
} from 'react-native';
import axios from 'axios';
import { useQuery } from 'react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../constants/config';
import Header from '../home/Header';
import ProductInfo from './ProductInfo';
import CommentSection from './CommentSection';
import ReviewsSection from './ReviewsSection';
import { useHasPurchased } from '../../hooks/useHasPurchased';
import { useProductReviews } from '../../hooks/useProductReviews';
import { FontAwesome } from '@expo/vector-icons';
import { addToRecentlyViewed } from '../../utils/recentlyViewed';

axios.defaults.timeout = 10000;

const fetchProductDetail = async (productPath) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/v1/product/detail/${productPath}`);
    if (response.status !== 200) throw new Error('Không thể tải chi tiết sản phẩm');
    const product = response.data.product;
    if (!product) throw new Error('Dữ liệu sản phẩm không hợp lệ');
    return product;
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết sản phẩm:', error.message);
    throw new Error('Có lỗi xảy ra khi lấy chi tiết sản phẩm');
  }
};

const ProductDetailScreen = ({ route, navigation }) => {
  const { productPath } = route.params;
  const [quantity, setQuantity] = useState(1);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFullDetail, setShowFullDetail] = useState(false);
  const [showSticky, setShowSticky] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [similarProducts, setSimilarProducts] = useState([]);
  const scrollTimeoutRef = useRef(null);

  const { data: product, isLoading, error } = useQuery(
    ['productDetail', productPath],
    () => fetchProductDetail(productPath),
    { retry: false, staleTime: 1000 * 60 * 5 }
  );

  useEffect(() => {
    if (product?.product_options?.length) {
      setSelectedOption(product.product_options[0]);
    }
  }, [product]);

  const { data: orderIds, isLoading: hasPurchasedLoading, error: hasPurchasedError } =
    useHasPurchased(product?.id, { enabled: !!product });
  const { data: reviews, isLoading: reviewsLoading, error: reviewsError } =
    useProductReviews(product?.id, { enabled: !!product });

  useEffect(() => {
    const checkFollowStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        const response = await fetch(`${BASE_URL}/api/v1/follow`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error(`Lỗi API: ${response.status}`);
        const data = await response.json();
        setIsFavorite(data.products?.some(p => p.product_id === product.id) || false);
      } catch (err) {
        console.error(err);
        setIsFavorite(false);
      }
    };

    const fetchSimilar = async () => {
      try {
        const resp = await fetch(`${BASE_URL}/api/v1/product/similar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product_id: product.id }),
        });
        if (!resp.ok) throw new Error();
        const json = await resp.json();
        setSimilarProducts(json.data || []);
      } catch (err) {
        console.error('Lỗi khi lấy sản phẩm tương tự:', err);
      }
    };

    if (product?.id) {
      checkFollowStatus();
      fetchSimilar();
      addToRecentlyViewed(product);
    }
  }, [product]);

  const toggleFollow = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return Alert.alert('Thông báo', 'Bạn cần đăng nhập để theo dõi sản phẩm');
      const url = isFavorite
        ? `${BASE_URL}/api/v1/follow/unfollow`
        : `${BASE_URL}/api/v1/follow/follow`;
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ product: { id: product.id } }),
      });
      const json = await resp.json();
      if (!resp.ok) return Alert.alert('Lỗi', json.message || 'Có lỗi xảy ra');
      setIsFavorite(!isFavorite);
      Alert.alert('Thông báo', isFavorite ? 'Bạn đã bỏ yêu thích' : 'Thêm vào yêu thích thành công');
      let list = JSON.parse(await AsyncStorage.getItem('followedProducts') || '[]');
      list = isFavorite
        ? list.filter(i => i.id !== product.id)
        : [...list, { id: product.id, name: product.name, image: product.image_url, path: product.path }];
      await AsyncStorage.setItem('followedProducts', JSON.stringify(list));
    } catch (err) {
      console.error(err);
      Alert.alert('Lỗi', 'Có lỗi khi thay đổi trạng thái yêu thích');
    }
  };

  const handleScroll = e => {
    const offsetY = e.nativeEvent.contentOffset.y;
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => setShowSticky(offsetY > 400), 100);
  };

  const handleOrder = async () => {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) return Alert.alert('Thông báo', 'Bạn cần đăng nhập để đặt hàng');
    try {
      const resp = await fetch(`${BASE_URL}/api/v1/cart/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ product, quantity, product_option: selectedOption || {} }),
      });
      if (!resp.ok) throw resp;
      Alert.alert('Đặt hàng', 'Sản phẩm đã được thêm vào giỏ hàng');
    } catch (err) {
      console.error(err);
      Alert.alert('Lỗi', 'Có lỗi khi thêm vào giỏ hàng');
    }
  };

  if (isLoading || hasPurchasedLoading || reviewsLoading) {
    return <ActivityIndicator size="large" color="#000" style={styles.loader} />;
  }
  if (error || !product) {
    return <View style={styles.center}><Text style={styles.errorText}>Không tìm thấy sản phẩm</Text></View>;
  }
  if (hasPurchasedError) {
    return <View style={styles.center}><Text style={styles.errorText}>{hasPurchasedError.message}</Text></View>;
  }
  if (reviewsError) {
    return <View style={styles.center}><Text style={styles.errorText}>{reviewsError.message}</Text></View>;
  }

  const purchasedCount = orderIds?.length || 0;
  const reviewCount = reviews?.length || 0;
  const effectivePrice = Number(selectedOption?.price || product.price);
  const totalPrice = effectivePrice * quantity;

  return (
    <View style={styles.screenContainer}>
      <Header navigation={navigation} />
      <FlatList
        data={[]}
        renderItem={() => null}
        keyExtractor={(item, index) => index.toString()}
        ListHeaderComponent={() => (
          <>
            <ProductInfo
              product={product}
              quantity={quantity}
              setQuantity={setQuantity}
              selectedOption={selectedOption}
              setSelectedOption={setSelectedOption}
              onOrder={handleOrder}
              showFullDetail={showFullDetail}
              setShowFullDetail={setShowFullDetail}
            />
            <TouchableOpacity onPress={toggleFollow} style={styles.followButton}>
              <FontAwesome name={isFavorite ? 'heart' : 'heart-o'} size={24} color={isFavorite ? 'red' : 'orange'} />
              <Text style={styles.followText}>{isFavorite ? 'Bỏ theo dõi' : 'Theo dõi'}</Text>
            </TouchableOpacity>
            <View style={styles.statisticsContainer}>
              <Text style={styles.statisticsText}>Số lượt đã mua: {purchasedCount}</Text>
              <Text style={styles.statisticsText}>Số lượt đã bình luận: {reviewCount}</Text>
            </View>
            {purchasedCount > 0 ? (
              <ReviewsSection reviews={reviews} />
            ) : (
              <View style={styles.center}>
                <Text style={styles.infoText}>
                  Bạn chưa mua sản phẩm này, vì vậy không thể đánh giá.
                </Text>
              </View>
            )}
          </>
        )}
        ListFooterComponent={() => (
          <>
            <Text style={styles.sectionTitle}>Sản phẩm tương tự</Text>
            {similarProducts.length > 0 ? (
              <FlatList
                data={similarProducts}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => navigation.navigate('ProductDetail', { productPath: item.path })}
                  >
                    <View style={styles.productContainer}>
                      <Image source={{ uri: item.image_url }} style={styles.productImage} />
                      <Text style={styles.productName}>{item.name}</Text>
                    </View>
                  </TouchableOpacity>
                )}
                contentContainerStyle={styles.productList}
              />
            ) : (
              <Text style={styles.noProductText}>Không có sản phẩm tương tự</Text>
            )}
          </>
        )}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: 140, backgroundColor: '#fff' }}
      />
      {showSticky && (
        <View style={styles.stickyButtonContainer}>
          <View style={styles.totalPriceContainer}>
            <Text style={styles.totalPriceLabel}>Tổng tiền:</Text>
            <Text style={styles.totalPriceText}>{totalPrice.toLocaleString('vi-VN')} đ</Text>
          </View>
          <TouchableOpacity style={styles.stickyButton} onPress={handleOrder}>
            <Text style={styles.stickyButtonText}>Thêm vào giỏ hàng</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: { flex: 1, backgroundColor: '#fff' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  center: { justifyContent: 'center', alignItems: 'center', padding: 20 },
  followButton: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 5, borderWidth: 2, borderColor: '#FFA500', alignSelf: 'center', marginVertical: 10 },
  followText: { marginLeft: 5, fontSize: 16, color: '#FFA500' },
  statisticsContainer: { marginVertical: 10, padding: 10, borderRadius: 5, marginHorizontal: 10 },
  statisticsText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 10, textAlign: 'center' },
  productList: { paddingVertical: 10 },
  productContainer: { marginHorizontal: 10, alignItems: 'center', justifyContent: 'center', width: 120 },
  productImage: { width: 120, height: 120, borderRadius: 10, marginBottom: 5 },
  productName: { fontSize: 14, textAlign: 'center', width: 120, color: '#333', fontWeight: 'bold' },
  noProductText: { fontSize: 16, color: 'gray', textAlign: 'center', marginVertical: 10 },
  infoText: { marginVertical: 20, textAlign: 'center', fontSize: 16, color: '#555' },
  errorText: { fontSize: 18, color: 'red' },
  stickyButtonContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', padding: 10, borderTopWidth: 1, borderColor: '#eee', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  totalPriceContainer: { flexDirection: 'row', alignItems: 'center' },
  totalPriceLabel: { fontSize: 16, color: '#333', marginRight: 5 },
  totalPriceText: { fontSize: 16, color: '#e53935', fontWeight: 'bold' },
  stickyButton: { backgroundColor: '#ff5722', paddingVertical: 14, paddingHorizontal: 20, borderRadius: 10, alignItems: 'center' },
  stickyButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});

export default ProductDetailScreen;
