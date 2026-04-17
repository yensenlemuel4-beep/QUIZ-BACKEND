const { Hadiah, GachaHistory, LimitGacha } = require('../../../models');

async function getPrizes() {
  return Hadiah.find({});
}

async function getPrizeUser(name) {
  return Hadiah.findOne({ name });
}

async function updatePrizeRemaining(name, remaining) {
  return Hadiah.updateOne({ name }, { $set: { remaining } });
}

async function getLimitGacha(userId, date) {
  return LimitGacha.findOne({ userId, date });
}

async function incrementLimitGacha(userId, date) {
  return LimitGacha.findOneAndUpdate(
    { userId, date },
    { $inc: { count: 1 } },
    { upsert: true, new: true }
  );
}

async function CreateHistory(userId, date, prize) {
  return GachaHistory.create({ userId, date, prize });
}

async function getUserHistory(userId) {
  return GachaHistory.find({ userId }).sort({ date: -1 });
}

async function winners() {
  const winnerList = await GachaHistory.aggregate([
    { $match: { prize: { $ne: null } } },
    { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
    { $unwind: '$user' },
    { $group: { _id: '$prize', winners: { $push: '$user.full_name' } } },
  ]);
  return winnerList;
}

module.exports = {
  getPrizes,
  getPrizeUser,
  updatePrizeRemaining,
  getLimitGacha,
  incrementLimitGacha,
  CreateHistory,
  getUserHistory,
  winners,
};