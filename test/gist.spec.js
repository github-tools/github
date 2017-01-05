import expect from 'must';

import Github from '../lib/GitHub';
import testUser from './fixtures/user.json';
import testGist from './fixtures/gist.json';
import {assertSuccessful} from './helpers/callbacks';

describe('Gist', function() {
   let gist;
   let gistId;
   let github;
   let commentId;
   let revisionId;

   before(function() {
      github = new Github({
         username: testUser.USERNAME,
         password: testUser.PASSWORD,
         auth: 'basic',
      });
   });

   describe('reading', function() {
      before(function() {
         gist = github.getGist('f1c0f84e53aa6b98ec03');
      });

      it('should read a gist', function(done) {
         gist.read(assertSuccessful(done, function(err, gist) {
            expect(gist).to.have.own('description', testGist.description);
            expect(gist.files).to.have.keys(Object.keys(testGist.files));
            expect(gist.files['README.md']).to.have.own('content', testGist.files['README.md'].content);

            done();
         }));
      });
   });

   describe('creating/modifiying', function() {
      before(function() {
         gist = github.getGist();
      });

      // 200ms between tests so that Github has a chance to settle
      beforeEach(function(done) {
         setTimeout(done, 200);
      });

      it('should create gist', function(done) {
         gist.create(testGist, assertSuccessful(done, function(err, gist) {
            expect(gist).to.have.own('id');
            expect(gist).to.have.own('public', testGist.public);
            expect(gist).to.have.own('description', testGist.description);
            gistId = gist.id;
            revisionId = gist.history[0].version;

            done();
         }));
      });

      it('should star a gist', function(done) {
         gist = github.getGist(gistId);
         gist.star(assertSuccessful(done, function() {
            gist.isStarred(assertSuccessful(done, function(err, result) {
               expect(result).to.be(true);
               done();
            }));
         }));
      });

      it('should create a comment a gist', function(done) {
         gist.createComment('Comment test', assertSuccessful(done, function(err, comment) {
            expect(comment).to.have.own('body', 'Comment test');
            commentId = comment.id;
            done();
         }));
      });

      it('should list comments', function(done) {
         gist.listComments(assertSuccessful(done, function(err, comments) {
            expect(comments).to.be.an.array();
            done();
         }));
      });

      it('should get comment', function(done) {
         gist.getComment(commentId, assertSuccessful(done, function(err, issue) {
            expect(issue).to.have.own('id', commentId);
            done();
         }));
      });

      it('should edit comment', function(done) {
         const newComment = 'new comment test';
         gist.editComment(commentId, newComment, assertSuccessful(done, function(err, comment) {
            expect(comment).to.have.own('body', newComment);
            done();
         }));
      });

      it('should delete comment', function(done) {
         gist.deleteComment(commentId, assertSuccessful(done));
      });

      it('should update gist', function(done) {
         const newGist = {
            files: {
               'README.md': {
                  content: 'README updated',
               },
            },
         };
         gist.update(newGist, assertSuccessful(done, function(err, gist) {
            expect(gist.history.length).to.be(2);
            expect(gist.files['README.md']).to.have.own('content', newGist.files['README.md'].content);
            done();
         }));
      });

      it('should list commits', function(done) {
         gist.listCommits(assertSuccessful(done, function(err, commits) {
            expect(commits).to.be.an.array();
            done();
         }));
      });

      it('should get revision', function(done) {
         gist.getRevision(revisionId, assertSuccessful(done, function(err, gist) {
            expect(gist.history.length).to.be(1);
            expect(gist.files['README.md']).to.have.own('content', testGist.files['README.md'].content);
            done();
         }));
      });
   });

   describe('deleting', function() {
      before(function() {
         gist = github.getGist(gistId);
      });

      // 200ms between tests so that Github has a chance to settle
      beforeEach(function(done) {
         setTimeout(done, 200);
      });

      it('should delete gist', function(done) {
         gist.delete(assertSuccessful(done));
      });
   });
});
