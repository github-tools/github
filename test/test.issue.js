'use strict';

var Github = require('../src/github.js');
var testUser = require('./user.json');
var github, issues;

describe('Github.Issue', function() {
   before(function() {
      github = new Github({
         username: testUser.USERNAME,
         password: testUser.PASSWORD,
         auth: 'basic'
      });

      issues = github.getIssues(testUser.USERNAME, 'TestRepo');
   });

   it('should list issues', function(done) {
      issues.list({}, function(err, issues, xhr) {
         should.not.exist(err);
         xhr.should.be.instanceof(XMLHttpRequest);
         issues.should.have.length.above(0);

         done();
      });
   });

   it('should post issue comment', function(done) {
      issues.list({}, function(err, issuesList) {
         issues.comment(issuesList[0], 'Comment test', function(err, res, xhr) {
            should.not.exist(err);
            xhr.should.be.instanceof(XMLHttpRequest);
            res.body.should.equal('Comment test');

            done();
         });
      });
   });
   it('should edit the issues title', function(done){
       issues.list({}, function(err, issuesList) {
         issues.edit(issuesList[0], {
             title: 'Edited test title'
         }, function(err, res) {
            should.not.exist(err);
            res.title.should.equal('Edited test title');
            done();
         });
      });
   });
   it('should edit the issues title', function(done){
       issues.list({}, function(err, issuesList) {
         issues.get(issuesList[0], function(err, res) {
            should.not.exist(err);
            res.title.should.equal('Edited test title');
            done();
         });
      });
   });
});
