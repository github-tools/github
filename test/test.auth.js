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

describe('Github constructor without authentication data', function() {
   it('should read public information', function(done) {
      var github = new Github();
      var gist = github.getGist('f1c0f84e53aa6b98ec03');

      gist.read(function(err, res, xhr) {
         should.not.exist(err);
         xhr.should.be.instanceof(XMLHttpRequest);
         res.should.be.an('object');

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