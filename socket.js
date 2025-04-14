// socket.js
import io from 'socket.io-client';
import { BASE_URL } from './src/constants/config';

// Khởi tạo socket toàn cục, tự động kết nối với server.
export const socket = io(BASE_URL, {
  transports: ['websocket'],
});
