import expect from 'must';

import Github from '../lib/GitHub';
import testUser from './fixtures/user.json';
import wait from './helpers/wait';
import {assertSuccessful} from './helpers/callbacks';
import getTestRepoName from './helpers/getTestRepoName';

describe('Issue', function() {
   let github;
   const testRepoName = getTestRepoName();
   let remoteIssues;

   before(function() {
      github = new Github({
         username: testUser.USERNAME,
         password: testUser.PASSWORD,
         auth: 'basic',
      });

      return github
         .getUser()
         .createRepo({name: testRepoName})
         .then(wait(5000))
         .then(function() {
            remoteIssues = github.getIssues(testUser.USERNAME, testRepoName);
            return remoteIssues.createIssue({
               title: 'Test issue',
               body: 'Test issue body',
            });
         })
         .then(function() {
            return remoteIssues.createMilestone({
               title: 'Default Milestone',
               description: 'Test',
            });
         });
   });

   after(function() {
      return github.getRepo(testUser.USERNAME, testRepoName).deleteRepo();
   });

   describe('reading', function() {
      let remoteIssueId;
      let milestoneId;

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

      it('should get issue events', function() {
         return remoteIssues.listIssueEvents(remoteIssueId)
            .then(function({data: events}) {
               expect(events).to.be.an.array();
            });
      });

      it('should get all milestones', function(done) {
         remoteIssues.listMilestones()
            .then(({data: milestones}) => {
               expect(milestones).to.be.an.array();
               milestoneId = milestones[0].number;

               done();
            }).catch(done);
      });

      it('should get a single milestone', function(done) {
         remoteIssues.getMilestone(milestoneId)
            .then(({data: milestone}) => {
               expect(milestone).to.have.own('title', 'Default Milestone');
               done();
            }).catch(done);
      });
   });

   describe('creating/editing/deleting', function() {
      let createdIssueId;
      let issueCommentId;
      let createdMilestoneId;
      let createdLabel;

      // 200ms between tests so that Github has a chance to settle
      beforeEach(function(done) {
         setTimeout(done, 200);
      });

      it('should create issue', function(done) {
         const newIssue = {
            title: 'New issue',
            body: 'New issue body',
         };

         remoteIssues.createIssue(newIssue, assertSuccessful(done, function(err, issue) {
            createdIssueId = issue.number;
            expect(issue).to.have.own('url');
            expect(issue).to.have.own('title', newIssue.title);
            expect(issue).to.have.own('body', newIssue.body);

            done();
         }));
      });

      it('should edit issue', function(done) {
         const newProps = {
            title: 'Edited title',
            state: 'closed',
         };

         remoteIssues.editIssue(createdIssueId, newProps, assertSuccessful(done, function(err, issue) {
            expect(issue).to.have.own('title', newProps.title);

            done();
         }));
      });

      it('should post issue comment', function(done) {
         remoteIssues.createIssueComment(createdIssueId, 'Comment test', assertSuccessful(done, function(err, issue) {
            expect(issue).to.have.own('body', 'Comment test');

            done();
         }));
      });

      it('should list issue comments', function(done) {
         remoteIssues.listIssueComments(createdIssueId, assertSuccessful(done, function(err, comments) {
            expect(comments).to.be.an.array();
            expect(comments[0]).to.have.own('body', 'Comment test');
            issueCommentId = comments[0].id;
            done();
         }));
      });

      it('should get a single issue comment', function(done) {
         remoteIssues.getIssueComment(issueCommentId, assertSuccessful(done, function(err, comment) {
            expect(comment).to.have.own('body', 'Comment test');
            done();
         }));
      });

      it('should edit issue comment', function(done) {
         remoteIssues.editIssueComment(issueCommentId, 'Comment test edited',
            assertSuccessful(done, function(err, comment) {
               expect(comment).to.have.own('body', 'Comment test edited');

               done();
            }));
      });

      it('should delete issue comment', function(done) {
         remoteIssues.deleteIssueComment(issueCommentId, assertSuccessful(done, function(err, response) {
            expect(response).to.be.true();

            done();
         }));
      });

      it('should create a milestone', function(done) {
         let milestone = {
            title: 'v42',
            description: 'The ultimate version',
         };

         remoteIssues.createMilestone(milestone)
            .then(({data: createdMilestone}) => {
               expect(createdMilestone).to.have.own('number');
               expect(createdMilestone).to.have.own('title', milestone.title);

               createdMilestoneId = createdMilestone.number;
               done();
            }).catch(done);
      });
      it('should update a milestone', function(done) {
         let milestone = {
            description: 'Version 6 * 7',
         };

         expect(createdMilestoneId).to.be.a.number();
         remoteIssues.editMilestone(createdMilestoneId, milestone)
            .then(({data: createdMilestone}) => {
               expect(createdMilestone).to.have.own('number', createdMilestoneId);
               expect(createdMilestone).to.have.own('description', milestone.description);

               done();
            }).catch(done);
      });
      it('should delete a milestone', function(done) {
         expect(createdMilestoneId).to.be.a.number();
         remoteIssues.deleteMilestone(createdMilestoneId)
            .then(({status}) => {
               expect(status).to.equal(204);
               done();
            }).catch(done);
      });

      it('should create a label', (done) => {
         let label = {
            name: 'test',
            color: '123456',
         };

         remoteIssues.createLabel(label)
            .then(({data: _createdLabel}) => {
               expect(_createdLabel).to.have.own('name', label.name);
               expect(_createdLabel).to.have.own('color', label.color);

               createdLabel = label.name;
               done();
            }).catch(done);
      });

      it('should retrieve a single label', (done) => {
         let label = {
            name: 'test',
            color: '123456',
         };

         remoteIssues.getLabel(label.name)
            .then(({data: retrievedLabel}) => {
               expect(retrievedLabel).to.have.own('name', label.name);
               expect(retrievedLabel).to.have.own('color', label.color);

               done();
            }).catch(done);
      });

      it('should update a label', (done) => {
         let label = {
            color: '789abc',
         };

         expect(createdLabel).to.be.a.string();
         remoteIssues.editLabel(createdLabel, label)
            .then(({data: updatedLabel}) => {
               expect(updatedLabel).to.have.own('name', createdLabel);
               expect(updatedLabel).to.have.own('color', label.color);

               done();
            }).catch(done);
      });

      it('should list labels', (done) => {
         expect(createdLabel).to.be.a.string();

         remoteIssues.listLabels({}, assertSuccessful(done, function(err, labels) {
            expect(labels).to.be.an.array();
            const hasLabel = labels.some((label) => label.name === createdLabel);
            expect(hasLabel).to.be.true();
            done();
         }));
      });

      it('should delete a label', (done) => {
         expect(createdLabel).to.be.a.string();
         remoteIssues.deleteLabel(createdLabel)
            .then(({status}) => {
               expect(status).to.equal(204);
               done();
            }).catch(done);
      });
   });
});
