import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StarRating from './StarRating';
import { BASE_URL } from '../config';

const CommentSection = ({ productId, orderId, orderItemId, onReviewSubmitted }) => {
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
        onReviewSubmitted();
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

export default CommentSection;