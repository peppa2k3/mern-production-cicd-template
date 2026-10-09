const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const env = require('./env');
const logger = require('./logger');
const User = require('../modules/users/user.model');

let io;

// Each authenticated socket joins two rooms: `user:<id>` for direct
// notifications, and `role:<roleId>` for group notifications. The
// notification service emits to whichever room matches the target.
function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: env.clientUrl, credentials: true },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Missing token'));
      const payload = jwt.verify(token, env.jwt.accessSecret);
      const user = await User.findById(payload.sub).populate('role');
      if (payload.kind !== 'access' || !user?.isActive || payload.sessionVersion !== (user.sessionVersion || 0)) {
        return next(new Error('Invalid session'));
      }
      socket.userId = payload.sub;
      socket.roleId = user.role?._id.toString();
      next();
    } catch (err) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(`user:${socket.userId}`);
    if (socket.roleId) socket.join(`role:${socket.roleId}`);
    logger.debug(`Socket connected: user:${socket.userId}`);

    socket.on('join:role', (roleId) => {
      if (roleId === socket.roleId) socket.join(`role:${socket.roleId}`);
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
