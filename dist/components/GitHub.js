(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['module', './Gist', './User', './Issue', './Search', './RateLimit', './Repository', './Organization', './Team', './Markdown'], factory);
  } else if (typeof exports !== "undefined") {
    factory(module, require('./Gist'), require('./User'), require('./Issue'), require('./Search'), require('./RateLimit'), require('./Repository'), require('./Organization'), require('./Team'), require('./Markdown'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod, global.Gist, global.User, global.Issue, global.Search, global.RateLimit, global.Repository, global.Organization, global.Team, global.Markdown);
    global.GitHub = mod.exports;
  }
})(this, function (module, _Gist, _User, _Issue, _Search, _RateLimit, _Repository, _Organization, _Team, _Markdown) {
  'use strict';

  var _Gist2 = _interopRequireDefault(_Gist);

  var _User2 = _interopRequireDefault(_User);

  var _Issue2 = _interopRequireDefault(_Issue);

  var _Search2 = _interopRequireDefault(_Search);

  var _RateLimit2 = _interopRequireDefault(_RateLimit);

  var _Repository2 = _interopRequireDefault(_Repository);

  var _Organization2 = _interopRequireDefault(_Organization);

  var _Team2 = _interopRequireDefault(_Team);

  var _Markdown2 = _interopRequireDefault(_Markdown);

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

  var GitHub = function () {
    /**
     * Create a new GitHub.
     * @param {Requestable.auth} [auth] - the credentials to authenticate to Github. If auth is
     *                                  not provided requests will be made unauthenticated
     * @param {string} [apiBase=https://api.github.com] - the base Github API URL
     */
    function GitHub(auth) {
      var apiBase = arguments.length <= 1 || arguments[1] === undefined ? 'https://api.github.com' : arguments[1];

      _classCallCheck(this, GitHub);

      this.__apiBase = apiBase;
      this.__auth = auth || {};
    }

    /**
     * Create a new Gist wrapper
     * @param {number} [id] - the id for the gist, leave undefined when creating a new gist
     * @return {Gist}
     */


    _createClass(GitHub, [{
      key: 'getGist',
      value: function getGist(id) {
        return new _Gist2.default(id, this.__auth, this.__apiBase);
      }
    }, {
      key: 'getUser',
      value: function getUser(user) {
        return new _User2.default(user, this.__auth, this.__apiBase);
      }
    }, {
      key: 'getOrganization',
      value: function getOrganization(organization) {
        return new _Organization2.default(organization, this.__auth, this.__apiBase);
      }
    }, {
      key: 'getTeam',
      value: function getTeam(teamId) {
        return new _Team2.default(teamId, this.__auth, this.__apiBase);
      }
    }, {
      key: 'getRepo',
      value: function getRepo(user, repo) {
        return new _Repository2.default(this._getFullName(user, repo), this.__auth, this.__apiBase);
      }
    }, {
      key: 'getIssues',
      value: function getIssues(user, repo) {
        return new _Issue2.default(this._getFullName(user, repo), this.__auth, this.__apiBase);
      }
    }, {
      key: 'search',
      value: function search(query) {
        return new _Search2.default(query, this.__auth, this.__apiBase);
      }
    }, {
      key: 'getRateLimit',
      value: function getRateLimit() {
        return new _RateLimit2.default(this.__auth, this.__apiBase);
      }
    }, {
      key: 'getMarkdown',
      value: function getMarkdown() {
        return new _Markdown2.default(this.__auth, this.__apiBase);
      }
    }, {
      key: '_getFullName',
      value: function _getFullName(user, repo) {
        var fullname = user;

        if (repo) {
          fullname = user + '/' + repo;
        }

        return fullname;
      }
    }]);

    return GitHub;
  }();

  module.exports = GitHub;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkdpdEh1Yi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7TUFxQk0sTTtBQUNIOzs7Ozs7QUFNQSxvQkFBWSxJQUFaLEVBQXNEO0FBQUEsVUFBcEMsT0FBb0MseURBQTFCLHdCQUEwQjs7QUFBQTs7QUFDbkQsV0FBSyxTQUFMLEdBQWlCLE9BQWpCO0FBQ0EsV0FBSyxNQUFMLEdBQWMsUUFBUSxFQUF0QjtBQUNGOztBQUVEOzs7Ozs7Ozs7OEJBS1EsRSxFQUFJO0FBQ1QsZUFBTyxtQkFBUyxFQUFULEVBQWEsS0FBSyxNQUFsQixFQUEwQixLQUFLLFNBQS9CLENBQVA7QUFDRjs7OzhCQVFPLEksRUFBTTtBQUNYLGVBQU8sbUJBQVMsSUFBVCxFQUFlLEtBQUssTUFBcEIsRUFBNEIsS0FBSyxTQUFqQyxDQUFQO0FBQ0Y7OztzQ0FPZSxZLEVBQWM7QUFDM0IsZUFBTywyQkFBaUIsWUFBakIsRUFBK0IsS0FBSyxNQUFwQyxFQUE0QyxLQUFLLFNBQWpELENBQVA7QUFDRjs7OzhCQU9PLE0sRUFBUTtBQUNiLGVBQU8sbUJBQVMsTUFBVCxFQUFpQixLQUFLLE1BQXRCLEVBQThCLEtBQUssU0FBbkMsQ0FBUDtBQUNGOzs7OEJBUU8sSSxFQUFNLEksRUFBTTtBQUNqQixlQUFPLHlCQUFlLEtBQUssWUFBTCxDQUFrQixJQUFsQixFQUF3QixJQUF4QixDQUFmLEVBQThDLEtBQUssTUFBbkQsRUFBMkQsS0FBSyxTQUFoRSxDQUFQO0FBQ0Y7OztnQ0FRUyxJLEVBQU0sSSxFQUFNO0FBQ25CLGVBQU8sb0JBQVUsS0FBSyxZQUFMLENBQWtCLElBQWxCLEVBQXdCLElBQXhCLENBQVYsRUFBeUMsS0FBSyxNQUE5QyxFQUFzRCxLQUFLLFNBQTNELENBQVA7QUFDRjs7OzZCQU9NLEssRUFBTztBQUNYLGVBQU8scUJBQVcsS0FBWCxFQUFrQixLQUFLLE1BQXZCLEVBQStCLEtBQUssU0FBcEMsQ0FBUDtBQUNGOzs7cUNBTWM7QUFDWixlQUFPLHdCQUFjLEtBQUssTUFBbkIsRUFBMkIsS0FBSyxTQUFoQyxDQUFQO0FBQ0Y7OztvQ0FNYTtBQUNYLGVBQU8sdUJBQWEsS0FBSyxNQUFsQixFQUEwQixLQUFLLFNBQS9CLENBQVA7QUFDRjs7O21DQVFZLEksRUFBTSxJLEVBQU07QUFDdEIsWUFBSSxXQUFXLElBQWY7O0FBRUEsWUFBSSxJQUFKLEVBQVU7QUFDUCxxQkFBYyxJQUFkLFNBQXNCLElBQXRCO0FBQ0Y7O0FBRUQsZUFBTyxRQUFQO0FBQ0Y7Ozs7OztBQUdKLFNBQU8sT0FBUCxHQUFpQixNQUFqQiIsImZpbGUiOiJHaXRIdWIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBmaWxlXG4gKiBAY29weXJpZ2h0ICAyMDEzIE1pY2hhZWwgQXVmcmVpdGVyIChEZXZlbG9wbWVudCBTZWVkKSBhbmQgMjAxNiBZYWhvbyBJbmMuXG4gKiBAbGljZW5zZSAgICBMaWNlbnNlZCB1bmRlciB7QGxpbmsgaHR0cHM6Ly9zcGR4Lm9yZy9saWNlbnNlcy9CU0QtMy1DbGF1c2UtQ2xlYXIuaHRtbCBCU0QtMy1DbGF1c2UtQ2xlYXJ9LlxuICogICAgICAgICAgICAgR2l0aHViLmpzIGlzIGZyZWVseSBkaXN0cmlidXRhYmxlLlxuICovXG4vKiBlc2xpbnQgdmFsaWQtanNkb2M6IFtcImVycm9yXCIsIHtcInJlcXVpcmVSZXR1cm5EZXNjcmlwdGlvblwiOiBmYWxzZX1dICovXG5cbmltcG9ydCBHaXN0IGZyb20gJy4vR2lzdCc7XG5pbXBvcnQgVXNlciBmcm9tICcuL1VzZXInO1xuaW1wb3J0IElzc3VlIGZyb20gJy4vSXNzdWUnO1xuaW1wb3J0IFNlYXJjaCBmcm9tICcuL1NlYXJjaCc7XG5pbXBvcnQgUmF0ZUxpbWl0IGZyb20gJy4vUmF0ZUxpbWl0JztcbmltcG9ydCBSZXBvc2l0b3J5IGZyb20gJy4vUmVwb3NpdG9yeSc7XG5pbXBvcnQgT3JnYW5pemF0aW9uIGZyb20gJy4vT3JnYW5pemF0aW9uJztcbmltcG9ydCBUZWFtIGZyb20gJy4vVGVhbSc7XG5pbXBvcnQgTWFya2Rvd24gZnJvbSAnLi9NYXJrZG93bic7XG5cbi8qKlxuICogR2l0SHViIGVuY2Fwc3VsYXRlcyB0aGUgZnVuY3Rpb25hbGl0eSB0byBjcmVhdGUgdmFyaW91cyBBUEkgd3JhcHBlciBvYmplY3RzLlxuICovXG5jbGFzcyBHaXRIdWIge1xuICAgLyoqXG4gICAgKiBDcmVhdGUgYSBuZXcgR2l0SHViLlxuICAgICogQHBhcmFtIHtSZXF1ZXN0YWJsZS5hdXRofSBbYXV0aF0gLSB0aGUgY3JlZGVudGlhbHMgdG8gYXV0aGVudGljYXRlIHRvIEdpdGh1Yi4gSWYgYXV0aCBpc1xuICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm90IHByb3ZpZGVkIHJlcXVlc3RzIHdpbGwgYmUgbWFkZSB1bmF1dGhlbnRpY2F0ZWRcbiAgICAqIEBwYXJhbSB7c3RyaW5nfSBbYXBpQmFzZT1odHRwczovL2FwaS5naXRodWIuY29tXSAtIHRoZSBiYXNlIEdpdGh1YiBBUEkgVVJMXG4gICAgKi9cbiAgIGNvbnN0cnVjdG9yKGF1dGgsIGFwaUJhc2UgPSAnaHR0cHM6Ly9hcGkuZ2l0aHViLmNvbScpIHtcbiAgICAgIHRoaXMuX19hcGlCYXNlID0gYXBpQmFzZTtcbiAgICAgIHRoaXMuX19hdXRoID0gYXV0aCB8fCB7fTtcbiAgIH1cblxuICAgLyoqXG4gICAgKiBDcmVhdGUgYSBuZXcgR2lzdCB3cmFwcGVyXG4gICAgKiBAcGFyYW0ge251bWJlcn0gW2lkXSAtIHRoZSBpZCBmb3IgdGhlIGdpc3QsIGxlYXZlIHVuZGVmaW5lZCB3aGVuIGNyZWF0aW5nIGEgbmV3IGdpc3RcbiAgICAqIEByZXR1cm4ge0dpc3R9XG4gICAgKi9cbiAgIGdldEdpc3QoaWQpIHtcbiAgICAgIHJldHVybiBuZXcgR2lzdChpZCwgdGhpcy5fX2F1dGgsIHRoaXMuX19hcGlCYXNlKTtcbiAgIH1cblxuICAgLyoqXG4gICAgKiBDcmVhdGUgYSBuZXcgVXNlciB3cmFwcGVyXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gW3VzZXJdIC0gdGhlIG5hbWUgb2YgdGhlIHVzZXIgdG8gZ2V0IGluZm9ybWF0aW9uIGFib3V0XG4gICAgKiAgICAgICAgICAgICAgICAgICAgICAgIGxlYXZlIHVuZGVmaW5lZCBmb3IgdGhlIGF1dGhlbnRpY2F0ZWQgdXNlclxuICAgICogQHJldHVybiB7VXNlcn1cbiAgICAqL1xuICAgZ2V0VXNlcih1c2VyKSB7XG4gICAgICByZXR1cm4gbmV3IFVzZXIodXNlciwgdGhpcy5fX2F1dGgsIHRoaXMuX19hcGlCYXNlKTtcbiAgIH1cblxuICAgLyoqXG4gICAgKiBDcmVhdGUgYSBuZXcgT3JnYW5pemF0aW9uIHdyYXBwZXJcbiAgICAqIEBwYXJhbSB7c3RyaW5nfSBvcmdhbml6YXRpb24gLSB0aGUgbmFtZSBvZiB0aGUgb3JnYW5pemF0aW9uXG4gICAgKiBAcmV0dXJuIHtPcmdhbml6YXRpb259XG4gICAgKi9cbiAgIGdldE9yZ2FuaXphdGlvbihvcmdhbml6YXRpb24pIHtcbiAgICAgIHJldHVybiBuZXcgT3JnYW5pemF0aW9uKG9yZ2FuaXphdGlvbiwgdGhpcy5fX2F1dGgsIHRoaXMuX19hcGlCYXNlKTtcbiAgIH1cblxuICAgLyoqXG4gICAgKiBjcmVhdGUgYSBuZXcgVGVhbSB3cmFwcGVyXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gdGVhbUlkIC0gdGhlIG5hbWUgb2YgdGhlIHRlYW1cbiAgICAqIEByZXR1cm4ge3RlYW19XG4gICAgKi9cbiAgIGdldFRlYW0odGVhbUlkKSB7XG4gICAgICByZXR1cm4gbmV3IFRlYW0odGVhbUlkLCB0aGlzLl9fYXV0aCwgdGhpcy5fX2FwaUJhc2UpO1xuICAgfVxuXG4gICAvKipcbiAgICAqIENyZWF0ZSBhIG5ldyBSZXBvc2l0b3J5IHdyYXBwZXJcbiAgICAqIEBwYXJhbSB7c3RyaW5nfSB1c2VyIC0gdGhlIHVzZXIgd2hvIG93bnMgdGhlIHJlc3Bvc2l0b3J5XG4gICAgKiBAcGFyYW0ge3N0cmluZ30gcmVwbyAtIHRoZSBuYW1lIG9mIHRoZSByZXBvc2l0b3J5XG4gICAgKiBAcmV0dXJuIHtSZXBvc2l0b3J5fVxuICAgICovXG4gICBnZXRSZXBvKHVzZXIsIHJlcG8pIHtcbiAgICAgIHJldHVybiBuZXcgUmVwb3NpdG9yeSh0aGlzLl9nZXRGdWxsTmFtZSh1c2VyLCByZXBvKSwgdGhpcy5fX2F1dGgsIHRoaXMuX19hcGlCYXNlKTtcbiAgIH1cblxuICAgLyoqXG4gICAgKiBDcmVhdGUgYSBuZXcgSXNzdWUgd3JhcHBlclxuICAgICogQHBhcmFtIHtzdHJpbmd9IHVzZXIgLSB0aGUgdXNlciB3aG8gb3ducyB0aGUgcmVzcG9zaXRvcnlcbiAgICAqIEBwYXJhbSB7c3RyaW5nfSByZXBvIC0gdGhlIG5hbWUgb2YgdGhlIHJlcG9zaXRvcnlcbiAgICAqIEByZXR1cm4ge0lzc3VlfVxuICAgICovXG4gICBnZXRJc3N1ZXModXNlciwgcmVwbykge1xuICAgICAgcmV0dXJuIG5ldyBJc3N1ZSh0aGlzLl9nZXRGdWxsTmFtZSh1c2VyLCByZXBvKSwgdGhpcy5fX2F1dGgsIHRoaXMuX19hcGlCYXNlKTtcbiAgIH1cblxuICAgLyoqXG4gICAgKiBDcmVhdGUgYSBuZXcgU2VhcmNoIHdyYXBwZXJcbiAgICAqIEBwYXJhbSB7c3RyaW5nfSBxdWVyeSAtIHRoZSBxdWVyeSB0byBzZWFyY2ggZm9yXG4gICAgKiBAcmV0dXJuIHtTZWFyY2h9XG4gICAgKi9cbiAgIHNlYXJjaChxdWVyeSkge1xuICAgICAgcmV0dXJuIG5ldyBTZWFyY2gocXVlcnksIHRoaXMuX19hdXRoLCB0aGlzLl9fYXBpQmFzZSk7XG4gICB9XG5cbiAgIC8qKlxuICAgICogQ3JlYXRlIGEgbmV3IFJhdGVMaW1pdCB3cmFwcGVyXG4gICAgKiBAcmV0dXJuIHtSYXRlTGltaXR9XG4gICAgKi9cbiAgIGdldFJhdGVMaW1pdCgpIHtcbiAgICAgIHJldHVybiBuZXcgUmF0ZUxpbWl0KHRoaXMuX19hdXRoLCB0aGlzLl9fYXBpQmFzZSk7XG4gICB9XG5cbiAgIC8qKlxuICAgICogQ3JlYXRlIGEgbmV3IE1hcmtkb3duIHdyYXBwZXJcbiAgICAqIEByZXR1cm4ge01hcmtkb3dufVxuICAgICovXG4gICBnZXRNYXJrZG93bigpIHtcbiAgICAgIHJldHVybiBuZXcgTWFya2Rvd24odGhpcy5fX2F1dGgsIHRoaXMuX19hcGlCYXNlKTtcbiAgIH1cblxuICAgLyoqXG4gICAgKiBDb21wdXRlcyB0aGUgZnVsbCByZXBvc2l0b3J5IG5hbWVcbiAgICAqIEBwYXJhbSB7c3RyaW5nfSB1c2VyIC0gdGhlIHVzZXJuYW1lIChvciB0aGUgZnVsbCBuYW1lKVxuICAgICogQHBhcmFtIHtzdHJpbmd9IHJlcG8gLSB0aGUgcmVwb3NpdG9yeSBuYW1lLCBtdXN0IG5vdCBiZSBwYXNzZWQgaWYgYHVzZXJgIGlzIHRoZSBmdWxsIG5hbWVcbiAgICAqIEByZXR1cm4ge3N0cmluZ30gdGhlIHJlcG9zaXRvcnkncyBmdWxsIG5hbWVcbiAgICAqL1xuICAgX2dldEZ1bGxOYW1lKHVzZXIsIHJlcG8pIHtcbiAgICAgIGxldCBmdWxsbmFtZSA9IHVzZXI7XG5cbiAgICAgIGlmIChyZXBvKSB7XG4gICAgICAgICBmdWxsbmFtZSA9IGAke3VzZXJ9LyR7cmVwb31gO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZnVsbG5hbWU7XG4gICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gR2l0SHViO1xuIl19
//# sourceMappingURL=GitHub.js.map
