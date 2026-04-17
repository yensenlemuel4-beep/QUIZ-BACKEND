const express = require('express');

const usersController = require('./users-controller');

const route = express.Router();

module.exports = (app) => {
  app.use('/users', route);

  route.get('/', usersController.getUsers);

  route.post('/', usersController.createUser);

  route.get('/:id', usersController.getUser);

  route.put('/:id', usersController.updateUser);

  route.put('/:id/change-password', usersController.changePassword);

  route.delete('/:id', usersController.deleteUser);
};
