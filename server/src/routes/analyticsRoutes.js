const express = require('express');
const router = express.Router();

const analyticsController = require('../controllers/analyticsController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { loadUnitScope, fromReqScope } = require('../middleware/scopeResolvers');
const { PERMISSIONS } = require('../permissions/permissions');

const orgScope = () => ({});

router.use(authenticate);

router.get('/organization', authorize(PERMISSIONS.VIEW_ORGANIZATION_ANALYTICS, orgScope), analyticsController.getOrganizationAnalytics);

router.get(
  '/parishes/compare',
  authorize(PERMISSIONS.VIEW_ORGANIZATION_ANALYTICS, orgScope),
  analyticsController.compareParishes
);

router.get(
  '/parishes/:parishId',
  authorize(PERMISSIONS.VIEW_PARISH_ANALYTICS, (req) => ({ parishId: req.params.parishId })),
  analyticsController.getParishAnalytics
);

router.get(
  '/units/:unitId',
  loadUnitScope,
  authorize(PERMISSIONS.VIEW_UNIT_ANALYTICS, fromReqScope),
  analyticsController.getUnitAnalytics
);

router.get(
  '/follow-up',
  authorize(PERMISSIONS.VIEW_MEMBER_ANALYTICS, (req) => ({ parishId: req.query.parishId })),
  analyticsController.getFollowUpRecommendations
);

module.exports = router;
