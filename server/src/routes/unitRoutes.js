const express = require('express');
const router = express.Router();

const unitController = require('../controllers/unitController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { loadUnitScope, fromReqScope } = require('../middleware/scopeResolvers');
const validate = require('../middleware/validate');
const { PERMISSIONS } = require('../permissions/permissions');
const { createUnitValidator, addUnitMemberValidator } = require('../validators/unitValidators');

router.use(authenticate);

router.get('/', authorize(PERMISSIONS.VIEW_MEMBERS, (req) => ({ parishId: req.query.parishId })), unitController.listUnits);

router.post(
  '/',
  validate(createUnitValidator),
  authorize(PERMISSIONS.CREATE_UNIT, (req) => ({ parishId: req.body.parish })),
  unitController.createUnit
);

router.get('/:unitId', loadUnitScope, authorize(PERMISSIONS.VIEW_MEMBERS, fromReqScope), unitController.getUnit);

router.patch('/:unitId', loadUnitScope, authorize(PERMISSIONS.UPDATE_UNIT, fromReqScope), unitController.updateUnit);

router.delete('/:unitId', loadUnitScope, authorize(PERMISSIONS.DELETE_UNIT, fromReqScope), unitController.deleteUnit);

router.get(
  '/:unitId/members',
  loadUnitScope,
  authorize(PERMISSIONS.MANAGE_UNIT_MEMBERS, fromReqScope),
  unitController.listUnitMembers
);

router.post(
  '/:unitId/members',
  validate(addUnitMemberValidator),
  loadUnitScope,
  authorize(PERMISSIONS.MANAGE_UNIT_MEMBERS, fromReqScope),
  unitController.addUnitMember
);

router.delete(
  '/:unitId/members/:memberId',
  loadUnitScope,
  authorize(PERMISSIONS.MANAGE_UNIT_MEMBERS, fromReqScope),
  unitController.removeUnitMember
);

router.post(
  '/:unitId/admins',
  loadUnitScope,
  authorize(PERMISSIONS.MANAGE_UNIT_ADMINS, fromReqScope),
  unitController.assignUnitAdmin
);

module.exports = router;
