'use strict';

var test_user, github, user;

if (typeof window === 'undefined') {
  // module dependencies
  var chai = require('chai'),
      sinonChai = require('sinon-chai');

  var Github = require('../');
  test_user = require('./user.json');

  // Use should flavour for Mocha
  var should = chai.should();
  chai.use(sinonChai);
}

describe('Github constructor', function() {
  before(function(){
    if (typeof window !== 'undefined') test_user = window.__fixtures__['test/user'];

    github = new Github({
      username: test_user.USERNAME,
      password: test_user.PASSWORD,
      auth: 'basic'
    });

    user = github.getUser();
  });

  it('should authenticate and return no errors', function(done){
    user.notifications(function(err){
      should.not.exist(err);
      done();
    });
  });
});

describe('Github constructor (failing case)', function() {
  before(function(){
    if (typeof window !== 'undefined') test_user = window.__fixtures__['test/user'];

    github = new Github({
      username: test_user.USERNAME,
      password: 'fake124',
      auth: 'basic'
    });
    user = github.getUser();
  });

  it('should fail authentication and return err', function(done){
    user.notifications(function(err){
      err.request.status.should.equal(401, 'Return 401 status for bad auth');
      JSON.parse(err.request.responseText).message.should.equal('Bad credentials');
      done();
    });
  });
});
