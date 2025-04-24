import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  Alert, 
  StyleSheet, 
  Image, 
  TouchableOpacity 
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from 'react-native-vector-icons/Ionicons';
import { BASE_URL } from '../../constants/config';

const ProductFollowScreen = ({ navigation }) => {
  const [followedProducts, setFollowedProducts] = useState([]);

  useEffect(() => {
    const fetchFollowedProducts = async () => {
      try {
        const followedProductsData = await AsyncStorage.getItem("followedProducts");
        if (followedProductsData) {
          setFollowedProducts(JSON.parse(followedProductsData));
        }
      } catch (error) {
        console.error("Lỗi khi lấy sản phẩm đã follow:", error);
        Alert.alert("Lỗi", "Không thể tải danh sách sản phẩm yêu thích.");
      }
    };

    fetchFollowedProducts();
  }, []);

  // Hàm thực hiện bỏ theo dõi sản phẩm, gọi API unfollow và cập nhật AsyncStorage
  const removeFollowedProduct = async (product) => {
    Alert.alert(
      "Xác nhận",
      "Bạn có chắc chắn muốn bỏ theo dõi sản phẩm này?",
      [
        {
          text: "Hủy",
          style: "cancel"
        },
        {
          text: "Có",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("authToken");
              if (!token) {
                Alert.alert("Thông báo", "Bạn cần đăng nhập để thực hiện chức năng này");
                return;
              }
              // Gọi API unfollow
              const status = `${BASE_URL}/api/v1/follow/unfollow`;
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
                // Cập nhật AsyncStorage và state để loại bỏ sản phẩm khỏi danh sách đã follow
                const updatedProducts = followedProducts.filter(item => item.id !== product.id);
                setFollowedProducts(updatedProducts);
                await AsyncStorage.setItem("followedProducts", JSON.stringify(updatedProducts));
                Alert.alert("Thông báo", "Bạn đã bỏ theo dõi sản phẩm thành công");
              } else {
                Alert.alert("Lỗi", data.message || "Có lỗi xảy ra khi bỏ theo dõi sản phẩm");
              }
            } catch (error) {
              console.error("Lỗi khi bỏ theo dõi sản phẩm:", error);
              Alert.alert("Lỗi", "Không thể bỏ theo dõi sản phẩm.");
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <TouchableOpacity
        style={styles.productTouchArea}
        onPress={() => navigation.navigate('ProductDetail', { productPath: item.path })}
      >
        <Image
          source={{ uri: item.image || "https://via.placeholder.com/150" }}
          style={styles.productImage}
        />
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.unfollowButton}
        onPress={() => removeFollowedProduct(item)}
      >
        <Icon name="trash" size={20} color="red" />
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
  container: { padding: 20, backgroundColor: '#f8f9fa', flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    justifyContent: 'flex-start'
  },
  title: { fontSize: 20, marginHorizontal: 10, fontWeight: 'bold', textAlign: 'center', flex: 1 },
  noProductsText: { textAlign: "center", marginTop: 20, fontSize: 16 },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    justifyContent: 'space-between'
  },
  productTouchArea: { flexDirection: "row", alignItems: "center", flex: 1 },
  productImage: { width: 50, height: 50, marginRight: 10, borderRadius: 5 },
  productInfo: { flex: 1 },
  productName: { fontSize: 16, color: "#333", flexWrap: "wrap" },
  unfollowButton: { padding: 5, marginLeft: 10 }
});

export default ProductFollowScreen;
