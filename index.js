'use strict';

const mongo = require('./lib/mongo');
const collections = require('./collections');
const assert = require('assert');

mongo.connect();

// This is the sample to be created at mongoDB samples collection.
let newSample = {
    timestamp: new Date('2016-02-02'),
    partitions: [
    { key: 5, val: 20 },
    { key: 10, val: 15 },
    { key: 15, val: 55 },
    { key: 35, val: 1 },
    { key: 95, val: 22 }
  ]
}

/**
 * 1 - The sequence will create a new sample object at samples collection
 * 2 - calculate simple sum at samples collection
 * 3 - calculate extended sum at samples collection
 * 4 - update created object
 * 5 - exlude created object
 */

console.log('\n  -- Creating new Sample -- ');collections.sample.create(newSample)
  .then(createdSample => {
    console.log(createdSample);
    
    // Execute the first part of challenge
    collections.sample.sum('2016-02-01', '2016-02-03', 10)
      .then(res => {
        console.log('\n  -- Executed Simple Sum -- ');
        console.log(res);

        let expected = { key: 10, below: 35, above: 78};
        console.log(`The object is equal to expected? ${isEqual(res, expected)}`)
      })
      .catch(err => {
        console.log(err);
      });

    // Execute the extended part of the challenge
    collections.sample.sumExtended('2016-02-01', '2016-02-03', [10, 35])
      .then(res => {
        console.log('\n  -- Executed Extended Sum -- ');
        console.log(res);

        let expected = [
          { key: 10, below: 35},
          { key: 35, below: 56},
          { key: 999, below: 22}
         ];
        console.log(`The object is equal to expected? ${isEqual(res, expected)}`)        
      })
      .catch(err => { console.log(err); })
      .then(() => {
        console.log('\n -- Updating collection object -- ');
        collections.sample.update(createdSample._id, {timestamp: new Date('2016-02-01')})
          .then(res => {
            console.log(res);

            console.log('\n -- Removing collection object -- ');
            collections.sample.remove(createdSample._id)
              .then(res => { console.log(res); })
              .catch(err => { console.log(err); });
          }); 
      });
    
  })
  .catch(err => { console.log(err); });

// helpers
function isEqual(obj1, obj2) {
  try {
    assert.deepEqual(obj1, obj2);
    return true;
  } catch (err) {
    return false;
  }
}