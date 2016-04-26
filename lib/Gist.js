/**
 * @file
 * @copyright  2013 Michael Aufreiter (Development Seed) and 2016 Yahoo Inc.
 * @license    Licensed under {@link https://spdx.org/licenses/BSD-3-Clause-Clear.html BSD-3-Clause-Clear}.
 *             Github.js is freely distributable.
 */

import Requestable from './Requestable';

/**
 * A Gist can retrieve and modify gists.
 */
class Gist extends Requestable {
   /**
    * Create a Gist.
    * @param {string} id - the id of the gist (not required when creating a gist)
    * @param {Requestable.auth} [auth] - information required to authenticate to Github
    * @param {string} [apiBase=https://api.github.com] - the base Github API URL
    */
   constructor(id, auth, apiBase) {
      super(auth, apiBase);
      this.id = id;
   }

   /**
    * Fetch a gist.
    * @see https://developer.github.com/v3/gists/#get-a-single-gist
    * @param {Requestable.callback} [cb] - will receive the gist
    * @return {Promise} - the Promise for the http request
    */
   read(cb) {
      return this._request('GET', `/gists/${this.id}`, null, cb);
   }

   /**
    * Create a new gist.
    * @see https://developer.github.com/v3/gists/#create-a-gist
    * @param {Object} gist - the data for the new gist
    * @param {Requestable.callback} [cb] - will receive the new gist upon creation
    * @return {Promise} - the Promise for the http request
    */
   create(gist, cb) {
      return this._request('POST', '/gists', gist, cb)
         .then((response) => {
            this.id = response.data.id;
            return response;
         });
   }

   /**
    * Delete a gist.
    * @see https://developer.github.com/v3/gists/#delete-a-gist
    * @param {Requestable.callback} [cb] - will receive true if the request succeeds
    * @return {Promise} - the Promise for the http request
    */
   delete(cb) {
      return this._request('DELETE', `/gists/${this.id}`, null, cb);
   }

   /**
    * Fork a gist.
    * @see https://developer.github.com/v3/gists/#fork-a-gist
    * @param {Requestable.callback} [cb] - the function that will receive the gist
    * @return {Promise} - the Promise for the http request
    */
   fork(cb) {
      return this._request('POST', `/gists/${this.id}/forks`, null, cb);
   }

   /**
    * Modify a gist.
    * @see https://developer.github.com/v3/gists/#edit-a-gist
    * @param {Object} gist - the data for the new gist
    * @param {Requestable.callback} [cb] - the function that receives the API result
    * @return {Promise} - the Promise for the http request
    */
   update(gist, cb) {
      return this._request('PATCH', `/gists/${this.id}`, gist, cb);
   }

   /**
    * Star a gist.
    * @see https://developer.github.com/v3/gists/#star-a-gist
    * @param {Requestable.callback} [cb] - will receive true if the request is successful
    * @return {Promise} - the Promise for the http request
    */
   star(cb) {
      return this._request('PUT', `/gists/${this.id}/star`, null, cb);
   }

   /**
    * Unstar a gist.
    * @see https://developer.github.com/v3/gists/#unstar-a-gist
    * @param {Requestable.callback} [cb] - will receive true if the request is successful
    * @return {Promise} - the Promise for the http request
    */
   unstar(cb) {
      return this._request('DELETE', `/gists/${this.id}/star`, null, cb);
   }

   /**
    * Check if a gist is starred by the user.
    * @see https://developer.github.com/v3/gists/#check-if-a-gist-is-starred
    * @param {Requestable.callback} [cb] - will receive true if the gist is starred and false if the gist is not starred
    * @return {Promise} - the Promise for the http request
    */
   isStarred(cb) {
      return this._request204or404(`/gists/${this.id}/star`, null, cb);
   }
}

module.exports = Gist;
