'use strict';

var Github = require('../src/github.js');

var expect = require('must');
var testUser = require('./fixtures/user.json');
var assertSuccessful = require('./helpers').assertSuccessful;

function assertArray(done) {
   return assertSuccessful(done, function(err, result) {
      expect(result).to.be.an.array();
      done();
   });
}

describe('Github.User', function() {
   var github, user;

   before(function() {
      github = new Github({
         username: testUser.USERNAME,
         password: testUser.PASSWORD,
         auth: 'basic'
      });
      user = github.getUser();
   });

   it('should get user repos', function(done) {
      user.repos(assertArray(done));
   });

   it('should get user repos with options', function(done) {
      var options = {
         type: 'owner',
         sort: 'updated',
         per_page: 90, // jscs:ignore
         page: 10
      };

      user.repos(options, assertArray(done));
   });

   it('should get user orgs', function(done) {
      user.orgs(assertArray(done));
   });

   it('should get user gists', function(done) {
      user.gists(assertArray(done));
   });

   it('should get user notifications', function(done) {
      user.notifications(assertArray(done));
   });

   it('should get user notifications with options', function(done) {
      var options = {
         all: true,
         participating: true,
         since: '2015-01-01T00:00:00Z',
         before: '2015-02-01T00:00:00Z'
      };

      user.notifications(options, assertArray(done));
   });

   it('should show user', function(done) {
      user.show('ingalls', assertSuccessful(done));
   });

   it('should show user\'s repos', function(done) {
      user.userRepos('aendrew', assertArray(done));
   });

   it('should show user\'s repos with options', function(done) {
      var options = {
         type: 'owner',
         sort: 'updated',
         per_page: 90, // jscs:ignore
         page: 1
      };

      user.userRepos('aendrew', options, assertArray(done));
   });

   it('should show user\'s starred repos', function(done) {
      user.userStarred(testUser.USERNAME, assertArray(done));
   });

   it('should show user\'s gists', function(done) {
      user.userGists(testUser.USERNAME, assertArray(done));
   });

   it('should show user\'s organisation repos', function(done) {
      user.orgRepos('openaddresses', assertArray(done));
   });

   it('should follow user', function(done) {
      user.follow('ingalls', assertSuccessful(done));
   });

   it('should unfollow user', function(done) {
      user.unfollow('ingalls', assertSuccessful(done));
   });
});
