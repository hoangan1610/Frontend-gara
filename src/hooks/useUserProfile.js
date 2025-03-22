import { useState, useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../constants/config';

const CACHE_DURATION = 5 * 60 * 1000; // 5 phút

export const useUserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const isLoadingRef = useRef(false);

  const loadProfile = useCallback(async (forceRefresh = false) => {
    // Nếu đang load thì không gọi lại
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    setLoading(true);

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        console.log('Token không tồn tại, cần đăng nhập');
        setLoading(false);
        isLoadingRef.current = false;
        return;
      }

      const now = Date.now();
      const cachedProfile = await AsyncStorage.getItem('cachedProfile');
      const cachedTimestamp = await AsyncStorage.getItem('cachedProfileTimestamp');

      // Nếu không buộc refresh và cache còn hợp lệ, sử dụng cache
      if (!forceRefresh && cachedProfile && cachedTimestamp && now - parseInt(cachedTimestamp, 10) < CACHE_DURATION) {
        setProfile(JSON.parse(cachedProfile));
        setLoading(false);
        isLoadingRef.current = false;
        return;
      }

      // Nếu cache không hợp lệ hoặc buộc refresh, gọi API để lấy dữ liệu mới
      const response = await fetch(`${BASE_URL}/api/v1/user/get-user-info`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setProfile(data);
        // Cập nhật cache mới khi API thành công
        await AsyncStorage.setItem('cachedProfile', JSON.stringify(data));
        await AsyncStorage.setItem('cachedProfileTimestamp', now.toString());
      } else {
        console.error('Lỗi lấy thông tin người dùng:', data.message);
      }
    } catch (error) {
      console.error('Lỗi khi lấy thông tin người dùng:', error);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, []);

  // Gọi loadProfile 1 lần đầu khi hook được mount
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Hàm refreshProfile để buộc lấy dữ liệu mới và cập nhật cache
  const refreshProfile = useCallback(() => {
    return loadProfile(true);
  }, [loadProfile]);

  return { profile, loading, refreshProfile, setProfile };
};
