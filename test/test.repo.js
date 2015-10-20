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
            q.notEquals(res.indexOf('# Github.js'), -1, 'Returned README');
            q.end();
        });
    });

    t.test('repo.getCommit', function(q) {
        repo.getCommit('master', '20fcff9129005d14cc97b9d59b8a3d37f4fb633b', function(err, commit) {
            q.error(err, 'get commit' + err);
            q.equals(commit.message, 'v0.10.4', 'Returned commit message.');
            q.equals(commit.author.date, '2015-03-20T17:01:42Z', 'Got correct date.');
            q.end();
        });
    });

    t.test('repo.getSha', function(q) {
        repo.getSha('master', '.gitignore', function(err, sha) {
            q.error(err, 'get sha error: ' + err);
            q.equals(sha, '8293a5658aed839ed52fb0e5bd9e6c467c992d3d', 'Returned sha message.');
            q.end();
        });
    });

    t.test('getRepo(fullname)', function(q) {
        var repo2 = github.getRepo('michael/github');
        repo2.show(function(err, res) {
            q.error(err, 'show repo');
            q.equals(res.full_name, 'michael/github', 'repo name');
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

  t.test('repo.writeBranch', function(q) {
    repo.branch('master', 'dev', function(err) {
      q.error(err);
      repo.write('dev', 'TEST.md', 'THIS IS AN UPDATED TEST', 'Updating test', function(err) {
        q.error(err);
        repo.read('dev', 'TEST.md', function(err, obj) {
          t.equals('THIS IS AN UPDATED TEST', obj);
          q.error(err);
          q.end();
        });
      });
    });
  });

  t.test('repo.getRef', function(q) {
    repo.getRef('heads/master', function(err) {
      q.error(err);
      q.end();
    });
  });

  t.test('repo.createRef', function(q) {
    repo.getRef('heads/master', function(err, sha) {
      var refSpec = {
        ref: 'refs/heads/new-test-branch',
        sha: sha
      };
      repo.createRef(refSpec, function(err) {
        q.error(err);
        q.end();
      });
    });
  });

  t.test('repo.deleteRef', function(q) {
    repo.deleteRef('heads/new-test-branch', function(err) {
      q.error(err);
      q.end();
    });
  });

  t.test('repo.listTags', function(q) {
    repo.listTags(function(err) {
      q.error(err);
      q.end();
    });
  });

  t.test('repo.listPulls', function(q) {
    repo.listPulls('open', function(err) {
      q.error(err);
      q.end();
    });
  });

  t.test('repo.getPull', function(q) {
    var repo = github.getRepo('michael', 'github');
    repo.getPull(153, function(err) {
      q.error(err);
      q.end();
    });
  });

  t.test('repo.listPulls', function(q) {
    repo.listPulls('open', function(err) {
      q.error(err);
      q.end();
    });
  });

  t.test('repo.writeAuthorAndCommitter', function(q) {
    var options = {
      author: {name: 'Author Name', email: 'author@example.com'},
      committer: {name: 'Committer Name', email: 'committer@example.com'}
    };
    repo.write('dev', 'TEST.md', 'THIS IS A TEST BY AUTHOR AND COMMITTER', 'Updating', options, function(err, res) {
      q.error(err);
      repo.getCommit('dev', res.commit.sha, function(err, commit) {
        q.error(err);
        q.equals(commit.author.name, 'Author Name', 'Got correct author name.');
        q.equals(commit.author.email, 'author@example.com', 'Got correct author email.');
        q.equals(commit.committer.name, 'Committer Name', 'Got correct committer name.');
        q.equals(commit.committer.email, 'committer@example.com', 'Got correct committer email.');
        q.end();
      });
    });
  });

  t.test('repo.writeChinese', function(q) {
    repo.write('master', '中文测试.md', 'THIS IS A TEST', 'Creating test', function(err) {
      q.error(err);
      q.end();
    });
  });

  t.test('repo.writeUnicodeContent', function(q) {
    repo.write('master', 'TEST.md', '\u2014', 'Long dash unicode', function(err) {
      q.error(err);
      repo.read('master', 'TEST.md', function(err, obj) {
        q.error(err);
        t.equals('\u2014', obj);
      });
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