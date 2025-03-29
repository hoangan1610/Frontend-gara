import React from 'react';
import { 
  View, Text, ActivityIndicator, StyleSheet, FlatList, Image, TouchableOpacity, TextInput, Alert, ScrollView 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BASE_URL } from '../../constants/config';
import { useUserProfile } from '../../hooks/useUserProfile';
import { KeyboardAvoidingView, Platform } from 'react-native';

const CheckoutScreen = ({ route, navigation }) => {
  const { selectedItems, cart } = route.params;
  const [address, setAddress] = React.useState('');
  const [paymentMethod, setPaymentMethod] = React.useState("COD"); // Mặc định COD

  // Hook lấy thông tin người dùng
  const { profile: userInfo, loading, error, refreshProfile } = useUserProfile();

  React.useEffect(() => {
    if (userInfo && userInfo.address) {
      setAddress(userInfo.address);
    }
  }, [userInfo]);

  const calculateTotal = () => {
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

  const total = calculateTotal();

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }
  if (error) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={styles.errorText}>{error.message}</Text>
        <TouchableOpacity onPress={refreshProfile} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Thanh toán</Text>
    </View>
  );

  const renderItem = ({ item }) => {
    if (!selectedItems.includes(item.id)) return null;
    const effectivePrice = item.product_option && item.product_option.price 
      ? item.product_option.price 
      : item.product.price;
    return (
      <View style={styles.itemContainer}>
        <Image 
          source={{ uri: item.product.image_url || "https://via.placeholder.com/150" }} 
          style={styles.itemImage} 
        />
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.product.name}</Text>
          {item.product_option && (
            <Text style={styles.itemOption}>Tùy chọn: {item.product_option.name}</Text>
          )}
          <Text style={styles.itemQuantity}>Số lượng: {item.quantity}</Text>
          <Text style={styles.itemPrice}>
            {(effectivePrice * item.quantity).toLocaleString()} đ
          </Text>
        </View>
      </View>
    );
  };

  const paymentOptions = [
    { id: "COD", label: "COD" },
    { id: "VNPay", label: "VNPay" },
    { id: "BANK", label: "Ngân hàng" },
  ];

  // Hàm gọi API xóa từng mặt hàng khỏi giỏ hàng theo endpoint đã định nghĩa
  const deleteCartItem = async (cartItemId) => {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) return;
    try {
      const response = await fetch(`${BASE_URL}/api/v1/cart/cart-item/delete/${cartItemId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Có lỗi xảy ra khi xóa sản phẩm khỏi giỏ hàng');
      }
    } catch (error) {
      console.error("Error deleting cart item:", error);
      throw error;
    }
  };

  const handlePlaceOrder = async () => {
    if (!address) {
      Alert.alert('Thông báo', 'Vui lòng nhập địa chỉ giao hàng');
      return;
    }
    // Gửi object product để phía backend truy cập item.product.id,…
    const orderItems = cart.cart_items
      .filter(item => selectedItems.includes(item.id))
      .map(item => ({
        product: item.product,
        quantity: item.quantity,
        product_option: item.product_option || {},
      }));

    const orderData = {
      items: orderItems,
      total: total,
      payment_method: paymentMethod,
      shipping_address: address,
    };

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Thông báo', 'Bạn cần đăng nhập để đặt hàng');
        return;
      }
      const response = await fetch(`${BASE_URL}/api/v1/order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });
      const data = await response.json();
      if (response.ok) {
        // Sau khi đặt hàng thành công, gọi API xóa các mặt hàng đã đặt khỏi giỏ hàng
        for (const item of cart.cart_items) {
          if (selectedItems.includes(item.id)) {
            try {
              await deleteCartItem(item.id);
            } catch (err) {
              console.error("Failed to delete cart item:", item.id, err);
            }
          }
        }
        // Cập nhật AsyncStorage giỏ hàng
        const storedCart = await AsyncStorage.getItem('cart');
        if (storedCart) {
          const currentCart = JSON.parse(storedCart);
          const updatedCartItems = currentCart.cart_items.filter(
            item => !selectedItems.includes(item.id)
          );
          const updatedCart = { ...currentCart, cart_items: updatedCartItems };
          await AsyncStorage.setItem('cart', JSON.stringify(updatedCart));
        }
        Alert.alert('Đặt hàng thành công', 'Đơn hàng của bạn đã được đặt thành công', [
          { text: 'OK', onPress: () => navigation.navigate('Home') }
        ]);
      } else {
        Alert.alert('Lỗi', data.message || 'Có lỗi xảy ra khi đặt hàng');
      }
    } catch (error) {
      console.error("Order placement error", error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi đặt hàng');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={{ flex: 1 }}>
        <FlatList 
          data={cart.cart_items}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
          keyboardShouldPersistTaps="always" 
        />
        {/* Phần form nhập liệu được đặt bên ngoài FlatList */}
        <ScrollView 
          contentContainerStyle={styles.formContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Tổng tiền:</Text>
            <Text style={styles.totalText}>{total.toLocaleString()} đ</Text>
          </View>
          <View style={styles.userInfoContainer}>
            <Text style={styles.sectionTitle}>Thông tin người nhận</Text>
            <Text style={styles.userInfoText}>
              {userInfo 
                ? `${userInfo.first_name || 'Người dùng'} ${userInfo.last_name || ''} - ${userInfo.phone || ''}` 
                : 'Chưa có thông tin người dùng'}
            </Text>
            <Text style={styles.addressLabel}>Địa chỉ giao hàng:</Text>
            {address ? (
              <Text style={styles.addressText}>{address}</Text>
            ) : (
              <Text style={styles.addressText}>Chưa có địa chỉ. Vui lòng nhập địa chỉ giao hàng.</Text>
            )}
            <TextInput 
              style={styles.addressInput}
              placeholder="Nhập địa chỉ giao hàng..."
              value={address}
              onChangeText={setAddress}
            />
          </View>
          <View style={styles.paymentContainer}>
            <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
            {paymentOptions.map(option => (
              <TouchableOpacity 
                key={option.id} 
                style={styles.paymentOption} 
                onPress={() => setPaymentMethod(option.id)}
              >
                <View style={styles.radioCircle}>
                  {paymentMethod === option.id && <View style={styles.selectedRb} />}
                </View>
                <Text style={styles.paymentLabel}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.orderButton} onPress={handlePlaceOrder}>
            <Text style={styles.orderButtonText}>Đặt hàng</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    padding: 15,
    backgroundColor: '#fff'
  },
  screenContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingBottom: 10,
    paddingHorizontal: 15,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemOption: {
    fontSize: 14,
    color: '#555',
  },
  itemQuantity: {
    fontSize: 14,
    marginVertical: 5,
  },
  itemPrice: {
    fontSize: 16,
    color: '#e53935',
    fontWeight: 'bold',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 15,
    borderTopWidth: 1,
    borderColor: '#eee',
    paddingTop: 10,
    paddingHorizontal: 15,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e53935',
  },
  userInfoContainer: {
    marginVertical: 15,
    padding: 15,
    backgroundColor: '#f7f7f7',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  userInfoText: {
    fontSize: 16,
    marginBottom: 5,
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
  },
  addressText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  addressInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  paymentContainer: {
    marginVertical: 15,
    padding: 15,
    backgroundColor: '#f7f7f7',
    borderRadius: 8,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ff5722',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  selectedRb: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ff5722',
  },
  paymentLabel: {
    fontSize: 16,
  },
  orderButton: {
    backgroundColor: '#ff5722',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  orderButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  retryButton: {
    marginTop: 10,
    backgroundColor: '#2563eb',
    padding: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default CheckoutScreen;
