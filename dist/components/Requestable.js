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
      return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
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

         var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ResponseError).call(this, message));

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
            var requestOptions = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

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
            var method = arguments.length <= 3 || arguments[3] === undefined ? 'GET' : arguments[3];

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
      var linksHeader = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

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
            var status = object.status;
            var statusText = object.statusText;
            var _object$config = object.config;
            var method = _object$config.method;
            var url = _object$config.url;

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJlcXVlc3RhYmxlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWFBLE9BQU0sbUJBQW1CLCtCQUFxQjtBQUM1QyxXQUFLLE1BQUksSUFBSixHQUFTLElBRDhCLENBQ3pCO0FBRHlCLElBQXJCLENBQXpCOztBQUlBLE9BQU0sVUFBVSxpQ0FBVztBQUN6QixrQkFBWSxDQUFFLGlCQUFpQixTQUFuQjtBQURhLElBQVgsQ0FBaEI7O0FBSUEsT0FBTSxNQUFNLHFCQUFNLGdCQUFOLENBQVo7O0FBRUEsT0FBSSxPQUFPLE9BQVAsS0FBbUIsV0FBdkIsRUFBb0M7QUFDakM7QUFDRjs7QUFFRDs7OztPQUdNLGE7OztBQUNIOzs7Ozs7QUFNQSw2QkFBWSxPQUFaLEVBQXFCLElBQXJCLEVBQTJCLFFBQTNCLEVBQXFDO0FBQUE7O0FBQUEsc0dBQzVCLE9BRDRCOztBQUVsQyxlQUFLLElBQUwsR0FBWSxJQUFaO0FBQ0EsZUFBSyxPQUFMLEdBQWUsU0FBUyxNQUF4QjtBQUNBLGVBQUssUUFBTCxHQUFnQixRQUFoQjtBQUNBLGVBQUssTUFBTCxHQUFjLFNBQVMsTUFBdkI7QUFMa0M7QUFNcEM7OztLQWJ3QixLOztPQW1CdEIsVztBQUNIOzs7Ozs7O0FBT0E7Ozs7OztBQU1BLDJCQUFZLElBQVosRUFBa0IsT0FBbEIsRUFBMkI7QUFBQTs7QUFDeEIsY0FBSyxTQUFMLEdBQWlCLFdBQVcsd0JBQTVCO0FBQ0EsY0FBSyxNQUFMLEdBQWM7QUFDWCxtQkFBTyxLQUFLLEtBREQ7QUFFWCxzQkFBVSxLQUFLLFFBRko7QUFHWCxzQkFBVSxLQUFLO0FBSEosVUFBZDs7QUFNQSxhQUFJLEtBQUssS0FBVCxFQUFnQjtBQUNiLGlCQUFLLHFCQUFMLEdBQTZCLFdBQVcsS0FBSyxLQUE3QztBQUNGLFVBRkQsTUFFTyxJQUFJLEtBQUssUUFB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LFdBQWdFLFVBQWhFLE1BQUo7QUFDQSxvQkFBUSxJQUFJLGFBQUosQ0FBa0IsT0FBbEIsRUFBMkIsSUFBM0IsRUFBaUMsTUFBakMsQ0FBUjtBQUNBLGdCQUFPLE9BQVAsU0FBa0IsS0FBSyxTQUFMLENBQWUsT0FBTyxJQUF0QixDQUFsQjtBQUNGLFVBTEQsTUFLTztBQUNKLG9CQUFRLE1BQVI7QUFDRjtBQUNELGFBQUksRUFBSixFQUFRO0FBQ0wsZ0JBQUkseUJBQUo7QUFDQSxlQUFHLEtBQUg7QUFDRixVQUhELE1BR08sSUFBSSxNQUFKLEVBQVk7QUFDakIsbUJBQU8sS0FBUDtBQUNELFVBRk0sTUFFQTtBQUNKLGdCQUFJLGdCQUFKO0FBQ0Esa0JBQU0sS0FBTjtBQUNGO0FBQ0gsT0FuQkQ7QUFvQkYiLCJmaWxlIjoiUmVxdWVzdGFibGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlXG4gKiBAY29weXJpZ2h0ICAyMDE2IFlhaG9vIEluYy5cbiAqIEBsaWNlbnNlICAgIExpY2Vuc2VkIHVuZGVyIHtAbGluayBodHRwczovL3NwZHgub3JnL2xpY2Vuc2VzL0JTRC0zLUNsYXVzZS1DbGVhci5odG1sIEJTRC0zLUNsYXVzZS1DbGVhcn0uXG4gKiAgICAgICAgICAgICBHaXRodWIuanMgaXMgZnJlZWx5IGRpc3RyaWJ1dGFibGUuXG4gKi9cblxuaW1wb3J0IHJlcXVlc3RFeHQgZnJvbSAncmVxdWVzdC1leHRlbnNpYmxlJztcbmltcG9ydCBSZXF1ZXN0SHR0cENhY2hlIGZyb20gJ3JlcXVlc3QtaHR0cC1jYWNoZSc7XG5pbXBvcnQgZGVidWcgZnJvbSAnZGVidWcnO1xuaW1wb3J0IHtCYXNlNjR9IGZyb20gJ2pzLWJhc2U2NCc7XG5pbXBvcnQge3BvbHlmaWxsfSBmcm9tICdlczYtcHJvbWlzZSc7XG5cbmNvbnN0IGh0dHBSZXF1ZXN0Q2FjaGUgPSBuZXcgUmVxdWVzdEh0dHBDYWNoZSh7XG4gIG1heDogMjU2KjEwMjQqMTAyNCAvLyBNYXhpbXVtIGNhY2hlIHNpemUgKDI1Nm1iKVxufSk7XG5cbmNvbnN0IHJlcXVlc3QgPSByZXF1ZXN0RXh0KHtcbiAgZXh0ZW5zaW9uczogWyBodHRwUmVxdWVzdENhY2hlLmV4dGVuc2lvbiBdXG59KTtcblxuY29uc3QgbG9nID0gZGVidWcoJ2dpdGh1YjpyZXF1ZXN0Jyk7XG5cbmlmICh0eXBlb2YgUHJvbWlzZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgIHBvbHlmaWxsKCk7XG59XG5cbi8qKlxuICogVGhlIGVycm9yIHN0cnVjdHVyZSByZXR1cm5lZCB3aGVuIGEgbmV0d29yayBjYWxsIGZhaWxzXG4gKi9cbmNsYXNzIFJlc3BvbnNlRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gICAvKipcbiAgICAqIENvbnN0cnVjdCBhIG5ldyBSZXNwb25zZUVycm9yXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZSAtIGFuIG1lc3NhZ2UgdG8gcmV0dXJuIGluc3RlYWQgb2YgdGhlIHRoZSBkZWZhdWx0IGVycm9yIG1lc3NhZ2VcbiAgICAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoIC0gdGhlIHJlcXVlc3RlZCBwYXRoXG4gICAgKiBAcGFyYW0ge09iamVjdH0gcmVzcG9uc2UgLSB0aGUgb2JqZWN0IHJldHVybmVkIGJ5IEF4aW9zXG4gICAgKi9cbiAgIGNvbnN0cnVjdG9yKG1lc3NhZ2UsIHBhdGgsIHJlc3BvbnNlKSB7XG4gICAgICBzdXBlcihtZXNzYWdlKTtcbiAgICAgIHRoaXMucGF0aCA9IHBhdGg7XG4gICAgICB0aGlzLnJlcXVlc3QgPSByZXNwb25zZS5jb25maWc7XG4gICAgICB0aGlzLnJlc3BvbnNlID0gcmVzcG9uc2U7XG4gICAgICB0aGlzLnN0YXR1cyA9IHJlc3BvbnNlLnN0YXR1cztcbiAgIH1cbn1cblxuLyoqXG4gKiBSZXF1ZXN0YWJsZSB3cmFwcyB0aGUgbG9naWMgZm9yIG1ha2luZyBodHRwIHJlcXVlc3RzIHRvIHRoZSBBUElcbiAqL1xuY2xhc3MgUmVxdWVzdGFibGUge1xuICAgLyoqXG4gICAgKiBFaXRoZXIgYSB1c2VybmFtZSBhbmQgcGFzc3dvcmQgb3IgYW4gb2F1dGggdG9rZW4gZm9yIEdpdGh1YlxuICAgICogQHR5cGVkZWYge09iamVjdH0gUmVxdWVzdGFibGUuYXV0aFxuICAgICogQHByb3Age3N0cmluZ30gW3VzZXJuYW1lXSAtIHRoZSBHaXRodWIgdXNlcm5hbWVcbiAgICAqIEBwcm9wIHtzdHJpbmd9IFtwYXNzd29yZF0gLSB0aGUgdXNlcidzIHBhc3N3b3JkXG4gICAgKiBAcHJvcCB7dG9rZW59IFt0b2tlbl0gLSBhbiBPQXV0aCB0b2tlblxuICAgICovXG4gICAvKipcbiAgICAqIEluaXRpYWxpemUgdGhlIGh0dHAgaW50ZXJuYWxzLlxuICAgICogQHBhcmFtIHtSZXF1ZXN0YWJsZS5hdXRofSBbYXV0aF0gLSB0aGUgY3JlZGVudGlhbHMgdG8gYXV0aGVudGljYXRlIHRvIEdpdGh1Yi4gSWYgYXV0aCBpc1xuICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm90IHByb3ZpZGVkIHJlcXVlc3Qgd2lsbCBiZSBtYWRlIHVuYXV0aGVudGljYXRlZFxuICAgICogQHBhcmFtIHtzdHJpbmd9IFthcGlCYXNlPWh0dHBzOi8vYXBpLmdpdGh1Yi5jb21dIC0gdGhlIGJhc2UgR2l0aHViIEFQSSBVUkxcbiAgICAqL1xuICAgY29uc3RydWN0b3IoYXV0aCwgYXBpQmFzZSkge1xuICAgICAgdGhpcy5fX2FwaUJhc2UgPSBhcGlCYXNlIHx8ICdodHRwczovL2FwaS5naXRodWIuY29tJztcbiAgICAgIHRoaXMuX19hdXRoID0ge1xuICAgICAgICAgdG9rZW46IGF1dGgudG9rZW4sXG4gICAgICAgICB1c2VybmFtZTogYXV0aC51c2VybmFtZSxcbiAgICAgICAgIHBhc3N3b3JkOiBhdXRoLnBhc3N3b3JkXG4gICAgICB9O1xuXG4gICAgICBpZiAoYXV0aC50b2tlbikge1xuICAgICAgICAgdGhpcy5fX2F1dGhvcml6YXRpb25IZWFkZXIgPSAndG9rZW4gJyArIGF1dGgudG9rZW47XG4gICAgICB9IGVsc2UgaWYgKGF1dGgudXNlcm5hbWUgJiYgYXV0aC5wYXNzd29yZCkge1xuICAgICAgICAgdGhpcy5fX2F1dGhvcml6YXRpb25IZWFkZXIgPSAnQmFzaWMgJyArIEJhc2U2NC5lbmNvZGUoYXV0aC51c2VybmFtZSArICc6JyArIGF1dGgucGFzc3dvcmQpO1xuICAgICAgfVxuICAgfVxuXG4gICAvKipcbiAgICAqIENvbXB1dGUgdGhlIFVSTCB0byB1c2UgdG8gbWFrZSBhIHJlcXVlc3QuXG4gICAgKiBAcHJpdmF0ZVxuICAgICogQHBhcmFtIHtzdHJpbmd9IHBhdGggLSBlaXRoZXIgYSBVUkwgcmVsYXRpdmUgdG8gdGhlIEFQSSBiYXNlIG9yIGFuIGFic29sdXRlIFVSTFxuICAgICogQHJldHVybiB7c3RyaW5nfSAtIHRoZSBVUkwgdG8gdXNlXG4gICAgKi9cbiAgIF9fZ2V0VVJMKHBhdGgpIHtcbiAgICAgIGxldCB1cmwgPSBwYXRoO1xuXG4gICAgICBpZiAocGF0aC5pbmRleE9mKCcvLycpID09PSAtMSkge1xuICAgICAgICAgdXJsID0gdGhpcy5fX2FwaUJhc2UgKyBwYXRoO1xuICAgICAgfVxuXG4gICAgICBsZXQgbmV3Q2FjaGVCdXN0ZXIgPSAndGltZXN0YW1wPScgKyBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAgIHJldHVybiB1cmwucmVwbGFjZSgvKHRpbWVzdGFtcD1cXGQrKS8sIG5ld0NhY2hlQnVzdGVyKTtcbiAgIH1cblxuICAgLyoqXG4gICAgKiBDb21wdXRlIHRoZSBoZWFkZXJzIHJlcXVpcmVkIGZvciBhbiBBUEkgcmVxdWVzdC5cbiAgICAqIEBwcml2YXRlXG4gICAgKiBAcGFyYW0ge2Jvb2xlYW59IHJhdyAtIGlmIHRoZSByZXF1ZXN0IHNob3VsZCBiZSB0cmVhdGVkIGFzIEpTT04gb3IgYXMgYSByYXcgcmVxdWVzdFxuICAgICogQHJldHVybiB7T2JqZWN0fSAtIHRoZSBoZWFkZXJzIHRvIHVzZSBpbiB0aGUgcmVxdWVzdFxuICAgICovXG4gICBfX2dldFJlcXVlc3RIZWFkZXJzKHJhdykge1xuICAgICAgbGV0IGhlYWRlcnMgPSB7XG4gICAgICAgICAnQWNjZXB0JzogcmF3ID8gJ2FwcGxpY2F0aW9uL3ZuZC5naXRodWIudjMucmF3K2pzb24nIDogJ2FwcGxpY2F0aW9uL3ZuZC5naXRodWIudjMranNvbicsXG4gICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb247Y2hhcnNldD1VVEYtOCdcbiAgICAgIH07XG5cbiAgICAgIGlmICh0aGlzLl9fYXV0aG9yaXphdGlvbkhlYWRlcikge1xuICAgICAgICAgaGVhZGVycy5BdXRob3JpemF0aW9uID0gdGhpcy5fX2F1dGhvcml6YXRpb25IZWFkZXI7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBoZWFkZXJzO1xuICAgfVxuXG4gICAvKipcbiAgICAqIFNldHMgdGhlIGRlZmF1bHQgb3B0aW9ucyBmb3IgQVBJIHJlcXVlc3RzXG4gICAgKiBAcHJvdGVjdGVkXG4gICAgKiBAcGFyYW0ge09iamVjdH0gW3JlcXVlc3RPcHRpb25zPXt9XSAtIHRoZSBjdXJyZW50IG9wdGlvbnMgZm9yIHRoZSByZXF1ZXN0XG4gICAgKiBAcmV0dXJuIHtPYmplY3R9IC0gdGhlIG9wdGlvbnMgdG8gcGFzcyB0byB0aGUgcmVxdWVzdFxuICAgICovXG4gICBfZ2V0T3B0aW9uc1dpdGhEZWZhdWx0cyhyZXF1ZXN0T3B0aW9ucyA9IHt9KSB7XG4gICAgICBpZiAoIShyZXF1ZXN0T3B0aW9ucy52aXNpYmlsaXR5IHx8IHJlcXVlc3RPcHRpb25zLmFmZmlsaWF0aW9uKSkge1xuICAgICAgICAgcmVxdWVzdE9wdGlvbnMudHlwZSA9IHJlcXVlc3RPcHRpb25zLnR5cGUgfHwgJ2FsbCc7XG4gICAgICB9XG4gICAgICByZXF1ZXN0T3B0aW9ucy5zb3J0ID0gcmVxdWVzdE9wdGlvbnMuc29ydCB8fCAndXBkYXRlZCc7XG4gICAgICByZXF1ZXN0T3B0aW9ucy5wZXJfcGFnZSA9IHJlcXVlc3RPcHRpb25zLnBlcl9wYWdlIHx8ICcxMDAnOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG5cbiAgICAgIHJldHVybiByZXF1ZXN0T3B0aW9ucztcbiAgIH1cblxuICAgLyoqXG4gICAgKiBpZiBhIGBEYXRlYCBpcyBwYXNzZWQgdG8gdGhpcyBmdW5jdGlvbiBpdCB3aWxsIGJlIGNvbnZlcnRlZCB0byBhbiBJU08gc3RyaW5nXG4gICAgKiBAcGFyYW0geyp9IGRhdGUgLSB0aGUgb2JqZWN0IHRvIGF0dGVtcHQgdG8gY29vZXJjZSBpbnRvIGFuIElTTyBkYXRlIHN0cmluZ1xuICAgICogQHJldHVybiB7c3RyaW5nfSAtIHRoZSBJU08gcmVwcmVzZW50YXRpb24gb2YgYGRhdGVgIG9yIHdoYXRldmVyIHdhcyBwYXNzZWQgaW4gaWYgaXQgd2FzIG5vdCBhIGRhdGVcbiAgICAqL1xuICAgX2RhdGVUb0lTTyhkYXRlKSB7XG4gICAgICBpZiAoZGF0ZSAmJiAoZGF0ZSBpbnN0YW5jZW9mIERhdGUpKSB7XG4gICAgICAgICBkYXRlID0gZGF0ZS50b0lTT1N0cmluZygpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZGF0ZTtcbiAgIH1cblxuICAgLyoqXG4gICAgKiBBIGZ1bmN0aW9uIHRoYXQgcmVjZWl2ZXMgdGhlIHJlc3VsdCBvZiB0aGUgQVBJIHJlcXVlc3QuXG4gICAgKiBAY2FsbGJhY2sgUmVxdWVzdGFibGUuY2FsbGJhY2tcbiAgICAqIEBwYXJhbSB7UmVxdWVzdGFibGUuRXJyb3J9IGVycm9yIC0gdGhlIGVycm9yIHJldHVybmVkIGJ5IHRoZSBBUEkgb3IgYG51bGxgXG4gICAgKiBAcGFyYW0geyhPYmplY3R8dHJ1ZSl9IHJlc3VsdCAtIHRoZSBkYXRhIHJldHVybmVkIGJ5IHRoZSBBUEkgb3IgYHRydWVgIGlmIHRoZSBBUEkgcmV0dXJucyBgMjA0IE5vIENvbnRlbnRgXG4gICAgKiBAcGFyYW0ge09iamVjdH0gcmVxdWVzdCAtIHRoZSByYXcge0BsaW5rY29kZSBodHRwczovL2dpdGh1Yi5jb20vbXphYnJpc2tpZS9heGlvcyNyZXNwb25zZS1zY2hlbWEgUmVzcG9uc2V9XG4gICAgKi9cbiAgIC8qKlxuICAgICogTWFrZSBhIHJlcXVlc3QuXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gbWV0aG9kIC0gdGhlIG1ldGhvZCBmb3IgdGhlIHJlcXVlc3QgKEdFVCwgUFVULCBQT1NULCBERUxFVEUpXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gcGF0aCAtIHRoZSBwYXRoIGZvciB0aGUgcmVxdWVzdFxuICAgICogQHBhcmFtIHsqfSBbZGF0YV0gLSB0aGUgZGF0YSB0byBzZW5kIHRvIHRoZSBzZXJ2ZXIuIEZvciBIVFRQIG1ldGhvZHMgdGhhdCBkb24ndCBoYXZlIGEgYm9keSB0aGUgZGF0YVxuICAgICogICAgICAgICAgICAgICAgICAgd2lsbCBiZSBzZW50IGFzIHF1ZXJ5IHBhcmFtZXRlcnNcbiAgICAqIEBwYXJhbSB7UmVxdWVzdGFibGUuY2FsbGJhY2t9IFtjYl0gLSB0aGUgY2FsbGJhY2sgZm9yIHRoZSByZXF1ZXN0XG4gICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtyYXc9ZmFsc2VdIC0gaWYgdGhlIHJlcXVlc3Qgc2hvdWxkIGJlIHNlbnQgYXMgcmF3LiBJZiB0aGlzIGlzIGEgZmFsc3kgdmFsdWUgdGhlbiB0aGVcbiAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWVzdCB3aWxsIGJlIG1hZGUgYXMgSlNPTlxuICAgICogQHJldHVybiB7UHJvbWlzZX0gLSB0aGUgUHJvbWlzZSBmb3IgdGhlIGh0dHAgcmVxdWVzdFxuICAgICovXG4gICBfcmVxdWVzdChtZXRob2QsIHBhdGgsIGRhdGEsIGNiLCByYXcpIHtcbiAgICAgIGNvbnN0IHVybCA9IHRoaXMuX19nZXRVUkwocGF0aCk7XG5cbiAgICAgIGxldCBoZWFkZXJzID0gdGhpcy5fX2dldFJlcXVlc3RIZWFkZXJzKHJhdyk7XG4gICAgICAvLyBGYWlsc2FmZSBjaGVjayBmb3IgZGlyZWN0bHkgbWFraW5nIHJlcXVlc3QgZnJvbSBOb2RlSlNcbiAgICAgIGlmKCFoZWFkZXJzWydVc2VyLUFnZW50J10pIHtcbiAgICAgICAgaGVhZGVyc1snVXNlci1BZ2VudCddID0gJ3JlcXVlc3QnO1xuICAgICAgfVxuXG4gICAgICBsZXQgcXVlcnlQYXJhbXMgPSB7fTtcbiAgICAgIGNvbnN0IHNob3VsZFVzZURhdGFBc1BhcmFtcyA9IGRhdGEgJiYgKHR5cGVvZiBkYXRhID09PSAnb2JqZWN0JykgJiYgbWV0aG9kSGFzTm9Cb2R5KG1ldGhvZCk7XG4gICAgICBpZiAoc2hvdWxkVXNlRGF0YUFzUGFyYW1zKSB7XG4gICAgICAgICBxdWVyeVBhcmFtcyA9IGRhdGE7XG4gICAgICAgICBkYXRhID0gdW5kZWZpbmVkO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBjb25maWcgPSB7XG4gICAgICAgICB1cmw6IHVybCxcbiAgICAgICAgIG1ldGhvZDogbWV0aG9kLFxuICAgICAgICAgaGVhZGVyczogaGVhZGVycyxcbiAgICAgICAgIHBhcmFtczogcXVlcnlQYXJhbXMsXG4gICAgICAgICBkYXRhOiBkYXRhLFxuICAgICAgICAgcmVzcG9uc2VUeXBlOiByYXcgPyAndGV4dCcgOiAnanNvbidcbiAgICAgIH07XG5cbiAgICAgIGxvZyhgJHtjb25maWcubWV0aG9kfSB0byAke2NvbmZpZy51cmx9YCk7XG5cbiAgICAgIGNvbnN0IHJlcXVlc3RQcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICByZXF1ZXN0KGNvbmZpZywgZnVuY3Rpb24oZXJyLCByZXNwb25zZSwgYm9keSkge1xuICAgICAgICAgIGxldCByZXQgPSB7XG4gICAgICAgICAgICBzdGF0dXM6IHJlc3BvbnNlP3Jlc3BvbnNlLnN0YXR1c0NvZGU6bnVsbCxcbiAgICAgICAgICAgIHN0YXR1c1RleHQ6IHJlc3BvbnNlP3Jlc3BvbnNlLnN0YXR1c01lc3NhZ2U6bnVsbCxcbiAgICAgICAgICAgIGhlYWRlcnM6IHJlc3BvbnNlP3Jlc3BvbnNlLmhlYWRlcnM6bnVsbCxcbiAgICAgICAgICAgIGNvbmZpZzogY29uZmlnXG4gICAgICAgICAgfVxuICAgICAgICAgIGlmKGVyciA9PT0gbnVsbCAmJiByZXNwb25zZSAmJiByZXNwb25zZS5zdGF0dXNDb2RlID49IDIwMCAmJiByZXNwb25zZS5zdGF0dXNDb2RlIDwgMzAwKSB7XG4gICAgICAgICAgICBpZihyYXcpIHtcbiAgICAgICAgICAgICAgcmV0LmRhdGEgPSBib2R5O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgIHJldC5kYXRhID0gSlNPTi5wYXJzZShib2R5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc29sdmUocmV0KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXQuZGF0YSA9IGJvZHk7XG4gICAgICAgICAgICBjYWxsYmFja0Vycm9yT3JSZWplY3RPclRocm93KGNiLCByZWplY3QsIHBhdGgpKHJldCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgICAgLy8gY29uc3QgcmVxdWVzdFByb21pc2UgPSBheGlvcyhjb25maWcpLmNhdGNoKGNhbGxiYWNrRXJyb3JPclRocm93KGNiLCBwYXRoKSk7XG5cbiAgICAgIGlmIChjYikge1xuICAgICAgICAgcmVxdWVzdFByb21pc2UudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgIGNiKG51bGwsIHJlc3BvbnNlLmRhdGEgfHwgdHJ1ZSwgcmVzcG9uc2UpO1xuICAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXF1ZXN0UHJvbWlzZTtcbiAgIH1cblxuICAgLyoqXG4gICAgKiBNYWtlIGEgcmVxdWVzdCB0byBhbiBlbmRwb2ludCB0aGUgcmV0dXJucyAyMDQgd2hlbiB0cnVlIGFuZCA0MDQgd2hlbiBmYWxzZVxuICAgICogQHBhcmFtIHtzdHJpbmd9IHBhdGggLSB0aGUgcGF0aCB0byByZXF1ZXN0XG4gICAgKiBAcGFyYW0ge09iamVjdH0gZGF0YSAtIGFueSBxdWVyeSBwYXJhbWV0ZXJzIGZvciB0aGUgcmVxdWVzdFxuICAgICogQHBhcmFtIHtSZXF1ZXN0YWJsZS5jYWxsYmFja30gY2IgLSB0aGUgY2FsbGJhY2sgdGhhdCB3aWxsIHJlY2VpdmUgYHRydWVgIG9yIGBmYWxzZWBcbiAgICAqIEBwYXJhbSB7bWV0aG9kfSBbbWV0aG9kPUdFVF0gLSBIVFRQIE1ldGhvZCB0byB1c2VcbiAgICAqIEByZXR1cm4ge1Byb21pc2V9IC0gdGhlIHByb21pc2UgZm9yIHRoZSBodHRwIHJlcXVlc3RcbiAgICAqL1xuICAgX3JlcXVlc3QyMDRvcjQwNChwYXRoLCBkYXRhLCBjYiwgbWV0aG9kID0gJ0dFVCcpIHtcbiAgICAgIHJldHVybiB0aGlzLl9yZXF1ZXN0KG1ldGhvZCwgcGF0aCwgZGF0YSlcbiAgICAgICAgIC50aGVuKGZ1bmN0aW9uIHN1Y2Nlc3MocmVzcG9uc2UpIHtcbiAgICAgICAgICAgIGlmIChjYikge1xuICAgICAgICAgICAgICAgY2IobnVsbCwgdHJ1ZSwgcmVzcG9uc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICB9LCBmdW5jdGlvbiBmYWlsdXJlKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICBpZiAocmVzcG9uc2Uuc3RhdHVzID09PSA0MDQpIHtcbiAgICAgICAgICAgICAgIGlmIChjYikge1xuICAgICAgICAgICAgICAgICAgY2IobnVsbCwgZmFsc2UsIHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGNiKSB7XG4gICAgICAgICAgICAgICBjYihyZXNwb25zZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aHJvdyByZXNwb25zZTtcbiAgICAgICAgIH0pO1xuICAgfVxuXG4gICAvKipcbiAgICAqIE1ha2UgYSByZXF1ZXN0IGFuZCBmZXRjaCBhbGwgdGhlIGF2YWlsYWJsZSBkYXRhLiBHaXRodWIgd2lsbCBwYWdpbmF0ZSByZXNwb25zZXMgc28gZm9yIHF1ZXJpZXNcbiAgICAqIHRoYXQgbWlnaHQgc3BhbiBtdWx0aXBsZSBwYWdlcyB0aGlzIG1ldGhvZCBpcyBwcmVmZXJyZWQgdG8ge0BsaW5rIFJlcXVlc3RhYmxlI3JlcXVlc3R9XG4gICAgKiBAcGFyYW0ge3N0cmluZ30gcGF0aCAtIHRoZSBwYXRoIHRvIHJlcXVlc3RcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gdGhlIHF1ZXJ5IHBhcmFtZXRlcnMgdG8gaW5jbHVkZVxuICAgICogQHBhcmFtIHtSZXF1ZXN0YWJsZS5jYWxsYmFja30gW2NiXSAtIHRoZSBmdW5jdGlvbiB0byByZWNlaXZlIHRoZSBkYXRhLiBUaGUgcmV0dXJuZWQgZGF0YSB3aWxsIGFsd2F5cyBiZSBhbiBhcnJheS5cbiAgICAqIEBwYXJhbSB7T2JqZWN0W119IHJlc3VsdHMgLSB0aGUgcGFydGlhbCByZXN1bHRzLiBUaGlzIGFyZ3VtZW50IGlzIGludGVuZGVkIGZvciBpbnRlcmFsIHVzZSBvbmx5LlxuICAgICogQHJldHVybiB7UHJvbWlzZX0gLSBhIHByb21pc2Ugd2hpY2ggd2lsbCByZXNvbHZlIHdoZW4gYWxsIHBhZ2VzIGhhdmUgYmVlbiBmZXRjaGVkXG4gICAgKiBAZGVwcmVjYXRlZCBUaGlzIHdpbGwgYmUgZm9sZGVkIGludG8ge0BsaW5rIFJlcXVlc3RhYmxlI19yZXF1ZXN0fSBpbiB0aGUgMi4wIHJlbGVhc2UuXG4gICAgKi9cbiAgIF9yZXF1ZXN0QWxsUGFnZXMocGF0aCwgb3B0aW9ucywgY2IsIHJlc3VsdHMpIHtcbiAgICAgIHJlc3VsdHMgPSByZXN1bHRzIHx8IFtdO1xuXG4gICAgICByZXR1cm4gdGhpcy5fcmVxdWVzdCgnR0VUJywgcGF0aCwgb3B0aW9ucylcbiAgICAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgbGV0IHRoaXNHcm91cDtcbiAgICAgICAgICAgIGlmIChyZXNwb25zZS5kYXRhIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgICAgICAgIHRoaXNHcm91cCA9IHJlc3BvbnNlLmRhdGE7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHJlc3BvbnNlLmRhdGEuaXRlbXMgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICAgICAgICAgdGhpc0dyb3VwID0gcmVzcG9uc2UuZGF0YS5pdGVtcztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICBsZXQgbWVzc2FnZSA9IGBjYW5ub3QgZmlndXJlIG91dCBob3cgdG8gYXBwZW5kICR7cmVzcG9uc2UuZGF0YX0gdG8gdGhlIHJlc3VsdCBzZXRgO1xuICAgICAgICAgICAgICAgdGhyb3cgbmV3IFJlc3BvbnNlRXJyb3IobWVzc2FnZSwgcGF0aCwgcmVzcG9uc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzdWx0cy5wdXNoLmFwcGx5KHJlc3VsdHMsIHRoaXNHcm91cCk7XG5cbiAgICAgICAgICAgIGNvbnN0IG5leHRVcmwgPSBnZXROZXh0UGFnZShyZXNwb25zZS5oZWFkZXJzLmxpbmspO1xuICAgICAgICAgICAgaWYgKG5leHRVcmwpIHtcbiAgICAgICAgICAgICAgIGxvZyhgZ2V0dGluZyBuZXh0IHBhZ2U6ICR7bmV4dFVybH1gKTtcbiAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9yZXF1ZXN0QWxsUGFnZXMobmV4dFVybCwgb3B0aW9ucywgY2IsIHJlc3VsdHMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoY2IpIHtcbiAgICAgICAgICAgICAgIGNiKG51bGwsIHJlc3VsdHMsIHJlc3BvbnNlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmVzcG9uc2UuZGF0YSA9IHJlc3VsdHM7XG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgICAgICB9KS5jYXRjaChjYWxsYmFja0Vycm9yT3JSZWplY3RPclRocm93KGNiLCBudWxsLCBwYXRoKSk7XG4gICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUmVxdWVzdGFibGU7XG5cbi8vIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vIC8vXG4vLyAgUHJpdmF0ZSBoZWxwZXIgZnVuY3Rpb25zICAvL1xuLy8gLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8gLy9cbmNvbnN0IE1FVEhPRFNfV0lUSF9OT19CT0RZID0gWydHRVQnLCAnSEVBRCcsICdERUxFVEUnXTtcbmZ1bmN0aW9uIG1ldGhvZEhhc05vQm9keShtZXRob2QpIHtcbiAgIHJldHVybiBNRVRIT0RTX1dJVEhfTk9fQk9EWS5pbmRleE9mKG1ldGhvZCkgIT09IC0xO1xufVxuXG5mdW5jdGlvbiBnZXROZXh0UGFnZShsaW5rc0hlYWRlciA9ICcnKSB7XG4gICBjb25zdCBsaW5rcyA9IGxpbmtzSGVhZGVyLnNwbGl0KC9cXHMqLFxccyovKTsgLy8gc3BsaXRzIGFuZCBzdHJpcHMgdGhlIHVybHNcbiAgIHJldHVybiBsaW5rcy5yZWR1Y2UoZnVuY3Rpb24obmV4dFVybCwgbGluaykge1xuICAgICAgaWYgKGxpbmsuc2VhcmNoKC9yZWw9XCJuZXh0XCIvKSAhPT0gLTEpIHtcbiAgICAgICAgIHJldHVybiAobGluay5tYXRjaCgvPCguKik+LykgfHwgW10pWzFdO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbmV4dFVybDtcbiAgIH0sIHVuZGVmaW5lZCk7XG59XG5cbmZ1bmN0aW9uIGNhbGxiYWNrRXJyb3JPclJlamVjdE9yVGhyb3coY2IsIHJlamVjdCwgcGF0aCkge1xuICAgcmV0dXJuIGZ1bmN0aW9uIGhhbmRsZXIob2JqZWN0KSB7XG4gICAgICBsZXQgZXJyb3I7XG4gICAgICBpZiAob2JqZWN0Lmhhc093blByb3BlcnR5KCdjb25maWcnKSkge1xuICAgICAgICAgY29uc3Qge3N0YXR1cywgc3RhdHVzVGV4dCwgY29uZmlnOiB7bWV0aG9kLCB1cmx9fSA9IG9iamVjdDtcbiAgICAgICAgIGxldCBtZXNzYWdlID0gKGAke3N0YXR1c30gZXJyb3IgbWFraW5nIHJlcXVlc3QgJHttZXRob2R9ICR7dXJsfTogXCIke3N0YXR1c1RleHR9XCJgKTtcbiAgICAgICAgIGVycm9yID0gbmV3IFJlc3BvbnNlRXJyb3IobWVzc2FnZSwgcGF0aCwgb2JqZWN0KTtcbiAgICAgICAgIGxvZyhgJHttZXNzYWdlfSAke0pTT04uc3RyaW5naWZ5KG9iamVjdC5kYXRhKX1gKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICBlcnJvciA9IG9iamVjdDtcbiAgICAgIH1cbiAgICAgIGlmIChjYikge1xuICAgICAgICAgbG9nKCdnb2luZyB0byBlcnJvciBjYWxsYmFjaycpO1xuICAgICAgICAgY2IoZXJyb3IpO1xuICAgICAgfSBlbHNlIGlmIChyZWplY3QpIHtcbiAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICBsb2coJ3Rocm93aW5nIGVycm9yJyk7XG4gICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgIH07XG59XG4iXX0=
//# sourceMappingURL=Requestable.js.map
