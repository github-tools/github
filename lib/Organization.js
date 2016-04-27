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
    * @param {string} organization - the name of the organization
    * @param {Requestable.auth} [auth] - information required to authenticate to Github
    * @param {string} [apiBase=https://api.github.com] - the base Github API URL
    */
   constructor(organization, auth, apiBase) {
      super(auth, apiBase);
      this.__name =  organization;
   }

   /**
    * Create a repository in an organization
    * @see https://developer.github.com/v3/repos/#create
    * @param {Object} options - the repository definition
    * @param {Requestable.callback} [cb] - will receive the created repository
    * @return {Promise} - the promise for the http request
    */
   createRepo(options, cb) {
      this._request('POST', `/orgs/${this.__name}/repos`, options, cb);
   }

   /**
    * List the repositories in an organization
    * @see https://developer.github.com/v3/repos/#list-organization-repositories
    * @param {Requestable.callback} [cb] - will receive the list of repositories
    * @return {Promise} - the promise for the http request
    */
   getRepos(cb) {
      let requestOptions = this._getOptionsWithDefaults({direction: 'desc'});

      return this._requestAllPages(`/orgs/${this.__name}/repos`, requestOptions, cb);
   }
}

module.exports = Organization;
