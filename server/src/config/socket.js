const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const env = require('./env');
const logger = require('./logger');

let io;

// Each authenticated socket joins two rooms: `user:<id>` for direct
// notifications, and `role:<roleId>` for group notifications. The
// notification service emits to whichever room matches the target.
function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: env.clientUrl, credentials: true },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Missing token'));
      const payload = jwt.verify(token, env.jwt.accessSecret);
      socket.userId = payload.sub;
      next();
    } catch (err) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(`user:${socket.userId}`);
    logger.debug(`Socket connected: user:${socket.userId}`);

    socket.on('join:role', (roleId) => {
      if (roleId) socket.join(`role:${roleId}`);
    });

    socket.on('disconnect', () => {
      logger.debug(`Socket disconnected: user:${socket.userId}`);
    });
  });

  return io;
}

function getIO() {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
}

module.exports = { initSocket, getIO };
