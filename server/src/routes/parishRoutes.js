const express = require('express');
const router = express.Router();

const parishController = require('../controllers/parishController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { PERMISSIONS } = require('../permissions/permissions');

router.use(authenticate);

router.get('/', authorize(PERMISSIONS.VIEW_PARISH, () => ({})), parishController.listParishes);
router.post('/', authorize(PERMISSIONS.CREATE_PARISH, () => ({})), parishController.createParish);
router.get('/:parishId', authorize(PERMISSIONS.VIEW_PARISH, (req) => ({ parishId: req.params.parishId })), parishController.getParish);
router.patch(
  '/:parishId',
  authorize(PERMISSIONS.UPDATE_PARISH, (req) => ({ parishId: req.params.parishId })),
  parishController.updateParish
);
router.delete('/:parishId', authorize(PERMISSIONS.DELETE_PARISH, () => ({})), parishController.deleteParish);

module.exports = router;
