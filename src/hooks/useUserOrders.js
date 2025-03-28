// hooks/useUserOrders.js
import { useQuery } from 'react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../constants/config';

const fetchUserOrders = async () => {
  const token = await AsyncStorage.getItem('authToken');
  if (!token) {
    throw new Error('Bạn cần đăng nhập để xem đơn hàng');
  }
  const response = await fetch(`${BASE_URL}/api/v1/order`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Có lỗi xảy ra khi lấy đơn hàng');
  }
  return data;
};

export const useUserOrders = () => {
  const { data, isLoading, error, refetch } = useQuery('userOrders', fetchUserOrders, {
    staleTime: 5 * 60 * 1000, // cache trong 5 phút
  });

  return { orders: data, isLoading, error, refreshOrders: refetch };
};
