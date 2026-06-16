import Notification from '../models/Notification.js';
import { emitToUser } from '../config/socket.js';

/**
 * Creates a notification in the database and pushes it in real-time if the user is online.
 * @param {string} userId - Recipient User ID
 * @param {string} title - Notification title
 * @param {string} message - Detailed notification message
 */
export const createAndSendNotification = async (userId, title, message) => {
  try {
    // 1. Save to Database
    const notification = await Notification.create({
      userId,
      title,
      message,
      readStatus: false
    });

    // 2. Emit via Socket.io
    emitToUser(userId.toString(), 'notification', notification);
    
    return notification;
  } catch (error) {
    console.error(`Failed to create/send notification for User ${userId}:`, error);
  }
};
