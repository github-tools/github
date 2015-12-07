'use strict';

/*!
 * @overview  Requestable.js
 *
 * @copyright (c) 2015 Michael Aufreiter, Development Seed
 *            Github.js is freely distributable.
 * @license   Licensed under BSD-3-Clause-Clear
 *
 *            For all details and documentation:
 *            http://substance.io/michael/github
 */

var debug = require('debug')('Github:Requestable');
var Base64 = require('js-base64').Base64;
var Request = require('axios');

function Requestable(options) {
   this.__baseUrl = options.apiUrl;
   this.__requestableConfig = {
      apiUrl: options.apiUrl,
      token: options.token,
      username: options.username,
      password: options.password
   };

   if ((options.token) || (options.username && options.password)) {
      this.__authorizationHeader = options.token ?
         'token ' + options.token :
         'Basic ' + Base64.encode(options.username + ':' + options.password);
   }
}

Requestable.prototype._getURL = function(path) {
   var url = path.indexOf('//') >= 0 ? path : this.__baseUrl + path;

   url += ((/\?/).test(url) ? '&' : '?');

   return url;
};

function buildError(path, response) {
   return {
      path: path,
      request: response.config,
      response: response,
      status: response.status
   };
}

// This is a hack util axios's next update
// (which will include following redirects in NodeJS)
function getRequestPromise(config) {
   debug('', config.method, 'to', config.url);

   return Request(config).catch(function(response) {
      if (response.status === 301 || response.status === 302) {
         debug('', 'Redirecting to ' + response.headers.location);
         config.url = response.headers.location;

         return getRequestPromise(config);
      }

      throw response;
   });
}

Requestable.prototype._request = function(method, path, data, cb, raw) {
   var headers = {
      Accept: raw ? 'application/vnd.github.v3.raw+json' : 'application/vnd.github.v3+json',
      'Content-Type': 'application/json;charset=UTF-8'
   };
   var url = this._getURL(path);
   var queryParams = {};

   if (this.__authorizationHeader) {
      headers.Authorization = this.__authorizationHeader;
   }

   if (data && typeof data === 'object' && ['GET', 'HEAD', 'DELETE'].indexOf(method) !== -1) {
      queryParams = data;
      data = {};
      url = url.replace(/(&timestamp=\d+)/, '') +
         (typeof window !== 'undefined' ? '&timestamp=' + new Date().getTime() : '');
   }

   var config = {
      url: url,
      method: method,
      headers: headers,
      params: queryParams,
      data: data,
      responseType: raw ? 'text' : 'json'
   };
   var requestPromise = getRequestPromise(config);

   if (cb) {
      requestPromise.then(function(response) {
         cb(null, response.data || true, response);
      }).catch(function(response) {
         debug('', 'catch', response.config.method, response.config.url);
         cb(buildError(path, response));
      });
   } else {
      return requestPromise;
   }
};

Requestable.prototype._requestAllPages = function(path, cb, results) {
   var that = this;

   results = results || [];

   return this._request('GET', path, null)
      .then(function(response) {
         results.push.apply(results, response.data);

         var linksHeader = response.headers.link || '';
         var links = linksHeader.split(/\s*,\s*/g);
         var next = null;

         links.forEach(function(link) {
            next = link.search(/rel="next"/) !== -1 ? link : next;
         });

         if (next) {
            next = (next.match(/<(.*)>/) || [])[1];
         }

         if (next) {
            debug('', 'getting next page', next);

            return that._requestAllPages(next, cb, results);
         }

         if (cb) {
            cb(null, results);
         } else {
            return Promise.resolve(results);
         }
      }).catch(function(response) {
         if (cb) {
            cb(buildError(path, response));
         } else {
            throw response;
         }
      });
};

module.exports = Requestable;
