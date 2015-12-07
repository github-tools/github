'use strict';

var testUser;

if (typeof window === 'undefined') {
   var Github = require('../');
   var callbackWithError = require('./helpers.js');

   testUser = require('./user.json');

   // Module dependencies
   var chai = require('chai');

   // Use should flavour for Mocha
   var should = chai.should();
}

describe('Authentication', function() {
   before(function() {
      if (typeof window !== 'undefined') testUser = window.__fixtures__['test/user'];
   });

   it('should authenticate with valid credentials', function(done) {
      var github = new Github({
         username: testUser.USERNAME,
         password: testUser.PASSWORD,
         auth: 'basic'
      });
      var user = github.getUser();

      user.notifications(callbackWithError(done, function(err) {
         should.not.exist(err);
         done();
      }));
   });

   it('should fail authentication with invalid credentials', function(done) {
      var github = new Github({
         username: testUser.USERNAME,
         password: 'fake124',
         auth: 'basic'
      });
      var user = github.getUser();

      user.notifications(callbackWithError(done, function(err) {
         err.status.should.equal(401, 'Return 401 status for bad auth');
         err.response.data.message.should.equal('Bad credentials');

         done();
      }));
   });
});
