const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth');
const { requireSuperAdmin } = require('../middleware/authorize');

// Creating/revoking admins and role assignments is a Super Admin-only
// capability in the MVP - it's the mechanism that grants every other
// permission, so it is deliberately not delegable via the generic
// permission system itself.
router.use(authenticate, requireSuperAdmin);

router.post('/role-assignments', adminController.createRoleAssignment);
router.get('/role-assignments', adminController.listRoleAssignments);
router.patch('/role-assignments/:assignmentId/permissions', adminController.updateRoleAssignmentPermissions);
router.delete('/role-assignments/:assignmentId', adminController.revokeRoleAssignment);

module.exports = router;
