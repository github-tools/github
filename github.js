/*!
 * @overview  Github.js
 *
 * @copyright (c) 2013 Michael Aufreiter, Development Seed
 *            Github.js is freely distributable.
 * @license   Licensed under BSD-3-Clause-Clear
 *
 *            For all details and documentation:
 *            http://substance.io/michael/github
 */
'use strict';

require('es6-promise').polyfill();

var User = require('./lib/User');
var Gist = require('./lib/Gist');
var Issue = require('./lib/Issue');
var Search = require('./lib/Search');
var Repository = require('./lib/Repository');

function Github(options) {
   this.apiUrl = options.apiUrl || 'https://api.github.com';
   this.username = options.username;
   this.password = options.password;
   this.token = options.token;
}

Github.prototype.getIssues = function(user, repo) {
   return new Issue({
      apiUrl: this.apiUrl,
      username: this.username,
      password: this.password,
      token: this.token,
      user: user,
      repo: repo
   });
};

Github.prototype.getRepo = function(user, repo) {
   var fullname = user;

   if (repo) {
      fullname = user + '/' + repo;
   }

   return new Repository({
      apiUrl: this.apiUrl,
      username: this.username,
      password: this.password,
      token: this.token,
      fullname: fullname
   });
};

Github.prototype.getUser = function() {
   return new User({
      apiUrl: this.apiUrl,
      username: this.username,
      password: this.password,
      token: this.token
   });
};

Github.prototype.getGist = function(id) {
   return new Gist({
      apiUrl: this.apiUrl,
      username: this.username,
      password: this.password,
      token: this.token,
      id: id
   });
};

Github.prototype.getSearch = function(query) {
   return new Search({
      apiUrl: this.apiUrl,
      username: this.username,
      password: this.password,
      token: this.token,
      query: query
   });
};

module.exports = Github;
