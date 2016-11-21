import expect from 'must';

import Github from '../lib/GitHub';
import wait from './helpers/wait';
import testUser from './fixtures/user.json';
import {assertSuccessful} from './helpers/callbacks';
import getTestRepoName from './helpers/getTestRepoName';

describe('Project', function() {
   let github;
   const testRepoName = getTestRepoName();
   let project;
   let columnId;
   let cardId;

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
           const remoteRepo = github.getRepo(testUser.USERNAME, testRepoName);
           return remoteRepo.createProject({
              name: 'test-project',
              body: 'body',
           });
        })
        .then(function(_project) {
           project = github.getProject(_project.data.id);
        });
   });

   after(function() {
      return github.getRepo(testUser.USERNAME, testRepoName).deleteRepo();
   });

   it('should get repo project', function(done) {
      project.getProject(assertSuccessful(done, function(err, project) {
         expect(project).to.own('name', 'test-project');
         done();
      }));
   });

   it('should update a project', function(done) {
      project.updateProject({
         name: 'another-test-project',
         body: 'another-body',
      }, assertSuccessful(done, function(err, project) {
         expect(project).to.own('name', 'another-test-project');
         expect(project).to.own('body', 'another-body');
         done();
      }));
   });

   it('should create a repo project column', function(done) {
      project.createProjectColumn({
         name: 'test-column',
      }, assertSuccessful(done, function(err, column) {
         expect(column).to.own('name', 'test-column');
         columnId = column.id;
         done();
      }));
   });

   it('should list repo project columns', function(done) {
      project.listProjectColumns(assertSuccessful(done, function(err, columns) {
         expect(columns).to.be.an.array();
         expect(columns.length).to.equal(1);
         done();
      }));
   });

   it('should get repo project column', function(done) {
      project.getProjectColumn(columnId, assertSuccessful(done, function(err, project) {
         expect(project).to.own('name', 'test-column');
         done();
      }));
   });

   it('should update a repo project column', function(done) {
      project.updateProjectColumn(columnId, {
         name: 'another-test-column',
      }, assertSuccessful(done, function(err, column) {
         expect(column).to.own('name', 'another-test-column');
         done();
      }));
   });

   it('should create repo project card', function(done) {
      project.createProjectCard(columnId, {
         note: 'test-card',
      }, assertSuccessful(done, function(err, card) {
         expect(card).to.own('note', 'test-card');
         cardId = card.id;
         done();
      }));
   });

   it('should list cards of a project', function(done) {
      project.listProjectCards(assertSuccessful(done, function(err, cards) {
         expect(cards).to.be.an.array();
         expect(cards.length).to.equal(1);
         done();
      }));
   });

   it('should list cards of a column', function(done) {
      project.listColumnCards(columnId, assertSuccessful(done, function(err, cards) {
         expect(cards).to.be.an.array();
         expect(cards.length).to.equal(1);
         done();
      }));
   });

   it('should get repo project card', function(done) {
      project.getProjectCard(cardId, assertSuccessful(done, function(err, card) {
         expect(card).to.own('note', 'test-card');
         done();
      }));
   });

   it('should update repo project card', function(done) {
      project.updateProjectCard(cardId, {
         note: 'another-test-card',
      }, assertSuccessful(done, function(err, card) {
         expect(card).to.own('note', 'another-test-card');
         done();
      }));
   });

   it('should move repo project card', function(done) {
      project.moveProjectCard(cardId, 'top', columnId, assertSuccessful(done, function(err, result) {
         expect(result).to.be(true);
         done();
      }));
   });

   it('should move repo project column', function(done) {
      project.moveProjectColumn(columnId, 'first', assertSuccessful(done, function(err, result) {
         expect(result).to.be(true);
         done();
      }));
   });

   it('should delete repo project card', function(done) {
      project.deleteProjectCard(cardId, assertSuccessful(done, function(err, result) {
         expect(result).to.be(true);
         done();
      }));
   });

   it('should delete repo project column', function(done) {
      project.deleteProjectColumn(columnId, assertSuccessful(done, function(err, result) {
         expect(result).to.be(true);
         done();
      }));
   });

   it('should delete repo project', function(done) {
      project.deleteProject(assertSuccessful(done, function(err, result) {
         expect(result).to.be(true);
         done();
      }));
   });
});
