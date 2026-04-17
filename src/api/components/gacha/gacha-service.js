const gachaRepository = require('./gacha-repository');

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

async function getRemainingHadiah() {
  const hadiah = await gachaRepository.getPrizes();
  return hadiah.map((h) => ({
    name: h.name,
    remaining: h.remaining,
  }));
}

async function performGacha(userId) {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  const daily = await gachaRepository.getLimitGacha(userId, today);
  if (daily.count >= 5) {
    throw new Error('Daily gacha limit reached');
  }

  await gachaRepository.incrementLimitGacha(userId, today);

  const prizes = await gachaRepository.getPrizes();
  const availablePrizes = prizes.filter((p) => p.remaining > 0);

  if (availablePrizes.length === 0) {
    await gachaRepository.CreateHistory(userId, new Date(), null);
    return { prize: null, message: 'No prize won' };
  }

  const randomIndex = Math.floor(Math.random() * availablePrizes.length);
  const wonPrize = availablePrizes[randomIndex];

  await gachaRepository.updatePrizeRemaining(
    wonPrize.name,
    wonPrize.remaining - 1
  );

  await gachaRepository.createGachaHistory(userId, new Date(), wonPrize.name);

  return { prize: wonPrize.name, message: 'Prize won!' };
}

async function getUserGachaHistory(userId) {
  const history = await gachaRepository.getUserHistory(userId);
  return history.map((h) => ({
    date: h.date,
    prize: h.prize,
  }));
}

async function getPrizeWinners() {
  const winners = await gachaRepository.getWinners();
  return winners.map((w) => ({
    prize: w._id,
    winners: w.winners.map(maskName),
  }));
}

module.exports = {
  getRemainingHadiah,
  performGacha,
  getUserGachaHistory,
  getPrizeWinners,
};
