(function (global, factory) {
   if (typeof define === "function" && define.amd) {
      define(['module', 'request-extensible', 'request-http-cache', 'debug', 'js-base64', 'es6-promise'], factory);
   } else if (typeof exports !== "undefined") {
      factory(module, require('request-extensible'), require('request-http-cache'), require('debug'), require('js-base64'), require('es6-promise'));
   } else {
      var mod = {
         exports: {}
      };
      factory(mod, global.requestExtensible, global.requestHttpCache, global.debug, global.jsBase64, global.Promise);
      global.Requestable = mod.exports;
   }
})(this, function (module, _requestExtensible, _requestHttpCache, _debug, _jsBase, _es6Promise) {
   'use strict';

   var _requestExtensible2 = _interopRequireDefault(_requestExtensible);

   var _requestHttpCache2 = _interopRequireDefault(_requestHttpCache);

   var _debug2 = _interopRequireDefault(_debug);

   function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : {
         default: obj
      };
   }

   var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
      return typeof obj;
   } : function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
   };

   var _createClass = function () {
      function defineProperties(target, props) {
         for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
         }
      }

      return function (Constructor, protoProps, staticProps) {
         if (protoProps) defineProperties(Constructor.prototype, protoProps);
         if (staticProps) defineProperties(Constructor, staticProps);
         return Constructor;
      };
   }();

   function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
         throw new TypeError("Cannot call a class as a function");
      }
   }

   function _possibleConstructorReturn(self, call) {
      if (!self) {
         throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }

      return call && (typeof call === "object" || typeof call === "function") ? call : self;
   }

   function _inherits(subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
         throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
      }

      subClass.prototype = Object.create(superClass && superClass.prototype, {
         constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
         }
      });
      if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
   }

   var httpRequestCache = new _requestHttpCache2.default({
      max: 256 * 1024 * 1024 // Maximum cache size (256mb)
   });

   var request = (0, _requestExtensible2.default)({
      extensions: [httpRequestCache.extension]
   });

   var log = (0, _debug2.default)('github:request');

   if (typeof Promise === 'undefined') {
      (0, _es6Promise.polyfill)();
   }

   /**
    * The error structure returned when a network call fails
    */

   var ResponseError = function (_Error) {
      _inherits(ResponseError, _Error);

      /**
       * Construct a new ResponseError
       * @param {string} message - an message to return instead of the the default error message
       * @param {string} path - the requested path
       * @param {Object} response - the object returned by Axios
       */
      function ResponseError(message, path, response) {
         _classCallCheck(this, ResponseError);

         var _this = _possibleConstructorReturn(this, (ResponseError.__proto__ || Object.getPrototypeOf(ResponseError)).call(this, message));

         _this.path = path;
         _this.request = response.config;
         _this.response = response;
         _this.status = response.status;
         return _this;
      }

      return ResponseError;
   }(Error);

   var Requestable = function () {
      /**
       * Either a username and password or an oauth token for Github
       * @typedef {Object} Requestable.auth
       * @prop {string} [username] - the Github username
       * @prop {string} [password] - the user's password
       * @prop {token} [token] - an OAuth token
       */
      /**
       * Initialize the http internals.
       * @param {Requestable.auth} [auth] - the credentials to authenticate to Github. If auth is
       *                                  not provided request will be made unauthenticated
       * @param {string} [apiBase=https://api.github.com] - the base Github API URL
       */
      function Requestable(auth, apiBase) {
         _classCallCheck(this, Requestable);

         this.__apiBase = apiBase || 'https://api.github.com';
         this.__auth = {
            token: auth.token,
            username: auth.username,
            password: auth.password
         };

         if (auth.token) {
            this.__authorizationHeader = 'token ' + auth.token;
         } else if (auth.username && auth.password) {
            this.__authorizationHeader = 'Basic ' + _jsBase.Base64.encode(auth.username + ':' + auth.password);
         }
      }

      /**
       * Compute the URL to use to make a request.
       * @private
       * @param {string} path - either a URL relative to the API base or an absolute URL
       * @return {string} - the URL to use
       */


      _createClass(Requestable, [{
         key: '__getURL',
         value: function __getURL(path) {
            var url = path;

            if (path.indexOf('//') === -1) {
               url = this.__apiBase + path;
            }

            var newCacheBuster = 'timestamp=' + new Date().getTime();
            return url.replace(/(timestamp=\d+)/, newCacheBuster);
         }
      }, {
         key: '__getRequestHeaders',
         value: function __getRequestHeaders(raw) {
            var headers = {
               'Accept': raw ? 'application/vnd.github.v3.raw+json' : 'application/vnd.github.v3+json',
               'Content-Type': 'application/json;charset=UTF-8'
            };

            if (this.__authorizationHeader) {
               headers.Authorization = this.__authorizationHeader;
            }

            return headers;
         }
      }, {
         key: '_getOptionsWithDefaults',
         value: function _getOptionsWithDefaults() {
            var requestOptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            if (!(requestOptions.visibility || requestOptions.affiliation)) {
               requestOptions.type = requestOptions.type || 'all';
            }
            requestOptions.sort = requestOptions.sort || 'updated';
            requestOptions.per_page = requestOptions.per_page || '100'; // eslint-disable-line

            return requestOptions;
         }
      }, {
         key: '_dateToISO',
         value: function _dateToISO(date) {
            if (date && date instanceof Date) {
               date = date.toISOString();
            }

            return date;
         }
      }, {
         key: '_request',
         value: function _request(method, path, data, cb, raw) {
            var url = this.__getURL(path);

            var headers = this.__getRequestHeaders(raw);
            // Failsafe check for directly making request from NodeJS
            if (!headers['User-Agent']) {
               headers['User-Agent'] = 'request';
            }

            var queryParams = {};
            var shouldUseDataAsParams = data && (typeof data === 'undefined' ? 'undefined' : _typeof(data)) === 'object' && methodHasNoBody(method);
            if (shouldUseDataAsParams) {
               queryParams = data;
               data = undefined;
            }

            var config = {
               url: url,
               method: method,
               headers: headers,
               params: queryParams,
               data: data,
               responseType: raw ? 'text' : 'json'
            };

            log(config.method + ' to ' + config.url);

            var requestPromise = new Promise(function (resolve, reject) {
               request(config, function (err, response, body) {
                  var ret = {
                     status: response ? response.statusCode : null,
                     statusText: response ? response.statusMessage : null,
                     headers: response ? response.headers : null,
                     config: config
                  };
                  if (err === null && response && response.statusCode >= 200 && response.statusCode < 300) {
                     if (raw) {
                        ret.data = body;
                     } else {
                        ret.data = JSON.parse(body);
                     }
                     resolve(ret);
                  } else {
                     ret.data = body;
                     callbackErrorOrRejectOrThrow(cb, reject, path)(ret);
                  }
               });
            });
            // const requestPromise = axios(config).catch(callbackErrorOrThrow(cb, path));

            if (cb) {
               requestPromise.then(function (response) {
                  cb(null, response.data || true, response);
               });
            }

            return requestPromise;
         }
      }, {
         key: '_request204or404',
         value: function _request204or404(path, data, cb) {
            var method = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'GET';

            return this._request(method, path, data).then(function success(response) {
               if (cb) {
                  cb(null, true, response);
               }
               return true;
            }, function failure(response) {
               if (response.status === 404) {
                  if (cb) {
                     cb(null, false, response);
                  }
                  return false;
               }

               if (cb) {
                  cb(response);
               }
               throw response;
            });
         }
      }, {
         key: '_requestAllPages',
         value: function _requestAllPages(path, options, cb, results) {
            var _this2 = this;

            results = results || [];

            return this._request('GET', path, options).then(function (response) {
               var thisGroup = void 0;
               if (response.data instanceof Array) {
                  thisGroup = response.data;
               } else if (response.data.items instanceof Array) {
                  thisGroup = response.data.items;
               } else {
                  var message = 'cannot figure out how to append ' + response.data + ' to the result set';
                  throw new ResponseError(message, path, response);
               }
               results.push.apply(results, thisGroup);

               var nextUrl = getNextPage(response.headers.link);
               if (nextUrl) {
                  log('getting next page: ' + nextUrl);
                  return _this2._requestAllPages(nextUrl, options, cb, results);
               }

               if (cb) {
                  cb(null, results, response);
               }

               response.data = results;
               return response;
            }).catch(callbackErrorOrRejectOrThrow(cb, null, path));
         }
      }]);

      return Requestable;
   }();

   module.exports = Requestable;

   // ////////////////////////// //
   //  Private helper functions  //
   // ////////////////////////// //
   var METHODS_WITH_NO_BODY = ['GET', 'HEAD', 'DELETE'];
   function methodHasNoBody(method) {
      return METHODS_WITH_NO_BODY.indexOf(method) !== -1;
   }

   function getNextPage() {
      var linksHeader = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

      var links = linksHeader.split(/\s*,\s*/); // splits and strips the urls
      return links.reduce(function (nextUrl, link) {
         if (link.search(/rel="next"/) !== -1) {
            return (link.match(/<(.*)>/) || [])[1];
         }

         return nextUrl;
      }, undefined);
   }

   function callbackErrorOrRejectOrThrow(cb, reject, path) {
      return function handler(object) {
         var error = void 0;
         if (object.hasOwnProperty('config')) {
            var status = object.status,
                statusText = object.statusText,
                _object$config = object.config,
                method = _object$config.method,
                url = _object$config.url;

            var message = status + ' error making request ' + method + ' ' + url + ': "' + statusText + '"';
            error = new ResponseError(message, path, object);
            log(message + ' ' + JSON.stringify(object.data));
         } else {
            error = object;
         }
         if (cb) {
            log('going to error callback');
            cb(error);
         } else if (reject) {
            reject(error);
         } else {
            log('throwing error');
            throw error;
         }
      };
   }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJlcXVlc3RhYmxlLmpzIl0sIm5hbWVzIjpbImh0dHBSZXF1ZXN0Q2FjaGUiLCJSZXF1ZXN0SHR0cENhY2hlIiwibWF4IiwicmVxdWVzdCIsImV4dGVuc2lvbnMiLCJleHRlbnNpb24iLCJsb2ciLCJQcm9taXNlIiwiUmVzcG9uc2VFcnJvciIsIm1lc3NhZ2UiLCJwYXRoIiwicmVzcG9uc2UiLCJjb25maWciLCJzdGF0dXMiLCJFcnJvciIsIlJlcXVlc3RhYmxlIiwiYXV0aCIsImFwaUJhc2UiLCJfX2FwaUJhc2UiLCJfX2F1dGgiLCJ0b2tlbiIsInVzZXJuYW1lIiwicGFzc3dvcmQiLCJfX2F1dGhvcml6YXRpb25IZWFkZXIiLCJCYXNlNjQiLCJlbmNvZGUiLCJ1cmwiLCJpbmRleE9mIiwibmV3Q2FjaGVCdXN0ZXIiLCJEYXRlIiwiZ2V0VGltZSIsInJlcGxhY2UiLCJyYXciLCJoZWFkZXJzIiwiQXV0aG9yaXphdGlvbiIsInJlcXVlc3RPcHRpb25zIiwidmlzaWJpbGl0eSIsImFmZmlsaWF0aW9uIiwidHlwZSIsInNvcnQiLCJwZXJfcGFnZSIsImRhdGUiLCJ0b0lTT1N0cmluZyIsIm1ldGhvZCIsImRhdGEiLCJjYiIsIl9fZ2V0VVJMIiwiX19nZXRSZXF1ZXN0SGVhZGVycyIsInF1ZXJ5UGFyYW1zIiwic2hvdWxkVXNlRGF0YUFzUGFyYW1zIiwibWV0aG9kSGFzTm9Cb2R5IiwidW5kZWZpbmVkIiwicGFyYW1zIiwicmVzcG9uc2VUeXBlIiwicmVxdWVzdFByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwiZXJyIiwiYm9keSIsInJldCIsInN0YXR1c0NvZGUiLCJzdGF0dXNUZXh0Iiwic3RhdHVzTWVzc2FnZSIsIkpTT04iLCJwYXJzZSIsImNhbGxiYWNrRXJyb3JPclJlamVjdE9yVGhyb3ciLCJ0aGVuIiwiX3JlcXVlc3QiLCJzdWNjZXNzIiwiZmFpbHVyZSIsIm9wdGlvbnMiLCJyZXN1bHRzIiwidGhpc0dyb3VwIiwiQXJyYXkiLCJpdGVtcyIsInB1c2giLCJhcHBseSIsIm5leHRVcmwiLCJnZXROZXh0UGFnZSIsImxpbmsiLCJfcmVxdWVzdEFsbFBhZ2VzIiwiY2F0Y2giLCJtb2R1bGUiLCJleHBvcnRzIiwiTUVUSE9EU19XSVRIX05PX0JPRFkiLCJsaW5rc0hlYWRlciIsImxpbmtzIiwic3BsaXQiLCJyZWR1Y2UiLCJzZWFyY2giLCJtYXRjaCIsImhhbmRsZXIiLCJvYmplY3QiLCJlcnJvciIsImhhc093blByb3BlcnR5Iiwic3RyaW5naWZ5Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFhQSxPQUFNQSxtQkFBbUIsSUFBSUMsMEJBQUosQ0FBcUI7QUFDNUNDLFdBQUssTUFBSSxJQUFKLEdBQVMsSUFEOEIsQ0FDekI7QUFEeUIsSUFBckIsQ0FBekI7O0FBSUEsT0FBTUMsVUFBVSxpQ0FBVztBQUN6QkMsa0JBQVksQ0FBRUosaUJBQWlCSyxTQUFuQjtBQURhLElBQVgsQ0FBaEI7O0FBSUEsT0FBTUMsTUFBTSxxQkFBTSxnQkFBTixDQUFaOztBQUVBLE9BQUksT0FBT0MsT0FBUCxLQUFtQixXQUF2QixFQUFvQztBQUNqQztBQUNGOztBQUVEOzs7O09BR01DLGE7OztBQUNIOzs7Ozs7QUFNQSw2QkFBWUMsT0FBWixFQUFxQkMsSUFBckIsRUFBMkJDLFFBQTNCLEVBQXFDO0FBQUE7O0FBQUEsbUlBQzVCRixPQUQ0Qjs7QUFFbEMsZUFBS0MsSUFBTCxHQUFZQSxJQUFaO0FBQ0EsZUFBS1AsT0FBTCxHQUFlUSxTQUFTQyxNQUF4QjtBQUNBLGVBQUtELFFBQUwsR0FBZ0JBLFFBQWhCO0FBQ0EsZUFBS0UsTUFBTCxHQUFjRixTQUFTRSxNQUF2QjtBQUxrQztBQU1wQzs7O0tBYndCQyxLOztPQW1CdEJDLFc7QUFDSDs7Ozs7OztBQU9BOzs7Ozs7QUFNQSwyQkFBWUMsSUFBWixFQUFrQkMsT0FBbEIsRUFBMkI7QUFBQTs7QUFDeEIs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S0FBSDtBQUNGLFVBSEQsTUFHTyxJQUFJckMsTUFBSixFQUFZO0FBQ2pCQSxtQkFBT3FDLEtBQVA7QUFDRCxVQUZNLE1BRUE7QUFDSnZGLGdCQUFJLGdCQUFKO0FBQ0Esa0JBQU11RixLQUFOO0FBQ0Y7QUFDSCxPQW5CRDtBQW9CRiIsImZpbGUiOiJSZXF1ZXN0YWJsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGVcbiAqIEBjb3B5cmlnaHQgIDIwMTYgWWFob28gSW5jLlxuICogQGxpY2Vuc2UgICAgTGljZW5zZWQgdW5kZXIge0BsaW5rIGh0dHBzOi8vc3BkeC5vcmcvbGljZW5zZXMvQlNELTMtQ2xhdXNlLUNsZWFyLmh0bWwgQlNELTMtQ2xhdXNlLUNsZWFyfS5cbiAqICAgICAgICAgICAgIEdpdGh1Yi5qcyBpcyBmcmVlbHkgZGlzdHJpYnV0YWJsZS5cbiAqL1xuXG5pbXBvcnQgcmVxdWVzdEV4dCBmcm9tICdyZXF1ZXN0LWV4dGVuc2libGUnO1xuaW1wb3J0IFJlcXVlc3RIdHRwQ2FjaGUgZnJvbSAncmVxdWVzdC1odHRwLWNhY2hlJztcbmltcG9ydCBkZWJ1ZyBmcm9tICdkZWJ1Zyc7XG5pbXBvcnQge0Jhc2U2NH0gZnJvbSAnanMtYmFzZTY0JztcbmltcG9ydCB7cG9seWZpbGx9IGZyb20gJ2VzNi1wcm9taXNlJztcblxuY29uc3QgaHR0cFJlcXVlc3RDYWNoZSA9IG5ldyBSZXF1ZXN0SHR0cENhY2hlKHtcbiAgbWF4OiAyNTYqMTAyNCoxMDI0IC8vIE1heGltdW0gY2FjaGUgc2l6ZSAoMjU2bWIpXG59KTtcblxuY29uc3QgcmVxdWVzdCA9IHJlcXVlc3RFeHQoe1xuICBleHRlbnNpb25zOiBbIGh0dHBSZXF1ZXN0Q2FjaGUuZXh0ZW5zaW9uIF1cbn0pO1xuXG5jb25zdCBsb2cgPSBkZWJ1ZygnZ2l0aHViOnJlcXVlc3QnKTtcblxuaWYgKHR5cGVvZiBQcm9taXNlID09PSAndW5kZWZpbmVkJykge1xuICAgcG9seWZpbGwoKTtcbn1cblxuLyoqXG4gKiBUaGUgZXJyb3Igc3RydWN0dXJlIHJldHVybmVkIHdoZW4gYSBuZXR3b3JrIGNhbGwgZmFpbHNcbiAqL1xuY2xhc3MgUmVzcG9uc2VFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgIC8qKlxuICAgICogQ29uc3RydWN0IGEgbmV3IFJlc3BvbnNlRXJyb3JcbiAgICAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlIC0gYW4gbWVzc2FnZSB0byByZXR1cm4gaW5zdGVhZCBvZiB0aGUgdGhlIGRlZmF1bHQgZXJyb3IgbWVzc2FnZVxuICAgICogQHBhcmFtIHtzdHJpbmd9IHBhdGggLSB0aGUgcmVxdWVzdGVkIHBhdGhcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSByZXNwb25zZSAtIHRoZSBvYmplY3QgcmV0dXJuZWQgYnkgQXhpb3NcbiAgICAqL1xuICAgY29uc3RydWN0b3IobWVzc2FnZSwgcGF0aCwgcmVzcG9uc2UpIHtcbiAgICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgICAgdGhpcy5wYXRoID0gcGF0aDtcbiAgICAgIHRoaXMucmVxdWVzdCA9IHJlc3BvbnNlLmNvbmZpZztcbiAgICAgIHRoaXMucmVzcG9uc2UgPSByZXNwb25zZTtcbiAgICAgIHRoaXMuc3RhdHVzID0gcmVzcG9uc2Uuc3RhdHVzO1xuICAgfVxufVxuXG4vKipcbiAqIFJlcXVlc3RhYmxlIHdyYXBzIHRoZSBsb2dpYyBmb3IgbWFraW5nIGh0dHAgcmVxdWVzdHMgdG8gdGhlIEFQSVxuICovXG5jbGFzcyBSZXF1ZXN0YWJsZSB7XG4gICAvKipcbiAgICAqIEVpdGhlciBhIHVzZXJuYW1lIGFuZCBwYXNzd29yZCBvciBhbiBvYXV0aCB0b2tlbiBmb3IgR2l0aHViXG4gICAgKiBAdHlwZWRlZiB7T2JqZWN0fSBSZXF1ZXN0YWJsZS5hdXRoXG4gICAgKiBAcHJvcCB7c3RyaW5nfSBbdXNlcm5hbWVdIC0gdGhlIEdpdGh1YiB1c2VybmFtZVxuICAgICogQHByb3Age3N0cmluZ30gW3Bhc3N3b3JkXSAtIHRoZSB1c2VyJ3MgcGFzc3dvcmRcbiAgICAqIEBwcm9wIHt0b2tlbn0gW3Rva2VuXSAtIGFuIE9BdXRoIHRva2VuXG4gICAgKi9cbiAgIC8qKlxuICAgICogSW5pdGlhbGl6ZSB0aGUgaHR0cCBpbnRlcm5hbHMuXG4gICAgKiBAcGFyYW0ge1JlcXVlc3RhYmxlLmF1dGh9IFthdXRoXSAtIHRoZSBjcmVkZW50aWFscyB0byBhdXRoZW50aWNhdGUgdG8gR2l0aHViLiBJZiBhdXRoIGlzXG4gICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub3QgcHJvdmlkZWQgcmVxdWVzdCB3aWxsIGJlIG1hZGUgdW5hdXRoZW50aWNhdGVkXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gW2FwaUJhc2U9aHR0cHM6Ly9hcGkuZ2l0aHViLmNvbV0gLSB0aGUgYmFzZSBHaXRodWIgQVBJIFVSTFxuICAgICovXG4gICBjb25zdHJ1Y3RvcihhdXRoLCBhcGlCYXNlKSB7XG4gICAgICB0aGlzLl9fYXBpQmFzZSA9IGFwaUJhc2UgfHwgJ2h0dHBzOi8vYXBpLmdpdGh1Yi5jb20nO1xuICAgICAgdGhpcy5fX2F1dGggPSB7XG4gICAgICAgICB0b2tlbjogYXV0aC50b2tlbixcbiAgICAgICAgIHVzZXJuYW1lOiBhdXRoLnVzZXJuYW1lLFxuICAgICAgICAgcGFzc3dvcmQ6IGF1dGgucGFzc3dvcmRcbiAgICAgIH07XG5cbiAgICAgIGlmIChhdXRoLnRva2VuKSB7XG4gICAgICAgICB0aGlzLl9fYXV0aG9yaXphdGlvbkhlYWRlciA9ICd0b2tlbiAnICsgYXV0aC50b2tlbjtcbiAgICAgIH0gZWxzZSBpZiAoYXV0aC51c2VybmFtZSAmJiBhdXRoLnBhc3N3b3JkKSB7XG4gICAgICAgICB0aGlzLl9fYXV0aG9yaXphdGlvbkhlYWRlciA9ICdCYXNpYyAnICsgQmFzZTY0LmVuY29kZShhdXRoLnVzZXJuYW1lICsgJzonICsgYXV0aC5wYXNzd29yZCk7XG4gICAgICB9XG4gICB9XG5cbiAgIC8qKlxuICAgICogQ29tcHV0ZSB0aGUgVVJMIHRvIHVzZSB0byBtYWtlIGEgcmVxdWVzdC5cbiAgICAqIEBwcml2YXRlXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gcGF0aCAtIGVpdGhlciBhIFVSTCByZWxhdGl2ZSB0byB0aGUgQVBJIGJhc2Ugb3IgYW4gYWJzb2x1dGUgVVJMXG4gICAgKiBAcmV0dXJuIHtzdHJpbmd9IC0gdGhlIFVSTCB0byB1c2VcbiAgICAqL1xuICAgX19nZXRVUkwocGF0aCkge1xuICAgICAgbGV0IHVybCA9IHBhdGg7XG5cbiAgICAgIGlmIChwYXRoLmluZGV4T2YoJy8vJykgPT09IC0xKSB7XG4gICAgICAgICB1cmwgPSB0aGlzLl9fYXBpQmFzZSArIHBhdGg7XG4gICAgICB9XG5cbiAgICAgIGxldCBuZXdDYWNoZUJ1c3RlciA9ICd0aW1lc3RhbXA9JyArIG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgICAgcmV0dXJuIHVybC5yZXBsYWNlKC8odGltZXN0YW1wPVxcZCspLywgbmV3Q2FjaGVCdXN0ZXIpO1xuICAgfVxuXG4gICAvKipcbiAgICAqIENvbXB1dGUgdGhlIGhlYWRlcnMgcmVxdWlyZWQgZm9yIGFuIEFQSSByZXF1ZXN0LlxuICAgICogQHByaXZhdGVcbiAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gcmF3IC0gaWYgdGhlIHJlcXVlc3Qgc2hvdWxkIGJlIHRyZWF0ZWQgYXMgSlNPTiBvciBhcyBhIHJhdyByZXF1ZXN0XG4gICAgKiBAcmV0dXJuIHtPYmplY3R9IC0gdGhlIGhlYWRlcnMgdG8gdXNlIGluIHRoZSByZXF1ZXN0XG4gICAgKi9cbiAgIF9fZ2V0UmVxdWVzdEhlYWRlcnMocmF3KSB7XG4gICAgICBsZXQgaGVhZGVycyA9IHtcbiAgICAgICAgICdBY2NlcHQnOiByYXcgPyAnYXBwbGljYXRpb24vdm5kLmdpdGh1Yi52My5yYXcranNvbicgOiAnYXBwbGljYXRpb24vdm5kLmdpdGh1Yi52Mytqc29uJyxcbiAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbjtjaGFyc2V0PVVURi04J1xuICAgICAgfTtcblxuICAgICAgaWYgKHRoaXMuX19hdXRob3JpemF0aW9uSGVhZGVyKSB7XG4gICAgICAgICBoZWFkZXJzLkF1dGhvcml6YXRpb24gPSB0aGlzLl9fYXV0aG9yaXphdGlvbkhlYWRlcjtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGhlYWRlcnM7XG4gICB9XG5cbiAgIC8qKlxuICAgICogU2V0cyB0aGUgZGVmYXVsdCBvcHRpb25zIGZvciBBUEkgcmVxdWVzdHNcbiAgICAqIEBwcm90ZWN0ZWRcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBbcmVxdWVzdE9wdGlvbnM9e31dIC0gdGhlIGN1cnJlbnQgb3B0aW9ucyBmb3IgdGhlIHJlcXVlc3RcbiAgICAqIEByZXR1cm4ge09iamVjdH0gLSB0aGUgb3B0aW9ucyB0byBwYXNzIHRvIHRoZSByZXF1ZXN0XG4gICAgKi9cbiAgIF9nZXRPcHRpb25zV2l0aERlZmF1bHRzKHJlcXVlc3RPcHRpb25zID0ge30pIHtcbiAgICAgIGlmICghKHJlcXVlc3RPcHRpb25zLnZpc2liaWxpdHkgfHwgcmVxdWVzdE9wdGlvbnMuYWZmaWxpYXRpb24pKSB7XG4gICAgICAgICByZXF1ZXN0T3B0aW9ucy50eXBlID0gcmVxdWVzdE9wdGlvbnMudHlwZSB8fCAnYWxsJztcbiAgICAgIH1cbiAgICAgIHJlcXVlc3RPcHRpb25zLnNvcnQgPSByZXF1ZXN0T3B0aW9ucy5zb3J0IHx8ICd1cGRhdGVkJztcbiAgICAgIHJlcXVlc3RPcHRpb25zLnBlcl9wYWdlID0gcmVxdWVzdE9wdGlvbnMucGVyX3BhZ2UgfHwgJzEwMCc7IC8vIGVzbGludC1kaXNhYmxlLWxpbmVcblxuICAgICAgcmV0dXJuIHJlcXVlc3RPcHRpb25zO1xuICAgfVxuXG4gICAvKipcbiAgICAqIGlmIGEgYERhdGVgIGlzIHBhc3NlZCB0byB0aGlzIGZ1bmN0aW9uIGl0IHdpbGwgYmUgY29udmVydGVkIHRvIGFuIElTTyBzdHJpbmdcbiAgICAqIEBwYXJhbSB7Kn0gZGF0ZSAtIHRoZSBvYmplY3QgdG8gYXR0ZW1wdCB0byBjb29lcmNlIGludG8gYW4gSVNPIGRhdGUgc3RyaW5nXG4gICAgKiBAcmV0dXJuIHtzdHJpbmd9IC0gdGhlIElTTyByZXByZXNlbnRhdGlvbiBvZiBgZGF0ZWAgb3Igd2hhdGV2ZXIgd2FzIHBhc3NlZCBpbiBpZiBpdCB3YXMgbm90IGEgZGF0ZVxuICAgICovXG4gICBfZGF0ZVRvSVNPKGRhdGUpIHtcbiAgICAgIGlmIChkYXRlICYmIChkYXRlIGluc3RhbmNlb2YgRGF0ZSkpIHtcbiAgICAgICAgIGRhdGUgPSBkYXRlLnRvSVNPU3RyaW5nKCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBkYXRlO1xuICAgfVxuXG4gICAvKipcbiAgICAqIEEgZnVuY3Rpb24gdGhhdCByZWNlaXZlcyB0aGUgcmVzdWx0IG9mIHRoZSBBUEkgcmVxdWVzdC5cbiAgICAqIEBjYWxsYmFjayBSZXF1ZXN0YWJsZS5jYWxsYmFja1xuICAgICogQHBhcmFtIHtSZXF1ZXN0YWJsZS5FcnJvcn0gZXJyb3IgLSB0aGUgZXJyb3IgcmV0dXJuZWQgYnkgdGhlIEFQSSBvciBgbnVsbGBcbiAgICAqIEBwYXJhbSB7KE9iamVjdHx0cnVlKX0gcmVzdWx0IC0gdGhlIGRhdGEgcmV0dXJuZWQgYnkgdGhlIEFQSSBvciBgdHJ1ZWAgaWYgdGhlIEFQSSByZXR1cm5zIGAyMDQgTm8gQ29udGVudGBcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSByZXF1ZXN0IC0gdGhlIHJhdyB7QGxpbmtjb2RlIGh0dHBzOi8vZ2l0aHViLmNvbS9temFicmlza2llL2F4aW9zI3Jlc3BvbnNlLXNjaGVtYSBSZXNwb25zZX1cbiAgICAqL1xuICAgLyoqXG4gICAgKiBNYWtlIGEgcmVxdWVzdC5cbiAgICAqIEBwYXJhbSB7c3RyaW5nfSBtZXRob2QgLSB0aGUgbWV0aG9kIGZvciB0aGUgcmVxdWVzdCAoR0VULCBQVVQsIFBPU1QsIERFTEVURSlcbiAgICAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoIC0gdGhlIHBhdGggZm9yIHRoZSByZXF1ZXN0XG4gICAgKiBAcGFyYW0geyp9IFtkYXRhXSAtIHRoZSBkYXRhIHRvIHNlbmQgdG8gdGhlIHNlcnZlci4gRm9yIEhUVFAgbWV0aG9kcyB0aGF0IGRvbid0IGhhdmUgYSBib2R5IHRoZSBkYXRhXG4gICAgKiAgICAgICAgICAgICAgICAgICB3aWxsIGJlIHNlbnQgYXMgcXVlcnkgcGFyYW1ldGVyc1xuICAgICogQHBhcmFtIHtSZXF1ZXN0YWJsZS5jYWxsYmFja30gW2NiXSAtIHRoZSBjYWxsYmFjayBmb3IgdGhlIHJlcXVlc3RcbiAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW3Jhdz1mYWxzZV0gLSBpZiB0aGUgcmVxdWVzdCBzaG91bGQgYmUgc2VudCBhcyByYXcuIElmIHRoaXMgaXMgYSBmYWxzeSB2YWx1ZSB0aGVuIHRoZVxuICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXF1ZXN0IHdpbGwgYmUgbWFkZSBhcyBKU09OXG4gICAgKiBAcmV0dXJuIHtQcm9taXNlfSAtIHRoZSBQcm9taXNlIGZvciB0aGUgaHR0cCByZXF1ZXN0XG4gICAgKi9cbiAgIF9yZXF1ZXN0KG1ldGhvZCwgcGF0aCwgZGF0YSwgY2IsIHJhdykge1xuICAgICAgY29uc3QgdXJsID0gdGhpcy5fX2dldFVSTChwYXRoKTtcblxuICAgICAgbGV0IGhlYWRlcnMgPSB0aGlzLl9fZ2V0UmVxdWVzdEhlYWRlcnMocmF3KTtcbiAgICAgIC8vIEZhaWxzYWZlIGNoZWNrIGZvciBkaXJlY3RseSBtYWtpbmcgcmVxdWVzdCBmcm9tIE5vZGVKU1xuICAgICAgaWYoIWhlYWRlcnNbJ1VzZXItQWdlbnQnXSkge1xuICAgICAgICBoZWFkZXJzWydVc2VyLUFnZW50J10gPSAncmVxdWVzdCc7XG4gICAgICB9XG5cbiAgICAgIGxldCBxdWVyeVBhcmFtcyA9IHt9O1xuICAgICAgY29uc3Qgc2hvdWxkVXNlRGF0YUFzUGFyYW1zID0gZGF0YSAmJiAodHlwZW9mIGRhdGEgPT09ICdvYmplY3QnKSAmJiBtZXRob2RIYXNOb0JvZHkobWV0aG9kKTtcbiAgICAgIGlmIChzaG91bGRVc2VEYXRhQXNQYXJhbXMpIHtcbiAgICAgICAgIHF1ZXJ5UGFyYW1zID0gZGF0YTtcbiAgICAgICAgIGRhdGEgPSB1bmRlZmluZWQ7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGNvbmZpZyA9IHtcbiAgICAgICAgIHVybDogdXJsLFxuICAgICAgICAgbWV0aG9kOiBtZXRob2QsXG4gICAgICAgICBoZWFkZXJzOiBoZWFkZXJzLFxuICAgICAgICAgcGFyYW1zOiBxdWVyeVBhcmFtcyxcbiAgICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgICByZXNwb25zZVR5cGU6IHJhdyA/ICd0ZXh0JyA6ICdqc29uJ1xuICAgICAgfTtcblxuICAgICAgbG9nKGAke2NvbmZpZy5tZXRob2R9IHRvICR7Y29uZmlnLnVybH1gKTtcblxuICAgICAgY29uc3QgcmVxdWVzdFByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIHJlcXVlc3QoY29uZmlnLCBmdW5jdGlvbihlcnIsIHJlc3BvbnNlLCBib2R5KSB7XG4gICAgICAgICAgbGV0IHJldCA9IHtcbiAgICAgICAgICAgIHN0YXR1czogcmVzcG9uc2U/cmVzcG9uc2Uuc3RhdHVzQ29kZTpudWxsLFxuICAgICAgICAgICAgc3RhdHVzVGV4dDogcmVzcG9uc2U/cmVzcG9uc2Uuc3RhdHVzTWVzc2FnZTpudWxsLFxuICAgICAgICAgICAgaGVhZGVyczogcmVzcG9uc2U/cmVzcG9uc2UuaGVhZGVyczpudWxsLFxuICAgICAgICAgICAgY29uZmlnOiBjb25maWdcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYoZXJyID09PSBudWxsICYmIHJlc3BvbnNlICYmIHJlc3BvbnNlLnN0YXR1c0NvZGUgPj0gMjAwICYmIHJlc3BvbnNlLnN0YXR1c0NvZGUgPCAzMDApIHtcbiAgICAgICAgICAgIGlmKHJhdykge1xuICAgICAgICAgICAgICByZXQuZGF0YSA9IGJvZHk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgcmV0LmRhdGEgPSBKU09OLnBhcnNlKGJvZHkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzb2x2ZShyZXQpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldC5kYXRhID0gYm9keTtcbiAgICAgICAgICAgIGNhbGxiYWNrRXJyb3JPclJlamVjdE9yVGhyb3coY2IsIHJlamVjdCwgcGF0aCkocmV0KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgICAvLyBjb25zdCByZXF1ZXN0UHJvbWlzZSA9IGF4aW9zKGNvbmZpZykuY2F0Y2goY2FsbGJhY2tFcnJvck9yVGhyb3coY2IsIHBhdGgpKTtcblxuICAgICAgaWYgKGNiKSB7XG4gICAgICAgICByZXF1ZXN0UHJvbWlzZS50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgY2IobnVsbCwgcmVzcG9uc2UuZGF0YSB8fCB0cnVlLCByZXNwb25zZSk7XG4gICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlcXVlc3RQcm9taXNlO1xuICAgfVxuXG4gICAvKipcbiAgICAqIE1ha2UgYSByZXF1ZXN0IHRvIGFuIGVuZHBvaW50IHRoZSByZXR1cm5zIDIwNCB3aGVuIHRydWUgYW5kIDQwNCB3aGVuIGZhbHNlXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gcGF0aCAtIHRoZSBwYXRoIHRvIHJlcXVlc3RcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhIC0gYW55IHF1ZXJ5IHBhcmFtZXRlcnMgZm9yIHRoZSByZXF1ZXN0XG4gICAgKiBAcGFyYW0ge1JlcXVlc3RhYmxlLmNhbGxiYWNrfSBjYiAtIHRoZSBjYWxsYmFjayB0aGF0IHdpbGwgcmVjZWl2ZSBgdHJ1ZWAgb3IgYGZhbHNlYFxuICAgICogQHBhcmFtIHttZXRob2R9IFttZXRob2Q9R0VUXSAtIEhUVFAgTWV0aG9kIHRvIHVzZVxuICAgICogQHJldHVybiB7UHJvbWlzZX0gLSB0aGUgcHJvbWlzZSBmb3IgdGhlIGh0dHAgcmVxdWVzdFxuICAgICovXG4gICBfcmVxdWVzdDIwNG9yNDA0KHBhdGgsIGRhdGEsIGNiLCBtZXRob2QgPSAnR0VUJykge1xuICAgICAgcmV0dXJuIHRoaXMuX3JlcXVlc3QobWV0aG9kLCBwYXRoLCBkYXRhKVxuICAgICAgICAgLnRoZW4oZnVuY3Rpb24gc3VjY2VzcyhyZXNwb25zZSkge1xuICAgICAgICAgICAgaWYgKGNiKSB7XG4gICAgICAgICAgICAgICBjYihudWxsLCB0cnVlLCByZXNwb25zZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgIH0sIGZ1bmN0aW9uIGZhaWx1cmUocmVzcG9uc2UpIHtcbiAgICAgICAgICAgIGlmIChyZXNwb25zZS5zdGF0dXMgPT09IDQwNCkge1xuICAgICAgICAgICAgICAgaWYgKGNiKSB7XG4gICAgICAgICAgICAgICAgICBjYihudWxsLCBmYWxzZSwgcmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoY2IpIHtcbiAgICAgICAgICAgICAgIGNiKHJlc3BvbnNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRocm93IHJlc3BvbnNlO1xuICAgICAgICAgfSk7XG4gICB9XG5cbiAgIC8qKlxuICAgICogTWFrZSBhIHJlcXVlc3QgYW5kIGZldGNoIGFsbCB0aGUgYXZhaWxhYmxlIGRhdGEuIEdpdGh1YiB3aWxsIHBhZ2luYXRlIHJlc3BvbnNlcyBzbyBmb3IgcXVlcmllc1xuICAgICogdGhhdCBtaWdodCBzcGFuIG11bHRpcGxlIHBhZ2VzIHRoaXMgbWV0aG9kIGlzIHByZWZlcnJlZCB0byB7QGxpbmsgUmVxdWVzdGFibGUjcmVxdWVzdH1cbiAgICAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoIC0gdGhlIHBhdGggdG8gcmVxdWVzdFxuICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSB0aGUgcXVlcnkgcGFyYW1ldGVycyB0byBpbmNsdWRlXG4gICAgKiBAcGFyYW0ge1JlcXVlc3RhYmxlLmNhbGxiYWNrfSBbY2JdIC0gdGhlIGZ1bmN0aW9uIHRvIHJlY2VpdmUgdGhlIGRhdGEuIFRoZSByZXR1cm5lZCBkYXRhIHdpbGwgYWx3YXlzIGJlIGFuIGFycmF5LlxuICAgICogQHBhcmFtIHtPYmplY3RbXX0gcmVzdWx0cyAtIHRoZSBwYXJ0aWFsIHJlc3VsdHMuIFRoaXMgYXJndW1lbnQgaXMgaW50ZW5kZWQgZm9yIGludGVyYWwgdXNlIG9ubHkuXG4gICAgKiBAcmV0dXJuIHtQcm9taXNlfSAtIGEgcHJvbWlzZSB3aGljaCB3aWxsIHJlc29sdmUgd2hlbiBhbGwgcGFnZXMgaGF2ZSBiZWVuIGZldGNoZWRcbiAgICAqIEBkZXByZWNhdGVkIFRoaXMgd2lsbCBiZSBmb2xkZWQgaW50byB7QGxpbmsgUmVxdWVzdGFibGUjX3JlcXVlc3R9IGluIHRoZSAyLjAgcmVsZWFzZS5cbiAgICAqL1xuICAgX3JlcXVlc3RBbGxQYWdlcyhwYXRoLCBvcHRpb25zLCBjYiwgcmVzdWx0cykge1xuICAgICAgcmVzdWx0cyA9IHJlc3VsdHMgfHwgW107XG5cbiAgICAgIHJldHVybiB0aGlzLl9yZXF1ZXN0KCdHRVQnLCBwYXRoLCBvcHRpb25zKVxuICAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICBsZXQgdGhpc0dyb3VwO1xuICAgICAgICAgICAgaWYgKHJlc3BvbnNlLmRhdGEgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICAgICAgICAgdGhpc0dyb3VwID0gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocmVzcG9uc2UuZGF0YS5pdGVtcyBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgICAgICAgICB0aGlzR3JvdXAgPSByZXNwb25zZS5kYXRhLml0ZW1zO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgIGxldCBtZXNzYWdlID0gYGNhbm5vdCBmaWd1cmUgb3V0IGhvdyB0byBhcHBlbmQgJHtyZXNwb25zZS5kYXRhfSB0byB0aGUgcmVzdWx0IHNldGA7XG4gICAgICAgICAgICAgICB0aHJvdyBuZXcgUmVzcG9uc2VFcnJvcihtZXNzYWdlLCBwYXRoLCByZXNwb25zZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXN1bHRzLnB1c2guYXBwbHkocmVzdWx0cywgdGhpc0dyb3VwKTtcblxuICAgICAgICAgICAgY29uc3QgbmV4dFVybCA9IGdldE5leHRQYWdlKHJlc3BvbnNlLmhlYWRlcnMubGluayk7XG4gICAgICAgICAgICBpZiAobmV4dFVybCkge1xuICAgICAgICAgICAgICAgbG9nKGBnZXR0aW5nIG5leHQgcGFnZTogJHtuZXh0VXJsfWApO1xuICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3JlcXVlc3RBbGxQYWdlcyhuZXh0VXJsLCBvcHRpb25zLCBjYiwgcmVzdWx0cyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChjYikge1xuICAgICAgICAgICAgICAgY2IobnVsbCwgcmVzdWx0cywgcmVzcG9uc2UpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXNwb25zZS5kYXRhID0gcmVzdWx0cztcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICAgICAgIH0pLmNhdGNoKGNhbGxiYWNrRXJyb3JPclJlamVjdE9yVGhyb3coY2IsIG51bGwsIHBhdGgpKTtcbiAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBSZXF1ZXN0YWJsZTtcblxuLy8gLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8gLy9cbi8vICBQcml2YXRlIGhlbHBlciBmdW5jdGlvbnMgIC8vXG4vLyAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLyAvL1xuY29uc3QgTUVUSE9EU19XSVRIX05PX0JPRFkgPSBbJ0dFVCcsICdIRUFEJywgJ0RFTEVURSddO1xuZnVuY3Rpb24gbWV0aG9kSGFzTm9Cb2R5KG1ldGhvZCkge1xuICAgcmV0dXJuIE1FVEhPRFNfV0lUSF9OT19CT0RZLmluZGV4T2YobWV0aG9kKSAhPT0gLTE7XG59XG5cbmZ1bmN0aW9uIGdldE5leHRQYWdlKGxpbmtzSGVhZGVyID0gJycpIHtcbiAgIGNvbnN0IGxpbmtzID0gbGlua3NIZWFkZXIuc3BsaXQoL1xccyosXFxzKi8pOyAvLyBzcGxpdHMgYW5kIHN0cmlwcyB0aGUgdXJsc1xuICAgcmV0dXJuIGxpbmtzLnJlZHVjZShmdW5jdGlvbihuZXh0VXJsLCBsaW5rKSB7XG4gICAgICBpZiAobGluay5zZWFyY2goL3JlbD1cIm5leHRcIi8pICE9PSAtMSkge1xuICAgICAgICAgcmV0dXJuIChsaW5rLm1hdGNoKC88KC4qKT4vKSB8fCBbXSlbMV07XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBuZXh0VXJsO1xuICAgfSwgdW5kZWZpbmVkKTtcbn1cblxuZnVuY3Rpb24gY2FsbGJhY2tFcnJvck9yUmVqZWN0T3JUaHJvdyhjYiwgcmVqZWN0LCBwYXRoKSB7XG4gICByZXR1cm4gZnVuY3Rpb24gaGFuZGxlcihvYmplY3QpIHtcbiAgICAgIGxldCBlcnJvcjtcbiAgICAgIGlmIChvYmplY3QuaGFzT3duUHJvcGVydHkoJ2NvbmZpZycpKSB7XG4gICAgICAgICBjb25zdCB7c3RhdHVzLCBzdGF0dXNUZXh0LCBjb25maWc6IHttZXRob2QsIHVybH19ID0gb2JqZWN0O1xuICAgICAgICAgbGV0IG1lc3NhZ2UgPSAoYCR7c3RhdHVzfSBlcnJvciBtYWtpbmcgcmVxdWVzdCAke21ldGhvZH0gJHt1cmx9OiBcIiR7c3RhdHVzVGV4dH1cImApO1xuICAgICAgICAgZXJyb3IgPSBuZXcgUmVzcG9uc2VFcnJvcihtZXNzYWdlLCBwYXRoLCBvYmplY3QpO1xuICAgICAgICAgbG9nKGAke21lc3NhZ2V9ICR7SlNPTi5zdHJpbmdpZnkob2JqZWN0LmRhdGEpfWApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgIGVycm9yID0gb2JqZWN0O1xuICAgICAgfVxuICAgICAgaWYgKGNiKSB7XG4gICAgICAgICBsb2coJ2dvaW5nIHRvIGVycm9yIGNhbGxiYWNrJyk7XG4gICAgICAgICBjYihlcnJvcik7XG4gICAgICB9IGVsc2UgaWYgKHJlamVjdCkge1xuICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgIGxvZygndGhyb3dpbmcgZXJyb3InKTtcbiAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfVxuICAgfTtcbn1cbiJdfQ==
//# sourceMappingURL=Requestable.js.map
