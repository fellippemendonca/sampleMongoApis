'use strict';

const mongoose = require('mongoose');
const configMongo = require('../config/mongo');

module.exports = {
  connect: function() {
    mongoose.connect(configMongo.url);

    mongoose.connection.on('error', function() {
      console.log('Could not connect to the database. Exiting now...');
      process.exit();
    });

    mongoose.connection.once('open', function() {
        console.log("Successfully connected to the database");
    });
  }
}
