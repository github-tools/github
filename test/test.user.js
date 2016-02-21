'use strict';

var Github = require('../src/github.js');
var testUser = require('./user.json');
var github, user;

describe('Github.User', function() {
   before(function() {
      github = new Github({
         username: testUser.USERNAME,
         password: testUser.PASSWORD,
         auth: 'basic'
      });
      user = github.getUser();
   });

   it('should get user.repos', function(done) {
      user.repos(function(err, repos, xhr) {
         should.not.exist(err);
         xhr.should.be.instanceof(XMLHttpRequest);
         repos.should.be.instanceof(Array);

         done();
      });
   });

   it('should get user.repos with options', function(done) {
      var options = {
         type: 'owner',
         sort: 'updated',
         per_page: 90, // jscs:ignore
         page: 10
      };

      user.repos(options, function(err, repos, xhr) {
         should.not.exist(err);
         xhr.should.be.instanceof(XMLHttpRequest);
         repos.should.be.instanceof(Array);

         done();
      });
   });

   it('should get user.orgs', function(done) {
      user.orgs(function(err, orgs, xhr) {
         should.not.exist(err);
         xhr.should.be.instanceof(XMLHttpRequest);

         done();
      });
   });

   it('should get user.gists', function(done) {
      user.gists(function(err, gists, xhr) {
         should.not.exist(err);
         xhr.should.be.instanceof(XMLHttpRequest);

         done();
      });
   });

   it('should get user.notifications', function(done) {
      user.notifications(function(err, notifications, xhr) {
         should.not.exist(err);
         xhr.should.be.instanceof(XMLHttpRequest);

         done();
      });
   });

   it('should get user.notifications with options', function(done) {
      var options = {
         all: true,
         participating: true,
         since: '2015-01-01T00:00:00Z',
         before: '2015-02-01T00:00:00Z'
      };

      user.notifications(options, function(err, notifications, xhr) {
         should.not.exist(err);
         xhr.should.be.instanceof(XMLHttpRequest);

         done();
      });
   });

   it('should show user', function(done) {
      user.show('ingalls', function(err, info, xhr) {
         should.not.exist(err);
         xhr.should.be.instanceof(XMLHttpRequest);

         done();
      });
   });

   it('should show user\'s repos', function(done) {
      // This is odd; userRepos times out on the test user, but user.repos does not.
      user.userRepos('aendrew', function(err, repos, xhr) {
         should.not.exist(err);
         xhr.should.be.instanceof(XMLHttpRequest);

         done();
      });
   });

   it('should show user\'s starred repos', function(done) {
      user.userStarred(testUser.USERNAME, function(err, repos, xhr) {
         should.not.exist(err);
         xhr.should.be.instanceof(XMLHttpRequest);

         done();
      });
   });

   it('should show user\'s gists', function(done) {
      user.userGists(testUser.USERNAME, function(err, gists, xhr) {
         should.not.exist(err);
         xhr.should.be.instanceof(XMLHttpRequest);

         done();
      });
   });

   it('should show user\'s organisation repos', function(done) {
      user.orgRepos('openaddresses', function(err, repos, xhr) {
         should.not.exist(err);
         xhr.should.be.instanceof(XMLHttpRequest);

         done();
      });
   });

   it('should follow user', function(done) {
      user.follow('ingalls', function(err, res, xhr) {
         should.not.exist(err);
         xhr.should.be.instanceof(XMLHttpRequest);

         done();
      });
   });

   it('should unfollow user', function(done) {
      user.unfollow('ingalls', function(err, res, xhr) {
         should.not.exist(err);
         xhr.should.be.instanceof(XMLHttpRequest);

         done();
      });
   });

   it('should create a repo', function(done) {
      var repoTest = Math.floor(Math.random() * (100000 - 0)) + 0;
      var github = new Github({
         username: testUser.USERNAME,
         password: testUser.PASSWORD,
         auth: 'basic'
      });
      var user = github.getUser();

      user.createRepo({
         name: repoTest
      }, function (err, res, xhr) {
         should.not.exist(err);
         xhr.should.be.instanceof(XMLHttpRequest);
         res.name.should.equal(repoTest.toString());

         done();
      });
   });
});
