'use strict';

/*!
 * @overview  User.js
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

function User(options) {
   User.super_.call(this, options);
}

inherits(User, Requestable);

User.prototype.repos = function(options, cb) {
   if (arguments.length === 1 && typeof arguments[0] === 'function') {
      cb = options;
      options = {};
   }

   options = options || {};

   var url = '/user/repos';
   var params = [];

   params.push('type=' + encodeURIComponent(options.type || 'all'));
   params.push('sort=' + encodeURIComponent(options.sort || 'updated'));
   params.push('per_page=' + encodeURIComponent(options.per_page || '1000')); // jscs:ignore

   if (options.page) {
      params.push('page=' + encodeURIComponent(options.page));
   }

   url += '?' + params.join('&');

   this._request('GET', url, null, cb);
};

User.prototype.orgs = function(cb) {
   this._request('GET', '/user/orgs', null, cb);
};

User.prototype.gists = function(cb) {
   this._request('GET', '/gists', null, cb);
};

User.prototype.notifications = function(options, cb) {
   if (arguments.length === 1 && typeof arguments[0] === 'function') {
      cb = options;
      options = {};
   }

   options = options || {};
   var url = '/notifications';
   var params = [];

   if (options.all) {
      params.push('all=true');
   }

   if (options.participating) {
      params.push('participating=true');
   }

   if (options.since) {
      var since = options.since;

      if (since.constructor === Date) {
         since = since.toISOString();
      }

      params.push('since=' + encodeURIComponent(since));
   }

   if (options.before) {
      var before = options.before;

      if (before.constructor === Date) {
         before = before.toISOString();
      }

      params.push('before=' + encodeURIComponent(before));
   }

   if (options.page) {
      params.push('page=' + encodeURIComponent(options.page));
   }

   if (params.length > 0) {
      url += '?' + params.join('&');
   }

   this._request('GET', url, null, cb);
};

User.prototype.show = function(username, cb) {
   var command = username ? '/users/' + username : '/user';

   this._request('GET', command, null, cb);
};

User.prototype.userRepos = function(username, cb) {
   // Github does not always honor the 1000 limit so we want to iterate over the data set.
   this._requestAllPages('/users/' + username + '/repos?type=all&per_page=1000&sort=updated', cb);
};

User.prototype.userStarred = function(username, cb) {
   // Github does not always honor the 1000 limit so we want to iterate over the data set.
   this._requestAllPages('/users/' + username + '/starred?type=all&per_page=1000', function(err, res) {
      cb(err, res);
   });
};

User.prototype.userGists = function(username, cb) {
   this._request('GET', '/users/' + username + '/gists', null, cb);
};

User.prototype.orgRepos = function(orgname, cb) {
   // Github does not always honor the 1000 limit so we want to iterate over the data set.
   this._requestAllPages('/orgs/' + orgname + '/repos?type=all&&page_num=1000&sort=updated&direction=desc', cb);
};

User.prototype.follow = function(username, cb) {
   this._request('PUT', '/user/following/' + username, null, cb);
};

User.prototype.unfollow = function(username, cb) {
   this._request('DELETE', '/user/following/' + username, null, cb);
};

User.prototype.createRepo = function(options, cb) {
   this._request('POST', '/user/repos', options, cb);
};

User.prototype.rateLimit = function(cb) {
   this._request('GET', '/rate_limit', null, cb);
};

module.exports = User;
