/**
 * @file
 * @copyright  2013 Michael Aufreiter (Development Seed) and 2016 Yahoo Inc.
 * @license    Licensed under {@link https://spdx.org/licenses/BSD-3-Clause-Clear.html BSD-3-Clause-Clear}.
 *             Github.js is freely distributable.
 */

import Requestable from './Requestable';
import debug from 'debug';
const log = debug('github:user');

/**
 * A User allows scoping of API requests to a particular Github user.
 */
class User extends Requestable {
   /**
    * Create a User.
    * @param {Requestable.auth} [auth] - information required to authenticate to Github
    * @param {string} [apiBase=https://api.github.com] - the base Github API URL
    */
   constructor(auth, apiBase) {
      super(auth, apiBase);
   }

   /**
    * List the user's repositories
    * @see https://developer.github.com/v3/repos/#list-your-repositories
    * @param {Object} [options={}] - any options to refine the search
    * @param {Requestable.callback} [cb] - will receive the list of repositories
    * @return {Promise} - the promise for the http request
    */
   repos(options, cb) {
      if (typeof options === 'function') {
         cb = options;
         options = {};
      }

      options = this._getOptionsWithDefaults(options);

      log(`Fetching repositories with options: ${JSON.stringify(options)}`);
      return this._requestAllPages('/user/repos', options, cb);
   }

   /**
    * List the orgs that the user belongs to
    * @param {Requestable.callback} [cb] - will receive the list of organizations
    * @return {Promise} - the promise for the http request
    */
   orgs(cb) {
      return this._request('GET', '/user/orgs', null, cb);
   }

   /**
    * List the user's gists
    * @param {Requestable.callback} [cb] - will receive the list of gists
    * @return {Promise} - the promise for the http request
    */
   gists(cb) {
      return this._request('GET', '/gists', null, cb);
   }

   /**
    * List the user's notifications
    * @see https://developer.github.com/v3/activity/notifications/#list-your-notifications
    * @param {Object} [options={}] - any options to refine the search
    * @param {Requestable.callback} [cb] - will receive the list of repositories
    * @return {Promise} - the promise for the http request
    */
   notifications(options, cb) {
      options = options || {};
      if (typeof options === 'function') {
         cb = options;
         options = {};
      }

      options.since = this._dateToISO(options.since);
      options.before = this._dateToISO(options.before);

      return this._request('GET', '/notifications', options, cb);
   }

   /**
    * Show a user
    * @see https://developer.github.com/v3/users/#get-a-single-user
    * @param {string} [username] - the user to show, defaults to the current user
    * @param {Requestable.callback} [cb] - will receive the user's information
    * @return {Promise} - the promise for the http request
    */
   show(username, cb) {
      if (typeof username === 'function') {
         cb = username;
         username = undefined;
      }
      const url = username ? '/users/' + username : '/user';

      return this._request('GET', url, null, cb);
   }

   /**
    * Get a user's repositories
    * @see https://developer.github.com/v3/repos/#list-user-repositories
    * @param {string} username - the user's repositories we are interested in
    * @param {Object} options - filtering options
    * @param {Requestable.callback} [cb] - will receive the list of repositories
    * @return {Promise} - the promise for the http request
    */
   userRepos(username, options, cb) {
      if (typeof options === 'function') {
         cb = options;
         options = {};
      }

      options = this._getOptionsWithDefaults(options);

      return this._requestAllPages(`/users/${username}/repos`, options, cb);
   }

   /**
    * Gets the list of starred repositories for a user
    * @see https://developer.github.com/v3/activity/starring/#list-repositories-being-starred
    * @param {string} username - the user to query
    * @param {Requestable.callback} [cb] - will receive the list of starred repositories
    * @return {Promise} - the promise for the http request
    */
   userStarred(username, cb) {
      let requestOptions = this._getOptionsWithDefaults();
      return this._requestAllPages(`/users/${username}/starred`, requestOptions, cb);
   }

   /**
    * List a user's gists
    * @see https://developer.github.com/v3/gists/#list-a-users-gists
    * @param {string} username - the user's gists to list
    * @param {Requestable.callback} [cb] - receives the list of gists
    * @return {Promise} - the promise for the http request
    */
   userGists(username, cb) {
      return this._request('GET', `/users/${username}/gists`, null, cb);
   }

   /**
    * List the repositories in an organization
    * @see https://developer.github.com/v3/repos/#list-organization-repositories
    * @param {string} orgname - the name of the organization
    * @param {Requestable.callback} [cb] - will receive the list of repositories
    * @return {Promise} - the promise for the http request
    */
   orgRepos(orgname, cb) {
      let requestOptions = this._getOptionsWithDefaults({direction: 'desc'});

      return this._requestAllPages(`/orgs/${orgname}/repos`, requestOptions, cb);
   }

   /**
    * Follow a user
    * @see https://developer.github.com/v3/users/followers/#follow-a-user
    * @param {string} username - the user to follow
    * @param {Requestable.callback} [cb] - will receive true if the request succeeds
    * @return {Promise} - the promise for the http request
    */
   follow(username, cb) {
      return this._request('PUT', `/user/following/${username}`, null, cb);
   }

   /**
    * Unfollow a user
    * @see https://developer.github.com/v3/users/followers/#follow-a-user
    * @param {string} username - the user to unfollow
    * @param {Requestable.callback} [cb] - receives true if the request succeeds
    * @return {Promise} - the promise for the http request
    */
   unfollow(username, cb) {
      return this._request('DELETE', `/user/following/${username}`, null, cb);
   }

   /**
    * Create a new user repository
    * @see https://developer.github.com/v3/repos/#create
    * @param {object} options - the repository definition
    * @param {Requestable.callback} [cb] - will receive the API response
    * @return {Promise} - the promise for the http request
    */
   createRepo(options, cb) {
      return this._request('POST', '/user/repos', options, cb);
   }
}

module.exports = User;
