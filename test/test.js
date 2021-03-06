'use strict';

const mongoose = require('mongoose');
const collections = require('../collections');
const assert = require('assert');

describe('Database Tests', () => {

  before((done) => {
    mongoose.connect('mongodb://localhost/testDatabase');
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'MongoDB Connection Error'));
    db.once('open', () => {
      console.log('MongoDB Connected Successfully.');
      done();
    });
  });


  describe('Test Database', () => {

    let newSample = {
      timestamp: new Date('2016-02-02'),
      partitions: []
    }

    it('New sample created at testDatabase', (done) => {
      collections.sample.create(newSample)
        .then(res => { done(); newSample = res })
        .catch(err => { throw err; })
    });

    it('Should retrieve data from test database', (done) => {
      collections.sample.searchAll()
        .then(res => {
          if (res.length > 0) {
            done();
          } else {
            throw new Error('No data!');
          };
        })
        .catch(err => { throw err });
    });

    it('Should update data from test database', (done) => {

      const newValues = {
        timestamp: new Date('2016-02-01'),
        partitions: [{ key: 15, val: 55 }]
      };

      collections.sample.update(newSample._id, newValues)
        .then(res => {
          const expected = { n: 1, nModified: 1, ok: 1 };
          assert.deepEqual(res, expected)
          done();
        })
        .catch(err => { throw err });
        
    });

    it('Should update data from test database', (done) => {
      const newValues = { 
        timestamp: new Date('2016-02-02'),
        partitions: [
          { key: 5, val: 20 },
          { key: 10, val: 15 },
          { key: 15, val: 55 },
          { key: 35, val: 1 },
          { key: 95, val: 22 }
        ]
      };

      collections.sample.update(newSample._id, newValues)
        .then(res => {
          const expected = { n: 1, nModified: 1, ok: 1 };
          assert.deepEqual(res, expected)
          done();
        })
        .catch(err => { throw err });
    });
    
    it('Should retrieve the correct simple sum from test database', (done) => {
      collections.sample.sum('2016-02-01', '2016-02-03', 10)
        .then(res => {
          const expected = { key: 10, below: 35, above: 78};
          assert.deepEqual(res, expected);
          done(); 
        })
        .catch(err => { throw err });
    });

    it('Should not retrieve any values for simple sum from test database using offset date range', (done) => {
      collections.sample.sum('2018-02-01', '2018-02-03', 10)
        .then(res => {
          const expected = {};
          assert.deepEqual(res, expected);
          done(); 
        })
        .catch(err => { throw err });
    });


    it('Should not retrieve any values for simple sum from test database using threshold 999', (done) => {
      collections.sample.sum('2018-02-01', '2018-02-03', 999)
        .then(res => {
          const expected = {};
          assert.deepEqual(res, expected);
          done(); 
        })
        .catch(err => { throw err });
    });


    it('Should retrieve the correct extended sum from test database', (done) => {
      collections.sample.sumExtended('2016-02-01', '2016-02-03', [10, 35])
        .then(res => {
          if (res.length > 0) {
            const expected = [
              { key: 10, below: 35},
              { key: 35, below: 56},
              { key: 999, below: 22}
             ];
            assert.deepEqual(res, expected);
            done();
          } else {
            throw new Error('No data!');
          };
        })
        .catch(err => { throw err });
    });

    it('Should not retrieve any values for extended sum from test database', (done) => {
      collections.sample.sumExtended('2018-02-01', '2018-02-03', [10, 35])
        .then(res => {
          const expected = [];
          assert.deepEqual(res, expected);
          done();
        })
        .catch(err => { throw err });
    });

    it('Should retrieve the total sum of values for extended sum from test database', (done) => {
      collections.sample.sumExtended('2016-02-01', '2016-02-03', [999])
        .then(res => {
          const expected = [ {key: 999, below: 113} ];
          assert.deepEqual(res, expected);
          done();
        })
        .catch(err => { throw err });
    });

    it('Should remove data from test database', (done) => {
      collections.sample.remove(newSample._id)
        .then(res => {
          const expected = { n: 1, ok: 1 };
          assert.deepEqual(res, expected)
          done();
        })
        .catch(err => { throw err });
    });

    it('Should remove inexistent data from test database', (done) => {
      collections.sample.remove(newSample._id)
        .then(res => {
          const expected = { n: 0, ok: 1 };
          assert.deepEqual(res, expected)
          done();
        })
        .catch(err => { throw err });
    });

  });

  after((done) => {
    mongoose.connection.db.dropDatabase(() => {
      mongoose.connection.close(done);
    });
  });

});