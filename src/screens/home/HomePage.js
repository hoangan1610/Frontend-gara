import React, { useEffect, useState } from 'react';
import { FlatList, View, StyleSheet, Text, TouchableOpacity, Image, Button } from 'react-native';
import axios from 'axios';
import { BASE_URL } from '../../constants/config';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Header from './Header';
import SlideShow from './SlideShow';
import CategoryList from './CategoryList';
import BestSellers from './BestSellers';
import CategorySection from './CategorySection';
import { getRecentlyViewed } from '../../utils/recentlyViewed';

const HomePage = () => {
  const navigation = useNavigation();
  const [categories, setCategories] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewedProducts, setViewedProducts] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/v1/category`);
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    const fetchBestSellers = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/v1/product/best-sellers`);
        setBestSellers(response.data);
      } catch (error) {
        console.error('Error fetching best sellers:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
    fetchBestSellers();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const fetchViewedProducts = async () => {
        const recent = await getRecentlyViewed();
        setViewedProducts(recent);
      };
      fetchViewedProducts();
    }, [])
  );  

  const renderRecentlyViewed = () => {
    if (!viewedProducts.length) return null;

    return (
      <View style={styles.recentContainer}>
        <View style={styles.sectionHeader}>      
          <Text style={styles.recentTitle}>Sản phẩm đã xem gần đây</Text>
        </View>
        <FlatList
          horizontal
          data={viewedProducts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => navigation.navigate('ProductDetail', { productPath: item.path })}
              style={styles.productCard}
            >
              <Image source={{ uri: item.image }} style={styles.productImage} />
              <Text style={styles.productName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.productPrice}>
                {item.price?.toLocaleString('vi-VN')} đ
              </Text>
            </TouchableOpacity>
          )}
          showsHorizontalScrollIndicator={false}
        />
      </View>
    );
  };

  // Hàm thử nghiệm: Emit thông báo từ client (chỉ là một test)
  const handleTestNotification = () => {
    console.log("Test Notification Triggered!");
    // Thực hiện emit socket hoặc một hành động khác ở đây
  };

  return (
    <View style={styles.container}>
      {/* Header được render bên ngoài FlatList, luôn hiển thị cố định */}
      <Header navigation={navigation} />

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <CategorySection category={item} />}
        ListHeaderComponent={() => (
          <>
            <SlideShow />
            <CategoryList categories={categories} />
            <BestSellers bestSellers={bestSellers} loading={loading} />
            {renderRecentlyViewed()}
            
            {/* Nút Test */}
            <TouchableOpacity
              style={styles.testButton}
              onPress={handleTestNotification}
            >
              <Text style={styles.testButtonText}>Test Thông Báo</Text>
            </TouchableOpacity>
          </>
        )}
        contentContainerStyle={styles.flatListContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  sectionHeader: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#fff',
    marginHorizontal: 10,
    borderRadius: 8,
    // Shadow cho iOS
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Elevation cho Android
    elevation: 2,
    marginBottom: 10,
  },
  
  recentContainer: {
    paddingHorizontal: 10,
    marginTop: 5,
  },
  
  recentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  
  productCard: {
    width: 140,
    height: 200,
    marginRight: 12,
    borderRadius: 10,
    backgroundColor: '#fff',
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  productImage: {
    width: '100%',
    height: 120,
    resizeMode: 'contain',
    borderRadius: 12,
  },
  
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    color: '#333',
    alignSelf: 'center',
  },
  
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
    color: 'red',
    alignSelf: 'center',
  },

  // Nút Test
  testButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
    alignSelf: 'center',
  },

  testButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomePage;
