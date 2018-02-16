'use strict';

const mongoose = require('mongoose'); 

/*
{
 timestamp: ISODate(‘2016-02-02’),
 partitions: [
 { key: 5, val: 20 },
 { key: 10, val: 15 },
 { key: 15, val: 55 },
 { key: 35, val: 1 },
 { key: 95, val: 22 },
 ]
}
*/

module.exports = mongoose.model('Sample', new mongoose.Schema({
  timestamp: { type: Date },
  partitions: [{
    key: { type: Number }, val: { type: Number }
  }]
}));