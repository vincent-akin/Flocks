const express = require('express');
const router = express.Router();

const prayerController = require('../controllers/prayerController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { loadPrayerRequestScope, fromReqScope } = require('../middleware/scopeResolvers');
const validate = require('../middleware/validate');
const { PERMISSIONS } = require('../permissions/permissions');
const { createPrayerRequestValidator, addTestimonyValidator } = require('../validators/prayerValidators');

router.use(authenticate);

router.post('/', validate(createPrayerRequestValidator), prayerController.submitPrayerRequest);
router.get('/', prayerController.listPrayerRequests); // visibility handled inside the controller
router.get('/testimonies', authorize(PERMISSIONS.VIEW_TESTIMONIES, (req) => ({ parishId: req.query.parishId })), prayerController.listTestimonies);
router.patch(
  '/testimonies/:testimonyId/moderate',
  authorize(PERMISSIONS.MODERATE_TESTIMONIES, () => ({})),
  prayerController.moderateTestimony
);

router.get('/:requestId', prayerController.getPrayerRequest); // access rules handled inside the controller

router.patch(
  '/:requestId/status',
  loadPrayerRequestScope,
  authorize(PERMISSIONS.MANAGE_PRAYER_REQUESTS, fromReqScope),
  prayerController.updatePrayerRequestStatus
);

router.patch(
  '/:requestId/assign',
  loadPrayerRequestScope,
  authorize(PERMISSIONS.ASSIGN_PRAYER_REQUEST, fromReqScope),
  prayerController.assignPrayerRequest
);

router.post('/:requestId/testimony', validate(addTestimonyValidator), prayerController.addTestimony);

module.exports = router;
