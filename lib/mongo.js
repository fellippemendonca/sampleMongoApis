'use strict';

const mongoose = require('mongoose');

module.exports = {
  connect: function() {
    mongoose.connect('mongodb://localhost:27017/sample');

    mongoose.connection.on('error', function() {
      console.log('Could not connect to the database. Exiting now...');
      process.exit();
    });

    mongoose.connection.once('open', function() {
        console.log("Successfully connected to the database");
    });
  }
}
