/**
 * @file
 * @copyright  2016 Matt Smith (Development Seed)
 * @license    Licensed under {@link https://spdx.org/licenses/BSD-3-Clause-Clear.html BSD-3-Clause-Clear}.
 *             Github.js is freely distributable.
 */

import Requestable from './Requestable';
import debug from 'debug';
const log = debug('github:watching');

/**
 * Watching a Repository registers the user to receive notifications on new discussions, as well as events in the user's
 * activity feed.
 */
export default class Watching extends Requestable {
   /**
    * Watching wrapper
    * @param {Requestable.auth} [auth] - information required to authenticate to Github
    * @param {string} [apiBase=https://api.github.com] - the base Github API URL
    */
   constructor(auth, apiBase) {
      super(auth, apiBase);
   }

   /**
    * Get Watchers for repo
    * @see https://developer.github.com/v3/activity/watching/#list-watchers
    * @param {string} owner - username or organization
    * @param {string} repo - repo name
    * @param {Requestable.callback} [cb] - list of watchers
    * @return {Promise} - the promise for the http request
    */
   listWatchers(owner, repo, cb) {
      log(`Fetching watchers for ${owner}/${repo}`);
      return this._requestAllPages(`/repos/${owner}/${repo}/subscribers`, undefined, cb);
   }

   /**
    * Subscribe to repo
    * @see https://developer.github.com/v3/activity/watching/#set-a-repository-subscription
    * @param {string} owner - username or organization
    * @param {string} repo - repo name
    * @param {Requestable.callback} [cb] - subscription status
    * @return {Promise} - the promise for the http request
    */
   subscribe(owner, repo, cb) {
      log(`Subscribing to ${owner}/${repo}`);
      return this._setSubscription(owner, repo, true, cb);
   }

   /**
    * Ignore a repo
    * @see https://developer.github.com/v3/activity/watching/#set-a-repository-subscription
    * @param {string} owner - username or organization
    * @param {string} repo - repo name
    * @param {Requestable.callback} [cb] - subscription status
    * @return {Promise} - the promise for the http request
    */
   ignore(owner, repo, cb) {
      log(`Ignoring ${owner}/${repo}`);
      return this._setSubscription(owner, repo, false, cb);
   }

   /**
    * Remove all subscription settings for repo
    * @see https://developer.github.com/v3/activity/watching/#delete-a-repository-subscription
    * @param {string} owner - username or organization
    * @param {string} repo - repo name
    * @param {Requestable.callback} [cb] - subscription status
    * @return {Promise} - the promise for the http request
    */
   removeSubscription(owner, repo, cb) {
      log(`Removing subscription settings for ${owner}/${repo}`);
      return this._request204or404(`/repos/${owner}/${repo}/subscription`, undefined, cb, 'DELETE');
   }

   /**
    * General subscription method
    * @private
    * @see https://developer.github.com/v3/activity/watching/#set-a-repository-subscription
    * @param {string} owner - username or organization
    * @param {string} repo - repo name
    * @param {boolean} subscribed - subscribed or ignored
    * @param {Requestable.callback} [cb] - subscription status
    * @return {Promise} - the promise for the http request
    */
   _setSubscription(owner, repo, subscribed, cb) {
      log(`Subscribing to ${owner}/${repo}`);
      return this._request('PUT', `/repos/${owner}/${repo}/subscription`, {
         subscribed,
         ignored: !subscribed
      }, cb);
   }
}
