'use strict';

var testUser, github, issues;

if (typeof window === 'undefined') {
   // Module dependencies
   var chai = require('chai');
   var Github = require('../');

   testUser = require('./user.json');

   // Use should flavour for Mocha
   var should = chai.should();
}

describe('Github.Issue', function() {
   before(function() {
      if (typeof window !== 'undefined') testUser = window.__fixtures__['test/user'];

      github = new Github({
         username: testUser.USERNAME,
         password: testUser.PASSWORD,
         auth: 'basic'
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
