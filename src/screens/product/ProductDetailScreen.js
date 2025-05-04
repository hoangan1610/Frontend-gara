import React, { useState, useRef, useEffect } from 'react';
import { 
  View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Alert, StyleSheet, FlatList, Image
} from 'react-native';
import axios from 'axios';
import { useQuery } from 'react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../constants/config';
import Header from '../home/Header';
import { emitter } from '../../utils/eventEmitter';
import ProductInfo from './ProductInfo';
import { useHasPurchased } from '../../hooks/useHasPurchased';
import { useProductReviews } from '../../hooks/useProductReviews';
import { FontAwesome } from '@expo/vector-icons';
import { addToRecentlyViewed } from '../../utils/recentlyViewed';

axios.defaults.timeout = 10000;

const fetchProductDetail = async (productPath) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/v1/product/detail/${productPath}`);
  
    if (response.status !== 200) {
      throw new Error('Không thể tải chi tiết sản phẩm');
    }
    const product = response.data.product;
    if (!product) {
      throw new Error('Dữ liệu sản phẩm không hợp lệ');
    }
    
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

  // Lấy chi tiết sản phẩm
  const { data: product, isLoading, error } = useQuery(
    ['productDetail', productPath],
    () => fetchProductDetail(productPath),
    {
      retry: false,
      staleTime: 1000 * 60 * 5, // cache 5 phút
    }
  );

  useEffect(() => {
    if (product && product.product_options && product.product_options.length > 0) {
      setSelectedOption(product.product_options[0]);
    }
  }, [product]);

  // Lấy danh sách orderIds mà trong đó sản phẩm đã được mua
  const { data: orderIds, isLoading: hasPurchasedLoading, error: hasPurchasedError } =
  useHasPurchased(product?.id, { enabled: !!product });

  // Lấy danh sách review cho sản phẩm
  const { data: reviews, isLoading: reviewsLoading, error: reviewsError } =
  useProductReviews(product?.id, { enabled: !!product });

  useEffect(() => {

    //Hàm kiểm tra trạng thái theo dõi
    const checkFollowStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        const response = await fetch(`${BASE_URL}/api/v1/follow`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`Lỗi API: ${response.status}`);
        }
        const data = await response.json();
        if (data && Array.isArray(data.products)) {
          setIsFavorite(data.products.some(item => item.product_id === product.id));
        } else {
          console.error("Dữ liệu không hợp lệ:", data);
          setIsFavorite(false); // Mặc định là chưa follow nếu dữ liệu sai
        }
      } catch (error) {
        console.error("Lỗi khi kiểm tra trạng thái follow:", error);
        setIsFavorite(false); // Đặt mặc định nếu lỗi xảy ra
      }
    };

    // Hàm hiển thị danh sách sản phẩm tương tự
    const fetchSimilarProductsList = async () => {
      if (product && product.id) {
        try {
          const similarProducts = await fetchSimilarProducts(product.id);
          setSimilarProducts(similarProducts);
        } catch (error) {
          console.error("Không thể lấy sản phẩm tương tự:", error);
        }
      }
    }; 

    if (product && product.id) {
      checkFollowStatus();
      fetchSimilarProductsList();
    }
  }, [product]);

  useEffect(() => {
    if (product && typeof product === 'object' && product.id && product.name && product.path) {
      addToRecentlyViewed(product); // Lưu sản phẩm đã xem vào AsyncStorage
    }
  }, [product]);

  const toggleFollow = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Thông báo", "Bạn cần đăng nhập để theo dõi sản phẩm");
        return;
      }
  
      const status = isFavorite ? `${BASE_URL}/api/v1/follow/unfollow` : `${BASE_URL}/api/v1/follow/follow`;
      const response = await fetch(status, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ product: { id: product.id } }),
      });
      const data = await response.json();
  
      if (response.ok) {
        setIsFavorite(!isFavorite);
        const message = isFavorite
          ? "Bạn đã bỏ yêu thích sản phẩm"
          : "Thêm sản phẩm vào mục yêu thích thành công";
        Alert.alert("Thông báo", message);
  
        // Lưu thông tin sản phẩm đã follow vào AsyncStorage
        let followedProducts = await AsyncStorage.getItem("followedProducts");
        followedProducts = followedProducts ? JSON.parse(followedProducts) : [];
  
        if (isFavorite) {
          // Nếu bỏ follow, xóa sản phẩm khỏi danh sách
          followedProducts = followedProducts.filter(item => item.id !== product.id);
        } else {
          // Nếu follow, thêm sản phẩm vào danh sách
          followedProducts.push({ 
            id: product.id,
            name: product.name,
            image: product.image_url || "https://via.placeholder.com/150",
            path: product.path, });
        }
        await AsyncStorage.setItem("followedProducts", JSON.stringify(followedProducts));
        //navigation.navigate("ProductDetail", { productPath: product.path });
  
      } else {
        Alert.alert("Lỗi", data.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Lỗi khi follow/unfollow sản phẩm:", error);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi follow/unfollow");
    }
  };  

  //Hàm lấy sản phẩm tương tự theo danh mục
  const fetchSimilarProducts = async (product_id) => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/product/similar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ product_id }),
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.data || []; 
      } else {
        const data = await response.json();
        throw new Error(data.message || "Có lỗi xảy ra khi lấy sản phẩm tương tự");
      }
    } catch (error) {
      console.error("Lỗi khi gọi API lấy sản phẩm tương tự:", error);
      throw error;
    }
  };
  
  // Lấy số lượng đơn hàng đã mua theo orderIds
  const purchasedCount = orderIds ? orderIds.length : 0;
  // Lấy số lượng bình luận của sản phẩm theo reviews
  const reviewCount = reviews ? reviews.length : 0;

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

        {/* Nút Follow */}
        <TouchableOpacity onPress={toggleFollow} style={styles.followButton}>
          <FontAwesome name={isFavorite ? "heart" : "heart-o"} size={24} color={isFavorite ? "red" : "orange"} />
          <Text style={styles.followText}>{isFavorite ? "Bỏ theo dõi" : "Theo dõi"}</Text>
        </TouchableOpacity>

        <View style={styles.statisticsContainer}>
          <Text style={styles.statisticsText}>Số lượt đã mua: {purchasedCount}</Text>
          <Text style={styles.statisticsText}>Số lượt đã bình luận: {reviewCount}</Text>
        </View>
        
        <Text style={styles.sectionTitle}>Sản phẩm tương tự</Text>
        {similarProducts.length > 0 ? (
          <FlatList
            data={similarProducts}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => navigation.navigate('ProductDetail', { productPath: item.path })} >
              <View style={styles.productContainer}>
                <Image source={{ uri: item.image_url }} style={styles.productImage} />
                <Text style={styles.productName}>{item.name}</Text>
              </View>
              </TouchableOpacity>
            )}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productList}
          />
        ) : (
          <Text style={styles.noProductText}>Không có sản phẩm tương tự</Text>
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
  errorText: { fontSize: 18, color: 'red' },
  followButton: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 5, backgroundColor: 'transparent',  borderWidth: 2, borderColor: '#FFA500', alignSelf: 'center', marginVertical: 10, },
  followText: { marginLeft: 5, fontSize: 16, color: '#FFA500', },
  statisticsContainer: { marginVertical: 10, padding: 10, borderRadius: 5, marginHorizontal: 10, },
  statisticsText: { fontSize: 16, fontWeight: "bold", color: "#333", },
  productList: {paddingVertical: 10, },
  productContainer: { marginHorizontal: 10, alignItems: 'center', justifyContent: 'center', width: 120, },
  productImage: { width: 120, height: 120, borderRadius: 10, marginBottom: 5, },
  productName: { fontSize: 14, textAlign: 'center', width: 120, color: '#333', fontWeight: 'bold', },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginVertical: 10, textAlign: "center", },
  noProductText: { fontSize: 16, color: "gray", textAlign: "center", marginVertical: 10, },
  errorText: { fontSize: 18, color: 'red' }
});

export default ProductDetailScreen;
