'use strict';

/*!
 * @overview  Search.js
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

function Search(options) {
   Search.super_.call(this, options);
   this.path = '/search/';
   this.query = '?q=' + options.query;
}

inherits(Search, Requestable);

Search.prototype.repositories = function(options, cb) {
   this._request('GET', this.path + 'repositories' + this.query, options, cb);
};

Search.prototype.code = function(options, cb) {
   this._request('GET', this.path + 'code' + this.query, options, cb);
};

Search.prototype.issues = function(options, cb) {
   this._request('GET', this.path + 'issues' + this.query, options, cb);
};

Search.prototype.users = function(options, cb) {
   this._request('GET', this.path + 'users' + this.query, options, cb);
};

module.exports = Search;
