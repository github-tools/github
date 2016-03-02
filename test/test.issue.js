'use strict';

var Github = require('../src/github.js');

var expect = require('must');
var testUser = require('./fixtures/user.json');
var assertSuccessful = require('./helpers').assertSuccessful;

describe('Github.Issue', function() {
   var github, remoteIssues, remoteIssue;

   before(function() {
      github = new Github({
         username: testUser.USERNAME,
         password: testUser.PASSWORD,
         auth: 'basic'
      });

      remoteIssues = github.getIssues(testUser.USERNAME, 'TestRepo');
   });

   describe('reading', function() {
      it('should list issues', function(done) {
         remoteIssues.list({}, assertSuccessful(done, function(err, issues) {
            expect(issues).to.be.an.array();
            remoteIssue = issues[0];

            done();
         }));
      });

      it('should get issue', function(done) {
         remoteIssues.get(remoteIssue.number, assertSuccessful(done, function(err, issue) {
            expect(issue).to.have.own('number', remoteIssue.number);

            done();
         }));
      });
   });

   describe('creating/modifiying', function() {
      // 200ms between tests so that Github has a chance to settle
      beforeEach(function(done) {
         setTimeout(done, 200);
      });

      it('should create issue', function(done) {
         var issue = {
            title: 'New issue',
            body: 'New issue body'
         };

         remoteIssues.create(issue, assertSuccessful(done, function(err, issue) {
            expect(issue).to.have.own('url');
            expect(issue).to.have.own('title', issue.title);
            expect(issue).to.have.own('body', issue.body);

            done();
         }));
      });

      it('should post issue comment', function(done) {
         remoteIssues.comment(remoteIssue, 'Comment test', assertSuccessful(done, function(err, issue) {
            expect(issue).to.have.own('body', 'Comment test');

            done();
         }));
      });

      it('should edit issues title', function(done) {
         var newProps = {
            title: 'Edited title'
         };

         remoteIssues.edit(remoteIssue.number, newProps, assertSuccessful(done, function(err, issue) {
            expect(issue).to.have.own('title', newProps.title);

            done();
         }));
      });
   });
});
