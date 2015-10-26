'use strict';

// module dependencies
var chai = require('chai'), sinonChai = require('sinon-chai');

var Github = require('../');
var test_user = require('./user.json');

// Use should flavour for Mocha
var should = chai.should();
chai.use(sinonChai);

describe('Github.User', function() {
  var github = new Github({
    username: test_user.USERNAME,
    password: test_user.PASSWORD,
    auth: 'basic'
  });
  var user = github.getUser();

  it('should get user.repos', function(done) {
    user.repos(function(err) {
      should.not.exist(err);
      done();
    });
  });

  it('should get user.repos with options', function(done) {
    var options = {
      type: 'owner',
      sort: 'updated',
      per_page: 10,
      page: 1
    };
    user.repos(options, function(err, repos) {
      repos.should.have.length(10);
      should.not.exist(err);

      done();
    });
  });

  it('should get user.orgs', function(done) {
    user.orgs(function(err) {
      should.not.exist(err);
      done();
    });
  });

  it('should get user.gists', function(done) {
    user.gists(function(err) {
      should.not.exist(err);
      done();
    });
  });

  it('should get user.notifications', function(done) {
    user.notifications(function(err) {
      should.not.exist(err);
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
    user.notifications(options, function(err) {
      should.not.exist(err);
      done();
    });
  });

  it('should show user', function(done) {
    user.show('ingalls', function(err) {
      should.not.exist(err);
      done();
    });
  });

  it('should show user\'s repos', function(done) {
    this.timeout(8000); // Bit of a longer timeout

    user.userRepos(test_user.USERNAME, function(err) {
      should.not.exist(err);
      done();
    });
  });

  it('should show user\'s starred repos', function(done) {
    user.userStarred(test_user.USERNAME, function(err) {
      should.not.exist(err);
      done();
    });
  });

  it('should show user\'s gists', function(done) {
    user.userGists(test_user.USERNAME, function(err) {
      should.not.exist(err);
      done();
    });
  });

  it('should show user\'s organisation repos', function(done) {
    user.orgRepos('openaddresses', function(err) {
      should.not.exist(err);
      done();
    });
  });

  it('should follow user', function(done) {
    user.follow('ingalls', function(err) {
      should.not.exist(err);
      done();
    });
  });

  it('should unfollow user', function(done) {
    user.unfollow('ingalls', function(err) {
      should.not.exist(err);
      done();
    });
  });

  it('should create a repo', function(done) {
    this.timeout(8000); // Bit of a longer timeout
    var repoTest = Date.now();
    var github = new Github({
      username: test_user.USERNAME,
      password: test_user.PASSWORD,
      auth: 'basic'
    });
    var user = github.getUser();

    user.createRepo({ 'name': repoTest }, function (err, res) {
      should.not.exist(err);
      res.name.should.equal(repoTest.toString());
      done();
    });
  });
});
