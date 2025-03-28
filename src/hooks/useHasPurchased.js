import { useQuery } from 'react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../constants/config';

const fetchHasPurchased = async (productId) => {
  const token = await AsyncStorage.getItem('authToken');
  if (!token) {
    throw new Error('Bạn cần đăng nhập để kiểm tra');
  }
  const response = await fetch(`${BASE_URL}/api/v1/order/has-purchased/${productId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Lỗi khi kiểm tra mua hàng');
  }
  // Nếu đã mua, trả về mảng các orderIds, nếu không thì trả về mảng rỗng
  return data.hasPurchased ? data.orderIds : [];
};

export const useHasPurchased = (productId) => {
  return useQuery(['hasPurchased', productId], () => fetchHasPurchased(productId), {
    enabled: !!productId, // Chỉ gọi API nếu productId hợp lệ
    staleTime: 5 * 60 * 1000, // Cache trong 5 phút
  });
};
