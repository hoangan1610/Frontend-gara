// hooks/useProductReviews.js
import { useEffect } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import io from 'socket.io-client';
import { BASE_URL } from '../constants/config';

// Socket connection singleton
const socket = io(BASE_URL, { transports: ['websocket'] });

// Fetch reviews from API
const fetchProductReviews = async (productId) => {
  const token = await AsyncStorage.getItem('authToken');
  if (!token) throw new Error('Bạn cần đăng nhập để xem bình luận');

  const res = await fetch(`${BASE_URL}/api/v1/review?productId=${productId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Lỗi khi lấy bình luận');
  return data.reviews;
};

// Hook with real-time updates
export const useProductReviews = (productId) => {
  const queryClient = useQueryClient();

  const query = useQuery(
    ['productReviews', productId],
    () => fetchProductReviews(productId),
    {
      enabled: !!productId,
      staleTime: 5 * 60 * 1000,
    }
  );

  useEffect(() => {
    if (!productId) return;

    socket.emit('joinProductRoom', productId);
    const onNewReview = (review) => {
      if (review.productId === productId) {
        queryClient.setQueryData(
          ['productReviews', productId],
          (old = []) => [review, ...old]
        );
      }
    };

    socket.on('reviewAdded', onNewReview);
    return () => {
      socket.off('reviewAdded', onNewReview);
      socket.emit('leaveProductRoom', productId);
    };
  }, [productId, queryClient]);

  return query;
};