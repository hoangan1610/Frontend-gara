import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from 'react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../constants/config';

const submitReview = async ({ productId, rating, comment, orderId }) => {
  const token = await AsyncStorage.getItem('authToken');
  if (!token) {
    throw new Error('Bạn cần đăng nhập để đánh giá sản phẩm');
  }
  const response = await fetch(`${BASE_URL}/api/v1/review`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ productId, rating, comment, orderId }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Có lỗi xảy ra khi gửi đánh giá');
  }
  return data;
};

const CommentSection = ({ productId = null, orderId = null }) => {
  const [commentText, setCommentText] = useState("");
  const [rating, setRating] = useState(0);
  const queryClient = useQueryClient();

  const isValidProps = productId != null && orderId != null;

  const mutation = useMutation(submitReview, {
    onSuccess: (data) => {
      Alert.alert('Cảm ơn', data.message || 'Bình luận của bạn đã được gửi');
      setRating(0);
      setCommentText("");
      // Invalidate query để load lại danh sách review
      queryClient.invalidateQueries(['productReviews', productId]);
    },
    onError: (error) => {
      Alert.alert('Lỗi', error.message);
    }
  });

  const renderStars = () => {
    let stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity key={i} onPress={() => setRating(i)}>
          <Ionicons 
            name={i <= rating ? "star" : "star-outline"} 
            size={24} 
            color="#ffd700" 
            style={{ marginHorizontal: 2 }}
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  const handleSubmitComment = () => {
    if (!isValidProps) {
      Alert.alert('Lỗi', 'Thông tin sản phẩm hoặc đơn hàng không xác định');
      return;
    }
    if (rating === 0) {
      Alert.alert('Thông báo', 'Vui lòng chọn số sao đánh giá');
      return;
    }
    if (!commentText.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập bình luận của bạn');
      return;
    }
    mutation.mutate({ productId, rating, comment: commentText, orderId });
  };

  return (
    <View style={styles.container}>
      {orderId && (
        <Text style={styles.orderIdText}>Order: #{orderId}</Text>
      )}
      <Text style={styles.title}>Bình luận & Đánh giá</Text>
      <View style={styles.starContainer}>
        {renderStars()}
      </View>
      <TextInput
        style={styles.input}
        placeholder="Viết bình luận của bạn..."
        value={commentText}
        onChangeText={setCommentText}
      />
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleSubmitComment} 
        disabled={mutation.isLoading}
      >
        <Text style={styles.buttonText}>
          {mutation.isLoading ? 'Đang gửi...' : 'Gửi bình luận'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    padding: 15,
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
  },
  orderIdText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  starContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#ff5722',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CommentSection;
