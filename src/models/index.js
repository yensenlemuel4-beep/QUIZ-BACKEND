const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const config = require('../core/config');
const logger = require('../core/logger')('app');

// MongoDB Atlas connection with proper options
const mongooseOptions = {
  retryWrites: true,
  w: 'majority',
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 5000,
};

mongoose.connect(config.database.connection, mongooseOptions);

const db = mongoose.connection;

db.on('error', (err) => {
  logger.error(err, 'MongoDB connection error');
});

db.once('open', () => {
  logger.info('Successfully connected to MongoDB');
});

const dbExports = {};
dbExports.db = db;

const basename = path.basename(__filename);

fs.readdirSync(__dirname)
  .filter(
    (file) =>
      file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js'
  )
  .forEach((file) => {
    const exportedData = require(path.join(__dirname, file))(mongoose);

    if (exportedData && exportedData.modelName) {
      dbExports[exportedData.modelName] = exportedData;
    } else if (exportedData && typeof exportedData === 'object') {
      Object.keys(exportedData).forEach((key) => {
        dbExports[key] = exportedData[key];
      });
    }
  });

module.exports = dbExports;
