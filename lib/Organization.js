/**
 * @file
 * @copyright  2013 Michael Aufreiter (Development Seed) and 2016 Yahoo Inc.
 * @license    Licensed under {@link https://spdx.org/licenses/BSD-3-Clause-Clear.html BSD-3-Clause-Clear}.
 *             Github.js is freely distributable.
 */

import Requestable from './Requestable';

/**
 * Organization encapsulates the functionality to create repositories in organizations
 */
class Organization extends Requestable {
   /**
    * Create a new Organization
    * @param {Requestable.auth} [auth] - information required to authenticate to Github
    * @param {string} [apiBase=https://api.github.com] - the base Github API URL
    */
   constructor(auth, apiBase) {
      super(auth, apiBase);
   }

   /**
    * Create a repository in an organization
    * @see https://developer.github.com/v3/repos/#create
    * @param {Object} options - contains the organization name and repository definition
    * @param {Requestable.callback} [cb] - will receive the created repository
    * @return {Promise} - the promise for the http request
    */
   createRepo(options, cb) {
      this._request('POST', '/orgs/' + options.orgname + '/repos', options, cb);
   }
}

module.exports = Organization;
