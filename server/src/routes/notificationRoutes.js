const express = require('express');
const router = express.Router();

const notificationController = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', notificationController.listNotifications);
router.patch('/:notificationId/read', notificationController.markNotificationRead);
router.patch('/read-all', notificationController.markAllNotificationsRead);

module.exports = router;
