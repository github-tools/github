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
      org.checkMembership('teenscode', 'daconex', function(err) {
         should.not.exist(err);
         done();
      });
   });

   it('should list organization members', function(done) {
      org.listMembers('teenscode', function(err) {
         should.not.exist(err);
         done();
      });
   });
});

