import React, { useState, useRef, useEffect } from 'react';
import { 
  View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Alert, StyleSheet 
} from 'react-native';
import axios from 'axios';
import { useQuery } from 'react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../constants/config';
import Header from '../home/Header';
import { emitter } from '../../utils/eventEmitter';
import ProductInfo from './ProductInfo';
import CommentSection from './CommentSection';
import ReviewsSection from './ReviewsSection';
import { useHasPurchased } from '../../hooks/useHasPurchased';
import { useProductReviews } from '../../hooks/useProductReviews';

axios.defaults.timeout = 10000;

const fetchProductDetail = async (productPath) => {
  const response = await axios.get(`${BASE_URL}/api/v1/product/detail/${productPath}`);
  if (response.status !== 200) {
    throw new Error('Không thể tải chi tiết sản phẩm');
  }
  return response.data.product;
};

const ProductDetailScreen = ({ route, navigation }) => {
  const { productPath } = route.params;
  const [quantity, setQuantity] = useState(1);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFullDetail, setShowFullDetail] = useState(false);
  const [showSticky, setShowSticky] = useState(false);
  const scrollTimeoutRef = useRef(null);

  // Lấy chi tiết sản phẩm
  const { data: product, isLoading, error } = useQuery(
    ['productDetail', productPath],
    () => fetchProductDetail(productPath)
  );

  useEffect(() => {
    if (product && product.product_options && product.product_options.length > 0) {
      setSelectedOption(product.product_options[0]);
    }
  }, [product]);

  // Lấy danh sách orderIds mà trong đó sản phẩm đã được mua
  const { data: orderIds, isLoading: hasPurchasedLoading, error: hasPurchasedError } = useHasPurchased(product ? product.id : null);

  // Lấy danh sách review cho sản phẩm
  const { data: reviews, isLoading: reviewsLoading, error: reviewsError } = useProductReviews(product ? product.id : null);

  const handleScroll = (e) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      setShowSticky(offsetY > 400);
    }, 100);
  };

  const handleOrder = async () => {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) {
      Alert.alert('Thông báo', 'Bạn cần đăng nhập để đặt hàng');
      return;
    }
    try {
      const body = {
        product,
        quantity,
        product_option: selectedOption || {}
      };
      const response = await fetch(`${BASE_URL}/api/v1/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      if (response.ok) {
        Alert.alert('Đặt hàng', 'Sản phẩm đã được thêm vào giỏ hàng');
        emitter.emit('cartUpdated');
      } else {
        const data = await response.json();
        Alert.alert('Lỗi', data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi đặt hàng');
    }
  };

  if (isLoading || hasPurchasedLoading || reviewsLoading) {
    return <ActivityIndicator size="large" color="#000" style={styles.loader} />;
  }
  if (error || !product) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Không tìm thấy sản phẩm</Text>
      </View>
    );
  }
  if (hasPurchasedError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{hasPurchasedError.message}</Text>
      </View>
    );
  }
  if (reviewsError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{reviewsError.message}</Text>
      </View>
    );
  }

  // Tính toán giá hiệu quả: ép kiểu số cho giá sản phẩm và tùy chọn
  const effectivePrice = selectedOption ? Number(selectedOption.price) : Number(product.price);
  const totalPrice = effectivePrice * quantity;

  // Kiểm tra xem người dùng đã bình luận cho đơn hàng (orderIds[0]) hay chưa
  // Giả sử mỗi review có thuộc tính orderId
  const hasReviewed = reviews && reviews.some(review => review.orderId === orderIds[0]);

  return (
    <View style={styles.screenContainer}>
      <Header navigation={navigation} />
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={{ paddingBottom: 140 }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
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
        {/* Nếu người dùng đã mua sản phẩm */}
        {orderIds && orderIds.length > 0 ? (
          <>
            {hasReviewed ? (
              <View style={styles.center}>
                <Text style={styles.infoText}>Bạn đã đánh giá sản phẩm này.</Text>
              </View>
            ) : (
              <CommentSection productId={product.id} orderId={orderIds[0]} />
            )}
            <ReviewsSection reviews={reviews} />
          </>
        ) : (
          <View style={styles.center}>
            <Text style={styles.infoText}>
              Bạn chưa mua sản phẩm này, vì vậy không thể đánh giá.
            </Text>
          </View>
        )}
      </ScrollView>
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
  container: { flex: 1, backgroundColor: '#fff' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  center: { justifyContent: 'center', alignItems: 'center', padding: 20 },
  stickyButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  totalPriceContainer: { flexDirection: 'row', alignItems: 'center' },
  totalPriceLabel: { fontSize: 16, color: '#333', marginRight: 5 },
  totalPriceText: { fontSize: 16, color: '#e53935', fontWeight: 'bold' },
  stickyButton: { backgroundColor: '#ff5722', paddingVertical: 14, paddingHorizontal: 20, borderRadius: 10, alignItems: 'center' },
  stickyButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  infoText: { marginVertical: 20, textAlign: 'center', fontSize: 16, color: '#555' },
  errorText: { fontSize: 18, color: 'red' }
});

export default ProductDetailScreen;
