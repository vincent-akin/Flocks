const express = require('express');
const router = express.Router();

const attendanceController = require('../controllers/attendanceController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { PERMISSIONS } = require('../permissions/permissions');
const { createAttendanceSessionValidator, markAttendanceValidator } = require('../validators/attendanceValidators');

const scopeFromBodyOrQuery = (req) => ({
  parishId: req.body.parish || req.query.parishId,
  unitId: req.body.unit || req.query.unitId,
});

router.use(authenticate);

router.get('/sessions', authorize(PERMISSIONS.VIEW_ATTENDANCE, scopeFromBodyOrQuery), attendanceController.listAttendanceSessions);

router.post(
  '/sessions',
  validate(createAttendanceSessionValidator),
  authorize(PERMISSIONS.CREATE_ATTENDANCE_SESSION, scopeFromBodyOrQuery),
  attendanceController.createAttendanceSession
);

router.post(
  '/sessions/:sessionId/rotate',
  authorize(PERMISSIONS.CREATE_ATTENDANCE_SESSION, () => ({})),
  attendanceController.rotateAttendanceToken
);

router.post(
  '/sessions/:sessionId/close',
  authorize(PERMISSIONS.EDIT_ATTENDANCE, () => ({})),
  attendanceController.closeAttendanceSession
);

router.get(
  '/sessions/:sessionId/records',
  authorize(PERMISSIONS.VIEW_ATTENDANCE, () => ({})),
  attendanceController.getSessionRecords
);

router.post('/sessions/:sessionId/mark', validate(markAttendanceValidator), attendanceController.markAttendance);

router.post(
  '/sessions/:sessionId/mark-manual',
  authorize(PERMISSIONS.EDIT_ATTENDANCE, () => ({})),
  attendanceController.markAttendanceManually
);

module.exports = router;
