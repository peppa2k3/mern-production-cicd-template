import { io } from 'socket.io-client';

let socket = null;

// Lazily creates a single authenticated socket connection. Call
// disconnectSocket() on logout to avoid a stale/unauthenticated socket
// lingering in the background.
export function getSocket(accessToken) {
  if (socket) return socket;
  socket = io(import.meta.env.VITE_SOCKET_URL || '/', {
    auth: { token: accessToken },
    autoConnect: true,
    transports: ['websocket'],
  });
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
