'use strict';

var Github = require('../src/github.js');
var testUser = require('./user.json');
var github;

describe('Github.Search', function() {
   before(function() {
      github = new Github({
         username: testUser.USERNAME,
         password: testUser.PASSWORD,
         auth: 'basic'
      });
   });

   it('should search.repositories', function(done) {
      var search = github.getSearch('tetris+language:assembly&sort=stars&order=desc');
      var options = null;

      search.repositories(options, function (err) {
         should.not.exist(err);
         done();
      });
   });

   it('should search.code', function(done) {
      var search = github.getSearch('addClass+in:file+language:js+repo:jquery/jquery');
      var options = null;

      search.code(options, function (err) {
         should.not.exist(err);
         done();
      });
   });

   it('should search.issues', function(done) {
      var search = github.getSearch('windows+label:bug+language:python+state:open&sort=created&order=asc');
      var options = null;

      search.issues(options, function (err) {
         should.not.exist(err);
         done();
      });
   });

   it('should search.users', function(done) {
      var search = github.getSearch('tom+repos:%3E42+followers:%3E1000');
      var options = null;

      search.users(options, function (err) {
         should.not.exist(err);
         done();
      });
   });
});
