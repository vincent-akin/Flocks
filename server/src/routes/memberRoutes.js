const express = require('express');
const router = express.Router();

const memberController = require('../controllers/memberController');
const { authenticate } = require('../middleware/auth');
const { authorize, authorizeSelfOrPermission } = require('../middleware/authorize');
const { loadMemberScope, fromReqScope } = require('../middleware/scopeResolvers');
const validate = require('../middleware/validate');
const { PERMISSIONS } = require('../permissions/permissions');
const { createMemberValidator, transferMemberValidator } = require('../validators/memberValidators');

const scopeFromQueryParish = (req) => ({ parishId: req.query.parishId });

router.use(authenticate);

router.get('/', authorize(PERMISSIONS.VIEW_MEMBERS, scopeFromQueryParish), memberController.listMembers);

router.post(
  '/',
  validate(createMemberValidator),
  authorize(PERMISSIONS.CREATE_MEMBER, (req) => ({ parishId: req.body.primaryParish })),
  memberController.createMember
);

router.get(
  '/:memberId',
  loadMemberScope,
  authorizeSelfOrPermission(PERMISSIONS.VIEW_MEMBERS, (req) => req.params.memberId, fromReqScope),
  memberController.getMember
);

router.patch(
  '/:memberId',
  loadMemberScope,
  authorizeSelfOrPermission(PERMISSIONS.UPDATE_MEMBER, (req) => req.params.memberId, fromReqScope),
  memberController.updateMember
);

router.patch(
  '/:memberId/status',
  loadMemberScope,
  authorize(PERMISSIONS.UPDATE_MEMBER, fromReqScope),
  memberController.updateMemberStatus
);

router.post(
  '/:memberId/transfer',
  validate(transferMemberValidator),
  loadMemberScope,
  authorize(PERMISSIONS.TRANSFER_MEMBER, fromReqScope),
  memberController.transferMember
);

router.get(
  '/:memberId/history',
  loadMemberScope,
  authorizeSelfOrPermission(PERMISSIONS.VIEW_MEMBER_HISTORY, (req) => req.params.memberId, fromReqScope),
  memberController.getMemberHistory
);

module.exports = router;
