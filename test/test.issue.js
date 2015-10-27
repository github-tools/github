'use strict';

var test_user, github, issues;

if (typeof window === 'undefined') {
  // module dependencies
  var chai = require('chai'),
      sinonChai = require('sinon-chai');

  var Github = require('../');
  test_user = require('./user.json');

  // Use should flavour for Mocha
  var should = chai.should();
  chai.use(sinonChai);
}

describe('Github.Issue', function() {
  before(function(){
    if (typeof window !== 'undefined') test_user = window.__fixtures__['test/user'];

    github = new Github({
      username : test_user.USERNAME,
      password : test_user.PASSWORD,
      auth : 'basic'
    });

    issues = github.getIssues('mikedeboertest', 'TestRepo');
  });

  it('should list issues', function(done) {
    issues.list({}, function(err, issues) {
      should.not.exist(err);
			issues.should.have.length.above(0);
			done();
    });
  });

  it('should post issue comment', function(done) {
    issues.list({}, function(err, issuesList) {
      issues.comment(issuesList[0], 'Comment test', function(err, res) {
        should.not.exist(err);
        res.body.should.equal('Comment test');
        done();
      });
    });
  });
});
