// NotificationComponent.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import NotificationService from '../services/NotificationService';

const NotificationComponent = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Đăng ký sự kiện thông báo từ socket
    NotificationService.subscribeToNotifications((data) => {
      // Cập nhật danh sách thông báo
      // Bạn có thể xử lý lại cấu trúc dữ liệu nếu cần, ví dụ: push vào array các thông báo chi tiết
      setNotifications(prev => [...prev, data]);
    });

    // Hủy kết nối khi component unmount
    return () => {
      NotificationService.disconnect();
    };
  }, []);

  // Render từng thông báo: bạn có thể tuỳ biến giao diện theo dữ liệu nhận được
  const renderItem = ({ item, index }) => (
    <TouchableOpacity 
      key={index}
      style={styles.notificationItem} 
      onPress={() => {
        // Điều hướng đến chi tiết thông báo hoặc thực hiện hành động phù hợp
        navigation.navigate('NotificationDetail', { data: item });
      }}
    >
      <Text style={styles.notificationText}>
        {/* Ví dụ hiển thị số đơn hàng mới */}
        {item.newOrders ? `Có ${item.newOrders} đơn hàng mới` : 'Thông báo mới'}  
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList 
        data={notifications}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text>Không có thông báo mới</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  notificationItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
    marginBottom: 5,
  },
  notificationText: { fontSize: 16 },
});

export default NotificationComponent;
