const express = require('express');

const gacha = require('./components/gacha/gacha-route');
const users = require('./components/users/users-route');

module.exports = () => {
  const app = express.Router();

  gacha(app);
  users(app);

  return app;
};
