import React, { useEffect, useState, useCallback } from 'react';
import { FlatList, View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { BASE_URL } from '../../constants/config';
import { useNavigation } from '@react-navigation/native'; // Sử dụng hook useNavigation

// Component riêng để render từng sản phẩm, được bọc bằng React.memo
const ProductItem = React.memo(({ item }) => {
  const navigation = useNavigation(); // Lấy navigation từ hook
  

  if (item.dummy) {
    // Trả về view trống để lấp đầy cột nếu là dummy
    return <View style={[styles.productItem, { opacity: 0 }]} />;
  }
  
  // Hàm định dạng giá: thêm dấu phân cách hàng nghìn nếu price là số
  const formatPrice = (price) => {
    if (typeof price === 'number') {
      return price.toLocaleString('vi-VN');
    }
    return price;
  };

  return (
    <TouchableOpacity 
      style={styles.productItem}
      // Truyền đúng tham số productPath khi điều hướng
      onPress={() => navigation.navigate('ProductDetail', { productPath: item.path })}
    >
      <Image source={{ uri: item.image_url }} style={styles.productImage} />
      <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.productPrice}>{formatPrice(item.price)} đ</Text>
    </TouchableOpacity>
  );
});

const CategorySection = ({ category }) => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 5; // số sản phẩm mỗi trang
  const numColumns = 2;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    if (!hasMore) return;
    try {
      setLoadingMore(true);
      const response = await axios.get(`${BASE_URL}/api/v1/product/search`, {
        params: {
          category_id: category.id,
          page: page,
          limit: pageSize,
        },
      });
      // Giả sử API trả về cấu trúc: { result: { products: [...], total: number } }
      const newProducts = response.data.result.products;
      if (newProducts && newProducts.length > 0) {
        setProducts(prev => [...prev, ...newProducts]);
        setPage(prev => prev + 1);
        if (newProducts.length < pageSize) {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error(`Error fetching products for category ${category.name}:`, error);
    } finally {
      setLoadingMore(false);
    }
  };

  // Nếu số sản phẩm lẻ, thêm phần tử dummy để đảm bảo mỗi hàng có 2 cột
  const dataForFlatList = products.length % numColumns !== 0
    ? [...products, { id: 'dummy', dummy: true }]
    : products;

  // Sử dụng useCallback để memo hóa hàm renderItem
  const renderProductItem = useCallback(({ item }) => <ProductItem item={item} />, []);

  // Giả sử mỗi dòng (row) có chiều cao cố định, ví dụ 200 (có thể điều chỉnh theo thiết kế)
  const ITEM_ROW_HEIGHT = 200;
  const getItemLayout = useCallback((data, index) => ({
    length: ITEM_ROW_HEIGHT,
    offset: ITEM_ROW_HEIGHT * Math.floor(index / numColumns),
    index,
  }), []);

  return (
    <View style={styles.categorySection}>
      <View style={styles.categorySectionHeader}>
        <Text style={styles.sectionTitle}>{category.name}</Text>
        <TouchableOpacity onPress={() => console.log('Xem thêm sản phẩm')}>
          <Text style={styles.viewAll}>Xem thêm</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={dataForFlatList}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={numColumns} // Hiển thị 2 sản phẩm trên 1 hàng
        columnWrapperStyle={styles.row} // Căn chỉnh đều giữa các sản phẩm
        showsVerticalScrollIndicator={false}
        onEndReached={() => {
          if (!loadingMore && hasMore) {
            fetchProducts();
          }
        }}
        onEndReachedThreshold={0.3}
        ListFooterComponent={loadingMore ? <ActivityIndicator size="small" color="#000" /> : null}
        contentContainerStyle={styles.productList}
        removeClippedSubviews={true}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        getItemLayout={getItemLayout}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  categorySection: {
    marginVertical: 15,
    marginHorizontal: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  categorySectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  viewAll: {
    color: '#007bff',
    fontSize: 16,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 10,
  },
  productList: {
    paddingBottom: 10,
  },
  productItem: {
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  productImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginBottom: 10,
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#e53935',
    marginTop: 5,
  },
});

export default CategorySection;
