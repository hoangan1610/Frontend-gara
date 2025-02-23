import React from 'react';
import { FlatList, TouchableOpacity, Image, Text, StyleSheet, View, ActivityIndicator } from 'react-native';

const BestSellers = ({ bestSellers, loading }) => {
  if (loading) {
    return <ActivityIndicator size="large" color="#000" />;
  }
  
  return (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Sản phẩm bán chạy</Text>
      </View>
      <FlatList
        data={bestSellers}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.productItem}>
            <Image source={{ uri: item.image_url }} style={styles.productImage} />
            <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.productPrice}>{item.price} đ</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.productList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  sectionHeader: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  productList: {
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  productItem: {
    marginRight: 15,
    alignItems: 'center',
    width: 120,
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

export default BestSellers;
