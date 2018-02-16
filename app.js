'use strict';

const mongo = require('./lib/mongo');
const collections = require('./collections');
const assert = require('assert');

mongo.connect();


let newSample = {
      timestamp: new Date('2016-02-01', '2016-02-03'),
      partitions: [
      { key: 5, val: 20 },
      { key: 10, val: 15 },
      { key: 15, val: 55 },
      { key: 35, val: 1 },
      { key: 95, val: 22 }
    ]
  }

/*
Const result = await sum('2016-02-01', '2016-02-03', 10);
result.should.equal({ key: 10, below: 35, above: 78});
*/
collections.sample.sum('2018-02-01', '2019-02-03', 10)
  .then(res => {
    console.log('simple sum');
    console.log(res);
    assert.deepEqual(res, { key: 10, below: 35, above: 78});
    })
  .catch(err => {
    console.log(err);
  });


/*
Const result = await sum('2016-02-01', '2016-02-03', [10, 35]);
result.should.equal([
 { key: 10, below: 35},
 { key: 35, below: 56},
 { key: 999, below: 22}
]);
*/
collections.sample.sumExtended('2018-02-01', '2019-02-03', [10, 35])
  .then(res => {
    console.log('extended sum');
    console.log(res);
    assert.deepEqual(res, [
      { key: 10, below: 35},
      { key: 35, below: 56},
      { key: 999, below: 22}
     ]);
    
  })
  .catch(err => {
    console.log(err);
  });
