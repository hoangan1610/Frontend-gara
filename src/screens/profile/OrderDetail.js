import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, ActivityIndicator, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import { Ionicons } from '@expo/vector-icons';
import { BASE_URL } from '../../constants/config';
import { Picker } from '@react-native-picker/picker';
import { TextInput } from 'react-native';

// StarRating component for CommentSection
const StarRating = ({ rating, setRating }) => {
  return (
    <View style={{ flexDirection: 'row', marginVertical: 10 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => setRating(star)}
          style={{ marginRight: 5 }}
        >
          <Icon
            name={rating >= star ? 'star' : 'star-outline'}
            size={30}
            color="#FFD700"
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

// Chỉnh sửa CommentSection
const CommentSection = ({ productId, orderId, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitReview = async () => {
    if (!rating) {
      Alert.alert('Thông báo', 'Vui lòng chọn số sao đánh giá.');
      return;
    }
    if (!comment.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập bình luận.');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Thông báo', 'Vui lòng đăng nhập để đánh giá.');
        return;
      }

      const response = await fetch(`${BASE_URL}/api/v1/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId,
          rating,
          comment,
          orderId,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        const pointsMessage = data.newLoyaltyPoints
          ? ` Bạn đã nhận được ${data.newLoyaltyPoints} điểm thưởng!`
          : '';
        Alert.alert('Thành công', `Đánh giá của bạn đã được gửi.${pointsMessage}`);
        setRating(0);
        setComment('');
        if (onReviewSubmitted) {
          onReviewSubmitted();
        }
      } else {
        Alert.alert('Lỗi', data.message || 'Không thể gửi đánh giá.');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi gửi đánh giá.');
      console.error('Lỗi gửi đánh giá:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={{ padding: 10, borderTopWidth: 1, borderTopColor: '#e0e0e0' }}>
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
        Đánh giá sản phẩm
      </Text>
      <StarRating rating={rating} setRating={setRating} />
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 5,
          padding: 10,
          minHeight: 80,
          marginBottom: 10,
        }}
        placeholder="Nhập bình luận của bạn..."
        value={comment}
        onChangeText={setComment}
        multiline
      />
      <TouchableOpacity
        style={{
          backgroundColor: isSubmitting ? '#ccc' : '#2563eb',
          padding: 10,
          borderRadius: 5,
          alignItems: 'center',
        }}
        onPress={handleSubmitReview}
        disabled={isSubmitting}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>
          {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const OrderDetail = ({ route, navigation }) => {
  const { orderId } = route.params;
  const [orderDetail, setOrderDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedReason, setSelectedReason] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [actionDone, setActionDone] = useState(false);
  const [isCancelRequest, setIsCancelRequest] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [hasReviewed, setHasReviewed] = useState(false); // State để kiểm tra người dùng đã đánh giá chưa

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
    setReviewsLoading(true);
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
        if (data.status === 'CANCELLED') {
          setActionDone(true);
        }
      } else {
        console.error('Lỗi từ server:', data.message);
      }

      // Lấy thông tin trạng thái yêu cầu hủy
      const orderResponse = await fetch(`${BASE_URL}/api/v1/order/${orderId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const orderData = await orderResponse.json();
      if (!orderResponse.ok) {
        console.error('Lỗi khi lấy trạng thái đơn hàng:', orderData.message);
        return;
      }

      // Kiểm tra AsyncStorage để dự phòng
      const storedCancelRequest = await AsyncStorage.getItem(`cancelRequest_${orderId}`);
      
      // Lấy review cho tất cả sản phẩm trong đơn hàng
      const productIds = data.order_items
        .map(item => item.product?.id)
        .filter(Boolean);
      
      let reviewsByProductId = {};
      let userHasReviewed = false;
      
      if (productIds.length > 0) {
        try {
          const reviewsPromises = productIds.map(id =>
            fetch(`${BASE_URL}/api/v1/review?productId=${id}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              }
            }).then(res => res.json())
          );
          const reviewsResponses = await Promise.all(reviewsPromises);
          
          // Kiểm tra xem đã có đánh giá nào cho đơn hàng này chưa
          reviewsByProductId = productIds.reduce((acc, id, index) => {
            const reviews = reviewsResponses[index].data || [];
            acc[id] = reviews;
            
            // Kiểm tra nếu có bất kỳ đánh giá nào từ đơn hàng này
            const hasReviewFromThisOrder = reviews.some(review => review.orderId === orderId);
            if (hasReviewFromThisOrder) {
              userHasReviewed = true;
            }
            
            return acc;
          }, {});
          
          setHasReviewed(userHasReviewed);
        } catch (error) {
          console.error('Lỗi khi lấy review:', error);
          setReviewsError(error.message || 'Không thể tải đánh giá');
        }
      }
      setReviewsLoading(false);
      
      setOrderDetail({
        ...data,
        cancelRequestStatus: orderData.cancelRequestStatus,
        reviewsByProductId
      });
      
      if (data.status === 'CANCELLED' || orderData.cancelRequestStatus === 'PENDING' || storedCancelRequest === 'PENDING') {
        setActionDone(true);
      } else {
        setActionDone(false);
      }
      if (orderData.cancelRequestStatus === 'PENDING' || storedCancelRequest === 'PENDING') {
        setIsCancelRequest(true);
      } else {
        setIsCancelRequest(false);
      }
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết đơn hàng:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to refresh reviews after submitting a new review
  const refreshReviews = () => {
    setHasReviewed(true); // Đánh dấu là đã đánh giá
    fetchOrderDetail(orderId);
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
      setActionDone(true);
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

  // Hàm kiểm tra thời gian có thể hủy trực tiếp trong vòng 30 phút
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

  // Lấy tất cả đánh giá cho hiển thị phía dưới
  const allReviews = [];
  if (orderDetail && orderDetail.reviewsByProductId) {
    Object.values(orderDetail.reviewsByProductId).forEach(reviews => {
      if (reviews && reviews.length > 0) {
        allReviews.push(...reviews);
      }
    });
  }

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
        <View style={{ flex: 1 }}>
          {/* Hiển thị thông tin đơn hàng */}
          <View style={styles.orderInfoContainer}>
            <Text style={styles.orderTitle}>Đơn hàng #{orderDetail.id}</Text>
            <Text style={styles.orderDate}>Ngày đặt hàng: {new Date(orderDetail.createdAt).toLocaleDateString('vi-VN')} </Text>
            <Text style={styles.orderAddress}>Địa chỉ: {orderDetail.info?.shipping_address || "Không có địa chỉ"}</Text>
            <Text style={styles.orderStatus}>Trạng thái: {orderDetail.status}</Text>
            <Text style={styles.paymentMethod}>Phương thức thanh toán: {orderDetail.payment_method || "Không xác định"} </Text>
            <Text style={styles.orderTotal}>Tổng tiền: {orderDetail.total_amount?.toLocaleString('vi-VN')} đ</Text>
          </View>

          {/* Danh sách sản phẩm trong đơn hàng và nút hủy đơn hàng */}
          <View style={styles.orderContentContainer}>
            <FlatList 
              data={orderDetail.order_items}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderOrderItem}
              style={styles.orderItemsList}
            />

            {/* Nút hủy đơn hàng - đã được đưa lên gần hơn với FlatList */}
            {isCancelable(orderDetail.createdAt) ? (
              <TouchableOpacity
                style={[styles.cancelButton, (actionDone || orderDetail.status === 'CANCELLED') && styles.disabledButton]}
                onPress={confirmCancelOrder}
                disabled={actionDone || orderDetail.status === 'CANCELLED'}
              >
                <Text style={styles.cancelButtonText}>Hủy đơn hàng</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.cancelButton, (actionDone || orderDetail.status === 'CANCELLED' || orderDetail.cancelRequestStatus === 'PENDING') && styles.disabledButton]}
                onPress={() => setModalVisible(true)}
                disabled={actionDone || orderDetail.status === 'CANCELLED' || orderDetail.cancelRequestStatus === 'PENDING'}
              >
                <Text style={styles.cancelButtonText}>
                  {isCancelRequest ? 'Chờ xác nhận' : 'Gửi yêu cầu hủy đơn hàng'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Phần đánh giá và bình luận - chỉ hiển thị khi đơn hàng đã hoàn thành và người dùng chưa đánh giá */}
          {orderDetail.status === 'FINISHED' && !hasReviewed && (
            <View style={styles.commentsAndReviewsContainer}>
              {/* Form đánh giá */}
              <CommentSection 
                productId={orderDetail.order_items[0]?.product?.id} 
                orderId={orderId} 
                onReviewSubmitted={refreshReviews} 
              />
            </View>
          )}
          
          {/* Hiển thị thông báo đã đánh giá nếu người dùng đã đánh giá */}
          {orderDetail.status === 'FINISHED' && hasReviewed && (
            <View style={styles.reviewCompletedContainer}>
              <Icon name="checkmark-circle" size={40} color="#4CAF50" />
              <Text style={styles.reviewCompletedText}>Bạn đã đánh giá sản phẩm này</Text>
            </View>
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
                  <Picker.Item label="Chọn lý do..." value="" />
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
                  style={styles.closeButton} 
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Đóng</Text>
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
  disabledButton: { backgroundColor: 'gray' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContent: { width: '80%', backgroundColor: 'white', padding: 20, borderRadius: 10 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  submitButton: { padding: 10, backgroundColor: '#1e90ff', borderRadius: 20, marginTop: 10, width: '100%', alignItems: 'center' },
  submitButtonText: { color: 'white', fontSize: 16, textAlign: 'center' },
  closeButton: { padding: 10, backgroundColor: '#ccc', borderRadius: 20, marginTop: 10, width: '100%', alignItems: 'center' },
  closeButtonText: { color: 'black', fontSize: 16, textAlign: 'center' },
  center: { justifyContent: 'center', alignItems: 'center', padding: 20 },
  infoText: { marginVertical: 20, textAlign: 'center', fontSize: 16, color: '#555' },
  
  // Styles cho ReviewsSection
  reviewsContainer: { marginTop: 20, padding: 10, backgroundColor: '#f2f2f2', borderRadius: 10 },
  reviewsTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  reviewItem: { backgroundColor: '#fff', padding: 10, borderRadius: 8, marginBottom: 10 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  reviewAvatar: { width: 32, height: 32, borderRadius: 16, marginRight: 8 },
  reviewAuthor: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  reviewStars: { flexDirection: 'row', marginBottom: 5 },
  reviewComment: { fontSize: 14, marginBottom: 5, color: '#555' },
  reviewDate: { fontSize: 12, color: '#999', textAlign: 'right' },
  commentsAndReviewsContainer: { marginTop: 20, padding: 10, backgroundColor: '#f2f2f2', borderRadius: 10 },
});

export default OrderDetail;