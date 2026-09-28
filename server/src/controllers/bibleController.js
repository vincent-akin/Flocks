const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const FeaturedVerse = require('../models/FeaturedVerse');
const BiblePlan = require('../models/BiblePlan');
const BibleReading = require('../models/BibleReading');
const { recordAudit } = require('../utils/audit');

function rangeForType(type, startDate) {
  const start = startDate ? new Date(startDate) : new Date();
  const end = new Date(start);
  if (type === 'DAILY') end.setDate(end.getDate() + 1);
  if (type === 'WEEKLY') end.setDate(end.getDate() + 7);
  if (type === 'YEARLY') end.setFullYear(end.getFullYear() + 1);
  return { start, end };
}

const setFeaturedVerse = catchAsync(async (req, res) => {
  const { type, reference, text, translation, startDate } = req.body;
  const { start, end } = rangeForType(type, startDate);

  const verse = await FeaturedVerse.create({
    organization: req.organizationId,
    type,
    reference,
    text,
    translation,
    startDate: start,
    endDate: end,
    setBy: req.user._id,
  });

  await recordAudit({ req, action: `SET_${type}_VERSE`, resource: 'FeaturedVerse', resourceId: verse._id, newValue: verse });

  res.status(201).json({ success: true, data: verse });
});

const getCurrentVerses = catchAsync(async (req, res) => {
  const now = new Date();
  const [daily, weekly, yearly] = await Promise.all(
    ['DAILY', 'WEEKLY', 'YEARLY'].map((type) =>
      FeaturedVerse.findOne({
        organization: req.organizationId,
        type,
        startDate: { $lte: now },
        endDate: { $gt: now },
      }).sort({ startDate: -1 })
    )
  );
  res.json({ success: true, data: { daily, weekly, yearly } });
});

const listBiblePlans = catchAsync(async (req, res) => {
  const filter = { organization: req.organizationId };
  if (req.query.published !== undefined) filter.isPublished = req.query.published === 'true';
  const plans = await BiblePlan.find(filter).sort({ startDate: -1 });
  res.json({ success: true, data: plans });
});

const getBiblePlan = catchAsync(async (req, res) => {
  const plan = await BiblePlan.findOne({ _id: req.params.planId, organization: req.organizationId });
  if (!plan) throw ApiError.notFound('Bible plan not found');
  res.json({ success: true, data: plan });
});

const createBiblePlan = catchAsync(async (req, res) => {
  const plan = await BiblePlan.create({
    organization: req.organizationId,
    parish: req.body.parish,
    title: req.body.title,
    description: req.body.description,
    planType: req.body.planType || 'CUSTOM',
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    dailyReadings: req.body.dailyReadings,
    createdBy: req.user._id,
  });

  await recordAudit({ req, action: 'CREATE_BIBLE_PLAN', resource: 'BiblePlan', resourceId: plan._id, newValue: plan });

  res.status(201).json({ success: true, data: plan });
});

const publishBiblePlan = catchAsync(async (req, res) => {
  const plan = await BiblePlan.findOneAndUpdate(
    { _id: req.params.planId, organization: req.organizationId },
    { isPublished: true },
    { new: true }
  );
  if (!plan) throw ApiError.notFound('Bible plan not found');

  await recordAudit({ req, action: 'PUBLISH_BIBLE_PLAN', resource: 'BiblePlan', resourceId: plan._id });

  res.json({ success: true, data: plan });
});

const joinBiblePlan = catchAsync(async (req, res) => {
  const plan = await BiblePlan.findOne({ _id: req.params.planId, organization: req.organizationId, isPublished: true });
  if (!plan) throw ApiError.notFound('Bible plan not found or not yet published');
  if (!req.user.member) throw ApiError.badRequest('Only a member profile can join a Bible plan');

  const existing = await BibleReading.findOne({ plan: plan._id, member: req.user.member });
  if (existing) return res.json({ success: true, data: existing });

  const reading = await BibleReading.create({ organization: req.organizationId, plan: plan._id, member: req.user.member });
  res.status(201).json({ success: true, data: reading });
});

const markDayComplete = catchAsync(async (req, res) => {
  const { day } = req.body;
  const plan = await BiblePlan.findOne({ _id: req.params.planId, organization: req.organizationId });
  if (!plan) throw ApiError.notFound('Bible plan not found');

  const reading = await BibleReading.findOne({ plan: plan._id, member: req.user.member });
  if (!reading) throw ApiError.badRequest('You have not joined this plan yet');

  if (!reading.daysCompleted.includes(day)) {
    reading.daysCompleted.push(day);
    reading.daysCompleted.sort((a, b) => a - b);
  }

  const today = new Date();
  const lastRead = reading.lastReadAt;
  const isConsecutive = lastRead && (today - lastRead) / (1000 * 60 * 60 * 24) <= 1.5;
  reading.currentStreak = isConsecutive ? reading.currentStreak + 1 : 1;
  reading.longestStreak = Math.max(reading.longestStreak, reading.currentStreak);
  reading.lastReadAt = today;

  if (req.body.note) reading.notes.push({ day, text: req.body.note });

  await reading.save();

  const completionPercentage = Math.round((reading.daysCompleted.length / plan.dailyReadings.length) * 100);

  res.json({ success: true, data: { ...reading.toObject(), completionPercentage } });
});

const getMyProgress = catchAsync(async (req, res) => {
  if (!req.user.member) throw ApiError.badRequest('No member profile associated with this account');
  const readings = await BibleReading.find({ member: req.user.member }).populate('plan', 'title planType dailyReadings');
  const withProgress = readings.map((r) => ({
    ...r.toObject(),
    completionPercentage: r.plan ? Math.round((r.daysCompleted.length / r.plan.dailyReadings.length) * 100) : 0,
  }));
  res.json({ success: true, data: withProgress });
});

module.exports = {
  setFeaturedVerse,
  getCurrentVerses,
  listBiblePlans,
  getBiblePlan,
  createBiblePlan,
  publishBiblePlan,
  joinBiblePlan,
  markDayComplete,
  getMyProgress,
};
