// src/socket.js
import io from 'socket.io-client';
import { BASE_URL } from './constants/config';

const socket = io(BASE_URL, {
  autoConnect: true, // Tự động kết nối khi khởi tạo
  withCredentials: true, // Gửi cookie nếu cần
  transports: ['websocket'], // Sử dụng WebSocket thay vì polling
});

socket.on('connect', () => {
  console.log('Socket đã kết nối thành công:', socket.id);
});

socket.on('connect_error', (error) => {
  console.error('Lỗi kết nối socket:', error);
});

export { socket };