import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Alert, StyleSheet, Image, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from 'react-native-vector-icons/Ionicons';

const ProductFollowScreen = ({ navigation }) => {
  const [followedProducts, setFollowedProducts] = useState([]);

  useEffect(() => {
    const fetchFollowedProducts = async () => {
      try {
        const followedProducts = await AsyncStorage.getItem("followedProducts");
        if (followedProducts) {
          setFollowedProducts(JSON.parse(followedProducts));
        }
      } catch (error) {
        console.error("Lỗi khi lấy sản phẩm đã follow:", error);
        Alert.alert("Lỗi", "Không thể tải danh sách sản phẩm yêu thích.");
      }
    };

    fetchFollowedProducts();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <TouchableOpacity onPress={() =>  navigation.navigate('ProductDetail', { productPath: item.path })}>
        <Image 
          source={{ uri: item.image || "https://via.placeholder.com/150" }} 
          style={styles.productImage} 
        />
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Danh sách sản phẩm yêu thích</Text>
      </View>

      {followedProducts.length === 0 ? (
        <Text style={styles.noProductsText}>Chưa có sản phẩm yêu thích</Text>
      ) : (
        <FlatList
          data={followedProducts}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#f8f9fa' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 20, marginHorizontal: 10, fontWeight: 'bold', textAlign: 'center' },
  noProductsText: { textAlign: "center", marginTop: 20, fontSize: 16, },
  itemContainer: { flexDirection: "row", alignItems: "center", padding: 10, borderBottomWidth: 1, borderBottomColor: "#ddd",},
  productImage: { width: 50, height: 50, marginRight: 10, borderRadius: 5, }, 
  productInfo: { flex: 1, flexDirection: "row", alignItems: "center" },
  productName: { fontSize: 16, color: "#333", flexWrap: "wrap", },
});

export default ProductFollowScreen;
