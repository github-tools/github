'use strict';

var test = require('tape'); //jshint ignore:line
var Github = require("../");
var test_user = require('./user.json');

test("Repo API", function(t) {
    var timeout = setTimeout(function () { t.fail(); }, 100000);
    var github = new Github({
      username: test_user.USERNAME,
      password: test_user.PASSWORD,
      auth: "basic"
    });
    var repo = github.getRepo('michael', 'github');

    t.test('repo.show', function(q) {
        repo.show(function(err, res) {
            q.error(err, 'show repo');
            q.equals(res.full_name, 'michael/github', 'repo name');
            q.end();
        });
    });

    t.test('repo.contents', function(q) {
        repo.contents('master', './', function(err) {
            q.error(err, 'get repo contents');
            q.end();
        });
    });

    t.test('repo.fork', function(q) {
        repo.fork(function(err) {
            q.error(err, 'test fork repo');
            q.end();
        });
    });

    t.test('repo.contributors', function(q) {
      repo.contributors(function(err, res) {
        q.error(err, 'repo contributors');
        q.ok(res instanceof Array, 'list of contributors');
        q.ok(res.length, 'at least one contributor');
        q.ok(res[0].author, 'contributor info');
        q.ok(res[0].total, 'total number of commits');
        q.ok(res[0].weeks, 'weekly hash');
        q.end();
      });
    });

    //@TODO repo.branch, repo.pull

    t.test('repo.listBranches', function(q) {
        repo.listBranches(function(err) {
            q.error(err, 'list branches');
            q.end();
        });
    });

    t.test('repo.read', function(q) {
        repo.read('master', 'README.md', function(err, res) {
            q.ok(res.indexOf('##Setup') !== -1, true, 'Returned REAMDE');
            q.end();
        });
    });

    t.test('repo.getCommit', function(q) {
        repo.getCommit('master', '20fcff9129005d14cc97b9d59b8a3d37f4fb633b', function(err, commit) {
            q.error(err, 'get commit' + err);
            q.ok(commit.message, 'v0.10.4', 'Returned commit message.');
            q.ok(commit.author.date, '2015-03-20T17:01:42Z', 'Got correct date.');
            q.end();
        });
    });

    clearTimeout(timeout);
    t.end();

});

var repoTest = Date.now();

test('Create Repo', function(t) {
  var timeout = setTimeout(function () { t.fail(); }, 10000);
  var github = new Github({
    username: test_user.USERNAME,
    password: test_user.PASSWORD,
    auth: "basic"
  });
  var user = github.getUser();

  t.test('user.createRepo', function(q) {
    user.createRepo({ "name": repoTest }, function (err, res) {
      q.error(err);
      q.equals(res.name, repoTest.toString(), 'Repo created');
      q.end();
    });
  });
  var repo = github.getRepo(test_user.USERNAME, repoTest);

  t.test('repo.write', function(q) {
    repo.write('master', 'TEST.md', 'THIS IS A TEST', 'Creating test', function(err) {
      q.error(err);
      q.end();
    });
  });
  clearTimeout(timeout);
  t.end();
});

test('delete Repo', function(t) {
  var timeout = setTimeout(function () { t.fail(); }, 10000);
  var github = new Github({
    username: test_user.USERNAME,
    password: test_user.PASSWORD,
    auth: "basic"
  });
  var repo = github.getRepo(test_user.USERNAME, repoTest);
  
  repo.deleteRepo(function(err, res) {
    t.error(err);
    t.equals(res, true, 'Repo Deleted');
    clearTimeout(timeout);
    t.end();
  });
});

test('Repo Returns commit errors correctly', function(t) {
  var timeout = setTimeout(function () { t.fail(); }, 10000);
  var github = new Github({
    username: test_user.USERNAME,
    password: test_user.PASSWORD,
    auth: "basic"
  });
  var repo = github.getRepo(test_user.USERNAME, test_user.REPO);

  repo.commit("broken-parent-hash", "broken-tree-hash", "commit message", function(err){
    t.ok(err, 'error thrown for bad commit');
    t.ok(err.request);
    t.equals(err.request.status, 422, 'Returns 422 status');
    clearTimeout(timeout);
    t.end();
  });
});
