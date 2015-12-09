'use strict';

var testUser;

if (typeof window === 'undefined') {
   // Module dependencies
   var chai = require('chai');
   var Github = require('../');
   var callbackWithError = require('./helpers.js');

   testUser = require('./user.json');

   // Use should flavour for Mocha
   var should = chai.should();
}

describe('User', function() {
   var user, github;

   before(function() {
      if (typeof window !== 'undefined') testUser = window.__fixtures__['test/user'];
      github = new Github({
         username: testUser.USERNAME,
         password: testUser.PASSWORD,
         auth: 'basic'
      });
      user = github.getUser();
   });

   it('should get user repos', function(done) {
      user.repos(callbackWithError(done, function(err) {
         should.not.exist(err);
         done();
      }));
   });

   it('should get user repos with options', function(done) {
      var options = {
         type: 'owner',
         sort: 'updated',
         per_page: 10, // jscs:ignore
         page: 1
      };

      user.repos(options, callbackWithError(done, function(err, repos) {
         repos.should.have.length(10);
         should.not.exist(err);

         done();
      }));
   });

   it('should get user orgs', function(done) {
      user.orgs(callbackWithError(done, function(err) {
         should.not.exist(err);
         done();
      }));
   });

   it('should get user gists', function(done) {
      user.gists(function(err) {
         should.not.exist(err);
         done();
      });
   });

   it('should get user notifications', function(done) {
      user.notifications(callbackWithError(done, function(err) {
         should.not.exist(err);
         done();
      }));
   });

   it('should get user notifications with options', function(done) {
      var options = {
         all: true,
         participating: true,
         since: '2015-01-01T00:00:00Z',
         before: '2015-02-01T00:00:00Z'
      };

      user.notifications(options, callbackWithError(done, function(err) {
         should.not.exist(err);
         done();
      }));
   });

   it('should show user', function(done) {
      user.show('ingalls', callbackWithError(done, function(err) {
         should.not.exist(err);
         done();
      }));
   });

   it('should show user\'s repos', function(done) {
      // This is odd; userRepos times out on the test user, but user.repos does not.
      user.userRepos('aendrew', callbackWithError(done, function(err) {
         should.not.exist(err);
         done();
      }));
   });

   it('should show user\'s starred repos', function(done) {
      user.userStarred(testUser.USERNAME, callbackWithError(done, function(err) {
         should.not.exist(err);
         done();
      }));
   });

   it('should show user\'s gists', function(done) {
      user.userGists(testUser.USERNAME, callbackWithError(done, function(err) {
         should.not.exist(err);
         done();
      }));
   });

   it('should show user\'s organisation repos', function(done) {
      user.orgRepos('openaddresses', callbackWithError(done, function(err) {
         should.not.exist(err);
         done();
      }));
   });

   it('should follow user', function(done) {
      user.follow('ingalls', callbackWithError(done, function(err) {
         should.not.exist(err);
         done();
      }));
   });

   it('should unfollow user', function(done) {
      user.unfollow('ingalls', callbackWithError(done, function(err) {
         should.not.exist(err);
         done();
      }));
   });

   it('should create a repo', function(done) {
      var repoTest = Math.floor(Math.random() * (100000 - 0)) + 0;
      var testRepo = {
         name: repoTest
      };

      user.createRepo(testRepo, callbackWithError(done, function (err, res) {
         should.not.exist(err);
         res.name.should.equal(repoTest.toString());
         done();
      }));
   });
});
