const express = require('express');
const router = express.Router();

const organizationController = require('../controllers/organizationController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { PERMISSIONS } = require('../permissions/permissions');

const orgScope = () => ({}); // organization-scoped routes need no parish/unit target

router.use(authenticate);
router.get('/', authorize(PERMISSIONS.VIEW_ORGANIZATION, orgScope), organizationController.getOrganization);
router.patch('/', authorize(PERMISSIONS.UPDATE_ORGANIZATION, orgScope), organizationController.updateOrganization);

module.exports = router;
