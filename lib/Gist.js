'use strict';

/*!
 * @overview  Gist.js
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

function Gist(options) {
   Gist.super_.call(this, options);
   this.gistPath = '/gists/' + options.id;
}

inherits(Gist, Requestable);

Gist.prototype.read = function(cb) {
   this._request('GET', this.gistPath, null, cb);
};

// Create the gist
// --------
// {
//  "description": "the description for this gist",
//    "public": true,
//    "files": {
//      "file1.txt": {
//        "content": "String file contents"
//      }
//    }
// }
Gist.prototype.create = function(options, cb) {
   this._request('POST', '/gists', options, cb);
};

Gist.prototype.delete = function(cb) {
   this._request('DELETE', this.gistPath, null, cb);
};

Gist.prototype.fork = function(cb) {
   this._request('POST', this.gistPath + '/fork', null, cb);
};

Gist.prototype.update = function(options, cb) {
   this._request('PATCH', this.gistPath, options, cb);
};

Gist.prototype.star = function(cb) {
   this._request('PUT', this.gistPath + '/star', null, cb);
};

Gist.prototype.unstar = function(cb) {
   this._request('DELETE', this.gistPath + '/star', null, cb);
};

Gist.prototype.isStarred = function(cb) {
   this._request('GET', this.gistPath + '/star', null, cb);
};

module.exports = Gist;
