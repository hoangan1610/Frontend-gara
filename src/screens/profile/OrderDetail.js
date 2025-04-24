import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, ActivityIndicator, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import { BASE_URL } from '../../constants/config';
import { Picker } from '@react-native-picker/picker';

const OrderDetail = ({ route, navigation }) => {
  const { orderId } = route.params;
  const [orderDetail, setOrderDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedReason, setSelectedReason] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const cancelReasons = [
    "Không nhận được kiện hàng",
    "Không còn nhu cầu",
    "Sản phẩm không khớp với mô tả",
    "Kiện hàng hoặc sản phẩm bị hư hỏng",
    "Sản phẩm bị lỗi hoặc không hoạt động",
    "Gửi sai sản phẩm"
  ];
  
  useEffect(() => {
    if (orderId) {
      fetchOrderDetail(orderId);
  }
  }, [orderId]);

  const fetchOrderDetail = async (orderId) => {
    if (!orderId) {
      console.error("Mã đơn hàng không hợp lệ");
      return;
    }
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        console.log('Token không tồn tại, cần đăng nhập');
        return;
      }
      const response = await fetch(`${BASE_URL}/api/v1/order/${orderId}/items`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setOrderDetail(data);
      } else {
        console.error('Lỗi từ server:', data.message);
      }
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết đơn hàng:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert("Vui lòng đăng nhập để tiếp tục");
        return;
      }
  
      const orderResponse = await fetch(`${BASE_URL}/api/v1/order/${orderId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        console.error('Không thể lấy thông tin đơn hàng:', errorData.message);
        Alert.alert("Không thể lấy thông tin đơn hàng");
        return;
      }
  
      const orderData = await orderResponse.json();
  
      if (!orderData || !orderData.createdAt) {
        console.error("Dữ liệu đơn hàng không hợp lệ:", orderData);
        Alert.alert("Dữ liệu đơn hàng không hợp lệ");
        return;
      }
  
      if (orderData.status === 'CANCELLED') {
        Alert.alert("Thông báo", "Đơn hàng đã được hủy trước đó.");
        return;
      }
      
      if (!isCancelable(orderData.createdAt)) {
        Alert.alert("Không thể hủy đơn hàng sau 30 phút kể từ khi tạo");
        return;
      }

      const cancelResponse = await fetch(`${BASE_URL}/api/v1/order/${orderId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      const cancelData = await cancelResponse.json();
  
      if (cancelResponse.ok) {
        Alert.alert("Đơn hàng đã được hủy thành công");
        await fetchOrderDetail(orderId);
      } else {
        console.error('Lỗi từ server:', cancelData.message);
        Alert.alert("Hủy đơn hàng thất bại:", cancelData.message);
      }
  
    } catch (error) {
      console.error('Lỗi khi hủy đơn hàng:', error);
      Alert.alert("Đã xảy ra lỗi khi hủy đơn hàng");
    }
  };
  
  const handleSendCancelRequest = async () => {
    if (!selectedReason) {
      Alert.alert('Vui lòng chọn lý do hủy đơn hàng.');
      return;
    }
  
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Không tìm thấy token người dùng.');
        return;
      }
  
      const orderResponse = await fetch(`${BASE_URL}/api/v1/order/${orderId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        console.error('Không thể lấy thông tin đơn hàng:', errorData.message);
        Alert.alert("Không thể lấy thông tin đơn hàng");
        return;
      }
  
      const orderData = await orderResponse.json();
  
      if (!orderData || !orderData.createdAt) {
        console.error("Dữ liệu đơn hàng không hợp lệ:", orderData);
        Alert.alert("Dữ liệu đơn hàng không hợp lệ");
        return;
      }
  
      if (orderData.status === 'CANCELLED') {
        Alert.alert("Thông báo", "Đơn hàng đã được hủy trước đó.");
        return;
      }

      if (orderData.cancelRequestStatus === 'PENDING') {
        Alert.alert("Thông báo", "Đơn hàng đã được gửi yêu cầu hủy hàng.");
        return;
      }
  
      if (isCancelable(orderData.createdAt)) {
        Alert.alert('Đơn hàng có thể hủy trực tiếp trong vòng 30 phút, không cần gửi yêu cầu.');
        return;
      }

      const response = await fetch(`${BASE_URL}/api/v1/order/${orderId}/request-cancel`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId: orderId,
          reason: selectedReason
        })
      });
  
      const data = await response.json();
  
      if (response.ok) {
        Alert.alert('Thành công', data.message);
        setModalVisible(false);
      } else {
        Alert.alert('Thất bại', data.message || 'Đã xảy ra lỗi.');
      }
    } catch (error) {
      console.error('Lỗi gửi yêu cầu hủy:', error);
      Alert.alert('Lỗi', 'Không thể gửi yêu cầu hủy đơn hàng.');
    }
  };

  //Hàm kiểm tra thời gian có thể hủy trực tiếp trong vòng 30 phút
  const isCancelable = (createdAt) => {
    if (!createdAt) {
        console.error("Ngày tạo đơn hàng không hợp lệ");
        return false;
    }

    const orderTime = new Date(createdAt);
    const currentTime = new Date();
    const timeDifferenceInMinutes = (currentTime - orderTime) / 60000;

    return timeDifferenceInMinutes <= 30; 
  };

  const confirmCancelOrder = () => {
    Alert.alert(
      "Xác nhận hủy đơn hàng",
      "Bạn có chắc chắn muốn hủy đơn hàng này?",
      [
        {
          text: "Không",
          onPress: () => console.log("Đã hủy yêu cầu hủy đơn hàng"),
          style: "cancel",
        },
        {
          text: "Có",
          onPress: () => handleCancelOrder(),
        },
      ],
      { cancelable: false }
    );
  };

  const renderOrderItem = ({ item }) => {
    const effectivePrice = item.product_option?.price || item.product?.price || 0;

    return (
      <View style={styles.orderItemCard}>
        {/* Hình ảnh sản phẩm */}
        <Image 
          source={{ uri: item?.product?.image_url || "https://via.placeholder.com/150" }} 
          style={styles.productImage} 
        />

        {/* Thông tin sản phẩm */}
        <View style={styles.orderItemInfo}>
          <Text style={styles.productName}>{item?.product?.name || "Không có tên"}</Text>
          <Text style={styles.productQuantity}>Số lượng: {item.quantity}</Text>
          <Text style={styles.productPrice}>
            {(effectivePrice * item.quantity).toLocaleString('vi-VN')} đ
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
      </View>

      {/* Loading */}
      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 20 }} />
      ) : orderDetail ? (
        <View>
          {/* Hiển thị thông tin đơn hàng */}
          <Text style={styles.orderTitle}>Đơn hàng #{orderDetail.id}</Text>
          <Text style={styles.orderDate}>Ngày đặt hàng: {new Date(orderDetail.createdAt).toLocaleDateString('vi-VN')} </Text>
          <Text style={styles.orderAddress}>Địa chỉ: {orderDetail.info?.shipping_address || "Không có địa chỉ"}</Text>
          <Text style={styles.orderStatus}>Trạng thái: {orderDetail.status}</Text>
          <Text style={styles.paymentMethod}>Phương thức thanh toán: {orderDetail.payment_method || "Không xác định"} </Text>
          <Text style={styles.orderTotal}>Tổng tiền: {orderDetail.total_amount?.toLocaleString('vi-VN')} đ</Text>

          {/* Danh sách sản phẩm trong đơn hàng */}
          <FlatList 
            data={orderDetail.order_items}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderOrderItem}
          />

          <TouchableOpacity style={styles.cancelButton} onPress={confirmCancelOrder}>
            <Text style={styles.cancelButtonText}>Hủy đơn hàng</Text>
          </TouchableOpacity>

          {/* Nút gửi yêu cầu hủy đơn hàng */}
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={() => setModalVisible(true)}>
            <Text style={styles.cancelButtonText}>Gửi yêu cầu hủy đơn hàng</Text>
          </TouchableOpacity>

          {/* Modal chọn lý do hủy đơn hàng */}
          <Modal
            visible={modalVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Chọn lý do hủy đơn hàng</Text>
                <Picker
                  selectedValue={selectedReason}
                  onValueChange={(itemValue) => setSelectedReason(itemValue)}
                >
                  {cancelReasons.map((reason, index) => (
                    <Picker.Item key={index} label={reason} value={reason} />
                  ))}
                </Picker>
                <TouchableOpacity 
                  style={styles.submitButton}
                  onPress={handleSendCancelRequest}
                >
                  <Text style={styles.submitButtonText}>Gửi yêu cầu hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.cancelButton} 
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Đóng</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      ) : (
        <Text style={styles.errorText}>Không tìm thấy đơn hàng</Text>
    )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  backButton: { fontSize: 16, color: '#2563eb' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 16 },
  orderTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  orderDate: { fontSize: 16, color: "#333", marginVertical: 6 },
  orderAddress: { fontSize: 16, color: "#333", marginVertical: 6 },
  paymentMethod: { fontSize: 16, color: "#333", marginVertical: 6 },
  orderStatus: { fontSize: 16, color: "#333", marginVertical: 6 },
  orderTotal: { fontSize: 16, fontWeight: 'bold', marginVertical: 6 },
  orderItemCard: { flexDirection: 'row', marginBottom: 16, marginVertical: 6, padding: 8, borderWidth: 1, borderRadius: 8, borderColor: '#ddd' },
  productImage: { width: 60, height: 60, borderRadius: 8, marginRight: 8 },
  orderItemInfo: { flex: 1 },
  productName: { fontSize: 16, fontWeight: 'bold' },
  productQuantity: { fontSize: 14 },
  productPrice: { fontSize: 14, fontWeight: 'bold', color: 'red' },
  errorText: { fontSize: 16, color: 'red', textAlign: 'center', marginTop: 20 },
  cancelButtonText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  cancelButton: { padding: 12, borderRadius: 20, alignItems: 'center', marginTop: 20, backgroundColor: '#1e90ff', width: '70%', alignSelf: 'center' },
  errorText: { fontSize: 16, color: 'red', textAlign: 'center', marginTop: 20 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContent: { width: '80%', backgroundColor: 'white', padding: 20, borderRadius: 10 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  submitButton: { padding: 10, backgroundColor: '#1e90ff', borderRadius: 20, marginTop: 10, width: '100%', alignItems: 'center' },
  submitButtonText: { color: 'white', fontSize: 16, textAlign: 'center' }
});

export default OrderDetail;
