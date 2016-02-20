'use strict';

var Github = require('../src/github.js');
var testUser = require('./user.json');
var github, rateLimit;

describe('Github.RateLimit', function() {
   before(function() {
      github = new Github({
         username: testUser.USERNAME,
         password: testUser.PASSWORD,
         auth: 'basic'
      });

      rateLimit = github.getRateLimit();
   });

   it('should get rate limit', function(done) {
      rateLimit.getRateLimit(function(err, rateInfo) {
         should.not.exist(err);
         rateInfo.should.be.an('object');
         rateInfo.should.have.deep.property('rate.limit');
         rateInfo.rate.limit.should.be.a('number');
         rateInfo.should.have.deep.property('rate.remaining');
         rateInfo.rate.remaining.should.be.a('number');
         rateInfo.rate.remaining.should.be.at.most(rateInfo.rate.limit);
         done();
      });
   });
});
