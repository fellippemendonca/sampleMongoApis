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


/**
 * Returns the mongo collection created object.
 * @example create(object) => object
 * @param {Object} 
 * @return {Object} mongodb created object
 */
function create(sample) { return Sample.create(sample); }


/**
 * Returns a mongo response while updating the object.
 * @example update(string, Object) => { n: 1, nModified: 1, ok: 1 }
 * @param {string, Object}
 * @return {object} mongodb created object
 */
function update(id, sample) { return Sample.update({ _id: id }, sample); }


/**
 * Returns true or throws an error while removing the object.
 * @example remove(string) => true
 * @param {string} 
 * @return {bool} mongodb created object
 */
function remove(id) { return Sample.remove({ _id: id }); }


/**
 * Returns the mongo collection created object.
 * @example create(object) => object
 * @param {Object} 
 * @return {Object} mongodb created object
 */
function search(sample) { return Sample.find(sample); }


/**
 * Returns the mongo collection all objects.
 * @example searchAll() => object
 * @param {Object} 
 * @return {Array} mongodb created object
 */
function searchAll() { return Sample.find({}); }


/**
 * Returns, between two dates, the sum of partition values below threhold inclusive,
 * and the sum of partition values above threhold.
 * @example sum(startDate, endDate, threshold) => { key: 10, above: 78, below: 35 }
 * @param {Date, Date, int}
 * @return {Object} the calculated threshold sum above and below
 */
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


/**
 * Returns, between two dates, the sum of partition values below threhold inclusive,
 * and the sum of partition values above threhold.
 * @example sum(startDate, endDate, thresholds) => 
 * [ { key: 10, below: 35 },
     { key: 35, below: 56 },
     { key: 999, below: 22 } ]
 * @param {Date, Date, Array}
 * @return {Array} the calculated thresholds sum
 */
function sumExtended(startDate, endDate, thresholds) {

  let conditions = buildCond(thresholds.sort((a, b) => { return a - b }));

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
// Builds dinamically conditions for an array of elements.
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
