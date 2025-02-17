import React, { useEffect, useState } from 'react';
import { 
  View, Text, FlatList, Image, StyleSheet, TextInput, TouchableOpacity, Dimensions, ActivityIndicator 
} from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Swiper from 'react-native-swiper';
import { BASE_URL } from '../constants/config';

const HomePage = () => {
  const navigation = useNavigation();
  const [categories, setCategories] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const renderCategoryItem = ({ item }) => (
    <View style={styles.categoryItem}>
      <Image source={{ uri: item.image_url }} style={styles.categoryImage} />
      <Text style={styles.categoryName}>{item.name}</Text>
    </View>
  );

  const renderBestSellerItem = ({ item }) => (
    <TouchableOpacity style={styles.productItem}>
      <Image source={{ uri: item.image_url }} style={styles.productImage} />
      <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.productPrice}>{item.price} đ</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        <TextInput style={styles.searchInput} placeholder="Tìm kiếm..." />

        <TouchableOpacity onPress={() => console.log('Thông báo')}>
          <Icon name="notifications-outline" size={24} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('ProfileScreen')}>
          <Image
            source={{ uri: 'https://via.placeholder.com/40' }}
            style={styles.userAvatar}
          />
        </TouchableOpacity>
      </View>

      {/* Slide Show */}
      <View style={styles.slideShow}>
        <Swiper autoplay height={200} dotStyle={styles.dot} activeDotStyle={styles.activeDot}>
          <Image 
            source={{ uri: 'https://akauto.com.vn/wp-content/uploads/2023/05/phim-cach-nhiet-o-to-bao-ve-suc-khoe.jpg' }}
            style={styles.slideImage}
          />
          <Image 
            source={{ uri: 'https://phukienotobinhduong.com/wp-content/uploads/2022/11/banner-02.jpg' }}
            style={styles.slideImage}
          />
          <Image 
            source={{ uri: 'https://phukiendochoioto.vn/wp-content/uploads/2023/10/Banner-1.png' }}
            style={styles.slideImage}
          />
        </Swiper>
      </View>

      {/* Danh sách category */}
      <FlatList
        data={categories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
      />

      {/* Sản phẩm bán chạy */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Sản phẩm bán chạy</Text>
        <TouchableOpacity onPress={() => console.log('Xem tất cả')}>
          <Text style={styles.viewAll}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#000" />
      ) : (
        <FlatList
          data={bestSellers}
          renderItem={renderBestSellerItem}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.productList}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#fff',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    marginHorizontal: 10,
    height: 35,
  },
  categoryList: {
    paddingHorizontal: 10,
  },
  categoryItem: {
    marginRight: 15,
    alignItems: 'center',
  },
  categoryImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 5,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  slideShow: {
    width: '100%',
    height: 200,
    marginBottom: 10,
  },
  slideImage: {
    width: Dimensions.get('window').width,
    height: 200,
    resizeMode: 'cover',
  },
  dot: {
    backgroundColor: 'rgba(0,0,0,.2)',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
  },
  activeDot: {
    backgroundColor: '#000',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  viewAll: {
    color: '#007bff',
    fontSize: 14,
  },
  productList: {
    paddingHorizontal: 10,
  },
  productItem: {
    marginRight: 15,
    alignItems: 'center',
    width: 120,
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

export default HomePage;
