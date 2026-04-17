const express = require('express');

const gachaController = require('./gacha-controller');

const route = express.Router();

module.exports = (app) => {
  app.use('/gacha', route);

  route.post('/', gachaController.performGacha);

  route.get('/hadiah', gachaController.getRemainingHadiah);

  route.get('/history/:userId', gachaController.getUserHistory);

  route.get('/winners', gachaController.getPrizeWinners);
};
