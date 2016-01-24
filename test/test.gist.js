'use strict';

var Github = require('../src/github.js');
var testUser = require('./user.json');
var github;

describe('Github.Gist', function() {
   var gist;

   before(function() {
      github = new Github({
         username: testUser.USERNAME,
         password: testUser.PASSWORD,
         auth: 'basic'
      });

      gist = github.getGist('f1c0f84e53aa6b98ec03');
   });

   it('should read gist', function(done) {
      gist.read(function(err, res) {
         should.not.exist(err);
         res.should.have.property('description', 'This is a test gist');
         res.files["README.md"].should.have.property('content', 'Hello World');

         done();
      });
   });

   it('should star', function(done) {
      gist.star(function(err) {
         should.not.exist(err);

         gist.isStarred(function(err) {
            should.not.exist(err);

            done();
         });
      });
   });
});

describe('Creating new Github.Gist', function() {
   var gist;

   before(function() {
      gist = github.getGist();
   });

   it('should create gist', function(done) {
      var gistData = {
         description: 'This is a test gist',
         public: true,
         files: {
            'README.md': {
               content: 'Hello World'
            }
         }
      };

      gist.create(gistData, function(err, res) {
         should.not.exist(err);
         res.should.have.property('description', gistData.description);
         res.should.have.property('public', gistData.public);
         res.should.have.property('id').to.be.a('string');
         done();
      });
   });
});

describe('deleting a Github.Gist', function() {
   var gist;

   before(function(done) {
      var gistData = {
         description: 'This is a test gist',
         public: true,
         files: {
            'README.md': {
               content: 'Hello World'
            }
         }
      };

      github.getGist().create(gistData, function(err, res) {
         gist = github.getGist(res.id);

         done();
      });
   });

   it('should delete gist', function(done) {
      gist.delete(function(err) {
         should.not.exist(err);

         done();
      });
   });
});