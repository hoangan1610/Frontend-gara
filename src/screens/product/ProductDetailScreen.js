import React, { useState, useRef, useCallback } from 'react';
import { 
  View, Text, Image, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert 
} from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../constants/config';
import Header from '../home/Header';
import { emitter } from '../../utils/eventEmitter';
import { useQuery } from 'react-query';

// Cài đặt timeout cho axios (ví dụ 10s)
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
  const [showFullDetail, setShowFullDetail] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showSticky, setShowSticky] = useState(false);
  const DETAIL_LIMIT = 200;
  const stickyThreshold = 400;
  const scrollTimeoutRef = useRef(null);

  // Sử dụng React Query để tải chi tiết sản phẩm (React Query sẽ cache dữ liệu theo key ['productDetail', productPath])
  const { data: product, isLoading, error } = useQuery(
    ['productDetail', productPath],
    () => fetchProductDetail(productPath)
  );

  // Khi có product, chọn mặc định option đầu tiên nếu có
  React.useEffect(() => {
    if (product && product.product_options && product.product_options.length > 0) {
      setSelectedOption(product.product_options[0]);
    }
  }, [product]);

  const handleScroll = (e) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      setShowSticky(offsetY > stickyThreshold);
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
        product: product,
        quantity: quantity,
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
        // Phát sự kiện để các Header ở mọi nơi cập nhật số lượng giỏ hàng mới
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

  if (isLoading) {
    return <ActivityIndicator size="large" color="#000" style={styles.loader} />;
  }
  if (error || !product) {
    return <Text style={styles.errorText}>Không tìm thấy sản phẩm</Text>;
  }

  const detailText = product.detail || '';
  const shouldTruncate = detailText.length > DETAIL_LIMIT;
  const displayedDetail = showFullDetail || !shouldTruncate
    ? detailText
    : detailText.substring(0, DETAIL_LIMIT) + '...';
  const effectivePrice = selectedOption && selectedOption.price
    ? selectedOption.price
    : product.price;
  const totalPrice = (typeof effectivePrice === 'number'
    ? effectivePrice * quantity
    : parseFloat(effectivePrice) * quantity) || 0;

  return (
    <View style={styles.screenContainer}>
      <Header navigation={navigation} />
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={{ paddingBottom: 140 }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <Image source={{ uri: product.image_url }} style={styles.productImage} />
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product.name}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.productPrice}>
              {typeof effectivePrice === 'number'
                ? effectivePrice.toLocaleString('vi-VN')
                : effectivePrice} đ
            </Text>
          </View>
          {product.product_options && product.product_options.length > 0 && (
            <View style={styles.optionsSelectionContainer}>
              <Text style={styles.optionsLabel}>Chọn tùy chọn:</Text>
              <View style={styles.optionsContainer}>
                {product.product_options.map((option) => (
                  <TouchableOpacity 
                    key={option.id} 
                    style={[
                      styles.optionButton, 
                      selectedOption && selectedOption.id === option.id && styles.optionButtonSelected
                    ]}
                    onPress={() => setSelectedOption(option)}
                  >
                    <Text style={[
                      styles.optionButtonText, 
                      selectedOption && selectedOption.id === option.id && styles.optionButtonTextSelected
                    ]}>
                      {option.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
          <View style={styles.quantityRow}>
            <Text style={styles.quantityLabel}>Chọn số lượng muốn đặt:</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity 
                style={styles.quantityButton} 
                onPress={() => setQuantity(prev => (prev > 1 ? prev - 1 : 1))}
              >
                <Ionicons name="remove-circle-outline" size={32} color="#ff5722" />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity 
                style={styles.quantityButton} 
                onPress={() => setQuantity(prev => prev + 1)}
              >
                <Ionicons name="add-circle-outline" size={32} color="#ff5722" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.orderRowContainer}>
            <View style={styles.totalPriceContainer}>
              <Text style={styles.totalPriceLabel}>Tổng tiền:</Text>
              <Text style={styles.totalPriceText}>{totalPrice.toLocaleString('vi-VN')} đ</Text>
            </View>
            <TouchableOpacity style={styles.oldButton} onPress={handleOrder}>
              <Text style={styles.oldButtonText}>Thêm vào giỏ hàng</Text>
            </TouchableOpacity>
          </View>
          <Markdown style={markdownStyles}>
            {displayedDetail}
          </Markdown>
          {shouldTruncate && (
            <TouchableOpacity onPress={() => setShowFullDetail(!showFullDetail)}>
              <Text style={styles.showMoreText}>{showFullDetail ? 'Ẩn bớt' : 'Xem thêm'}</Text>
            </TouchableOpacity>
          )}
          {product.product_options && product.product_options.length > 0 && (
            <View style={styles.optionsContainerBottom}>
              <Text style={styles.optionsTitle}>Bảng giá tùy chọn:</Text>
              {product.product_options.map((option) => (
                <View key={option.id} style={styles.optionItem}>
                  <Text style={styles.optionName}>{option.name}</Text>
                  <Text style={styles.optionPrice}>
                    {typeof option.price === 'number'
                      ? option.price.toLocaleString('vi-VN')
                      : parseInt(option.price).toLocaleString('vi-VN')} đ
                  </Text>
                </View>
              ))}
            </View>
          )}
          <Text style={styles.stockText}>Còn hàng: {product.stock}</Text>
        </View>
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

const markdownStyles = {
  heading2: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  heading3: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 6,
  },
  body: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 0,
  },
  productImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  productInfo: {
    padding: 15,
  },
  productName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  productPrice: {
    fontSize: 20,
    color: '#e53935',
    fontWeight: 'bold',
  },
  optionsSelectionContainer: {
    marginVertical: 10,
  },
  optionsLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ff5722',
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  optionButtonSelected: {
    backgroundColor: '#ff5722',
  },
  optionButtonText: {
    fontSize: 16,
    color: '#ff5722',
  },
  optionButtonTextSelected: {
    color: '#fff',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  quantityButton: {
    paddingHorizontal: 5,
  },
  quantityText: {
    fontSize: 20,
    marginHorizontal: 10,
  },
  orderRowContainer: {
    marginVertical: 10,
  },
  totalPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalPriceLabel: {
    fontSize: 16,
    color: '#333',
    marginRight: 5,
  },
  totalPriceText: {
    fontSize: 16,
    color: '#e53935',
    fontWeight: 'bold',
  },
  oldButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#ff5722',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 10,
  },
  oldButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  optionsContainerBottom: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
  },
  optionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  optionName: {
    fontSize: 16,
    color: '#333',
  },
  optionPrice: {
    fontSize: 16,
    color: '#e53935',
    fontWeight: 'bold',
  },
  stockText: {
    fontSize: 16,
    color: '#333',
    marginVertical: 10,
  },
  showMoreText: {
    color: '#007bff',
    fontSize: 16,
    marginBottom: 10,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    textAlign: 'center',
    fontSize: 18,
    color: 'red',
    marginTop: 20,
  },
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
    justifyContent: 'space-between',
  },
  stickyButton: {
    backgroundColor: '#ff5722',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  stickyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ProductDetailScreen;
