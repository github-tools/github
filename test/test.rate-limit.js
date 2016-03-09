'use strict';

var Github = require('../src/github.js');

var expect = require('must');
var testUser = require('./fixtures/user.json');
var assertSuccessful = require('./helpers').assertSuccessful;

describe('Github.RateLimit', function() {
   var github, rateLimit;

   before(function() {
      github = new Github({
         username: testUser.USERNAME,
         password: testUser.PASSWORD,
         auth: 'basic'
      });

      rateLimit = github.getRateLimit();
   });

   it('should get rate limit', function(done) {
      rateLimit.getRateLimit(assertSuccessful(done, function(err, rateInfo) {
         var rate = rateInfo.rate;

         expect(rate).to.be.an.object();
         expect(rate).to.have.own('limit');
         expect(rate).to.have.own('remaining');
         expect(rate.limit).to.be.a.number();
         expect(rate.remaining).to.be.a.number();
         expect(rate.remaining).to.be.at.most(rateInfo.rate.limit);

         done();
      }));
   });
});
