import { useState, useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../constants/config';

const CACHE_DURATION = 5 * 60 * 1000; // 5 phút

export const useUserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const isLoadingRef = useRef(false);

  const loadProfile = useCallback(async (forceRefresh = false) => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    setLoading(true);

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        console.log('Token không tồn tại, cần đăng nhập');
        setProfile(null);
        setLoading(false);
        isLoadingRef.current = false;
        return;
      }

      const now = Date.now();
      const cachedProfile = await AsyncStorage.getItem('cachedProfile');
      const cachedTimestamp = await AsyncStorage.getItem('cachedProfileTimestamp');

      if (!forceRefresh && cachedProfile && cachedTimestamp && now - parseInt(cachedTimestamp, 10) < CACHE_DURATION) {
        const parsedProfile = JSON.parse(cachedProfile);
        setProfile({ ...parsedProfile, token }); // Thêm token vào profile từ cache
        setLoading(false);
        isLoadingRef.current = false;
        return;
      }

      const response = await fetch(`${BASE_URL}/api/v1/user/get-user-info`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        if (data.loyaltyPoints === undefined) {
          data.loyaltyPoints = 0;
        }
        const updatedProfile = { ...data, token }; // Thêm token vào profile
        setProfile(updatedProfile);
        await AsyncStorage.setItem('cachedProfile', JSON.stringify(updatedProfile));
        await AsyncStorage.setItem('cachedProfileTimestamp', now.toString());
      } else {
        console.error('Lỗi lấy thông tin người dùng:', data.message);
        setProfile(null);
      }
    } catch (error) {
      console.error('Lỗi khi lấy thông tin người dùng:', error);
      setProfile(null);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const refreshProfile = useCallback(() => {
    return loadProfile(true);
  }, [loadProfile]);

  return { profile, loading, refreshProfile, setProfile };
};