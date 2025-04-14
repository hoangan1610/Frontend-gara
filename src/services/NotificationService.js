// NotificationService.js
import io from 'socket.io-client';
import { BASE_URL } from '../constants/config';

class NotificationService {
  constructor() {
    // Tạo kết nối socket sử dụng transport WebSocket
    this.socket = io(BASE_URL, {
      transports: ['websocket'],
    });
  }

  // Đăng ký các sự kiện thông báo
  subscribeToNotifications(callback) {
    // Ví dụ: lắng nghe event "notification"
    this.socket.on('notification', (data) => {
      // Data có thể chứa các thông tin chi tiết như:
      // { newOrders: number, newPosts: number, newEvents: number, newComments: number, newRatings: number }
      callback(data);
    });
  }

  // Nếu muốn lắng nghe riêng từng loại notification
  subscribeToNewOrders(callback) {
    this.socket.on('newOrder', callback);
  }

  subscribeToNewPosts(callback) {
    this.socket.on('newPost', callback);
  }

  // Tương tự, bạn có thể thêm các phương thức khác cho mỗi event

  // Hủy kết nối khi không còn sử dụng nữa
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

export default new NotificationService();
