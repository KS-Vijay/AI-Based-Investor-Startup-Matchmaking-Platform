import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

let socket = null;

export const initSocket = (userId) => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    socket.on('connect', () => {
      console.log('Connected to WebSocket server:', socket.id);
      if (userId) {
        socket.emit('user_online', userId);
      }
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });
  } else if (userId && socket.connected) {
    socket.emit('user_online', userId);
  }

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    const userStr = localStorage.getItem('currentUser');
    const user = userStr ? JSON.parse(userStr) : null;
    return initSocket(user?._id);
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
