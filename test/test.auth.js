'use strict';

var Github = require('../src/github.js');
var testUser = require('./user.json');
var github, user;

describe('Github constructor', function() {
   before(function() {
      github = new Github({
         username: testUser.USERNAME,
         password: testUser.PASSWORD,
         auth: 'basic'
      });

      user = github.getUser();
   });

   it('should authenticate and return no errors', function(done) {
      user.notifications(function(err) {
         should.not.exist(err);
         done();
      });
   });
});

describe('Github constructor (failing case)', function() {
   before(function() {
      github = new Github({
         username: testUser.USERNAME,
         password: 'fake124',
         auth: 'basic'
      });

      user = github.getUser();
   });

   it('should fail authentication and return err', function(done) {
      user.notifications(function(err) {
         err.error.should.equal(401, 'Return 401 status for bad auth');
         JSON.parse(err.request.responseText).message.should.equal('Bad credentials');
         done();
      });
   });
});