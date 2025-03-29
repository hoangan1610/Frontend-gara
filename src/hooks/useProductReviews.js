import { useQuery } from 'react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../constants/config';

const fetchProductReviews = async (productId) => {
  const token = await AsyncStorage.getItem('authToken');
  if (!token) {
    throw new Error('Bạn cần đăng nhập để xem bình luận');
  }
  const response = await fetch(`${BASE_URL}/api/v1/review?productId=${productId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Lỗi khi lấy bình luận');
  }
  // Giả sử API trả về { reviews: [...] }
  return data.reviews;
};

export const useProductReviews = (productId) => {
  return useQuery(['productReviews', productId], () => fetchProductReviews(productId), {
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
  });
};
