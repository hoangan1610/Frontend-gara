import React, { useEffect, useState } from 'react';
import { FlatList, View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { BASE_URL } from '../../constants/config';

const CategorySection = ({ category }) => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 5; // số sản phẩm mỗi trang

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
  const dataForFlatList = products.length % 2 !== 0
    ? [...products, { id: 'dummy', dummy: true }]
    : products;

  const renderProductItem = ({ item }) => {
    if (item.dummy) {
      // Render view trống để lấp đầy cột
      return <View style={[styles.productItem, { opacity: 0 }]} />;
    }
    return (
      <TouchableOpacity style={styles.productItem}>
        <Image source={{ uri: item.image_url }} style={styles.productImage} />
        <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.productPrice}>{item.price} đ</Text>
      </TouchableOpacity>
    );
  };

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
        numColumns={2} // Hiển thị 2 sản phẩm trên 1 hàng
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
      />
    </View>
  );
};

const styles = StyleSheet.create({
  categorySection: {
    marginVertical: 15,
  },
  categorySectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  viewAll: {
    color: '#007bff',
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  productList: {
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  productItem: {
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginBottom: 5,
  },
  productName: {
    fontSize: 14,
    textAlign: 'center',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#d9534f',
  },
});

export default CategorySection;
