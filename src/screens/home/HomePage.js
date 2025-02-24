import React, { useEffect, useState } from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import axios from 'axios';
import { BASE_URL } from '../../constants/config';
import { useNavigation } from '@react-navigation/native';
import Header from './Header';
import SlideShow from './SlideShow';
import CategoryList from './CategoryList';
import BestSellers from './BestSellers';
import CategorySection from './CategorySection';

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
          </>
        )}
        contentContainerStyle={styles.flatListContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  flatListContainer: {
    paddingBottom: 20,
  },
});

export default HomePage;
