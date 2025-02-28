import React, { useEffect, useState } from 'react';
import { 
  View, Text, Image, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert 
} from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';
import { BASE_URL } from '../../constants/config';

const ProductDetailScreen = ({ route, navigation }) => {
  // Nhận productPath từ route.params
  const { productPath } = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFullDetail, setShowFullDetail] = useState(false);
  const DETAIL_LIMIT = 200; // Giới hạn ký tự hiển thị ban đầu

  useEffect(() => {
    fetchProductDetail();
  }, []);

  const fetchProductDetail = async () => {
    try {
      // Gọi API với productPath
      const response = await axios.get(`${BASE_URL}/api/v1/product/detail/${productPath}`);
      setProduct(response.data.product);
    } catch (error) {
      console.error('Error fetching product details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrder = () => {
    // Ví dụ đặt hàng: hiện thông báo đặt hàng thành công
    Alert.alert('Đặt hàng', 'Sản phẩm đã được thêm vào giỏ hàng');
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#000" style={styles.loader} />;
  }

  if (!product) {
    return <Text style={styles.errorText}>Không tìm thấy sản phẩm</Text>;
  }

  // Xử lý hiển thị chi tiết: nếu quá dài thì hiển thị giới hạn ban đầu
  const detailText = product.detail;
  const shouldTruncate = detailText.length > DETAIL_LIMIT;
  const displayedDetail = showFullDetail || !shouldTruncate 
    ? detailText 
    : detailText.substring(0, DETAIL_LIMIT) + '...';

  return (
    <View style={styles.screenContainer}>
      {/* Nút Back luôn hiển thị */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>
      <ScrollView style={styles.container}>
        <Image source={{ uri: product.image_url }} style={styles.productImage} />
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product.name}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.productPrice}>
              {typeof product.price === 'number' 
                ? product.price.toLocaleString('vi-VN') 
                : product.price} đ
            </Text>
            <TouchableOpacity style={styles.orderButtonInline} onPress={handleOrder}>
              <Text style={styles.orderButtonTextInline}>Đặt hàng</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.stockText}>Còn hàng: {product.stock}</Text>
          {/* Sử dụng Markdown để hiển thị nội dung detail */}
          <Markdown style={markdownStyles}>
            {displayedDetail}
          </Markdown>
          {shouldTruncate && (
            <TouchableOpacity onPress={() => setShowFullDetail(!showFullDetail)}>
              <Text style={styles.showMoreText}>
                {showFullDetail ? 'Ẩn bớt' : 'Xem thêm'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        {product.product_options && product.product_options.length > 0 && (
          <View style={styles.optionsContainer}>
            <Text style={styles.optionsTitle}>Tùy chọn sản phẩm:</Text>
            {product.product_options.map((option) => (
              <View key={option.id} style={styles.optionItem}>
                <Text style={styles.optionName}>{option.name}</Text>
                <Text style={styles.optionPrice}>
                  {typeof option.price === 'number'
                    ? option.price.toLocaleString('vi-VN')
                    : parseInt(option.price).toLocaleString('vi-VN')
                  } đ
                </Text>
              </View>
            ))}
          </View>
        )}
        {/* Nút đặt hàng ở vị trí cũ (ở cuối trang) */}
        <TouchableOpacity style={styles.orderButton} onPress={handleOrder}>
          <Text style={styles.orderButtonText}>Đặt hàng</Text>
        </TouchableOpacity>
      </ScrollView>
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
    position: 'relative',
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    // Để có đủ không gian cho nút back nằm chồng lên
    marginTop: 50,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 15,
    zIndex: 100, // Đảm bảo nằm trên cùng
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
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
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  productPrice: {
    fontSize: 20,
    color: '#e53935',
    fontWeight: 'bold',
  },
  orderButtonInline: {
    backgroundColor: '#ff5722',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  orderButtonTextInline: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  stockText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  showMoreText: {
    color: '#007bff',
    fontSize: 16,
    marginBottom: 10,
  },
  optionsContainer: {
    padding: 15,
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  optionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
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
  orderButton: {
    backgroundColor: '#ff5722',
    paddingVertical: 16,
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  orderButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
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
});

export default ProductDetailScreen;
