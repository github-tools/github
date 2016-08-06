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
                     callbackErrorOrThrow(cb, path)(ret);
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
            }).catch(callbackErrorOrThrow(cb, path));
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

   function callbackErrorOrThrow(cb, path) {
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
         } else {
            log('throwing error');
            throw error;
         }
      };
   }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJlcXVlc3RhYmxlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWFBLE9BQU0sbUJBQW1CLCtCQUFxQjtBQUM1QyxXQUFLLE1BQUksSUFBSixHQUFTLElBRDhCLENBQ3pCO0FBRHlCLElBQXJCLENBQXpCOztBQUlBLE9BQU0sVUFBVSxpQ0FBVztBQUN6QixrQkFBWSxDQUFFLGlCQUFpQixTQUFuQjtBQURhLElBQVgsQ0FBaEI7O0FBSUEsT0FBTSxNQUFNLHFCQUFNLGdCQUFOLENBQVo7O0FBRUEsT0FBSSxPQUFPLE9BQVAsS0FBbUIsV0FBdkIsRUFBb0M7QUFDakM7QUFDRjs7QUFFRDs7OztPQUdNLGE7OztBQUNIOzs7Ozs7QUFNQSw2QkFBWSxPQUFaLEVBQXFCLElBQXJCLEVBQTJCLFFBQTNCLEVBQXFDO0FBQUE7O0FBQUEsc0dBQzVCLE9BRDRCOztBQUVsQyxlQUFLLElBQUwsR0FBWSxJQUFaO0FBQ0EsZUFBSyxPQUFMLEdBQWUsU0FBUyxNQUF4QjtBQUNBLGVBQUssUUFBTCxHQUFnQixRQUFoQjtBQUNBLGVBQUssTUFBTCxHQUFjLFNBQVMsTUFBdkI7QUFMa0M7QUFNcEM7OztLQWJ3QixLOztPQW1CdEIsVztBQUNIOzs7Ozs7O0FBT0E7Ozs7OztBQU1BLDJCQUFZLElBQVosRUFBa0IsT0FBbEIsRUFBMkI7QUFBQTs7QUFDeEIsY0FBSyxTQUFMLEdBQWlCLFdBQVcsd0JBQTVCO0FBQ0EsY0FBSyxNQUFMLEdBQWM7QUFDWCxtQkFBTyxLQUFLLEtBREQ7QUFFWCxzQkFBVSxLQUFLLFFBRko7QUFHWCxzQkFBVSxLQUFLO0FBSEosVUFBZDs7QUFNQSxhQUFJLEtBQUssS0FBVCxFQUFnQjtBQUNiLGlCQUFLLHFCQUFMLEdBQTZCLFdBQVcsS0FBSyxLQUE3QztBQUNGLFVBRkQsTUFFTyxJQUFJLEtBQUssUUFB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QUosQ0FBa0IsT0FBbEIsRUFBMkIsSUFBM0IsRUFBaUMsTUFBakMsQ0FBUjtBQUNBLGdCQUFPLE9BQVAsU0FBa0IsS0FBSyxTQUFMLENBQWUsT0FBTyxJQUF0QixDQUFsQjtBQUNGLFVBTEQsTUFLTztBQUNKLG9CQUFRLE1BQVI7QUFDRjtBQUNELGFBQUksRUFBSixFQUFRO0FBQ0wsZ0JBQUkseUJBQUo7QUFDQSxlQUFHLEtBQUg7QUFDRixVQUhELE1BR087QUFDSixnQkFBSSxnQkFBSjtBQUNBLGtCQUFNLEtBQU47QUFDRjtBQUNILE9BakJEO0FBa0JGIiwiZmlsZSI6IlJlcXVlc3RhYmxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZVxuICogQGNvcHlyaWdodCAgMjAxNiBZYWhvbyBJbmMuXG4gKiBAbGljZW5zZSAgICBMaWNlbnNlZCB1bmRlciB7QGxpbmsgaHR0cHM6Ly9zcGR4Lm9yZy9saWNlbnNlcy9CU0QtMy1DbGF1c2UtQ2xlYXIuaHRtbCBCU0QtMy1DbGF1c2UtQ2xlYXJ9LlxuICogICAgICAgICAgICAgR2l0aHViLmpzIGlzIGZyZWVseSBkaXN0cmlidXRhYmxlLlxuICovXG5cbmltcG9ydCByZXF1ZXN0RXh0IGZyb20gJ3JlcXVlc3QtZXh0ZW5zaWJsZSc7XG5pbXBvcnQgUmVxdWVzdEh0dHBDYWNoZSBmcm9tICdyZXF1ZXN0LWh0dHAtY2FjaGUnO1xuaW1wb3J0IGRlYnVnIGZyb20gJ2RlYnVnJztcbmltcG9ydCB7QmFzZTY0fSBmcm9tICdqcy1iYXNlNjQnO1xuaW1wb3J0IHtwb2x5ZmlsbH0gZnJvbSAnZXM2LXByb21pc2UnO1xuXG5jb25zdCBodHRwUmVxdWVzdENhY2hlID0gbmV3IFJlcXVlc3RIdHRwQ2FjaGUoe1xuICBtYXg6IDI1NioxMDI0KjEwMjQgLy8gTWF4aW11bSBjYWNoZSBzaXplICgyNTZtYilcbn0pO1xuXG5jb25zdCByZXF1ZXN0ID0gcmVxdWVzdEV4dCh7XG4gIGV4dGVuc2lvbnM6IFsgaHR0cFJlcXVlc3RDYWNoZS5leHRlbnNpb24gXVxufSk7XG5cbmNvbnN0IGxvZyA9IGRlYnVnKCdnaXRodWI6cmVxdWVzdCcpO1xuXG5pZiAodHlwZW9mIFByb21pc2UgPT09ICd1bmRlZmluZWQnKSB7XG4gICBwb2x5ZmlsbCgpO1xufVxuXG4vKipcbiAqIFRoZSBlcnJvciBzdHJ1Y3R1cmUgcmV0dXJuZWQgd2hlbiBhIG5ldHdvcmsgY2FsbCBmYWlsc1xuICovXG5jbGFzcyBSZXNwb25zZUVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICAgLyoqXG4gICAgKiBDb25zdHJ1Y3QgYSBuZXcgUmVzcG9uc2VFcnJvclxuICAgICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2UgLSBhbiBtZXNzYWdlIHRvIHJldHVybiBpbnN0ZWFkIG9mIHRoZSB0aGUgZGVmYXVsdCBlcnJvciBtZXNzYWdlXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gcGF0aCAtIHRoZSByZXF1ZXN0ZWQgcGF0aFxuICAgICogQHBhcmFtIHtPYmplY3R9IHJlc3BvbnNlIC0gdGhlIG9iamVjdCByZXR1cm5lZCBieSBBeGlvc1xuICAgICovXG4gICBjb25zdHJ1Y3RvcihtZXNzYWdlLCBwYXRoLCByZXNwb25zZSkge1xuICAgICAgc3VwZXIobWVzc2FnZSk7XG4gICAgICB0aGlzLnBhdGggPSBwYXRoO1xuICAgICAgdGhpcy5yZXF1ZXN0ID0gcmVzcG9uc2UuY29uZmlnO1xuICAgICAgdGhpcy5yZXNwb25zZSA9IHJlc3BvbnNlO1xuICAgICAgdGhpcy5zdGF0dXMgPSByZXNwb25zZS5zdGF0dXM7XG4gICB9XG59XG5cbi8qKlxuICogUmVxdWVzdGFibGUgd3JhcHMgdGhlIGxvZ2ljIGZvciBtYWtpbmcgaHR0cCByZXF1ZXN0cyB0byB0aGUgQVBJXG4gKi9cbmNsYXNzIFJlcXVlc3RhYmxlIHtcbiAgIC8qKlxuICAgICogRWl0aGVyIGEgdXNlcm5hbWUgYW5kIHBhc3N3b3JkIG9yIGFuIG9hdXRoIHRva2VuIGZvciBHaXRodWJcbiAgICAqIEB0eXBlZGVmIHtPYmplY3R9IFJlcXVlc3RhYmxlLmF1dGhcbiAgICAqIEBwcm9wIHtzdHJpbmd9IFt1c2VybmFtZV0gLSB0aGUgR2l0aHViIHVzZXJuYW1lXG4gICAgKiBAcHJvcCB7c3RyaW5nfSBbcGFzc3dvcmRdIC0gdGhlIHVzZXIncyBwYXNzd29yZFxuICAgICogQHByb3Age3Rva2VufSBbdG9rZW5dIC0gYW4gT0F1dGggdG9rZW5cbiAgICAqL1xuICAgLyoqXG4gICAgKiBJbml0aWFsaXplIHRoZSBodHRwIGludGVybmFscy5cbiAgICAqIEBwYXJhbSB7UmVxdWVzdGFibGUuYXV0aH0gW2F1dGhdIC0gdGhlIGNyZWRlbnRpYWxzIHRvIGF1dGhlbnRpY2F0ZSB0byBHaXRodWIuIElmIGF1dGggaXNcbiAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vdCBwcm92aWRlZCByZXF1ZXN0IHdpbGwgYmUgbWFkZSB1bmF1dGhlbnRpY2F0ZWRcbiAgICAqIEBwYXJhbSB7c3RyaW5nfSBbYXBpQmFzZT1odHRwczovL2FwaS5naXRodWIuY29tXSAtIHRoZSBiYXNlIEdpdGh1YiBBUEkgVVJMXG4gICAgKi9cbiAgIGNvbnN0cnVjdG9yKGF1dGgsIGFwaUJhc2UpIHtcbiAgICAgIHRoaXMuX19hcGlCYXNlID0gYXBpQmFzZSB8fCAnaHR0cHM6Ly9hcGkuZ2l0aHViLmNvbSc7XG4gICAgICB0aGlzLl9fYXV0aCA9IHtcbiAgICAgICAgIHRva2VuOiBhdXRoLnRva2VuLFxuICAgICAgICAgdXNlcm5hbWU6IGF1dGgudXNlcm5hbWUsXG4gICAgICAgICBwYXNzd29yZDogYXV0aC5wYXNzd29yZFxuICAgICAgfTtcblxuICAgICAgaWYgKGF1dGgudG9rZW4pIHtcbiAgICAgICAgIHRoaXMuX19hdXRob3JpemF0aW9uSGVhZGVyID0gJ3Rva2VuICcgKyBhdXRoLnRva2VuO1xuICAgICAgfSBlbHNlIGlmIChhdXRoLnVzZXJuYW1lICYmIGF1dGgucGFzc3dvcmQpIHtcbiAgICAgICAgIHRoaXMuX19hdXRob3JpemF0aW9uSGVhZGVyID0gJ0Jhc2ljICcgKyBCYXNlNjQuZW5jb2RlKGF1dGgudXNlcm5hbWUgKyAnOicgKyBhdXRoLnBhc3N3b3JkKTtcbiAgICAgIH1cbiAgIH1cblxuICAgLyoqXG4gICAgKiBDb21wdXRlIHRoZSBVUkwgdG8gdXNlIHRvIG1ha2UgYSByZXF1ZXN0LlxuICAgICogQHByaXZhdGVcbiAgICAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoIC0gZWl0aGVyIGEgVVJMIHJlbGF0aXZlIHRvIHRoZSBBUEkgYmFzZSBvciBhbiBhYnNvbHV0ZSBVUkxcbiAgICAqIEByZXR1cm4ge3N0cmluZ30gLSB0aGUgVVJMIHRvIHVzZVxuICAgICovXG4gICBfX2dldFVSTChwYXRoKSB7XG4gICAgICBsZXQgdXJsID0gcGF0aDtcblxuICAgICAgaWYgKHBhdGguaW5kZXhPZignLy8nKSA9PT0gLTEpIHtcbiAgICAgICAgIHVybCA9IHRoaXMuX19hcGlCYXNlICsgcGF0aDtcbiAgICAgIH1cblxuICAgICAgbGV0IG5ld0NhY2hlQnVzdGVyID0gJ3RpbWVzdGFtcD0nICsgbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICByZXR1cm4gdXJsLnJlcGxhY2UoLyh0aW1lc3RhbXA9XFxkKykvLCBuZXdDYWNoZUJ1c3Rlcik7XG4gICB9XG5cbiAgIC8qKlxuICAgICogQ29tcHV0ZSB0aGUgaGVhZGVycyByZXF1aXJlZCBmb3IgYW4gQVBJIHJlcXVlc3QuXG4gICAgKiBAcHJpdmF0ZVxuICAgICogQHBhcmFtIHtib29sZWFufSByYXcgLSBpZiB0aGUgcmVxdWVzdCBzaG91bGQgYmUgdHJlYXRlZCBhcyBKU09OIG9yIGFzIGEgcmF3IHJlcXVlc3RcbiAgICAqIEByZXR1cm4ge09iamVjdH0gLSB0aGUgaGVhZGVycyB0byB1c2UgaW4gdGhlIHJlcXVlc3RcbiAgICAqL1xuICAgX19nZXRSZXF1ZXN0SGVhZGVycyhyYXcpIHtcbiAgICAgIGxldCBoZWFkZXJzID0ge1xuICAgICAgICAgJ0FjY2VwdCc6IHJhdyA/ICdhcHBsaWNhdGlvbi92bmQuZ2l0aHViLnYzLnJhdytqc29uJyA6ICdhcHBsaWNhdGlvbi92bmQuZ2l0aHViLnYzK2pzb24nLFxuICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9VVRGLTgnXG4gICAgICB9O1xuXG4gICAgICBpZiAodGhpcy5fX2F1dGhvcml6YXRpb25IZWFkZXIpIHtcbiAgICAgICAgIGhlYWRlcnMuQXV0aG9yaXphdGlvbiA9IHRoaXMuX19hdXRob3JpemF0aW9uSGVhZGVyO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gaGVhZGVycztcbiAgIH1cblxuICAgLyoqXG4gICAgKiBTZXRzIHRoZSBkZWZhdWx0IG9wdGlvbnMgZm9yIEFQSSByZXF1ZXN0c1xuICAgICogQHByb3RlY3RlZFxuICAgICogQHBhcmFtIHtPYmplY3R9IFtyZXF1ZXN0T3B0aW9ucz17fV0gLSB0aGUgY3VycmVudCBvcHRpb25zIGZvciB0aGUgcmVxdWVzdFxuICAgICogQHJldHVybiB7T2JqZWN0fSAtIHRoZSBvcHRpb25zIHRvIHBhc3MgdG8gdGhlIHJlcXVlc3RcbiAgICAqL1xuICAgX2dldE9wdGlvbnNXaXRoRGVmYXVsdHMocmVxdWVzdE9wdGlvbnMgPSB7fSkge1xuICAgICAgaWYgKCEocmVxdWVzdE9wdGlvbnMudmlzaWJpbGl0eSB8fCByZXF1ZXN0T3B0aW9ucy5hZmZpbGlhdGlvbikpIHtcbiAgICAgICAgIHJlcXVlc3RPcHRpb25zLnR5cGUgPSByZXF1ZXN0T3B0aW9ucy50eXBlIHx8ICdhbGwnO1xuICAgICAgfVxuICAgICAgcmVxdWVzdE9wdGlvbnMuc29ydCA9IHJlcXVlc3RPcHRpb25zLnNvcnQgfHwgJ3VwZGF0ZWQnO1xuICAgICAgcmVxdWVzdE9wdGlvbnMucGVyX3BhZ2UgPSByZXF1ZXN0T3B0aW9ucy5wZXJfcGFnZSB8fCAnMTAwJzsgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuXG4gICAgICByZXR1cm4gcmVxdWVzdE9wdGlvbnM7XG4gICB9XG5cbiAgIC8qKlxuICAgICogaWYgYSBgRGF0ZWAgaXMgcGFzc2VkIHRvIHRoaXMgZnVuY3Rpb24gaXQgd2lsbCBiZSBjb252ZXJ0ZWQgdG8gYW4gSVNPIHN0cmluZ1xuICAgICogQHBhcmFtIHsqfSBkYXRlIC0gdGhlIG9iamVjdCB0byBhdHRlbXB0IHRvIGNvb2VyY2UgaW50byBhbiBJU08gZGF0ZSBzdHJpbmdcbiAgICAqIEByZXR1cm4ge3N0cmluZ30gLSB0aGUgSVNPIHJlcHJlc2VudGF0aW9uIG9mIGBkYXRlYCBvciB3aGF0ZXZlciB3YXMgcGFzc2VkIGluIGlmIGl0IHdhcyBub3QgYSBkYXRlXG4gICAgKi9cbiAgIF9kYXRlVG9JU08oZGF0ZSkge1xuICAgICAgaWYgKGRhdGUgJiYgKGRhdGUgaW5zdGFuY2VvZiBEYXRlKSkge1xuICAgICAgICAgZGF0ZSA9IGRhdGUudG9JU09TdHJpbmcoKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGRhdGU7XG4gICB9XG5cbiAgIC8qKlxuICAgICogQSBmdW5jdGlvbiB0aGF0IHJlY2VpdmVzIHRoZSByZXN1bHQgb2YgdGhlIEFQSSByZXF1ZXN0LlxuICAgICogQGNhbGxiYWNrIFJlcXVlc3RhYmxlLmNhbGxiYWNrXG4gICAgKiBAcGFyYW0ge1JlcXVlc3RhYmxlLkVycm9yfSBlcnJvciAtIHRoZSBlcnJvciByZXR1cm5lZCBieSB0aGUgQVBJIG9yIGBudWxsYFxuICAgICogQHBhcmFtIHsoT2JqZWN0fHRydWUpfSByZXN1bHQgLSB0aGUgZGF0YSByZXR1cm5lZCBieSB0aGUgQVBJIG9yIGB0cnVlYCBpZiB0aGUgQVBJIHJldHVybnMgYDIwNCBObyBDb250ZW50YFxuICAgICogQHBhcmFtIHtPYmplY3R9IHJlcXVlc3QgLSB0aGUgcmF3IHtAbGlua2NvZGUgaHR0cHM6Ly9naXRodWIuY29tL216YWJyaXNraWUvYXhpb3MjcmVzcG9uc2Utc2NoZW1hIFJlc3BvbnNlfVxuICAgICovXG4gICAvKipcbiAgICAqIE1ha2UgYSByZXF1ZXN0LlxuICAgICogQHBhcmFtIHtzdHJpbmd9IG1ldGhvZCAtIHRoZSBtZXRob2QgZm9yIHRoZSByZXF1ZXN0IChHRVQsIFBVVCwgUE9TVCwgREVMRVRFKVxuICAgICogQHBhcmFtIHtzdHJpbmd9IHBhdGggLSB0aGUgcGF0aCBmb3IgdGhlIHJlcXVlc3RcbiAgICAqIEBwYXJhbSB7Kn0gW2RhdGFdIC0gdGhlIGRhdGEgdG8gc2VuZCB0byB0aGUgc2VydmVyLiBGb3IgSFRUUCBtZXRob2RzIHRoYXQgZG9uJ3QgaGF2ZSBhIGJvZHkgdGhlIGRhdGFcbiAgICAqICAgICAgICAgICAgICAgICAgIHdpbGwgYmUgc2VudCBhcyBxdWVyeSBwYXJhbWV0ZXJzXG4gICAgKiBAcGFyYW0ge1JlcXVlc3RhYmxlLmNhbGxiYWNrfSBbY2JdIC0gdGhlIGNhbGxiYWNrIGZvciB0aGUgcmVxdWVzdFxuICAgICogQHBhcmFtIHtib29sZWFufSBbcmF3PWZhbHNlXSAtIGlmIHRoZSByZXF1ZXN0IHNob3VsZCBiZSBzZW50IGFzIHJhdy4gSWYgdGhpcyBpcyBhIGZhbHN5IHZhbHVlIHRoZW4gdGhlXG4gICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVlc3Qgd2lsbCBiZSBtYWRlIGFzIEpTT05cbiAgICAqIEByZXR1cm4ge1Byb21pc2V9IC0gdGhlIFByb21pc2UgZm9yIHRoZSBodHRwIHJlcXVlc3RcbiAgICAqL1xuICAgX3JlcXVlc3QobWV0aG9kLCBwYXRoLCBkYXRhLCBjYiwgcmF3KSB7XG4gICAgICBjb25zdCB1cmwgPSB0aGlzLl9fZ2V0VVJMKHBhdGgpO1xuXG4gICAgICBsZXQgaGVhZGVycyA9IHRoaXMuX19nZXRSZXF1ZXN0SGVhZGVycyhyYXcpO1xuICAgICAgLy8gRmFpbHNhZmUgY2hlY2sgZm9yIGRpcmVjdGx5IG1ha2luZyByZXF1ZXN0IGZyb20gTm9kZUpTXG4gICAgICBpZighaGVhZGVyc1snVXNlci1BZ2VudCddKSB7XG4gICAgICAgIGhlYWRlcnNbJ1VzZXItQWdlbnQnXSA9ICdyZXF1ZXN0JztcbiAgICAgIH1cblxuICAgICAgbGV0IHF1ZXJ5UGFyYW1zID0ge307XG4gICAgICBjb25zdCBzaG91bGRVc2VEYXRhQXNQYXJhbXMgPSBkYXRhICYmICh0eXBlb2YgZGF0YSA9PT0gJ29iamVjdCcpICYmIG1ldGhvZEhhc05vQm9keShtZXRob2QpO1xuICAgICAgaWYgKHNob3VsZFVzZURhdGFBc1BhcmFtcykge1xuICAgICAgICAgcXVlcnlQYXJhbXMgPSBkYXRhO1xuICAgICAgICAgZGF0YSA9IHVuZGVmaW5lZDtcbiAgICAgIH1cblxuICAgICAgY29uc3QgY29uZmlnID0ge1xuICAgICAgICAgdXJsOiB1cmwsXG4gICAgICAgICBtZXRob2Q6IG1ldGhvZCxcbiAgICAgICAgIGhlYWRlcnM6IGhlYWRlcnMsXG4gICAgICAgICBwYXJhbXM6IHF1ZXJ5UGFyYW1zLFxuICAgICAgICAgZGF0YTogZGF0YSxcbiAgICAgICAgIHJlc3BvbnNlVHlwZTogcmF3ID8gJ3RleHQnIDogJ2pzb24nXG4gICAgICB9O1xuXG4gICAgICBsb2coYCR7Y29uZmlnLm1ldGhvZH0gdG8gJHtjb25maWcudXJsfWApO1xuXG4gICAgICBjb25zdCByZXF1ZXN0UHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgcmVxdWVzdChjb25maWcsIGZ1bmN0aW9uKGVyciwgcmVzcG9uc2UsIGJvZHkpIHtcbiAgICAgICAgICBsZXQgcmV0ID0ge1xuICAgICAgICAgICAgc3RhdHVzOiByZXNwb25zZT9yZXNwb25zZS5zdGF0dXNDb2RlOm51bGwsXG4gICAgICAgICAgICBzdGF0dXNUZXh0OiByZXNwb25zZT9yZXNwb25zZS5zdGF0dXNNZXNzYWdlOm51bGwsXG4gICAgICAgICAgICBoZWFkZXJzOiByZXNwb25zZT9yZXNwb25zZS5oZWFkZXJzOm51bGwsXG4gICAgICAgICAgICBjb25maWc6IGNvbmZpZ1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZihlcnIgPT09IG51bGwgJiYgcmVzcG9uc2UgJiYgcmVzcG9uc2Uuc3RhdHVzQ29kZSA+PSAyMDAgJiYgcmVzcG9uc2Uuc3RhdHVzQ29kZSA8IDMwMCkge1xuICAgICAgICAgICAgaWYocmF3KSB7XG4gICAgICAgICAgICAgIHJldC5kYXRhID0gYm9keTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICByZXQuZGF0YSA9IEpTT04ucGFyc2UoYm9keSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXNvbHZlKHJldCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0LmRhdGEgPSBib2R5O1xuICAgICAgICAgICAgY2FsbGJhY2tFcnJvck9yVGhyb3coY2IsIHBhdGgpKHJldCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgICAgLy8gY29uc3QgcmVxdWVzdFByb21pc2UgPSBheGlvcyhjb25maWcpLmNhdGNoKGNhbGxiYWNrRXJyb3JPclRocm93KGNiLCBwYXRoKSk7XG5cbiAgICAgIGlmIChjYikge1xuICAgICAgICAgcmVxdWVzdFByb21pc2UudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgIGNiKG51bGwsIHJlc3BvbnNlLmRhdGEgfHwgdHJ1ZSwgcmVzcG9uc2UpO1xuICAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXF1ZXN0UHJvbWlzZTtcbiAgIH1cblxuICAgLyoqXG4gICAgKiBNYWtlIGEgcmVxdWVzdCB0byBhbiBlbmRwb2ludCB0aGUgcmV0dXJucyAyMDQgd2hlbiB0cnVlIGFuZCA0MDQgd2hlbiBmYWxzZVxuICAgICogQHBhcmFtIHtzdHJpbmd9IHBhdGggLSB0aGUgcGF0aCB0byByZXF1ZXN0XG4gICAgKiBAcGFyYW0ge09iamVjdH0gZGF0YSAtIGFueSBxdWVyeSBwYXJhbWV0ZXJzIGZvciB0aGUgcmVxdWVzdFxuICAgICogQHBhcmFtIHtSZXF1ZXN0YWJsZS5jYWxsYmFja30gY2IgLSB0aGUgY2FsbGJhY2sgdGhhdCB3aWxsIHJlY2VpdmUgYHRydWVgIG9yIGBmYWxzZWBcbiAgICAqIEBwYXJhbSB7bWV0aG9kfSBbbWV0aG9kPUdFVF0gLSBIVFRQIE1ldGhvZCB0byB1c2VcbiAgICAqIEByZXR1cm4ge1Byb21pc2V9IC0gdGhlIHByb21pc2UgZm9yIHRoZSBodHRwIHJlcXVlc3RcbiAgICAqL1xuICAgX3JlcXVlc3QyMDRvcjQwNChwYXRoLCBkYXRhLCBjYiwgbWV0aG9kID0gJ0dFVCcpIHtcbiAgICAgIHJldHVybiB0aGlzLl9yZXF1ZXN0KG1ldGhvZCwgcGF0aCwgZGF0YSlcbiAgICAgICAgIC50aGVuKGZ1bmN0aW9uIHN1Y2Nlc3MocmVzcG9uc2UpIHtcbiAgICAgICAgICAgIGlmIChjYikge1xuICAgICAgICAgICAgICAgY2IobnVsbCwgdHJ1ZSwgcmVzcG9uc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICB9LCBmdW5jdGlvbiBmYWlsdXJlKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICBpZiAocmVzcG9uc2Uuc3RhdHVzID09PSA0MDQpIHtcbiAgICAgICAgICAgICAgIGlmIChjYikge1xuICAgICAgICAgICAgICAgICAgY2IobnVsbCwgZmFsc2UsIHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGNiKSB7XG4gICAgICAgICAgICAgICBjYihyZXNwb25zZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aHJvdyByZXNwb25zZTtcbiAgICAgICAgIH0pO1xuICAgfVxuXG4gICAvKipcbiAgICAqIE1ha2UgYSByZXF1ZXN0IGFuZCBmZXRjaCBhbGwgdGhlIGF2YWlsYWJsZSBkYXRhLiBHaXRodWIgd2lsbCBwYWdpbmF0ZSByZXNwb25zZXMgc28gZm9yIHF1ZXJpZXNcbiAgICAqIHRoYXQgbWlnaHQgc3BhbiBtdWx0aXBsZSBwYWdlcyB0aGlzIG1ldGhvZCBpcyBwcmVmZXJyZWQgdG8ge0BsaW5rIFJlcXVlc3RhYmxlI3JlcXVlc3R9XG4gICAgKiBAcGFyYW0ge3N0cmluZ30gcGF0aCAtIHRoZSBwYXRoIHRvIHJlcXVlc3RcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gdGhlIHF1ZXJ5IHBhcmFtZXRlcnMgdG8gaW5jbHVkZVxuICAgICogQHBhcmFtIHtSZXF1ZXN0YWJsZS5jYWxsYmFja30gW2NiXSAtIHRoZSBmdW5jdGlvbiB0byByZWNlaXZlIHRoZSBkYXRhLiBUaGUgcmV0dXJuZWQgZGF0YSB3aWxsIGFsd2F5cyBiZSBhbiBhcnJheS5cbiAgICAqIEBwYXJhbSB7T2JqZWN0W119IHJlc3VsdHMgLSB0aGUgcGFydGlhbCByZXN1bHRzLiBUaGlzIGFyZ3VtZW50IGlzIGludGVuZGVkIGZvciBpbnRlcmFsIHVzZSBvbmx5LlxuICAgICogQHJldHVybiB7UHJvbWlzZX0gLSBhIHByb21pc2Ugd2hpY2ggd2lsbCByZXNvbHZlIHdoZW4gYWxsIHBhZ2VzIGhhdmUgYmVlbiBmZXRjaGVkXG4gICAgKiBAZGVwcmVjYXRlZCBUaGlzIHdpbGwgYmUgZm9sZGVkIGludG8ge0BsaW5rIFJlcXVlc3RhYmxlI19yZXF1ZXN0fSBpbiB0aGUgMi4wIHJlbGVhc2UuXG4gICAgKi9cbiAgIF9yZXF1ZXN0QWxsUGFnZXMocGF0aCwgb3B0aW9ucywgY2IsIHJlc3VsdHMpIHtcbiAgICAgIHJlc3VsdHMgPSByZXN1bHRzIHx8IFtdO1xuXG4gICAgICByZXR1cm4gdGhpcy5fcmVxdWVzdCgnR0VUJywgcGF0aCwgb3B0aW9ucylcbiAgICAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgbGV0IHRoaXNHcm91cDtcbiAgICAgICAgICAgIGlmIChyZXNwb25zZS5kYXRhIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgICAgICAgIHRoaXNHcm91cCA9IHJlc3BvbnNlLmRhdGE7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHJlc3BvbnNlLmRhdGEuaXRlbXMgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICAgICAgICAgdGhpc0dyb3VwID0gcmVzcG9uc2UuZGF0YS5pdGVtcztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICBsZXQgbWVzc2FnZSA9IGBjYW5ub3QgZmlndXJlIG91dCBob3cgdG8gYXBwZW5kICR7cmVzcG9uc2UuZGF0YX0gdG8gdGhlIHJlc3VsdCBzZXRgO1xuICAgICAgICAgICAgICAgdGhyb3cgbmV3IFJlc3BvbnNlRXJyb3IobWVzc2FnZSwgcGF0aCwgcmVzcG9uc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzdWx0cy5wdXNoLmFwcGx5KHJlc3VsdHMsIHRoaXNHcm91cCk7XG5cbiAgICAgICAgICAgIGNvbnN0IG5leHRVcmwgPSBnZXROZXh0UGFnZShyZXNwb25zZS5oZWFkZXJzLmxpbmspO1xuICAgICAgICAgICAgaWYgKG5leHRVcmwpIHtcbiAgICAgICAgICAgICAgIGxvZyhgZ2V0dGluZyBuZXh0IHBhZ2U6ICR7bmV4dFVybH1gKTtcbiAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9yZXF1ZXN0QWxsUGFnZXMobmV4dFVybCwgb3B0aW9ucywgY2IsIHJlc3VsdHMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoY2IpIHtcbiAgICAgICAgICAgICAgIGNiKG51bGwsIHJlc3VsdHMsIHJlc3BvbnNlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmVzcG9uc2UuZGF0YSA9IHJlc3VsdHM7XG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgICAgICB9KS5jYXRjaChjYWxsYmFja0Vycm9yT3JUaHJvdyhjYiwgcGF0aCkpO1xuICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFJlcXVlc3RhYmxlO1xuXG4vLyAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLyAvL1xuLy8gIFByaXZhdGUgaGVscGVyIGZ1bmN0aW9ucyAgLy9cbi8vIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vIC8vXG5jb25zdCBNRVRIT0RTX1dJVEhfTk9fQk9EWSA9IFsnR0VUJywgJ0hFQUQnLCAnREVMRVRFJ107XG5mdW5jdGlvbiBtZXRob2RIYXNOb0JvZHkobWV0aG9kKSB7XG4gICByZXR1cm4gTUVUSE9EU19XSVRIX05PX0JPRFkuaW5kZXhPZihtZXRob2QpICE9PSAtMTtcbn1cblxuZnVuY3Rpb24gZ2V0TmV4dFBhZ2UobGlua3NIZWFkZXIgPSAnJykge1xuICAgY29uc3QgbGlua3MgPSBsaW5rc0hlYWRlci5zcGxpdCgvXFxzKixcXHMqLyk7IC8vIHNwbGl0cyBhbmQgc3RyaXBzIHRoZSB1cmxzXG4gICByZXR1cm4gbGlua3MucmVkdWNlKGZ1bmN0aW9uKG5leHRVcmwsIGxpbmspIHtcbiAgICAgIGlmIChsaW5rLnNlYXJjaCgvcmVsPVwibmV4dFwiLykgIT09IC0xKSB7XG4gICAgICAgICByZXR1cm4gKGxpbmsubWF0Y2goLzwoLiopPi8pIHx8IFtdKVsxXTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG5leHRVcmw7XG4gICB9LCB1bmRlZmluZWQpO1xufVxuXG5mdW5jdGlvbiBjYWxsYmFja0Vycm9yT3JUaHJvdyhjYiwgcGF0aCkge1xuICAgcmV0dXJuIGZ1bmN0aW9uIGhhbmRsZXIob2JqZWN0KSB7XG4gICAgICBsZXQgZXJyb3I7XG4gICAgICBpZiAob2JqZWN0Lmhhc093blByb3BlcnR5KCdjb25maWcnKSkge1xuICAgICAgICAgY29uc3Qge3N0YXR1cywgc3RhdHVzVGV4dCwgY29uZmlnOiB7bWV0aG9kLCB1cmx9fSA9IG9iamVjdDtcbiAgICAgICAgIGxldCBtZXNzYWdlID0gKGAke3N0YXR1c30gZXJyb3IgbWFraW5nIHJlcXVlc3QgJHttZXRob2R9ICR7dXJsfTogXCIke3N0YXR1c1RleHR9XCJgKTtcbiAgICAgICAgIGVycm9yID0gbmV3IFJlc3BvbnNlRXJyb3IobWVzc2FnZSwgcGF0aCwgb2JqZWN0KTtcbiAgICAgICAgIGxvZyhgJHttZXNzYWdlfSAke0pTT04uc3RyaW5naWZ5KG9iamVjdC5kYXRhKX1gKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICBlcnJvciA9IG9iamVjdDtcbiAgICAgIH1cbiAgICAgIGlmIChjYikge1xuICAgICAgICAgbG9nKCdnb2luZyB0byBlcnJvciBjYWxsYmFjaycpO1xuICAgICAgICAgY2IoZXJyb3IpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgIGxvZygndGhyb3dpbmcgZXJyb3InKTtcbiAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfVxuICAgfTtcbn1cbiJdfQ==
//# sourceMappingURL=Requestable.js.map
