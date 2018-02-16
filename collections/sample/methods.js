'use strict';

const Sample = require('./model/Sample');


module.exports = {
  create: create,
  update: update,
  remove: remove,
  search: search,
  searchAll: searchAll,
  sum: sum,
  sumExtended: sumExtended
};


function create(sample) { return Sample.create(sample); }

function update(sample) { return Sample.update(sample); }

function remove(sample) { return Sample.delete(sample); }

function search(sample) { return Sample.find(sample); }

function searchAll() { return Sample.find({}); }


function sum(startDate, endDate, threshold) {
  return Sample.aggregate([
    { $match: { timestamp: { $gte: new Date(startDate), $lte: new Date(endDate) } } },
    { $unwind: '$partitions' },
    {
      $group: {
        _id: { $cond: [ { '$lte': [ '$partitions.key', threshold ] }, 'below' , 'above' ]},
        sum: { $sum: '$partitions.val' }
      }
    }
  ])
    .then(samples => {
      let result = {};
      samples.map(sample => {
        result.key = threshold;
        sample._id === 'above' ? result.above = sample.sum : result.below = sample.sum;
      });
      return result;
    })
}


function sumExtended(startDate, endDate, thresholds) {

  let conditions = buildCond(thresholds);

  return Sample.aggregate([
    { $match: { timestamp: { $gte: new Date(startDate), $lte: new Date(endDate) } } },
    { $unwind: '$partitions' },
    {
      $group: {
        _id: conditions,
        below: { $sum: '$partitions.val' }
      }
    }
  ])
    .then(samples => {
      return samples.map(sample => {
        return { key:sample._id, below: sample.below }
      }).sort((a, b) => { return a.key - b.key });
    })
}


// HELPER
function buildCond(elements) {
  let length = elements.length;

  if (length > 0) {
    let current = elements[0];
    let nextList = elements.slice(1, elements.length);
    return { $cond: [ { "$lte": [ "$partitions.key", current ] }, current, buildCond(nextList) ] };
  
  } else {
    return 999
  }
}
