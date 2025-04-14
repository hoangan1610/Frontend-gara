// NotificationScreen.js
import React from 'react';
import { View, Text, FlatList, Button, StyleSheet } from 'react-native';
import useSocketNotifications from '../../hooks/useSocketNotifications';

const NotificationScreen = ({ userId }) => {
  const { notifications, socket } = useSocketNotifications(userId);

  const handleTestNotification = () => {
    const testData = {
      message: '🔔 Thử nhận thông báo từ nút test',
      timestamp: new Date().toISOString(),
    };
    console.log("📤 Gửi test emit local để test giao diện:", testData);
    // Emit giả trên client để test hiển thị
    socket.emit('notification', testData);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📬 Danh sách thông báo</Text>

      <Button title="🔁 Test nhận thông báo (local)" onPress={handleTestNotification} />

      <FlatList
        data={notifications}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.notification}>
            <Text>{item.message}</Text>
            <Text style={styles.time}>{item.timestamp}</Text>
          </View>
        )}
      />
    </View>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  notification: { padding: 12, backgroundColor: '#eee', borderRadius: 8, marginVertical: 4 },
  time: { fontSize: 12, color: '#666' },
});
