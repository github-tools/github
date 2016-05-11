import expect from 'must';

import Github from '../lib/GitHub';
import testUser from './fixtures/user.json';
import {assertSuccessful} from './helpers/callbacks';

describe('Issue', function() {
   let github;
   let remoteIssues;
   let remoteIssueId;
   let remoteIssueCommentId;

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
         remoteIssues.listIssues({}, assertSuccessful(done, function(err, issues) {
            expect(issues).to.be.an.array();
            remoteIssueId = issues[0].number;

            done();
         }));
      });

      it('should get issue', function(done) {
         remoteIssues.getIssue(remoteIssueId, assertSuccessful(done, function(err, issue) {
            expect(issue).to.have.own('number', remoteIssueId);

            done();
         }));
      });
   });

   describe('creating/modifiying/editing/deleting', function() {
      // 200ms between tests so that Github has a chance to settle
      beforeEach(function(done) {
         setTimeout(done, 200);
      });

      it('should create issue', function(done) {
         const newIssue = {
            title: 'New issue',
            body: 'New issue body'
         };

         remoteIssues.createIssue(newIssue, assertSuccessful(done, function(err, issue) {
            expect(issue).to.have.own('url');
            expect(issue).to.have.own('title', newIssue.title);
            expect(issue).to.have.own('body', newIssue.body);

            done();
         }));
      });

      it('should post issue comment', function(done) {
         remoteIssues.createIssueComment(remoteIssueId, 'Comment test', assertSuccessful(done, function(err, issue) {
            expect(issue).to.have.own('body', 'Comment test');

            done();
         }));
      });

      it('should list issue comments', function(done) {
         remoteIssues.listIssueComments(remoteIssueId, assertSuccessful(done, function(err, comments) {
            expect(comments).to.be.an.array();
            expect(comments[0]).to.have.own('body', 'Comment test');
            remoteIssueCommentId = comments[0].id
            done();
         }));
      });

      it('should get a single issue comment', function(done) {
         remoteIssues.getIssueComment(remoteIssueCommentId, assertSuccessful(done, function(err, comment) {
            expect(comment).to.have.own('body', 'Comment test');
            done();
         }));
      });

      it('should edit issue comment', function(done) {
         remoteIssues.editIssueComment(remoteIssueCommentId, 'Comment test edited', assertSuccessful(done, function(err, comment) {
            expect(comment).to.have.own('body', 'Comment test edited');

            done();
         }));
      });

      it('should delete issue comment', function(done) {
         remoteIssues.deleteIssueComment(remoteIssueCommentId, assertSuccessful(done, function(err, response) {
            expect(response).to.be.true;

            done();
         }));
      });

      it('should edit issues title', function(done) {
         const newProps = {
            title: 'Edited title'
         };

         remoteIssues.editIssue(remoteIssueId, newProps, assertSuccessful(done, function(err, issue) {
            expect(issue).to.have.own('title', newProps.title);

            done();
         }));
      });
   });
});
