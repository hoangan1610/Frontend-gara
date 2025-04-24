// src/hooks/useSocketNotifications.js
import { useEffect, useState } from 'react';
import { socket } from '../socket';

export const useSocketNotifications = (userId) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!userId) {
      console.log('Không có userId, không thể kết nối thông báo');
      return;
    }

    // Tham gia phòng thông báo
    const joinRoom = () => {
      console.log('Tham gia phòng thông báo với userId:', userId);
      socket.emit('joinNotificationRoom', String(userId));
    };

    // Xử lý sự kiện kết nối
    const handleConnect = () => {
      console.log('Socket đã kết nối thành công:', socket.id);
      joinRoom();
    };

    // Xử lý thông báo
    const handleNotification = (data) => {
      console.log('Nhận thông báo qua Socket.IO:', data);
      setNotifications((prev) => {
        const updated = [data, ...prev.filter(p => p.id !== data.id)];
        console.log('Danh sách thông báo Socket.IO:', updated);
        return updated;
      });
    };

    // Xử lý lỗi kết nối
    const handleConnectError = (error) => {
      console.error('Lỗi kết nối socket:', error.message);
    };

    // Thêm listeners
    socket.on('connect', handleConnect);
    socket.on('notification', handleNotification);
    socket.on('connect_error', handleConnectError);

    // Kiểm tra và thử kết nối
    if (!socket.connected) {
      console.log('Socket chưa kết nối, đang thử kết nối...');
      socket.connect();
    } else {
      joinRoom();
    }

    // Dọn dẹp
    return () => {
      socket.off('connect', handleConnect);
      socket.off('notification', handleNotification);
      socket.off('connect_error', handleConnectError);
    };
  }, [userId]);

  return { notifications, socket };
};

export default useSocketNotifications;