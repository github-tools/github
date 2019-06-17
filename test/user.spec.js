import expect from 'must';

import Github from '../lib/GitHub';
import testUser from './fixtures/user.js';
import {assertSuccessful, assertArray} from './helpers/callbacks';

describe('User', function() {
   let github;
   let user;

   before(function() {
      github = new Github({
         username: testUser.USERNAME,
         password: testUser.PASSWORD,
         auth: 'basic',
      });
      user = github.getUser();
   });

   it('should get user repos', function(done) {
      user.listRepos(assertArray(done));
   });

   it('should get user repos with options', function(done) {
      const filterOpts = {
         type: 'owner',
         sort: 'updated',
         per_page: 90, // eslint-disable-line
         page: 10,
      };

      user.listRepos(filterOpts, assertArray(done));
   });

   it('should get user orgs', function(done) {
      user.listOrgs(assertArray(done));
   });

   it('should get user followers', function(done) {
      user.listFollowers(assertArray(done));
   });

   it('should get user following list', function(done) {
      user.listFollowing(assertArray(done));
   });

   it('should get user gists', function(done) {
      user.listGists(assertArray(done));
   });

   it('should get user notifications', function(done) {
      user.listNotifications(assertArray(done));
   });

   it('should get user notifications with options', function(done) {
      const filterOpts = {
         all: true,
         participating: true,
         since: '2015-01-01T00:00:00Z',
         before: '2015-02-01T00:00:00Z',
      };

      user.listNotifications(filterOpts, assertArray(done));
   });

   it('should get the user\'s profile', function(done) {
      user.getProfile(assertSuccessful(done));
   });

   it('should show user\'s starred repos', function(done) {
      user.listStarredRepos(assertArray(done));
   });

   it('should show user\'s starred gists', function(done) {
      const option = {
         since: '2015-01-01T00:00:00Z',
      };
      user.listStarredGists(option, assertArray(done));
   });

   describe('following a user', function() {
      const userToFollow = 'ingalls';

      before(function() {
         return user.unfollow(userToFollow);
      });

      it('should follow user', function(done) {
         user.follow(userToFollow, assertSuccessful(done, function(err, resp) {
            user._request('GET', '/user/following', null, assertSuccessful(done, function(err, following) {
               expect((following.some((user) => user['login'] === userToFollow))).to.be.true();
               done();
            }));
         }));
      });
   });

   describe('following yourself', function() {
      const userToFollow = testUser.USERNAME;

      before(function() {
         return user.unfollow(userToFollow);
      });

      it('should not list yourself as one of your followers', function(done) {
         user.follow(userToFollow, assertSuccessful(done, function(err, resp) {
            user._request('GET', '/user/following', null, assertSuccessful(done, function(err, following) {
               expect((following.some((user) => user['login'] === userToFollow))).to.be.false();
               done();
            }));
         }));
      });
   });

   describe('unfollowing a user', function(done) {
      const userToUnfollow = 'ingalls';

      before(function() {
         return user.follow(userToUnfollow);
      });

      it('should unfollow a user', function(done) {
         user.unfollow(userToUnfollow, assertSuccessful(done, function(err, resp) {
            user._request('GET', '/user/following', null, assertSuccessful(done, function(err, following) {
               expect((following.some((user) => user['login'] === userToUnfollow))).to.be.false();
               done();
            }));
         }));
      });
   });

   it('should list the email addresses of the user', function(done) {
      user.getEmails(assertSuccessful(done));
   });
});
