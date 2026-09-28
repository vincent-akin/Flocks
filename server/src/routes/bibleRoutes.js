const express = require('express');
const router = express.Router();

const bibleController = require('../controllers/bibleController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { PERMISSIONS } = require('../permissions/permissions');
const { setFeaturedVerseValidator, createBiblePlanValidator } = require('../validators/bibleValidators');

const orgScope = () => ({});

router.use(authenticate);

router.get('/verses/current', bibleController.getCurrentVerses);
router.post('/verses', validate(setFeaturedVerseValidator), authorize(PERMISSIONS.SET_DAILY_VERSE, orgScope), bibleController.setFeaturedVerse);

router.get('/plans', bibleController.listBiblePlans);
router.get('/plans/mine', bibleController.getMyProgress);
router.get('/plans/:planId', bibleController.getBiblePlan);
router.post(
  '/plans',
  validate(createBiblePlanValidator),
  authorize(PERMISSIONS.CREATE_BIBLE_PLAN, (req) => ({ parishId: req.body.parish })),
  bibleController.createBiblePlan
);
router.post('/plans/:planId/publish', authorize(PERMISSIONS.PUBLISH_BIBLE_PLAN, orgScope), bibleController.publishBiblePlan);
router.post('/plans/:planId/join', bibleController.joinBiblePlan);
router.post('/plans/:planId/progress', bibleController.markDayComplete);

module.exports = router;
