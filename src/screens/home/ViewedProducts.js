import { FlatList, TouchableOpacity, Image, Text, StyleSheet, View, ActivityIndicator } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';

const ViewedProducts = ({viewedProducts, loading}) => {
    const navigation = useNavigation();
    
    // Hàm định dạng giá
    const formatPrice = (price) => {
    if (typeof price === 'number') {
      return price.toLocaleString('vi-VN');
    }
    return price;
    };

    const validProducts = viewedProducts.filter(item => item && item.id);

    if (loading) {
        return (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#000" />
          </View>
        );
    }

    if (validProducts.length === 0) {
        return (
          <View style={styles.container}>
            <Text style={styles.noProductsText}>Chưa có sản phẩm đã xem.</Text>
          </View>
        );
      }
    

    return (
        <View style={styles.container}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sản phẩm đã xem</Text>
          </View>
          <FlatList
            data={validProducts}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
            <TouchableOpacity 
            style={styles.productItem}
            onPress={() => navigation.navigate('ProductDetail', { productPath: item.path })}>
                <Image source={{ uri: item.image_url }} style={styles.productImage} />
                <Text style={styles.productName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.productPrice}>{formatPrice(item.price)} đ</Text>
            </TouchableOpacity>
            )}
            contentContainerStyle={styles.productList}
          />
        </View>
    );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    paddingHorizontal: 15,
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  productList: {
    paddingHorizontal: 10,
  },
  productItem: {
    marginRight: 15,
    alignItems: 'center',
    width: 140,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    // Shadow cho iOS
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Elevation cho Android
    elevation: 3,
  },
  productImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginBottom: 10,
    resizeMode: 'cover',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#e53935',
    marginTop: 5,
  },
});

export default ViewedProducts