import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, Alert, RefreshControl 
} from 'react-native';
import { BASE_URL } from '../../constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import Header from '../home/Header'; // Đảm bảo đường dẫn chính xác

const CartScreen = ({ navigation }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  const loadCart = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem('authToken');
    if (!token) {
      Alert.alert('Thông báo', 'Bạn cần đăng nhập để xem giỏ hàng');
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(`${BASE_URL}/api/v1/cart`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setCart(data);
      } else {
        Alert.alert('Lỗi', data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Không thể tải giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const updateItemQuantity = async (cartItemId, newQuantity, product_option) => {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) return;
    try {
      const response = await fetch(`${BASE_URL}/api/v1/cart/cart-item/update/${cartItemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          quantity: newQuantity,
          product_option: product_option
        })
      });
      if (response.ok) {
        loadCart();
      } else {
        const data = await response.json();
        Alert.alert('Lỗi', data.message || 'Có lỗi xảy ra khi cập nhật số lượng');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Không thể cập nhật số lượng');
    }
  };

  const handleQuantityChange = (item, newQuantity) => {
    setCart(prevCart => ({
      ...prevCart,
      cart_items: prevCart.cart_items.map(ci =>
        ci.id === item.id ? { ...ci, quantity: newQuantity } : ci
      ),
    }));
    updateItemQuantity(item.id, newQuantity, item.product_option);
  };

  const toggleItemSelection = (id) => {
    setSelectedItems(prev => 
      prev.includes(id)
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (cart && cart.cart_items) {
      if (selectedItems.length === cart.cart_items.length) {
        setSelectedItems([]);
      } else {
        setSelectedItems(cart.cart_items.map(item => item.id));
      }
    }
  };

  const calculateSelectedTotal = () => {
    if (!cart || !cart.cart_items) return 0;
    return cart.cart_items
      .filter(item => selectedItems.includes(item.id))
      .reduce((sum, item) => {
        const effectivePrice = item.product_option && item.product_option.price 
          ? item.product_option.price 
          : item.product.price;
        return sum + effectivePrice * item.quantity;
      }, 0);
  };

  const renderItem = useCallback(({ item }) => {
    const effectivePrice = item.product_option && item.product_option.price 
      ? item.product_option.price 
      : item.product.price;
    
    const isSelected = selectedItems.includes(item.id);
    
    return (
      <View style={styles.itemContainer}>
        <TouchableOpacity onPress={() => toggleItemSelection(item.id)}>
          <Ionicons 
            name={isSelected ? "checkbox-outline" : "square-outline"} 
            size={24} 
            color="#ff5722" 
          />
        </TouchableOpacity>
        <Image 
          source={{ uri: item.product.image_url || "https://via.placeholder.com/150" }} 
          style={styles.itemImage} 
        />
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.product.name}</Text>
          {item.product_option && (
            <Text style={styles.itemOption}>Tùy chọn: {item.product_option.name}</Text>
          )}
          <View style={styles.quantityRow}>
            <TouchableOpacity 
              style={styles.quantityButton} 
              onPress={() => {
                if (item.quantity > 1) {
                  handleQuantityChange(item, item.quantity - 1);
                }
              }}
            >
              <Ionicons name="remove-circle-outline" size={20} color="#ff5722" />
            </TouchableOpacity>
            <Text style={styles.itemQuantity}>{item.quantity}</Text>
            <TouchableOpacity 
              style={styles.quantityButton} 
              onPress={() => handleQuantityChange(item, item.quantity + 1)}
            >
              <Ionicons name="add-circle-outline" size={20} color="#ff5722" />
            </TouchableOpacity>
          </View>
          <Text style={styles.itemPrice}>
            {(effectivePrice * item.quantity).toLocaleString()} đ
          </Text>
        </View>
        <TouchableOpacity onPress={() => handleDeleteItem(item.id)}>
          <Ionicons name="trash-outline" size={24} color="#ff0000" />
        </TouchableOpacity>
      </View>
    );
  }, [selectedItems]);

  const handleDeleteItem = async (cartItemId) => {
    Alert.alert('Xóa sản phẩm', 'Bạn có chắc muốn xóa sản phẩm khỏi giỏ hàng?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Xóa', onPress: async () => {
          const token = await AsyncStorage.getItem('authToken');
          try {
            const response = await fetch(`${BASE_URL}/api/v1/cart/cart-item/delete/${cartItemId}`, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              }
            });
            if (response.ok) {
              loadCart();
            } else {
              const data = await response.json();
              Alert.alert('Lỗi', data.message || 'Có lỗi xảy ra');
            }
          } catch (error) {
            console.error(error);
            Alert.alert('Lỗi', 'Không thể xóa sản phẩm');
          }
      }},
    ]);
  };

  if (loading && !cart) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      {/* Thêm Header vào đầu trang */}
      <Header navigation={navigation} title="Giỏ hàng của bạn" />

      {/* Nội dung trang giỏ hàng */}
      {cart && cart.cart_items && cart.cart_items.length > 0 && (
        <TouchableOpacity style={styles.selectAllButton} onPress={toggleSelectAll}>
          <Text style={styles.selectAllText}>
            {selectedItems.length === cart.cart_items.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
          </Text>
        </TouchableOpacity>
      )}
      {cart && cart.cart_items && cart.cart_items.length > 0 ? (
        <FlatList 
          data={cart.cart_items}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={loadCart} />
          }
        />
      ) : (
        <Text style={styles.emptyText}>Giỏ hàng trống</Text>
      )}
      {selectedItems.length > 0 && (
        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>
            Tổng tiền đã chọn: {calculateSelectedTotal().toLocaleString()} đ
          </Text>
        </View>
      )}
      <TouchableOpacity 
        style={[
          styles.checkoutButton, 
          selectedItems.length === 0 && styles.checkoutButtonDisabled
        ]}
        onPress={() => {
          if (selectedItems.length === 0) {
            Alert.alert('Thông báo', 'Vui lòng chọn sản phẩm để thanh toán');
            return;
          }
          const selectedTotal = calculateSelectedTotal();
          Alert.alert('Thông báo', `Chức năng thanh toán chưa được xây dựng.\nTổng tiền cho sản phẩm đã chọn: ${selectedTotal.toLocaleString()} đ`);
        }}
        disabled={selectedItems.length === 0}
      >
        <Text style={styles.checkoutButtonText}>Thanh toán</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  selectAllButton: {
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  selectAllText: {
    fontSize: 14,
    color: '#007BFF',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemOption: {
    fontSize: 14,
    color: '#555',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  quantityButton: {
    paddingHorizontal: 5,
  },
  itemQuantity: {
    fontSize: 16,
    marginHorizontal: 8,
  },
  itemPrice: {
    fontSize: 16,
    color: '#e53935',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 20,
    fontSize: 16,
    color: '#999',
  },
  totalContainer: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: '#eee',
    marginTop: 10,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'right',
    color: '#e53935',
  },
  checkoutButton: {
    backgroundColor: '#ff5722',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  checkoutButtonDisabled: {
    backgroundColor: '#ccc',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CartScreen;
