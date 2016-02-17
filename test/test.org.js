'use strict';

var Github = require('../src/github.js');
var testUser = require('./user.json');
var github, org;

describe('Github.Organization', function() {
   before(function() {
      github = new Github({
         username: testUser.USERNAME,
         password: testUser.PASSWORD,
         auth: 'basic'
      });
      org = github.getOrg();
   });

   it('should check organization membership', function(done) {
      org.checkMembership('github-tools', 'AurelioDeRosa', function(err) {
         should.not.exist(err);
         done();
      });
   });

   it('should list organization members', function(done) {
      org.listMembers('github-tools', function(err) {
         should.not.exist(err);
         done();
      });
   });

   it('should list organization repos', function(done) {
      org.listRepos('github-tools', function(err) {
         should.not.exist(err);
         done();
      });
   });
});
