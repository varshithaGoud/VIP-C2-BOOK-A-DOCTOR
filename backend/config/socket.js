import { Server } from 'socket.io';

// Map of userId -> Set of socketIds (enables multi-device active sessions)
const userSockets = new Map();
let ioInstance = null;

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: '*', // In production, restrict this to the frontend domain
      methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
  });

  ioInstance = io;

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Register user socket mapping
    socket.on('register', (userId) => {
      if (userId) {
        if (!userSockets.has(userId)) {
          userSockets.set(userId, new Set());
        }
        userSockets.get(userId).add(socket.id);
        console.log(`User ${userId} registered to socket ID ${socket.id}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
      
      // Remove socket mapping
      for (const [userId, sockets] of userSockets.entries()) {
        if (sockets.has(socket.id)) {
          sockets.delete(socket.id);
          if (sockets.size === 0) {
            userSockets.delete(userId);
          }
          console.log(`Removed socket ID ${socket.id} for User ${userId}`);
          break;
        }
      }
    });
  });

  return io;
};

/**
 * Emit a real-time event to a specific user
 * @param {string} userId - Target user ID
 * @param {string} eventName - Socket event to emit
 * @param {Object} data - Payload data
 */
export const emitToUser = (userId, eventName, data) => {
  if (ioInstance && userSockets.has(userId)) {
    const sockets = userSockets.get(userId);
    sockets.forEach((socketId) => {
      ioInstance.to(socketId).emit(eventName, data);
    });
    return true;
  }
  return false;
};

/**
 * Emit a broadcast event to all sockets
 */
export const broadcast = (eventName, data) => {
  if (ioInstance) {
    ioInstance.emit(eventName, data);
    return true;
  }
  return false;
};
