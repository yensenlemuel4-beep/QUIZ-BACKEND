const gachaRepository = require('./gacha-repository');
const { errorResponder, errorTypes } = require('../../../core/errors');

function maskName(name) {
  if (!name) return name;
  const parts = name.split(' ');
  if (parts.length === 1) {
    return name.charAt(0) + '*'.repeat(name.length - 1);
  }
  const first = parts[0];
  const last = parts[parts.length - 1];
  const maskedFirst = first.charAt(0) + '*'.repeat(first.length - 1);
  const maskedLast = '*'.repeat(last.length - 1) + last.charAt(last.length - 1);
  return `${maskedFirst} ${maskedLast}`;
}

async function getRemainingHadiah(request, response, next) {
  try {
    const hadiah = await gachaRepository.getPrizes();
    const result = [];
    for (let i = 0; i < hadiah.length; ) {
      result.push({
        name: hadiah[i].name,
        remaining: hadiah[i].remaining,
      });
    }
    return response.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function performGacha(request, response, next) {
  try {
    const { userId } = request.body;
    const today = new Date().toISOString().split('T')[0];

    const daily = await gachaRepository.getLimitGacha(userId, today);
    if (daily && daily.count >= 5) {
      return next(errorResponder(errorTypes.UNPROCESSABLE_ENTITY, 'Reached daily gacha limit'));
    }

    await gachaRepository.incrementLimitGacha(userId, today);

    const prizes = await gachaRepository.getPrizes();
    const availablePrizes = [];
    for (let i = 0; i < prizes.length; i++) {
      if (prizes[i].remaining > 0) {
        availablePrizes.push(prizes[i]);
      }
    }

    if (availablePrizes.length === 0) {
      await gachaRepository.CreateHistory(userId, new Date(), null);
      return response.status(200).json({ prize: null, message: 'No prize won' });
    }

    const randomIndex = Math.floor(Math.random() * availablePrizes.length);
    const wonPrize = availablePrizes[randomIndex];

    await gachaRepository.updatePrizeRemaining(wonPrize.name, wonPrize.remaining - 1);

    await gachaRepository.CreateHistory(userId, new Date(), wonPrize.name);

    return response.status(200).json({ prize: wonPrize.name, message: 'Prize won!' });
  } catch (error) {
    return next(error);
  }
}

async function getUserHistory(request, response, next) {
  try {
    const { userId } = request.params;
    const history = await gachaRepository.getUserHistory(userId);
    const result = [];
    for (let i = 0; i < history.length; i++) {
      result.push({
        date: history[i].date,
        prize: history[i].prize,
      });
    }
    return response.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function getPrizeWinners(request, response, next) {
  try {
    const winnerD = await gachaRepository.winners();
    const result = [];
    for (let i = 0; i < winnerD.length; i++) {
      const winner = winnerD[i];
      const masked = [];
      for (let j = 0; j < winner.winners.length; j++) {
        masked.push(maskName(winner.winners[j]));
      }
      result.push({
        prize: winner._id,
        winners: masked,
      });
    }
    return response.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getRemainingHadiah,
  performGacha,
  getUserHistory,
  getPrizeWinners,
};