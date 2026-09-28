const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const Notification = require('../models/Notification');

const listNotifications = catchAsync(async (req, res) => {
  if (!req.user.member) throw ApiError.badRequest('No member profile associated with this account');

  const filter = { organization: req.organizationId, recipient: req.user.member };
  if (req.query.unreadOnly === 'true') filter.isRead = false;

  const [notifications, unreadCount] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).limit(50),
    Notification.countDocuments({ organization: req.organizationId, recipient: req.user.member, isRead: false }),
  ]);

  res.json({ success: true, data: notifications, meta: { unreadCount } });
});

const markNotificationRead = catchAsync(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.notificationId, organization: req.organizationId, recipient: req.user.member },
    { isRead: true, readAt: new Date() },
    { new: true }
  );
  if (!notification) throw ApiError.notFound('Notification not found');
  res.json({ success: true, data: notification });
});

const markAllNotificationsRead = catchAsync(async (req, res) => {
  await Notification.updateMany(
    { organization: req.organizationId, recipient: req.user.member, isRead: false },
    { isRead: true, readAt: new Date() }
  );
  res.json({ success: true, message: 'All notifications marked as read' });
});

module.exports = { listNotifications, markNotificationRead, markAllNotificationsRead };
