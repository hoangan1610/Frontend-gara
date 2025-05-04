import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, ActivityIndicator, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import { BASE_URL } from '../../constants/config';
import { Picker } from '@react-native-picker/picker';
import CommentSection from './CommentSection';
import ReviewSection from './ReviewSection';
import { useQuery, useQueryClient } from 'react-query';

// Hàm lấy chi tiết đơn hàng
const fetchOrderDetail = async (orderId) => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) {
      throw new Error('Token không tồn tại, cần đăng nhập');
    }
    // Lấy chi tiết đơn hàng
    const itemsResponse = await fetch(`${BASE_URL}/api/v1/order/${orderId}/items`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    const itemsData = await itemsResponse.json();
    if (!itemsResponse.ok) {
      throw new Error(itemsData.message || 'Lỗi khi lấy chi tiết đơn hàng');
    }
    // Lấy trạng thái đơn hàng
    const statusResponse = await fetch(`${BASE_URL}/api/v1/order/${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    const statusData = await statusResponse.json();
    if (!statusResponse.ok) {
      throw new Error(statusData.message || 'Lỗi khi lấy trạng thái đơn hàng');
    }
    // Lấy trạng thái yêu cầu hủy
    const storedCancelRequest = await AsyncStorage.getItem(`cancelRequest_${orderId}`);
    // Lấy đánh giá sản phẩm
    const productIds = itemsData.order_items
      ?.map((item) => item.product?.id)
      ?.filter(Boolean) || [];
    let reviewsByProductId = {};
    if (productIds.length > 0) {
      const reviewsPromises = productIds.map((id) =>
        fetch(`${BASE_URL}/api/v1/review?productId=${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }).then((res) => res.json())
      );
      const reviewsResponses = await Promise.all(reviewsPromises);
      reviewsByProductId = productIds.reduce((acc, id, index) => {
        acc[id] = reviewsResponses[index].reviews || [];
        return acc;
      }, {});
    }
    // Lấy trạng thái đánh giá
    const ratingStatusPromises = itemsData.order_items?.map((item) =>
      fetch(`${BASE_URL}/api/v1/order/${orderId}/item/${item.id}/rating`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }).then((res) => res.json())
    ) || [];
    const ratingStatuses = await Promise.all(ratingStatusPromises);
    const ratingStatusByItemId = itemsData.order_items?.reduce((acc, item, index) => {
      acc[item.id] = ratingStatuses[index].hasRated || false;
      return acc;
    }, {}) || {};

    return {
      ...itemsData,
      cancelRequestStatus: statusData.cancelRequestStatus,
      storedCancelRequest,
      reviewsByProductId,
      ratingStatusByItemId,
    };
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết đơn hàng:', error.message);
    throw new Error('Có lỗi xảy ra khi lấy chi tiết đơn hàng');
  }
};

const OrderDetail = ({ route, navigation }) => {
  const { orderId } = route.params;
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [selectedReason, setSelectedReason] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [actionDone, setActionDone] = useState(false);
  const [isCancelRequest, setIsCancelRequest] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState(null);

  const cancelReasons = [
    "Không nhận được kiện hàng",
    "Không còn nhu cầu",
    "Sản phẩm không khớp với mô tả",
    "Kiện hàng hoặc sản phẩm bị hư hỏng",
    "Sản phẩm bị lỗi hoặc không hoạt động",
    "Gửi sai sản phẩm"
  ];
  
  // Lấy chi tiết đơn hàng
  const { data: orderDetail, isLoading, error } = useQuery(
    ['orderDetail', orderId],
    () => fetchOrderDetail(orderId),
    {
      retry: false,
      staleTime: 1000 * 60 * 5, // Cache 5 phút
      onSuccess: (data) => {
        setActionDone(
          data.status === 'CANCELLED' ||
            data.cancelRequestStatus === 'PENDING' ||
            data.storedCancelRequest === 'PENDING'
        );
        setIsCancelRequest(
          data.cancelRequestStatus === 'PENDING' ||
            data.storedCancelRequest === 'PENDING'
        );
      },
      onError: () => {
        setReviewsLoading(false);
        setReviewsError('Không thể tải đánh giá');
      },
    }
  );

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
        setActionDone(false);
        return;
      }

      if (orderData.status === 'CANCELLED') {
        Alert.alert("Thông báo", "Đơn hàng đã được hủy trước đó.");
        setActionDone(true);
        return;
      }

      if (!isCancelable(orderData.createdAt)) {
        Alert.alert("Không thể hủy đơn hàng sau 30 phút kể từ khi tạo");
        return;
      }
      setActionDone(true)
      const cancelResponse = await fetch(`${BASE_URL}/api/v1/order/${orderId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const cancelData = await cancelResponse.json();

      if (cancelResponse.ok) {
        Alert.alert("Đơn hàng đã được hủy thành công");
        queryClient.invalidateQueries(['orderDetail', orderId]);
      } else {
        console.error('Lỗi từ server:', cancelData.message);
        Alert.alert("Hủy đơn hàng thất bại", cancelData.message);
        setActionDone(false);
      }

    } catch (error) {
      console.error('Lỗi khi hủy đơn hàng:', error);
      Alert.alert("Đã xảy ra lỗi khi hủy đơn hàng");
      setActionDone(false);
    }
  };
  
  const handleSendCancelRequest = async () => {
    if (!selectedReason) {
      Alert.alert('Thông báo', 'Vui lòng chọn lý do hủy đơn hàng.');
      return;
    }
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Thông báo', 'Không tìm thấy token người dùng.');
        return;
      }

      const orderResponse = await fetch(`${BASE_URL}/api/v1/order/${orderId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!orderResponse.ok) {
        const err = await orderResponse.json();
        Alert.alert('Thông báo', 'Không thể lấy thông tin đơn hàng');
        return;
      }

      const orderData = await orderResponse.json();
      if (!orderData.createdAt) {
        Alert.alert('Thông báo', 'Dữ liệu đơn hàng không hợp lệ');
        return;
      }
      if (orderData.status === 'CANCELLED') {
        Alert.alert('Thông báo', 'Đơn hàng đã được hủy trước đó.');
        setActionDone(true);
        return;
      }
      if (orderData.cancelRequestStatus === 'PENDING') {
        Alert.alert('Thông báo', 'Đơn hàng đã được gửi yêu cầu hủy hàng.');
        setActionDone(true);
        setIsCancelRequest(true);
        return;
      }
      if (isCancelable(orderData.createdAt)) {
        Alert.alert('Thông báo', 'Đơn hàng có thể hủy trực tiếp trong vòng 30 phút, không cần gửi yêu cầu.');
        setActionDone(false);
        return;
      }

      const response = await fetch(`${BASE_URL}/api/v1/order/${orderId}/request-cancel`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, reason: selectedReason })
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Thành công', data.message);
        setActionDone(true);
        setIsCancelRequest(true);
        await AsyncStorage.setItem(`cancelRequest_${orderId}`, 'PENDING');
        setModalVisible(false);
        queryClient.invalidateQueries(['orderDetail', orderId]);
      } else {
        Alert.alert('Thất bại', data.message || 'Đã xảy ra lỗi.');
        setActionDone(false);
        setIsCancelRequest(false);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể gửi yêu cầu hủy đơn hàng.');
      setActionDone(false);
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
    const productPath = item.product?.path || item.productPath;

    return (
      <TouchableOpacity
        style={styles.orderItemCard}
        onPress={() => navigation.navigate('ProductDetail', { productPath })}
      >
        <Image
          source={{ uri: item?.product?.image_url || "https://via.placeholder.com/150" }}
          style={styles.productImage}
        />
        <View style={styles.orderItemInfo}>
          <Text style={styles.productName}>{item?.product?.name || "Không có tên"}</Text>
          <Text style={styles.productQuantity}>Số lượng: {item.quantity}</Text>
          <Text style={styles.productPrice}>
            {(effectivePrice * item.quantity).toLocaleString('vi-VN')} đ
          </Text>
        </View>
      </TouchableOpacity>
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

          {orderDetail.status === 'FINISHED' ? (
            <View style={{ marginVertical: 10 }}>
              {Object.values(orderDetail.ratingStatusByItemId || {}).every((hasRated) => hasRated) ? (
                <View style={styles.center}>
                  <Text style={styles.infoText}>Bạn đã đánh giá đơn hàng này.</Text>
                </View>
              ) : (
                <CommentSection
                  orderId={orderId}
                  orderItems={orderDetail.order_items}
                  onReviewSubmitted={() => {
                    queryClient.invalidateQueries(['orderDetail', orderId]);}}
                />
              )}
              {reviewsLoading ? (
                <ActivityIndicator size="small" color="#2563eb" style={{ marginVertical: 10 }} />
              ) : reviewsError ? (
                <Text style={styles.errorText}>Lỗi khi tải đánh giá: {reviewsError}</Text>
              ) : (
                <ReviewSection reviews={orderDetail.reviewsByProductId} />
              )}
            </View>
          ) : (
            <>
              {isCancelable(orderDetail.createdAt) ? (
                <TouchableOpacity
                  style={[
                    styles.cancelButton,
                    (actionDone || orderDetail.status === 'CANCELLED') && styles.disabledButton,
                  ]}
                  onPress={confirmCancelOrder}
                  disabled={actionDone || orderDetail.status === 'CANCELLED'}
                >
                  <Text style={styles.cancelButtonText}>Hủy đơn hàng</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.cancelButton,
                    (actionDone ||
                      orderDetail.status === 'CANCELLED' ||
                      orderDetail.cancelRequestStatus === 'PENDING') &&
                      styles.disabledButton,
                  ]}
                  onPress={() => setModalVisible(true)}
                  disabled={
                    actionDone ||
                    orderDetail.status === 'CANCELLED' ||
                    orderDetail.cancelRequestStatus === 'PENDING'
                  }
                >
                  <Text style={styles.cancelButtonText}>
                    {isCancelRequest ? 'Chờ xác nhận' : 'Gửi yêu cầu hủy đơn hàng'}
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}

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
  submitButtonText: { color: 'white', fontSize: 16, textAlign: 'center' },
  disabledButton: { backgroundColor: 'gray' },
  center: { justifyContent: 'center', alignItems: 'center', padding: 20 },
  infoText: { marginVertical: 20, textAlign: 'center', fontSize: 16, color: '#555' },
});

export default OrderDetail;
