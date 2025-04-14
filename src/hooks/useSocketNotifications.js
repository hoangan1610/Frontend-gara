// useSocketNotifications.js
import { useEffect, useState } from 'react';
import { socket } from '../../socket';

export const useSocketNotifications = (userId) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (userId) {
      console.log("Joining notification room for userId:", userId, typeof userId);
      // Emit join room với ép kiểu về chuỗi
      socket.emit("joinNotificationRoom", String(userId));

      // Đăng ký lắng nghe sự kiện "notification" nếu chưa đăng ký
      const notificationHandler = (data) => {
        console.log("Received notification:", data);
        setNotifications((prev) => [data, ...prev]);
      };

      socket.on("notification", notificationHandler);

      // Cleanup: chỉ loại bỏ listener, không disconnect socket toàn cục
      return () => {
        socket.off("notification", notificationHandler);
      };
    }
  }, [userId]);

  return { notifications, socket };
};

export default useSocketNotifications;
