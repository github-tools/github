'use strict';

/*!
 * @overview  Issue.js
 *
 * @copyright (c) 2015 Michael Aufreiter, Development Seed
 *            Github.js is freely distributable.
 * @license   Licensed under BSD-3-Clause-Clear
 *
 *            For all details and documentation:
 *            http://substance.io/michael/github
 */

var inherits = require('inherits');
var Requestable = require('./helpers/Requestable');

function Issue(options) {
   Issue.super_.call(this, options);
   this.path = '/repos/' + options.user + '/' + options.repo + '/issues';
}

inherits(Issue, Requestable);

Issue.prototype.list = function(options, cb) {
   var query = Object.keys(options).map(function(key) {
     return encodeURIComponent(key) + '=' + encodeURIComponent(options[key]);
  });

   this._requestAllPages(this.path + '?' + query.join('&'), cb);
};

Issue.prototype.comment = function(issue, comment, cb) {
   this._request('POST', issue.comments_url, {
      body: comment
   }, function(err, res) {
      cb(err, res);
   });
};

module.exports = Issue;
