import expect from 'must';

import Github from '../src/Github';
import testUser from './fixtures/user.json';
import {assertSuccessful} from './helpers/callbacks';

describe('Issue', function() {
   let github;
   let remoteIssues;
   let remoteIssue;

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
         const newIssue = {
            title: 'New issue',
            body: 'New issue body'
         };

         remoteIssues.create(newIssue, assertSuccessful(done, function(err, issue) {
            expect(issue).to.have.own('url');
            expect(issue).to.have.own('title', newIssue.title);
            expect(issue).to.have.own('body', newIssue.body);

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
         const newProps = {
            title: 'Edited title'
         };

         remoteIssues.edit(remoteIssue.number, newProps, assertSuccessful(done, function(err, issue) {
            expect(issue).to.have.own('title', newProps.title);

            done();
         }));
      });
   });
});
