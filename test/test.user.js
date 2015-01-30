'use strict';

var test = require('tape'); //jshint ignore:line
var Github = require("../");
var test_user = require('./user.json');

test("User API", function(t) {
  var timeout = setTimeout(function () { t.fail(); }, 100000);
  var github = new Github({
    username: test_user.USERNAME,
    password: test_user.PASSWORD,
    auth: "basic"
  });
  var user = github.getUser();

  t.test('user.repos', function(q) {
    user.repos(function(err) {
      q.error(err, 'user orgs');
      q.end();
    });
  });

  t.test('user.orgs', function(q) {
    user.orgs(function(err) {
      q.error(err, 'user orgs');
      q.end();
    });
  });

  t.test('user.gists', function(q) {
    user.gists(function(err) {
      q.error(err, 'user gists');
      q.end();
    });
  });

  t.test('user.notifications', function(q) {
    user.notifications(function(err) {
      q.error(err, 'user notifications');
      q.end();
    });
  });

  t.test('user.notifications with options', function(q) {
    var options = {
      all: true,
      participating: true,
      since: '2015-01-01T00:00:00Z',
      before: '2015-02-01T00:00:00Z'
    };
    user.notifications(options, function(err) {
      q.error(err, 'user notifications');
      q.end();
    });
  });

  t.test('user.show', function(q) {
    user.show('ingalls', function(err) {
      q.error(err, 'user show');
      q.end();
    });
  });

  t.test('user.userRepos', function(q) {
    user.userRepos(test_user.USERNAME, function(err) {
      q.error(err, 'alt user repos');
      q.end();
    });
  });

  t.test('user.userStarred', function(q) {
    user.userStarred(test_user.USERNAME, function(err, res) {
      q.error(err, 'alt user starred');
      q.end();
    });
  });

  t.test('user.userGists', function(q) {
    user.userGists(test_user.USERNAME, function(err) {
      q.error(err, 'alt user gists');
      q.end();
    });
  });

  t.test('user.orgRepos', function(q) {
    user.orgRepos('openaddresses', function(err) {
      q.error(err, 'org users');
      q.end();
    });
  });

  t.test('user.follow', function(q) {
    user.follow('ingalls', function(err) {
      q.error(err, 'follow ingalls');
      q.end();
    });
  });

  t.test('user.unfollow', function(q) {
    user.unfollow('ingalls', function(err) {
      q.error(err, 'unfollow ingalls');
      q.end();
    });
  });

  t.test('user.createRepo', function(q) {
    var test_user = require('./user.json');
    var repoTest = Date.now();
    var github = new Github({
      username: test_user.USERNAME,
      password: test_user.PASSWORD,
      auth: "basic"
    });
    var user = github.getUser();

    user.createRepo({ "name": repoTest }, function (err, res) {
      q.error(err);
      q.equals(res.name, repoTest.toString(), 'Repo created');
      q.end();
    });
  });

  clearTimeout(timeout);
  t.end();
});
