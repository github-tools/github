'use strict';

var Github = require('../src/github.js');
var testUser = require('./user.json');
var github, issues;

describe('Github.Issue', function() {
   var issue;

   before(function() {
      github = new Github({
         username: testUser.USERNAME,
         password: testUser.PASSWORD,
         auth: 'basic'
      });

      issues = github.getIssues(testUser.USERNAME, 'TestRepo');
   });

   it('should create issue', function(done) {
      issues.create({
         title: 'New issue',
         body: 'New issue body'
      }, function(err, issue, xhr) {
         should.not.exist(err);
         xhr.should.be.instanceof(XMLHttpRequest);
         should.exist(issue.url);
         issue.title.should.equal('New issue');
         issue.body.should.equal('New issue body');

         done();
      });
   });

   it('should list issues', function(done) {
      issues.list({}, function(err, issues, xhr) {
         should.not.exist(err);
         xhr.should.be.instanceof(XMLHttpRequest);
         issues.should.have.length.above(0);

         issue = issues[0];

         done();
      });
   });

   it('should list events', function(done) {
      issues.events(null, function(err, events, xhr) {
         should.not.exist(err);
         xhr.should.be.instanceof(XMLHttpRequest);
         events.should.have.length.above(0);

         done();
      });
   });

   it('should post issue comment', function(done) {
      issues.comment(issue, 'Comment test', function(err, res, xhr) {
         should.not.exist(err);
         xhr.should.be.instanceof(XMLHttpRequest);
         res.body.should.equal('Comment test');

         done();
      });
   });

   it('should edit issues title', function(done) {
      issues.edit(issue.number, {
         title: 'Edited title'
      }, function(err, res, xhr) {
         should.not.exist(err);
         xhr.should.be.instanceof(XMLHttpRequest);
         res.title.should.equal('Edited title');

         done();
      });
   });

   it('should get issue', function(done) {
      issues.get(issue.number, function(err, res, xhr) {
         should.not.exist(err);
         xhr.should.be.instanceof(XMLHttpRequest);
         res.number.should.equal(issue.number);

         done();
      });
   });
});
