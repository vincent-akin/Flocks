const express = require('express');
const router = express.Router();

router.use('/auth', require('./authRoutes'));
router.use('/organizations', require('./organizationRoutes'));
router.use('/parishes', require('./parishRoutes'));
router.use('/admins', require('./adminRoutes'));
router.use('/members', require('./memberRoutes'));
router.use('/units', require('./unitRoutes'));
router.use('/bible', require('./bibleRoutes'));
router.use('/prayers', require('./prayerRoutes'));
router.use('/attendance', require('./attendanceRoutes'));
router.use('/events', require('./eventRoutes'));
router.use('/analytics', require('./analyticsRoutes'));
router.use('/notifications', require('./notificationRoutes'));

router.get('/health', (req, res) => res.json({ success: true, message: 'Flocks API is healthy', timestamp: new Date() }));

module.exports = router;
