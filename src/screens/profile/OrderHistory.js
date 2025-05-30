import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { BASE_URL } from '../../constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OrderHistory = ({navigation}) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredStatus, setFilteredStatus] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = filteredStatus
  ? orders.filter(order => order.status === filteredStatus)
  : orders;

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        console.log('Token không tồn tại, cần đăng nhập');
        return;
      }
      const response = await fetch(`${BASE_URL}/api/v1/order`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        // Sắp xếp đơn hàng theo id giảm dần (mới nhất trước)
        const sortedOrders = data.sort((a, b) => b.id - a.id); 
        setOrders(sortedOrders);
      } else {
        console.error('Lỗi từ server:', data.message);
      }
    } catch (error) {
      console.error('Lỗi khi lấy đơn hàng:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const renderOrderItem = (orderItem) => {
    const effectivePrice =
      orderItem.product_option?.price ?? orderItem.product?.price ?? 0;
    const productPath = orderItem.product?.path;;

    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() =>
          navigation.navigate('ProductDetail', { productPath })
        }
      >
        <Image
          source={{ uri: orderItem.product?.image_url || 'https://via.placeholder.com/150' }}
          style={styles.productImage}
        />
        <View style={styles.orderInfo}>
          <Text style={styles.productName}>
            {orderItem.product?.name || 'Không có tên'}
          </Text>
          <Text style={styles.productQuantity}>
            Số lượng: {orderItem.quantity}
          </Text>
          <Text style={styles.productPrice}>
            {(effectivePrice * orderItem.quantity).toLocaleString('vi-VN')} đ
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đơn hàng đã mua</Text>
      </View>

      <View style={styles.filterContainer}>
      {['PENDING', 'CANCELLED', 'DELIVERING', 'FINISHED'].map(status => (
        <TouchableOpacity
          key={status}
          style={[
            styles.filterButton,
            filteredStatus === status && styles.activeFilterButton
          ]}
          onPress={() => setFilteredStatus(filteredStatus === status ? null : status)}
          >
          <Text style={[
          styles.filterButtonText,
          filteredStatus === status && styles.activeFilterButtonText
          ]}>
            {status}
          </Text>
        </TouchableOpacity>
      ))}
      </View>
      {loading ? (
      <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(order) => order.id.toString()}
          renderItem={({ item: order }) => (
            
          <View style={styles.orderContainer}>
            {/* Hiển thị thông tin đơn hàng */}
            <Text style={styles.orderTitle}>Đơn hàng #{order.id}</Text>
            <Text style={styles.orderStatus}>Trạng thái: {order.status}</Text>
            <Text style={styles.orderTotal}>Tổng tiền: {order.total_amount.toLocaleString('vi-VN')} đ</Text>

            {/* Hiển thị danh sách sản phẩm trong đơn hàng */}
            <FlatList
              data={order.order_items}
              keyExtractor={(orderItem, index) => index.toString()}
              renderItem={({ item: orderItem }) => renderOrderItem(orderItem)}
            />

            {/* Nút xem chi tiết đơn hàng */}
            <TouchableOpacity 
              style={styles.detailButton} 
              onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })} >
              <Text style={styles.detailButtonText}>Xem chi tiết</Text>
            </TouchableOpacity>
          </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },

  // Style cho từng đơn hàng
  orderContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 4,
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  orderStatus: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'red',
    marginBottom: 10,
  },

  // Style cho danh sách sản phẩm trong đơn hàng
  orderCard: {
    flexDirection: 'row',
    backgroundColor: '#fdfdfd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    elevation: 2,
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 6,
    marginRight: 12,
  },
  orderInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 3,
  },
  productOption: {
    fontSize: 14,
    color: '#555',
    marginBottom: 3,
  },
  productQuantity: {
    fontSize: 14,
    color: '#555',
  },
  productPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'red',
    marginTop: 5,
  },

  detailButton: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  detailButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 10,
    marginBottom: 10,
  },
  filterButton: {
    flex: 1,
    backgroundColor: '#e0e0e0',
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    alignItems: 'center',
  },
  filterButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  activeFilterButton: {
    backgroundColor: 'red',
  },
  activeFilterButtonText: {
    color: '#fff',
  },  
});

export default OrderHistory;
