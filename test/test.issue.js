'use strict';

var testUser;

if (typeof window === 'undefined') {
   var Github = require('../');
   var callbackWithError = require('./helpers.js');

   testUser = require('./user.json');

   // Module dependencies
   var chai = require('chai');

   // Use should flavour for Mocha
   var should = chai.should();
}

describe('Issues', function() {
   var github, issues;

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
      issues.list({}, callbackWithError(done, function(err, issues) {
         should.not.exist(err);
         issues.should.have.length.above(0);
         done();
      }));
   });

   it('should post issue comment', function(done) {
      issues.list({}, callbackWithError(done, function(err, issuesList) {
         should.not.exist(err);
         issues.comment(issuesList[0], 'Comment test', callbackWithError(done, function(err, res) {
            should.not.exist(err);
            res.body.should.equal('Comment test');
            done();
         }));
      }));
   });
});
