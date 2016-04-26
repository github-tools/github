/**
 * @file
 * @copyright  2013 Michael Aufreiter (Development Seed) and 2016 Yahoo Inc.
 * @license    Licensed under {@link https://spdx.org/licenses/BSD-3-Clause-Clear.html BSD-3-Clause-Clear}.
 *             Github.js is freely distributable.
 */

import Requestable from './Requestable';

/**
 * Issue wraps the functionality to get issues for repositories
 */
class Issue extends Requestable {
   /**
    * Create a new Issue
    * @param {string} repoPath - the full name (:user/:repo) to get issues for
    * @param {Requestable.auth} [auth] - information required to authenticate to Github
    * @param {string} [apiBase=https://api.github.com] - the base Github API URL
    */
   constructor(repoPath, auth, apiBase) {
      super(auth, apiBase);
      this.__issuesPath = `/repos/${repoPath}/issues`;
   }

   /**
    * Create a new issue
    * @see https://developer.github.com/v3/issues/#create-an-issue
    * @param {Object} issueData - the issue to create
    * @param {Requestable.callback} [cb] - will receive the created issue
    * @return {Promise} - the promise for the http request
    */
   create(issueData, cb) {
      this._request('POST', this.__issuesPath, issueData, cb);
   }

   /**
    * List the issues for the repository
    * @see https://developer.github.com/v3/issues/#list-issues-for-a-repository
    * @param {Object} options - filtering options
    * @param {Requestable.callback} [cb] - will receive the array of issues
    * @return {Promise} - the promise for the http request
    */
   list(options, cb) {
      this._requestAllPages(this.__issuesPath, options, cb);
   }

   /**
    * Comment on an issue
    * @see https://developer.github.com/v3/issues/comments/#create-a-comment
    * @param {Object} issue - an issue object fetched from GitHub
    * @param {string} comment - the comment to add
    * @param {Requestable.callback} [cb] - will receive the created comment
    * @return {Promise} - the promise for the http request
    */
   comment(issue, comment, cb) {
      // path should change to be `${this.__issuesPath}/${issue}/comments`
      this._request('POST', issue.comments_url, {body: comment}, cb); // jscs:ignore
   }

   /**
    * Edit an issue
    * @see https://developer.github.com/v3/issues/#edit-an-issue
    * @param {number} issue - the issue number to edit
    * @param {Object} issueData - the new issue data
    * @param {Requestable.callback} [cb] - will receive the modified issue
    * @return {Promise} - the promise for the http request
    */
   edit(issue, issueData, cb) {
      this._request('PATCH', `${this.__issuesPath}/${issue}`, issueData, cb);
   }

   /**
    * Get a particular issue
    * @see https://developer.github.com/v3/issues/#get-a-single-issue
    * @param {number} issue - the issue number to fetch
    * @param {Requestable.callback} [cb] - will receive the issue
    * @return {Promise} - the promise for the http request
    */
   get(issue, cb) {
      this._request('GET', `${this.__issuesPath}/${issue}`, null, cb);
   }

}

module.exports = Issue;
