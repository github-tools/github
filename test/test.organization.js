'use strict';

var Github = require('../src/github.js');
var testUser = require('./user.json');
var github, organization;

describe('Github.Organization', function() {
   before(function() {
      github = new Github({
         username: testUser.USERNAME,
         password: testUser.PASSWORD,
         auth: 'basic'
      });
      organization = github.getOrganization();
   });

   it('should create an public organisation repo', function(done) {
      var repoTest = Math.floor(Math.random() * (100000 - 0)) + 0;
      var options ={
          "orgname": "openaddresses",
          "name": repoTest,
          "description": "test create repo",
          "homepage": "https://github.com/",
          "private": false,
          "has_issues": true,
          "has_wiki": true,
          "has_downloads": true
      };
      organization.createRepo(options, function(err, repos, xhr) {
         should.not.exist(err);
         xhr.should.be.instanceof(XMLHttpRequest);
         res.name.should.equal(repoTest.toString());

         done();
      });
   });

});
