(function (global, factory) {
   if (typeof define === "function" && define.amd) {
      define(['module', './Requestable', 'debug'], factory);
   } else if (typeof exports !== "undefined") {
      factory(module, require('./Requestable'), require('debug'));
   } else {
      var mod = {
         exports: {}
      };
      factory(mod, global.Requestable, global.debug);
      global.User = mod.exports;
   }
})(this, function (module, _Requestable2, _debug) {
   'use strict';

   var _Requestable3 = _interopRequireDefault(_Requestable2);

   var _debug2 = _interopRequireDefault(_debug);

   function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : {
         default: obj
      };
   }

   function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
         throw new TypeError("Cannot call a class as a function");
      }
   }

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

   var log = (0, _debug2.default)('github:user');

   /**
    * A User allows scoping of API requests to a particular Github user.
    */

   var User = function (_Requestable) {
      _inherits(User, _Requestable);

      /**
       * Create a User.
       * @param {string} [username] - the user to use for user-scoped queries
       * @param {Requestable.auth} [auth] - information required to authenticate to Github
       * @param {string} [apiBase=https://api.github.com] - the base Github API URL
       */
      function User(username, auth, apiBase) {
         _classCallCheck(this, User);

         var _this = _possibleConstructorReturn(this, (User.__proto__ || Object.getPrototypeOf(User)).call(this, auth, apiBase));

         _this.__user = username;
         return _this;
      }

      /**
       * Get the url for the request. (dependent on if we're requesting for the authenticated user or not)
       * @private
       * @param {string} endpoint - the endpoint being requested
       * @return {string} - the resolved endpoint
       */


      _createClass(User, [{
         key: '__getScopedUrl',
         value: function __getScopedUrl(endpoint) {
            if (this.__user) {
               return endpoint ? '/users/' + this.__user + '/' + endpoint : '/users/' + this.__user;
            } else {
               // eslint-disable-line
               switch (endpoint) {
                  case '':
                     return '/user';

                  case 'notifications':
                  case 'gists':
                     return '/' + endpoint;

                  default:
                     return '/user/' + endpoint;
               }
            }
         }
      }, {
         key: 'listRepos',
         value: function listRepos(options, cb) {
            if (typeof options === 'function') {
               cb = options;
               options = {};
            }

            options = this._getOptionsWithDefaults(options);

            log('Fetching repositories with options: ' + JSON.stringify(options));
            return this._requestAllPages(this.__getScopedUrl('repos'), options, cb);
         }
      }, {
         key: 'listOrgs',
         value: function listOrgs(cb) {
            return this._request('GET', this.__getScopedUrl('orgs'), null, cb);
         }
      }, {
         key: 'listGists',
         value: function listGists(cb) {
            return this._request('GET', this.__getScopedUrl('gists'), null, cb);
         }
      }, {
         key: 'listNotifications',
         value: function listNotifications(options, cb) {
            options = options || {};
            if (typeof options === 'function') {
               cb = options;
               options = {};
            }

            options.since = this._dateToISO(options.since);
            options.before = this._dateToISO(options.before);

            return this._request('GET', this.__getScopedUrl('notifications'), options, cb);
         }
      }, {
         key: 'getProfile',
         value: function getProfile(cb) {
            return this._request('GET', this.__getScopedUrl(''), null, cb);
         }
      }, {
         key: 'listStarredRepos',
         value: function listStarredRepos(cb) {
            var requestOptions = this._getOptionsWithDefaults();
            return this._requestAllPages(this.__getScopedUrl('starred'), requestOptions, cb);
         }
      }, {
         key: 'follow',
         value: function follow(username, cb) {
            return this._request('PUT', '/user/following/' + this.__user, null, cb);
         }
      }, {
         key: 'unfollow',
         value: function unfollow(username, cb) {
            return this._request('DELETE', '/user/following/' + this.__user, null, cb);
         }
      }, {
         key: 'createRepo',
         value: function createRepo(options, cb) {
            return this._request('POST', '/user/repos', options, cb);
         }
      }]);

      return User;
   }(_Requestable3.default);

   module.exports = User;
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlVzZXIuanMiXSwibmFtZXMiOlsibG9nIiwiVXNlciIsInVzZXJuYW1lIiwiYXV0aCIsImFwaUJhc2UiLCJfX3VzZXIiLCJlbmRwb2ludCIsIm9wdGlvbnMiLCJjYiIsIl9nZXRPcHRpb25zV2l0aERlZmF1bHRzIiwiSlNPTiIsInN0cmluZ2lmeSIsIl9yZXF1ZXN0QWxsUGFnZXMiLCJfX2dldFNjb3BlZFVybCIsIl9yZXF1ZXN0Iiwic2luY2UiLCJfZGF0ZVRvSVNPIiwiYmVmb3JlIiwicmVxdWVzdE9wdGlvbnMiLCJSZXF1ZXN0YWJsZSIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFTQSxPQUFNQSxNQUFNLHFCQUFNLGFBQU4sQ0FBWjs7QUFFQTs7OztPQUdNQyxJOzs7QUFDSDs7Ozs7O0FBTUEsb0JBQVlDLFFBQVosRUFBc0JDLElBQXRCLEVBQTRCQyxPQUE1QixFQUFxQztBQUFBOztBQUFBLGlIQUM1QkQsSUFENEIsRUFDdEJDLE9BRHNCOztBQUVsQyxlQUFLQyxNQUFMLEdBQWNILFFBQWQ7QUFGa0M7QUFHcEM7O0FBRUQ7Ozs7Ozs7Ozs7d0NBTWVJLFEsRUFBVTtBQUN0QixnQkFBSSxLQUFLRCxNQUFULEVBQWlCO0FBQ2Qsc0JBQU9DLHVCQUNNLEtBQUtELE1BRFgsU0FDcUJDLFFBRHJCLGVBRU0sS0FBS0QsTUFGbEI7QUFLRixhQU5ELE1BTU87QUFBRTtBQUNOLHVCQUFRQyxRQUFSO0FBQ0csdUJBQUssRUFBTDtBQUNHLDRCQUFPLE9BQVA7O0FBRUgsdUJBQUssZUFBTDtBQUNBLHVCQUFLLE9BQUw7QUFDRyxrQ0FBV0EsUUFBWDs7QUFFSDtBQUNHLHVDQUFnQkEsUUFBaEI7QUFUTjtBQVdGO0FBQ0g7OzttQ0FTU0MsTyxFQUFTQyxFLEVBQUk7QUFDcEIsZ0JBQUksT0FBT0QsT0FBUCxLQUFtQixVQUF2QixFQUFtQztBQUNoQ0Msb0JBQUtELE9BQUw7QUFDQUEseUJBQVUsRUFBVjtBQUNGOztBQUVEQSxzQkFBVSxLQUFLRSx1QkFBTCxDQUE2QkYsT0FBN0IsQ0FBVjs7QUFFQVAseURBQTJDVSxLQUFLQyxTQUFMLENBQWVKLE9BQWYsQ0FBM0M7QUFDQSxtQkFBTyxLQUFLSyxnQkFBTCxDQUFzQixLQUFLQyxjQUFMLENBQW9CLE9BQXBCLENBQXRCLEVBQW9ETixPQUFwRCxFQUE2REMsRUFBN0QsQ0FBUDtBQUNGOzs7a0NBUVFBLEUsRUFBSTtBQUNWLG1CQUFPLEtBQUtNLFFBQUwsQ0FBYyxLQUFkLEVBQXFCLEtBQUtELGNBQUwsQ0FBb0IsTUFBcEIsQ0FBckIsRUFBa0QsSUFBbEQsRUFBd0RMLEVBQXhELENBQVA7QUFDRjs7O21DQVFTQSxFLEVBQUk7QUFDWCxtQkFBTyxLQUFLTSxRQUFMLENBQWMsS0FBZCxFQUFxQixLQUFLRCxjQUFMLENBQW9CLE9BQXBCLENBQXJCLEVBQW1ELElBQW5ELEVBQXlETCxFQUF6RCxDQUFQO0FBQ0Y7OzsyQ0FTaUJELE8sRUFBU0MsRSxFQUFJO0FBQzVCRCxzQkFBVUEsV0FBVyxFQUFyQjtBQUNBLGdCQUFJLE9BQU9BLE9BQVAsS0FBbUIsVUFBdkIsRUFBbUM7QUFDaENDLG9CQUFLRCxPQUFMO0FBQ0FBLHlCQUFVLEVBQVY7QUFDRjs7QUFFREEsb0JBQVFRLEtBQVIsR0FBZ0IsS0FBS0MsVUFBTCxDQUFnQlQsUUFBUVEsS0FBeEIsQ0FBaEI7QUFDQVIsb0JBQVFVLE1BQVIsR0FBaUIsS0FBS0QsVUFBTCxDQUFnQlQsUUFBUVUsTUFBeEIsQ0FBakI7O0FBRUEsbUJBQU8sS0FBS0gsUUFBTCxDQUFjLEtBQWQsRUFBcUIsS0FBS0QsY0FBTCxDQUFvQixlQUFwQixDQUFyQixFQUEyRE4sT0FBM0QsRUFBb0VDLEVBQXBFLENBQVA7QUFDRjs7O29DQVFVQSxFLEVBQUk7QUFDWixtQkFBTyxLQUFLTSxRQUFMLENBQWMsS0FBZCxFQUFxQixLQUFLRCxjQUFMLENBQW9CLEVBQXBCLENBQXJCLEVBQThDLElBQTlDLEVBQW9ETCxFQUFwRCxDQUFQO0FBQ0Y7OzswQ0FRZ0JBLEUsRUFBSTtBQUNsQixnQkFBSVUsaUJBQWlCLEtBQUtULHVCQUFMLEVBQXJCO0FBQ0EsbUJBQU8sS0FBS0csZ0JBQUwsQ0FBc0IsS0FBS0MsY0FBTCxDQUFvQixTQUFwQixDQUF0QixFQUFzREssY0FBdEQsRUFBc0VWLEVBQXRFLENBQVA7QUFDRjs7O2dDQVNNTixRLEVBQVVNLEUsRUFBSTtBQUNsQixtQkFBTyxLQUFLTSxRQUFMLENBQWMsS0FBZCx1QkFBd0MsS0FBS1QsTUFBN0MsRUFBdUQsSUFBdkQsRUFBNkRHLEVBQTdELENBQVA7QUFDRjs7O2tDQVNRTixRLEVBQVVNLEUsRUFBSTtBQUNwQixtQkFBTyxLQUFLTSxRQUFMLENBQWMsUUFBZCx1QkFBMkMsS0FBS1QsTUFBaEQsRUFBMEQsSUFBMUQsRUFBZ0VHLEVBQWhFLENBQVA7QUFDRjs7O29DQVNVRCxPLEVBQVNDLEUsRUFBSTtBQUNyQixtQkFBTyxLQUFLTSxRQUFMLENBQWMsTUFBZCxFQUFzQixhQUF0QixFQUFxQ1AsT0FBckMsRUFBOENDLEVBQTlDLENBQVA7QUFDRjs7OztLQXZKZVcscUI7O0FBMEpuQkMsVUFBT0MsT0FBUCxHQUFpQnBCLElBQWpCIiwiZmlsZSI6IlVzZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlXG4gKiBAY29weXJpZ2h0ICAyMDEzIE1pY2hhZWwgQXVmcmVpdGVyIChEZXZlbG9wbWVudCBTZWVkKSBhbmQgMjAxNiBZYWhvbyBJbmMuXG4gKiBAbGljZW5zZSAgICBMaWNlbnNlZCB1bmRlciB7QGxpbmsgaHR0cHM6Ly9zcGR4Lm9yZy9saWNlbnNlcy9CU0QtMy1DbGF1c2UtQ2xlYXIuaHRtbCBCU0QtMy1DbGF1c2UtQ2xlYXJ9LlxuICogICAgICAgICAgICAgR2l0aHViLmpzIGlzIGZyZWVseSBkaXN0cmlidXRhYmxlLlxuICovXG5cbmltcG9ydCBSZXF1ZXN0YWJsZSBmcm9tICcuL1JlcXVlc3RhYmxlJztcbmltcG9ydCBkZWJ1ZyBmcm9tICdkZWJ1Zyc7XG5jb25zdCBsb2cgPSBkZWJ1ZygnZ2l0aHViOnVzZXInKTtcblxuLyoqXG4gKiBBIFVzZXIgYWxsb3dzIHNjb3Bpbmcgb2YgQVBJIHJlcXVlc3RzIHRvIGEgcGFydGljdWxhciBHaXRodWIgdXNlci5cbiAqL1xuY2xhc3MgVXNlciBleHRlbmRzIFJlcXVlc3RhYmxlIHtcbiAgIC8qKlxuICAgICogQ3JlYXRlIGEgVXNlci5cbiAgICAqIEBwYXJhbSB7c3RyaW5nfSBbdXNlcm5hbWVdIC0gdGhlIHVzZXIgdG8gdXNlIGZvciB1c2VyLXNjb3BlZCBxdWVyaWVzXG4gICAgKiBAcGFyYW0ge1JlcXVlc3RhYmxlLmF1dGh9IFthdXRoXSAtIGluZm9ybWF0aW9uIHJlcXVpcmVkIHRvIGF1dGhlbnRpY2F0ZSB0byBHaXRodWJcbiAgICAqIEBwYXJhbSB7c3RyaW5nfSBbYXBpQmFzZT1odHRwczovL2FwaS5naXRodWIuY29tXSAtIHRoZSBiYXNlIEdpdGh1YiBBUEkgVVJMXG4gICAgKi9cbiAgIGNvbnN0cnVjdG9yKHVzZXJuYW1lLCBhdXRoLCBhcGlCYXNlKSB7XG4gICAgICBzdXBlcihhdXRoLCBhcGlCYXNlKTtcbiAgICAgIHRoaXMuX191c2VyID0gdXNlcm5hbWU7XG4gICB9XG5cbiAgIC8qKlxuICAgICogR2V0IHRoZSB1cmwgZm9yIHRoZSByZXF1ZXN0LiAoZGVwZW5kZW50IG9uIGlmIHdlJ3JlIHJlcXVlc3RpbmcgZm9yIHRoZSBhdXRoZW50aWNhdGVkIHVzZXIgb3Igbm90KVxuICAgICogQHByaXZhdGVcbiAgICAqIEBwYXJhbSB7c3RyaW5nfSBlbmRwb2ludCAtIHRoZSBlbmRwb2ludCBiZWluZyByZXF1ZXN0ZWRcbiAgICAqIEByZXR1cm4ge3N0cmluZ30gLSB0aGUgcmVzb2x2ZWQgZW5kcG9pbnRcbiAgICAqL1xuICAgX19nZXRTY29wZWRVcmwoZW5kcG9pbnQpIHtcbiAgICAgIGlmICh0aGlzLl9fdXNlcikge1xuICAgICAgICAgcmV0dXJuIGVuZHBvaW50ID9cbiAgICAgICAgICAgIGAvdXNlcnMvJHt0aGlzLl9fdXNlcn0vJHtlbmRwb2ludH1gIDpcbiAgICAgICAgICAgIGAvdXNlcnMvJHt0aGlzLl9fdXNlcn1gXG4gICAgICAgICAgICA7XG5cbiAgICAgIH0gZWxzZSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgICAgICAgIHN3aXRjaCAoZW5kcG9pbnQpIHtcbiAgICAgICAgICAgIGNhc2UgJyc6XG4gICAgICAgICAgICAgICByZXR1cm4gJy91c2VyJztcblxuICAgICAgICAgICAgY2FzZSAnbm90aWZpY2F0aW9ucyc6XG4gICAgICAgICAgICBjYXNlICdnaXN0cyc6XG4gICAgICAgICAgICAgICByZXR1cm4gYC8ke2VuZHBvaW50fWA7XG5cbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICByZXR1cm4gYC91c2VyLyR7ZW5kcG9pbnR9YDtcbiAgICAgICAgIH1cbiAgICAgIH1cbiAgIH1cblxuICAgLyoqXG4gICAgKiBMaXN0IHRoZSB1c2VyJ3MgcmVwb3NpdG9yaWVzXG4gICAgKiBAc2VlIGh0dHBzOi8vZGV2ZWxvcGVyLmdpdGh1Yi5jb20vdjMvcmVwb3MvI2xpc3QtdXNlci1yZXBvc2l0b3JpZXNcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV0gLSBhbnkgb3B0aW9ucyB0byByZWZpbmUgdGhlIHNlYXJjaFxuICAgICogQHBhcmFtIHtSZXF1ZXN0YWJsZS5jYWxsYmFja30gW2NiXSAtIHdpbGwgcmVjZWl2ZSB0aGUgbGlzdCBvZiByZXBvc2l0b3JpZXNcbiAgICAqIEByZXR1cm4ge1Byb21pc2V9IC0gdGhlIHByb21pc2UgZm9yIHRoZSBodHRwIHJlcXVlc3RcbiAgICAqL1xuICAgbGlzdFJlcG9zKG9wdGlvbnMsIGNiKSB7XG4gICAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgIGNiID0gb3B0aW9ucztcbiAgICAgICAgIG9wdGlvbnMgPSB7fTtcbiAgICAgIH1cblxuICAgICAgb3B0aW9ucyA9IHRoaXMuX2dldE9wdGlvbnNXaXRoRGVmYXVsdHMob3B0aW9ucyk7XG5cbiAgICAgIGxvZyhgRmV0Y2hpbmcgcmVwb3NpdG9yaWVzIHdpdGggb3B0aW9uczogJHtKU09OLnN0cmluZ2lmeShvcHRpb25zKX1gKTtcbiAgICAgIHJldHVybiB0aGlzLl9yZXF1ZXN0QWxsUGFnZXModGhpcy5fX2dldFNjb3BlZFVybCgncmVwb3MnKSwgb3B0aW9ucywgY2IpO1xuICAgfVxuXG4gICAvKipcbiAgICAqIExpc3QgdGhlIG9yZ3MgdGhhdCB0aGUgdXNlciBiZWxvbmdzIHRvXG4gICAgKiBAc2VlIGh0dHBzOi8vZGV2ZWxvcGVyLmdpdGh1Yi5jb20vdjMvb3Jncy8jbGlzdC11c2VyLW9yZ2FuaXphdGlvbnNcbiAgICAqIEBwYXJhbSB7UmVxdWVzdGFibGUuY2FsbGJhY2t9IFtjYl0gLSB3aWxsIHJlY2VpdmUgdGhlIGxpc3Qgb2Ygb3JnYW5pemF0aW9uc1xuICAgICogQHJldHVybiB7UHJvbWlzZX0gLSB0aGUgcHJvbWlzZSBmb3IgdGhlIGh0dHAgcmVxdWVzdFxuICAgICovXG4gICBsaXN0T3JncyhjYikge1xuICAgICAgcmV0dXJuIHRoaXMuX3JlcXVlc3QoJ0dFVCcsIHRoaXMuX19nZXRTY29wZWRVcmwoJ29yZ3MnKSwgbnVsbCwgY2IpO1xuICAgfVxuXG4gICAvKipcbiAgICAqIExpc3QgdGhlIHVzZXIncyBnaXN0c1xuICAgICogQHNlZSBodHRwczovL2RldmVsb3Blci5naXRodWIuY29tL3YzL2dpc3RzLyNsaXN0LWEtdXNlcnMtZ2lzdHNcbiAgICAqIEBwYXJhbSB7UmVxdWVzdGFibGUuY2FsbGJhY2t9IFtjYl0gLSB3aWxsIHJlY2VpdmUgdGhlIGxpc3Qgb2YgZ2lzdHNcbiAgICAqIEByZXR1cm4ge1Byb21pc2V9IC0gdGhlIHByb21pc2UgZm9yIHRoZSBodHRwIHJlcXVlc3RcbiAgICAqL1xuICAgbGlzdEdpc3RzKGNiKSB7XG4gICAgICByZXR1cm4gdGhpcy5fcmVxdWVzdCgnR0VUJywgdGhpcy5fX2dldFNjb3BlZFVybCgnZ2lzdHMnKSwgbnVsbCwgY2IpO1xuICAgfVxuXG4gICAvKipcbiAgICAqIExpc3QgdGhlIHVzZXIncyBub3RpZmljYXRpb25zXG4gICAgKiBAc2VlIGh0dHBzOi8vZGV2ZWxvcGVyLmdpdGh1Yi5jb20vdjMvYWN0aXZpdHkvbm90aWZpY2F0aW9ucy8jbGlzdC15b3VyLW5vdGlmaWNhdGlvbnNcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV0gLSBhbnkgb3B0aW9ucyB0byByZWZpbmUgdGhlIHNlYXJjaFxuICAgICogQHBhcmFtIHtSZXF1ZXN0YWJsZS5jYWxsYmFja30gW2NiXSAtIHdpbGwgcmVjZWl2ZSB0aGUgbGlzdCBvZiByZXBvc2l0b3JpZXNcbiAgICAqIEByZXR1cm4ge1Byb21pc2V9IC0gdGhlIHByb21pc2UgZm9yIHRoZSBodHRwIHJlcXVlc3RcbiAgICAqL1xuICAgbGlzdE5vdGlmaWNhdGlvbnMob3B0aW9ucywgY2IpIHtcbiAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICBjYiA9IG9wdGlvbnM7XG4gICAgICAgICBvcHRpb25zID0ge307XG4gICAgICB9XG5cbiAgICAgIG9wdGlvbnMuc2luY2UgPSB0aGlzLl9kYXRlVG9JU08ob3B0aW9ucy5zaW5jZSk7XG4gICAgICBvcHRpb25zLmJlZm9yZSA9IHRoaXMuX2RhdGVUb0lTTyhvcHRpb25zLmJlZm9yZSk7XG5cbiAgICAgIHJldHVybiB0aGlzLl9yZXF1ZXN0KCdHRVQnLCB0aGlzLl9fZ2V0U2NvcGVkVXJsKCdub3RpZmljYXRpb25zJyksIG9wdGlvbnMsIGNiKTtcbiAgIH1cblxuICAgLyoqXG4gICAgKiBTaG93IHRoZSB1c2VyJ3MgcHJvZmlsZVxuICAgICogQHNlZSBodHRwczovL2RldmVsb3Blci5naXRodWIuY29tL3YzL3VzZXJzLyNnZXQtYS1zaW5nbGUtdXNlclxuICAgICogQHBhcmFtIHtSZXF1ZXN0YWJsZS5jYWxsYmFja30gW2NiXSAtIHdpbGwgcmVjZWl2ZSB0aGUgdXNlcidzIGluZm9ybWF0aW9uXG4gICAgKiBAcmV0dXJuIHtQcm9taXNlfSAtIHRoZSBwcm9taXNlIGZvciB0aGUgaHR0cCByZXF1ZXN0XG4gICAgKi9cbiAgIGdldFByb2ZpbGUoY2IpIHtcbiAgICAgIHJldHVybiB0aGlzLl9yZXF1ZXN0KCdHRVQnLCB0aGlzLl9fZ2V0U2NvcGVkVXJsKCcnKSwgbnVsbCwgY2IpO1xuICAgfVxuXG4gICAvKipcbiAgICAqIEdldHMgdGhlIGxpc3Qgb2Ygc3RhcnJlZCByZXBvc2l0b3JpZXMgZm9yIHRoZSB1c2VyXG4gICAgKiBAc2VlIGh0dHBzOi8vZGV2ZWxvcGVyLmdpdGh1Yi5jb20vdjMvYWN0aXZpdHkvc3RhcnJpbmcvI2xpc3QtcmVwb3NpdG9yaWVzLWJlaW5nLXN0YXJyZWRcbiAgICAqIEBwYXJhbSB7UmVxdWVzdGFibGUuY2FsbGJhY2t9IFtjYl0gLSB3aWxsIHJlY2VpdmUgdGhlIGxpc3Qgb2Ygc3RhcnJlZCByZXBvc2l0b3JpZXNcbiAgICAqIEByZXR1cm4ge1Byb21pc2V9IC0gdGhlIHByb21pc2UgZm9yIHRoZSBodHRwIHJlcXVlc3RcbiAgICAqL1xuICAgbGlzdFN0YXJyZWRSZXBvcyhjYikge1xuICAgICAgbGV0IHJlcXVlc3RPcHRpb25zID0gdGhpcy5fZ2V0T3B0aW9uc1dpdGhEZWZhdWx0cygpO1xuICAgICAgcmV0dXJuIHRoaXMuX3JlcXVlc3RBbGxQYWdlcyh0aGlzLl9fZ2V0U2NvcGVkVXJsKCdzdGFycmVkJyksIHJlcXVlc3RPcHRpb25zLCBjYik7XG4gICB9XG5cbiAgIC8qKlxuICAgICogSGF2ZSB0aGUgYXV0aGVudGljYXRlZCB1c2VyIGZvbGxvdyB0aGlzIHVzZXJcbiAgICAqIEBzZWUgaHR0cHM6Ly9kZXZlbG9wZXIuZ2l0aHViLmNvbS92My91c2Vycy9mb2xsb3dlcnMvI2ZvbGxvdy1hLXVzZXJcbiAgICAqIEBwYXJhbSB7c3RyaW5nfSB1c2VybmFtZSAtIHRoZSB1c2VyIHRvIGZvbGxvd1xuICAgICogQHBhcmFtIHtSZXF1ZXN0YWJsZS5jYWxsYmFja30gW2NiXSAtIHdpbGwgcmVjZWl2ZSB0cnVlIGlmIHRoZSByZXF1ZXN0IHN1Y2NlZWRzXG4gICAgKiBAcmV0dXJuIHtQcm9taXNlfSAtIHRoZSBwcm9taXNlIGZvciB0aGUgaHR0cCByZXF1ZXN0XG4gICAgKi9cbiAgIGZvbGxvdyh1c2VybmFtZSwgY2IpIHtcbiAgICAgIHJldHVybiB0aGlzLl9yZXF1ZXN0KCdQVVQnLCBgL3VzZXIvZm9sbG93aW5nLyR7dGhpcy5fX3VzZXJ9YCwgbnVsbCwgY2IpO1xuICAgfVxuXG4gICAvKipcbiAgICAqIEhhdmUgdGhlIGN1cnJlbnRseSBhdXRoZW50aWNhdGVkIHVzZXIgdW5mb2xsb3cgdGhpcyB1c2VyXG4gICAgKiBAc2VlIGh0dHBzOi8vZGV2ZWxvcGVyLmdpdGh1Yi5jb20vdjMvdXNlcnMvZm9sbG93ZXJzLyNmb2xsb3ctYS11c2VyXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gdXNlcm5hbWUgLSB0aGUgdXNlciB0byB1bmZvbGxvd1xuICAgICogQHBhcmFtIHtSZXF1ZXN0YWJsZS5jYWxsYmFja30gW2NiXSAtIHJlY2VpdmVzIHRydWUgaWYgdGhlIHJlcXVlc3Qgc3VjY2VlZHNcbiAgICAqIEByZXR1cm4ge1Byb21pc2V9IC0gdGhlIHByb21pc2UgZm9yIHRoZSBodHRwIHJlcXVlc3RcbiAgICAqL1xuICAgdW5mb2xsb3codXNlcm5hbWUsIGNiKSB7XG4gICAgICByZXR1cm4gdGhpcy5fcmVxdWVzdCgnREVMRVRFJywgYC91c2VyL2ZvbGxvd2luZy8ke3RoaXMuX191c2VyfWAsIG51bGwsIGNiKTtcbiAgIH1cblxuICAgLyoqXG4gICAgKiBDcmVhdGUgYSBuZXcgcmVwb3NpdG9yeSBmb3IgdGhlIGN1cnJlbnRseSBhdXRoZW50aWNhdGVkIHVzZXJcbiAgICAqIEBzZWUgaHR0cHM6Ly9kZXZlbG9wZXIuZ2l0aHViLmNvbS92My9yZXBvcy8jY3JlYXRlXG4gICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyAtIHRoZSByZXBvc2l0b3J5IGRlZmluaXRpb25cbiAgICAqIEBwYXJhbSB7UmVxdWVzdGFibGUuY2FsbGJhY2t9IFtjYl0gLSB3aWxsIHJlY2VpdmUgdGhlIEFQSSByZXNwb25zZVxuICAgICogQHJldHVybiB7UHJvbWlzZX0gLSB0aGUgcHJvbWlzZSBmb3IgdGhlIGh0dHAgcmVxdWVzdFxuICAgICovXG4gICBjcmVhdGVSZXBvKG9wdGlvbnMsIGNiKSB7XG4gICAgICByZXR1cm4gdGhpcy5fcmVxdWVzdCgnUE9TVCcsICcvdXNlci9yZXBvcycsIG9wdGlvbnMsIGNiKTtcbiAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBVc2VyO1xuIl19
//# sourceMappingURL=User.js.map
