import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  FlatList,
  Modal,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { BASE_URL } from '../../constants/config';
import { emitter } from '../../utils/eventEmitter';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useCart } from '../../hooks/useCart';
import { useSocketNotifications } from '../../hooks/useSocketNotifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Header = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [sortAsc, setSortAsc] = useState(false); // false: mới→cũ, true: cũ→mới
  const debounceTimerRef = useRef(null);

  const { profile, refreshProfile, setProfile } = useUserProfile();
  const { cart, loadCart } = useCart();
  const { notifications: socketNotifications } = useSocketNotifications(profile?.id);

  // Tự động load notifications khi profile sẵn sàng
  useEffect(() => {
    if (profile?.id && profile.token) {
      fetchNotifications();
    }
  }, [profile]);

  // Hàm làm mới token
  const refreshToken = async () => {
    try {
      const rt = await AsyncStorage.getItem('refreshToken');
      if (!rt) return null;
      const res = await fetch(`${BASE_URL}/api/v1/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: rt }),
      });
      const data = await res.json();
      if (data.success) {
        await AsyncStorage.setItem('authToken', data.token);
        setProfile(prev => prev ? { ...prev, token: data.token } : null);
        return data.token;
      }
      return null;
    } catch {
      return null;
    }
  };

  // Lấy danh sách thông báo từ API
  const fetchNotifications = useCallback(async () => {
    if (!profile?.id || !profile.token) return;
    try {
      let res = await fetch(`${BASE_URL}/api/v1/notifications?userId=${profile.id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${profile.token}`,
        },
      });
      if (res.status === 401) {
        const newToken = await refreshToken();
        if (!newToken) {
          Alert.alert('Phiên hết hạn', 'Vui lòng đăng nhập lại.', [
            { text: 'OK', onPress: () => navigation.navigate('Login') },
          ]);
          return;
        }
        res = await fetch(`${BASE_URL}/api/v1/notifications?userId=${profile.id}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${newToken}`,
          },
        });
      }
      const data = await res.json();
      if (data.success) setNotifications(data.result);
    } catch (err) {
      console.error('Lỗi khi lấy thông báo:', err);
    }
  }, [profile]);

  useFocusEffect(
    useCallback(() => {
      if (!profile) refreshProfile();
      if (!cart) loadCart();
      if (showNotifications) fetchNotifications();
    }, [profile, cart, showNotifications])
  );

  // Nghe emitter để cập nhật cart & notifications
  useEffect(() => {
    const sub1 = emitter.addListener('cartUpdated', () => loadCart(true));
    const sub2 = emitter.addListener('notificationUpdated', fetchNotifications);
    return () => {
      sub1.remove();
      sub2.remove();
    };
  }, [loadCart, fetchNotifications]);

  // Kết hợp socket và API
  useEffect(() => {
    if (socketNotifications.length) {
      setNotifications(prev => {
        const merged = [
          ...socketNotifications,
          ...prev.filter(p => !socketNotifications.some(n => n.id === p.id))
        ];
        return merged;
      });
    }
  }, [socketNotifications]);

  // Sort notifications theo timestamp
  const sortedNotifications = useMemo(() => {
    return [...notifications].sort((a, b) => {
      const diff = new Date(b.timestamp) - new Date(a.timestamp);
      return sortAsc ? -diff : diff;
    });
  }, [notifications, sortAsc]);

  // Debounce tìm kiếm
  const debouncedFetchSuggestions = query => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => fetchSuggestions(query), 500);
  };

  const fetchSuggestions = async query => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(`${BASE_URL}/api/v1/product/search?searchTerm=${query}`);
      const data = await res.json();
      if (res.ok) {
        setSuggestions(data.result.products.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image_url || 'https://via.placeholder.com/150',
          path: item.path,
        })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitEditing = () => {
    navigation.navigate('SearchScreen', { query: searchText });
  };

  const getImageUrl = () =>
    profile?.image_url ? `${profile.image_url}?${Date.now()}` : 'https://via.placeholder.com/40';

  const cartCount = cart?.cart_items?.length || 0;
  const unreadCount = notifications.filter(n => !n.read).length;

  const markNotificationAsRead = async id => {
    if (!profile?.token) return;
    try {
      const res = await fetch(`${BASE_URL}/api/v1/notifications/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${profile.token}`,
        },
      });
      const result = await res.json();
      if (result.success) emitter.emit('notificationUpdated');
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    if (!profile?.token) {
      Alert.alert('Lỗi', 'Vui lòng đăng nhập để thực hiện.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
      return;
    }
    try {
      let res = await fetch(`${BASE_URL}/api/v1/notifications/mark-all-read`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${profile.token}`,
        },
      });
      if (res.status === 401) {
        const newToken = await refreshToken();
        if (!newToken) return;
        res = await fetch(`${BASE_URL}/api/v1/notifications/mark-all-read`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${newToken}`,
          },
        });
      }
      const result = await res.json();
      if (result.success) {
        emitter.emit('notificationUpdated');
        if (result.message === 'Không có thông báo chưa đọc để đánh dấu') {
          Alert.alert('Thông báo', result.message);
        }
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi đánh dấu tất cả.');
    }
  };

  const viewNotificationDetail = notification => {
    if (!notification.read) markNotificationAsRead(notification.id);
    if (notification.orderId) {
      navigation.navigate('OrderDetail', { orderId: notification.orderId });
    } else {
      Alert.alert('Thông báo', notification.message);
    }
  };

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        { backgroundColor: item.read ? '#fff' : '#e6f7ff' },
      ]}
      onPress={() => viewNotificationDetail(item)}
    >
      <Text style={styles.notificationText}>{item.message}</Text>
      {item.orderId && (
        <Text style={styles.notificationOrder}>Order: #{item.orderId}</Text>
      )}
      <Text style={styles.notificationTimestamp}>
        {new Date(item.timestamp).toLocaleString()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm..."
          value={searchText}
          onChangeText={text => {
            setSearchText(text);
            debouncedFetchSuggestions(text);
          }}
          returnKeyType="search"
          onSubmitEditing={handleSubmitEditing}
        />
        {suggestions.length > 0 && searchText.trim() && (
          <View style={styles.suggestionsContainer}>
            <FlatList
              data={suggestions}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.suggestionItem}
                  onPress={() => navigation.navigate('ProductDetail', { productPath: item.path })}
                >
                  <Image source={{ uri: item.image }} style={styles.suggestionImage} />
                  <View style={styles.textContainer}>
                    <Text style={styles.productName}>{item.name}</Text>
                    <Text style={styles.productPrice}>{item.price.toLocaleString()} VNĐ</Text>
                  </View>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}
      </View>

      <TouchableOpacity onPress={() => navigation.navigate('Cart')} style={styles.cartContainer}>
        <Icon name="cart-outline" size={24} color="#000" />
        {cartCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{cartCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setShowNotifications(true)} style={styles.notificationContainer}>
        <Icon name="notifications-outline" size={24} color="#000" />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
        <Image source={{ uri: getImageUrl() }} style={styles.userAvatar} />
      </TouchableOpacity>

      <Modal
        visible={showNotifications}
        animationType="slide"
        transparent
        onRequestClose={() => setShowNotifications(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Thông báo</Text>
              <TouchableOpacity onPress={() => setSortAsc(!sortAsc)} style={styles.sortButton}>
                <Text style={styles.sortButtonText}>
                  {sortAsc ? 'Cũ → Mới' : 'Mới → Cũ'}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: '#007bff', marginBottom: 10 }]}
              onPress={markAllAsRead}
            >
              <Text style={styles.closeButtonText}>Đánh dấu tất cả đã đọc</Text>
            </TouchableOpacity>

            <FlatList
              data={sortedNotifications}
              keyExtractor={item => item.id?.toString() || Math.random().toString()}
              renderItem={renderNotificationItem}
              ListEmptyComponent={<Text style={styles.infoText}>Không có thông báo nào.</Text>}
            />

            <TouchableOpacity style={styles.closeButton} onPress={() => setShowNotifications(false)}>
              <Text style={styles.closeButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 10, paddingVertical: 10, backgroundColor: '#fff'
  },
  searchContainer: { width: '60%', alignItems: 'center' },
  searchInput: {
    backgroundColor: '#f0f0f0', borderRadius: 20, width: '100%',
    paddingHorizontal: 15, marginHorizontal: 10, height: 40, textAlignVertical: 'center'
  },
  userAvatar: { width: 35, height: 35, borderRadius: 20, borderWidth: 2, borderColor: '#2563eb' },
  suggestionsContainer: {
    position: 'absolute', top: 50, left: 0, right: 0,
    backgroundColor: 'white', borderRadius: 5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 4, zIndex: 10, maxHeight: 400
  },
  suggestionItem: { flexDirection: 'row', alignItems: 'center', padding: 10, borderBottomWidth: 1, borderBottomColor: '#ddd' },
  productName: { fontSize: 16, fontWeight: 'bold' },
  productPrice: { fontSize: 14, color: 'red' },
  suggestionImage: { width: 60, height: 60, borderRadius: 8, marginRight: 10 },
  textContainer: { flex: 1 },
  cartContainer: { position: 'relative', padding: 5 },
  notificationContainer: { position: 'relative', padding: 5 },
  badge: {
    position: 'absolute', right: 0, top: -5,
    backgroundColor: 'red', borderRadius: 10,
    minWidth: 20, height: 20, justifyContent: 'center',
    alignItems: 'center', paddingHorizontal: 3
  },
  badgeText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', paddingHorizontal: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 10, padding: 20, maxHeight: '80%' },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  sortButton: {
    paddingHorizontal: 10, paddingVertical: 5,
    backgroundColor: '#eee', borderRadius: 5
  },
  sortButtonText: { fontSize: 14, color: '#333' },
  notificationItem: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#ddd' },
  notificationText: { fontSize: 16, color: '#333' },
  notificationOrder: { fontSize: 14, color: '#888' },
  notificationTimestamp: { fontSize: 12, color: '#aaa', marginTop: 5 },
  closeButton: { marginTop: 10, backgroundColor: '#ff5722', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  closeButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  infoText: { textAlign: 'center', fontSize: 16, color: '#555' },
});

export default Header;
