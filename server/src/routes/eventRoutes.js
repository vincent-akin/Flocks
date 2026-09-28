const express = require('express');
const router = express.Router();

const eventController = require('../controllers/eventController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { PERMISSIONS } = require('../permissions/permissions');
const { createEventValidator } = require('../validators/eventValidators');

const scopeFromBody = (req) => ({ parishId: req.body.parish, unitId: req.body.unit });

router.use(authenticate);

router.get('/', eventController.listEvents); // visibility filtering handled in the controller

router.post('/', validate(createEventValidator), authorize(PERMISSIONS.CREATE_EVENT, scopeFromBody), eventController.createEvent);

router.patch('/:eventId', authorize(PERMISSIONS.UPDATE_EVENT, () => ({})), eventController.updateEvent);

router.delete('/:eventId', authorize(PERMISSIONS.DELETE_EVENT, () => ({})), eventController.deleteEvent);

module.exports = router;
