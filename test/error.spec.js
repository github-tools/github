import assert from 'assert';
import expect from 'must';
import nock from 'nock';

import Github from '../lib/GitHub';
import testUser from './fixtures/user.js';
import {assertSuccessful, assertFailure} from './helpers/callbacks';
import fixtureExhausted from './fixtures/repos-ratelimit-exhausted.js';
import fixtureOk from './fixtures/repos-ratelimit-ok.js';

describe('Rate limit error', function() {
   let github;
   let user;
   let scope;

   before(function() {
      github = new Github();
      user = github.getUser(testUser.USERNAME);
   });

   beforeEach(function() {
      scope = fixtureExhausted();
   });

   it('should reject promise with 403 error', function() {
      return user.listRepos().then(function() {
         assert.fail(undefined, undefined, 'Promise was resolved instead of rejected');
      }, function(error) {
         expect(error).to.be.an.error();
         expect(error).to.have.own('response');
         expect(error.response).to.have.own('status');
         expect(error.response.status).to.be(403);
      });
   });

   it('should call callback', function(done) {
      user.listRepos(assertFailure(done, function(error) {
         expect(error).to.be.an.error();
         expect(error).to.have.own('response');
         expect(error.response).to.have.own('status');
         expect(error.response.status).to.be(403);
         done();
      }));
   });

   afterEach(function() {
      scope.done();
      nock.cleanAll();
   });
});

describe('Rate limit OK', function() {
   let github;
   let user;
   let scope;

   before(function() {
      github = new Github();
      user = github.getUser(testUser.USERNAME);
   });

   beforeEach(function() {
      scope = fixtureOk();
   });

   it('should resolve promise', function() {
      return expect(user.listRepos()).to.resolve.to.object();
   });

   it('should call callback with array of results', function(done) {
      user.listRepos(assertSuccessful(done, function(error, result) {
         expect(error).is.not.an.error();
         expect(error).is.not.truthy();
         expect(result).is.array();
         done();
      }));
   });

   afterEach(function() {
      scope.done();
      nock.cleanAll();
   });
});

describe('content path encoding', function() {
   let github;
   let repository;

   beforeEach(function() {
      github = new Github();
      repository = github.getRepo('octo', 'release-notes');
   });

   afterEach(function() {
      nock.cleanAll();
   });

   it('should encode reserved characters when getting contents', function() {
      const scope = nock('https://api.github.com:443')
         .get('/repos/octo/release-notes/contents/docs/release%23notes.md')
         .query({ref: 'release-2026'})
         .reply(200, {sha: 'content-sha'});
      return repository.getContents('release-2026', 'docs/release#notes.md').then(function() {
         scope.done();
      });
   });

   it('should encode reserved characters when getting a SHA', function() {
      const scope = nock('https://api.github.com:443')
         .get('/repos/octo/release-notes/contents/reports/draft%3F.txt')
         .query({ref: 'release-2026'})
         .reply(200, {sha: 'content-sha'});
      return repository.getSha('release-2026', 'reports/draft?.txt').then(function() {
         scope.done();
      });
   });

   it('should encode reserved characters when writing a file', function() {
      const scope = nock('https://api.github.com:443')
         .get('/repos/octo/release-notes/contents/reports/draft%3F.txt')
         .query({ref: 'release-2026'})
         .reply(200, {sha: 'content-sha'})
         .put('/repos/octo/release-notes/contents/reports/draft%3F.txt')
         .reply(200, {commit: {sha: 'updated'}});
      return repository.writeFile('release-2026', 'reports/draft?.txt', 'Draft', 'Update draft').then(function() {
         scope.done();
      });
   });

   it('should encode reserved characters when deleting a file', function() {
      const scope = nock('https://api.github.com:443')
         .get('/repos/octo/release-notes/contents/docs/release%23notes.md')
         .query({ref: 'release-2026'})
         .reply(200, {sha: 'content-sha'})
         .delete('/repos/octo/release-notes/contents/docs/release%23notes.md')
         .reply(200, {commit: {sha: 'deleted'}});
      return repository.deleteFile('release-2026', 'docs/release#notes.md').then(function() {
         scope.done();
      });
   });
});
