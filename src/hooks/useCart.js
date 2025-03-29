import { useState, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../constants/config';

export const useCart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const isLoadingRef = useRef(false);
  const hasLoadedRef = useRef(false);

  const loadCart = useCallback(async (forceRefresh = false) => {
    if (isLoadingRef.current) return; // Nếu đang load, không gọi lại
    if (hasLoadedRef.current && cart && !forceRefresh) return; // Nếu đã load và không buộc refresh, dùng dữ liệu cũ

    isLoadingRef.current = true;
    setLoading(true);
    const token = await AsyncStorage.getItem('authToken');
    if (!token) {
      setLoading(false);
      isLoadingRef.current = false;
      return;
    }
    try {
      const response = await fetch(`${BASE_URL}/api/v1/cart`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setCart(data);
        hasLoadedRef.current = true;
      } else {
        console.error('Lỗi tải giỏ hàng:', data.message);
      }
    } catch (error) {
      console.error('Không thể tải giỏ hàng:', error);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [cart]);

  const refreshCart = useCallback(async () => {
    hasLoadedRef.current = false;
    await loadCart(true);
  }, [loadCart]);

  return { cart, loading, loadCart, refreshCart, setCart };
};
