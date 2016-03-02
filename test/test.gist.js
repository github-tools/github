'use strict';

var Github = require('../src/github.js');

var expect = require('must');
var testUser = require('./fixtures/user.json');
var testGist = require('./fixtures/gist.json');
var assertSuccessful = require('./helpers').assertSuccessful;

describe('Github.Gist', function() {
   var gist, gistId, github;

   before(function() {
      github = new Github({
         username: testUser.USERNAME,
         password: testUser.PASSWORD,
         auth: 'basic'
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
