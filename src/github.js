/**
 * @file
 * @copyright  2013 Michael Aufreiter (Development Seed) and 2016 Yahoo Inc.
 * @license    Licensed under {@link https://spdx.org/licenses/BSD-3-Clause-Clear.html BSD-3-Clause-Clear}.
 *             Github.js is freely distributable.
 */

import Gist from './Gist';
import User from './User';
import Issue from './Issue';
import Search from './Search';
import RateLimit from './RateLimit';
import Repository from './Repository';
import Organization from './Organization';

/**
 * GitHub encapsulates the functionality to create various API wrapper objects.
 */
class GitHub {
   /**
    * Create a new GitHub.
    * @param {Requestable.auth} [auth] - the credentials to authenticate to Github. If auth is
    *                                  not provided requests will be made unauthenticated
    * @param {string} [apiBase=https://api.github.com] - the base Github API URL
    */
   constructor(auth, apiBase = 'https://api.github.com') {
      this.__apiBase = apiBase;
      this.__auth = auth || {};
   }

   /**
    * Create a new Gist wrapper
    * @param {number} id - the id for the gist, leave undefined when creating a new gist
    */
   getGist(id) {
      return new Gist(id, this.__auth, this.__apiBase);
   }

   /**
    * Create a new User wrapper
    * @return {User}
    */
   getUser() {
      return new User(this.__auth, this.__apiBase);
   }

   /**
    * Create a new Organization wrapper
    * @return {Organization}
    */
   getOrg() {
      return new Organization(this.__auth, this.__apiBase);
   }

   /**
    * Create a new Repository wrapper
    * @param {string} user - the user who owns the respository
    * @param {string} repo - the name of the repository
    * @return {Repository}
    */
   getRepo(user, repo) {
      return new Repository(this._getFullName(user, repo), this.__auth, this.__apiBase);
   }

   /**
    * Create a new Issue wrapper
    * @param {string} user - the user who owns the respository
    * @param {string} repo - the name of the repository
    * @return {Issue}
    */
   getIssues(user, repo) {
      return new Issue(this._getFullName(user, repo), this.__auth, this.__apiBase);
   }

   /**
    * Create a new Search wrapper
    * @param {string} query - the query to search for
    * @return {Search}
    */
   search(query) {
      return new Search(query, this.__auth, this.__apiBase);
   }

   /**
    * Create a new RateLimit wrapper
    * @return {RateLimit}
    */
   getRateLimit() {
      return new RateLimit(this.__auth, this.__apiBase);
   }

   _getFullName(user, repo) {
      let fullname = user;

      if (repo) {
         fullname = `${user}/${repo}`;
      }

      return fullname;
   }
}

module.exports = GitHub;
