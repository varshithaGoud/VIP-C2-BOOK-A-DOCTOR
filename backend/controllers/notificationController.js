import Notification from '../models/Notification.js';

// @desc    Get all notifications for logged in user
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark notifications as read
// @route   PUT /api/notifications/read
// @access  Private
export const markNotificationsAsRead = async (req, res) => {
  try {
    const { id } = req.body;

    if (id) {
      // Mark single notification as read
      const notification = await Notification.findById(id);
      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }

      if (notification.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to read this notification' });
      }

      notification.readStatus = true;
      await notification.save();
      return res.json(notification);
    } else {
      // Mark all user notifications as read
      await Notification.updateMany(
        { userId: req.user._id, readStatus: false },
        { readStatus: true }
      );
      res.json({ message: 'All notifications marked as read' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
