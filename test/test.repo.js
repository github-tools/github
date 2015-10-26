'use strict';

// module dependencies
var chai = require('chai'), sinonChai = require('sinon-chai');

var Github = require('../');
var test_user = require('./user.json');

// Use should flavour for Mocha
var should = chai.should();
chai.use(sinonChai);

describe('Github.Repository', function() {
  var github = new Github({
    username : test_user.USERNAME,
    password : test_user.PASSWORD,
    auth : 'basic'
  });
  var repo = github.getRepo('michael', 'github');

  it('should show repo', function(done) {
    repo.show(function(err, res) {
      should.not.exist(err);
      res.full_name.should.equal('michael/github');
      done();
    });
  });

  it('should show repo contents', function(done) {
    repo.contents('master', './', function(err) {
      should.not.exist(err);
      // @TODO write better assertion.
      done();
    });
  });

  it('should fork repo', function(done) {
    repo.fork(function(err) {
      should.not.exist(err);
      // @TODO write better assertion.
      done();
    });
  });

  it('should show repo contributors', function(done) {
    repo.contributors(function(err, res) {
      should.not.exist(err);
      res.should.be.instanceof(Array);
      res.should.have.length.above(1);
      should.exist(res[0].author);
      should.exist(res[0].total);
      should.exist(res[0].weeks);
      done();
    });
  });

  //@TODO repo.branch, repo.pull

  it('should list repo branches', function(done) {
    repo.listBranches(function(err) {
      should.not.exist(err);
      done();
    });
  });

  it('should read repo', function(done) {
    repo.read('master', 'README.md', function(err, res) {
      res.indexOf('# Github.js').should.be.above(-1);
      done();
    });
  });

  it('should get commit from repo', function(done) {
    repo.getCommit('master', '20fcff9129005d14cc97b9d59b8a3d37f4fb633b', function(err, commit) {
      should.not.exist(err);
      commit.message.should.equal('v0.10.4');
      commit.author.date.should.equal('2015-03-20T17:01:42Z');
      done();
    });
  });

  it('should get a SHA from a repo', function(done) {
    repo.getSha('master', '.gitignore', function(err, sha) {
      should.not.exist(err);
      sha.should.equal('8293a5658aed839ed52fb0e5bd9e6c467c992d3d');
      done();
    });
  });

  it('should get a repo by fullname', function(done) {
    var repo2 = github.getRepo('michael/github');
    repo2.show(function(err, res) {
      should.not.exist(err);
      res.full_name.should.equal('michael/github');
      done();
    });
  });
});

var repoTest = Math.floor(Math.random() * (100000 - 0)) + 0;

describe('Creating new Github.Repository', function() {
  var github = new Github({
    username : test_user.USERNAME,
    password : test_user.PASSWORD,
    auth : 'basic'
  });
  var user = github.getUser();

  it('should create repo', function(done) {
    user.createRepo({'name' : repoTest}, function(err, res) {
      should.not.exist(err);
      res.name.should.equal(repoTest.toString());
      done();
    });
  });

  var repo = github.getRepo(test_user.USERNAME, repoTest);

  it('should write to repo', function(done) {
    repo.write('master', 'TEST.md', 'THIS IS A TEST', 'Creating test', function(err) {
      should.not.exist(err);
      // @TODO write a better assertion.
      done();
    });
  });

  it('should write to repo branch', function(done) {
    this.timeout(8000); // Bit of a longer timeout

    repo.branch('master', 'dev', function(err) {
      should.not.exist(err);
      repo.write('dev', 'TEST.md', 'THIS IS AN UPDATED TEST', 'Updating test', function(err) {
        should.not.exist(err);
        repo.read('dev', 'TEST.md', function(err, res) {
          res.should.equal('THIS IS AN UPDATED TEST');
          should.not.exist(err);
          done();
        });
      });
    });
  });

  it('should get ref from repo', function(done) {
    repo.getRef('heads/master', function(err) {
      should.not.exist(err);
      // @TODO write better assertion
      done();
    });
  });

  it('should create ref on repo', function(done) {
    repo.getRef('heads/master', function(err, sha) {
      var refSpec = {ref : 'refs/heads/new-test-branch', sha : sha};
      repo.createRef(refSpec, function(err) {
        should.not.exist(err);
        // @TODO write better assertion
        done();
      });
    });
  });

  it('should delete ref on repo', function(done) {
    repo.deleteRef('heads/new-test-branch', function(err) {
      should.not.exist(err);
      // @TODO write better assertion
      done();
    });
  });

  it('should list tags on repo', function(done) {
    repo.listTags(function(err) {
      should.not.exist(err);
      // @TODO write better assertion
      done();
    });
  });

  it('should list pulls on repo', function(done) {
    repo.listPulls('open', function(err) {
      should.not.exist(err);
      // @TODO write better assertion
      done();
    });
  });

  it('should get pull requests on repo', function(done) {
    var repo = github.getRepo('michael', 'github');
    repo.getPull(153, function(err) {
      should.not.exist(err);
      // @TODO write better assertion
      done();
    });
  });

  it('should list pull requests on repo', function(done) {
    repo.listPulls('open', function(err) {
      should.not.exist(err);
      done();
    });
  });

  it('should write author and committer to repo', function(done) {
    var options = {
      author : {name : 'Author Name', email : 'author@example.com'},
      committer : {name : 'Committer Name', email : 'committer@example.com'}
    };
    repo.write('dev', 'TEST.md', 'THIS IS A TEST BY AUTHOR AND COMMITTER', 'Updating', options, function(err, res) {
      should.not.exist(err);
      repo.getCommit('dev', res.commit.sha, function(err, commit) {
        should.not.exist(err);
        commit.author.name.should.equal('Author Name');
        commit.author.email.should.equal('author@example.com');
        commit.committer.name.should.equal('Committer Name');
        commit.committer.email.should.equal('committer@example.com');

        done();
      });
    });
  });

  it('should be able to write CJK unicode to repo', function(done) {
    repo.write('master', '中文测试.md', 'THIS IS A TEST', 'Creating test', function(err) {
      should.not.exist(err);
      // @TODO write better assertion
      done();
    });
  });

  it('should be able to write unicode to repo', function(done) {
    repo.write('master', 'TEST_unicode.md', '\u2014', 'Long dash unicode', function(err) {
      should.not.exist(err);

      repo.read('master', 'TEST_unicode.md', function(err, obj) {
        should.not.exist(err);
        obj.should.equal('\u2014');

        done();
      });
    });
  });

  it('should pass a regression test for _request (#14)', function(done) {
    this.timeout(8000); // Bit of a longer timeout

    repo.getRef('heads/master', function(err, sha) {
      var refSpec = {ref : 'refs/heads/testing-14', sha : sha};
      repo.createRef(refSpec, function(err) {
        should.not.exist(err);

        // Triggers GET:
        // https://api.github.com/repos/michael/cmake_cdt7_stalled/git/refs/heads/prose-integration
        repo.getRef('heads/master', function(err) {
          should.not.exist(err);

          // Triggers DELETE:
          // https://api.github.com/repos/michael/cmake_cdt7_stalled/git/refs/heads/prose-integration
          repo.deleteRef('heads/testing-14', function(err, res, xhr) {
            should.not.exist(err);
            xhr.status.should.equal(204);
            done();
          });
        });
      });
    });
  });
});

describe('deleting a Github.Repository', function() {
  var github = new Github({
    username : test_user.USERNAME,
    password : test_user.PASSWORD,
    auth : 'basic'
  });
  var repo = github.getRepo(test_user.USERNAME, repoTest);

  it('should delete the repo', function(done){
    repo.deleteRepo(function(err, res) {
      should.not.exist(err);
      res.should.be.true; //jshint ignore:line
      done();
    });
  });
});

describe('Repo returns commit errors correctly', function() {
  var github = new Github({
    username : test_user.USERNAME,
    password : test_user.PASSWORD,
    auth : 'basic'
  });
  var repo = github.getRepo(test_user.USERNAME, test_user.REPO);

  it('should fail on broken commit', function(done){
    repo.commit('broken-parent-hash', 'broken-tree-hash', 'commit message', function(err) {
      should.exist(err);
      should.exist(err.request);
      err.request.status.should.equal(422);
      done();
    });
  });
});
