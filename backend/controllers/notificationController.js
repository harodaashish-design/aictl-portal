const { Notification } = require('../models');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipientId: req.user._id }).sort({
    createdAt: -1,
  });
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  res.json({
    success: true,
    unreadCount,
    notifications,
  });
});

const markNotificationAsRead = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const notif = await Notification.findById(id);

  if (!notif) {
    return next(new AppError('Notification not found.', 404));
  }
  if (String(notif.recipientId) !== String(req.user._id)) {
    return next(new AppError('Access denied.', 403));
  }

  const updated = await Notification.findByIdAndUpdate(
    String(notif._id),
    { isRead: true },
    { new: true }
  );

  res.json({
    success: true,
    notification: updated,
  });
});

const markAllNotificationsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipientId: req.user._id, isRead: false },
    { isRead: true }
  );

  res.json({
    success: true,
    message: 'All notifications marked as read.',
  });
});

module.exports = {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsRead,
};
