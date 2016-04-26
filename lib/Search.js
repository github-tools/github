/**
 * @file
 * @copyright  2013 Michael Aufreiter (Development Seed) and 2016 Yahoo Inc.
 * @license    Licensed under {@link https://spdx.org/licenses/BSD-3-Clause-Clear.html BSD-3-Clause-Clear}.
 *             Github.js is freely distributable.
 */

import Requestable from './Requestable';
import debug from 'debug';
const log = debug('github:search');

/**
 * Wrap the Search API
 */
class Search extends Requestable {
   /**
    * Create a Search
    * @param {Object} defaults - defaults for the search
    * @param {Requestable.auth} [auth] - information required to authenticate to Github
    * @param {string} [apiBase=https://api.github.com] - the base Github API URL
    */
   constructor(defaults, auth, apiBase) {
      super(auth, apiBase);
      this.__defaults = this._getOptionsWithDefaults(defaults);
   }

   /**
    * Perform a search on the GitHub API
    * @private
    * @param {string} path - the scope of the search
    * @param {Object} [withOptions] - additional parameters for the search
    * @param {Requestable.callback} [cb] - will receive the results of the search
    * @return {Promise} - the promise for the http request
    */
   _search(path, withOptions = {}, cb = undefined) {
      let requestOptions = {};
      Object.keys(this.__defaults).forEach((prop) => requestOptions[prop] = this.__defaults[prop]);
      Object.keys(withOptions).forEach((prop) => requestOptions[prop] = withOptions[prop]);

      log(`searching ${path} with options:`, requestOptions);
      return this._request('GET', `/search/${path}`, requestOptions, cb);
   }

   /**
    * Search in repositories
    * @see https://developer.github.com/v3/search/#search-repositories
    * @param {Object} [options] - additional parameters for the search
    * @param {Requestable.callback} [cb] - will receive the results of the search
    * @return {Promise} - the promise for the http request
    */
   repositories(options, cb) {
      return this._search('repositories', options, cb);
   }

   /**
    * Search amongst code
    * @see https://developer.github.com/v3/search/#search-code
    * @param {Object} [options] - additional parameters for the search
    * @param {Requestable.callback} [cb] - will receive the results of the search
    * @return {Promise} - the promise for the http request
    */
   code(options, cb) {
      return this._search('code', options, cb);
   }

   /**
    * Search issues
    * @see https://developer.github.com/v3/search/#search-issues
    * @param {Object} [options] - additional parameters for the search
    * @param {Requestable.callback} [cb] - will receive the results of the search
    * @return {Promise} - the promise for the http request
    */
   issues(options, cb) {
      return this._search('issues', options, cb);
   }

   /**
    * Search for users
    * @see https://developer.github.com/v3/search/#search-users
    * @param {Object} [options] - additional parameters for the search
    * @param {Requestable.callback} [cb] - will receive the results of the search
    * @return {Promise} - the promise for the http request
    */
   users(options, cb) {
      return this._search('users', options, cb);
   }
}

module.exports = Search;
