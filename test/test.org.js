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
      organization = github.getOrg();
   });

   it('should create an organisation repo', function(done) {
      var repoTest = Math.floor(Math.random() * (100000 - 0)) + 0;
      var options = {
         orgname: testUser.ORGANIZATION,
         name: repoTest,
         description: 'test create organization repo',
         homepage: 'https://github.com/',
         private: false,
         has_issues: true,
         has_wiki: true,
         has_downloads: true
      };

      organization.createRepo(options, function(err, res, xhr) {
         should.not.exist(err);
         xhr.should.be.instanceof(XMLHttpRequest);
         res.name.should.equal(repoTest.toString());
         res.full_name.should.equal(testUser.ORGANIZATION + '/' + repoTest.toString());

         done();
      });
   });
});
