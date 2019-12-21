(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['module', './Requestable'], factory);
  } else if (typeof exports !== "undefined") {
    factory(module, require('./Requestable'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod, global.Requestable);
    global.Gist = mod.exports;
  }
})(this, function (module, _Requestable2) {
  'use strict';

  var _Requestable3 = _interopRequireDefault(_Requestable2);

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

  var Gist = function (_Requestable) {
    _inherits(Gist, _Requestable);

    /**
     * Create a Gist.
     * @param {string} id - the id of the gist (not required when creating a gist)
     * @param {Requestable.auth} [auth] - information required to authenticate to Github
     * @param {string} [apiBase=https://api.github.com] - the base Github API URL
     */
    function Gist(id, auth, apiBase) {
      _classCallCheck(this, Gist);

      var _this = _possibleConstructorReturn(this, (Gist.__proto__ || Object.getPrototypeOf(Gist)).call(this, auth, apiBase));

      _this.__id = id;
      return _this;
    }

    /**
     * Fetch a gist.
     * @see https://developer.github.com/v3/gists/#get-a-single-gist
     * @param {Requestable.callback} [cb] - will receive the gist
     * @return {Promise} - the Promise for the http request
     */


    _createClass(Gist, [{
      key: 'read',
      value: function read(cb) {
        return this._request('GET', '/gists/' + this.__id, null, cb);
      }
    }, {
      key: 'create',
      value: function create(gist, cb) {
        var _this2 = this;

        return this._request('POST', '/gists', gist, cb).then(function (response) {
          _this2.__id = response.data.id;
          return response;
        });
      }
    }, {
      key: 'delete',
      value: function _delete(cb) {
        return this._request('DELETE', '/gists/' + this.__id, null, cb);
      }
    }, {
      key: 'fork',
      value: function fork(cb) {
        return this._request('POST', '/gists/' + this.__id + '/forks', null, cb);
      }
    }, {
      key: 'update',
      value: function update(gist, cb) {
        return this._request('PATCH', '/gists/' + this.__id, gist, cb);
      }
    }, {
      key: 'star',
      value: function star(cb) {
        return this._request('PUT', '/gists/' + this.__id + '/star', null, cb);
      }
    }, {
      key: 'unstar',
      value: function unstar(cb) {
        return this._request('DELETE', '/gists/' + this.__id + '/star', null, cb);
      }
    }, {
      key: 'isStarred',
      value: function isStarred(cb) {
        return this._request204or404('/gists/' + this.__id + '/star', null, cb);
      }
    }, {
      key: 'listComments',
      value: function listComments(cb) {
        return this._requestAllPages('/gists/' + this.__id + '/comments', null, cb);
      }
    }, {
      key: 'getComment',
      value: function getComment(comment, cb) {
        return this._request('GET', '/gists/' + this.__id + '/comments/' + comment, null, cb);
      }
    }, {
      key: 'createComment',
      value: function createComment(comment, cb) {
        return this._request('POST', '/gists/' + this.__id + '/comments', { body: comment }, cb);
      }
    }, {
      key: 'editComment',
      value: function editComment(comment, body, cb) {
        return this._request('PATCH', '/gists/' + this.__id + '/comments/' + comment, { body: body }, cb);
      }
    }, {
      key: 'deleteComment',
      value: function deleteComment(comment, cb) {
        return this._request('DELETE', '/gists/' + this.__id + '/comments/' + comment, null, cb);
      }
    }]);

    return Gist;
  }(_Requestable3.default);

  module.exports = Gist;
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkdpc3QuanMiXSwibmFtZXMiOlsiR2lzdCIsImlkIiwiYXV0aCIsImFwaUJhc2UiLCJfX2lkIiwiY2IiLCJfcmVxdWVzdCIsImdpc3QiLCJ0aGVuIiwicmVzcG9uc2UiLCJkYXRhIiwiX3JlcXVlc3QyMDRvcjQwNCIsIl9yZXF1ZXN0QWxsUGFnZXMiLCJjb21tZW50IiwiYm9keSIsIlJlcXVlc3RhYmxlIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7TUFZTUEsSTs7O0FBQ0g7Ozs7OztBQU1BLGtCQUFZQyxFQUFaLEVBQWdCQyxJQUFoQixFQUFzQkMsT0FBdEIsRUFBK0I7QUFBQTs7QUFBQSw4R0FDdEJELElBRHNCLEVBQ2hCQyxPQURnQjs7QUFFNUIsWUFBS0MsSUFBTCxHQUFZSCxFQUFaO0FBRjRCO0FBRzlCOztBQUVEOzs7Ozs7Ozs7OzJCQU1LSSxFLEVBQUk7QUFDTixlQUFPLEtBQUtDLFFBQUwsQ0FBYyxLQUFkLGNBQStCLEtBQUtGLElBQXBDLEVBQTRDLElBQTVDLEVBQWtEQyxFQUFsRCxDQUFQO0FBQ0Y7Ozs2QkFTTUUsSSxFQUFNRixFLEVBQUk7QUFBQTs7QUFDZCxlQUFPLEtBQUtDLFFBQUwsQ0FBYyxNQUFkLEVBQXNCLFFBQXRCLEVBQWdDQyxJQUFoQyxFQUFzQ0YsRUFBdEMsRUFDSEcsSUFERyxDQUNFLFVBQUNDLFFBQUQsRUFBYztBQUNqQixpQkFBS0wsSUFBTCxHQUFZSyxTQUFTQyxJQUFULENBQWNULEVBQTFCO0FBQ0EsaUJBQU9RLFFBQVA7QUFDRixTQUpHLENBQVA7QUFLRjs7OzhCQVFNSixFLEVBQUk7QUFDUixlQUFPLEtBQUtDLFFBQUwsQ0FBYyxRQUFkLGNBQWtDLEtBQUtGLElBQXZDLEVBQStDLElBQS9DLEVBQXFEQyxFQUFyRCxDQUFQO0FBQ0Y7OzsyQkFRSUEsRSxFQUFJO0FBQ04sZUFBTyxLQUFLQyxRQUFMLENBQWMsTUFBZCxjQUFnQyxLQUFLRixJQUFyQyxhQUFtRCxJQUFuRCxFQUF5REMsRUFBekQsQ0FBUDtBQUNGOzs7NkJBU01FLEksRUFBTUYsRSxFQUFJO0FBQ2QsZUFBTyxLQUFLQyxRQUFMLENBQWMsT0FBZCxjQUFpQyxLQUFLRixJQUF0QyxFQUE4Q0csSUFBOUMsRUFBb0RGLEVBQXBELENBQVA7QUFDRjs7OzJCQVFJQSxFLEVBQUk7QUFDTixlQUFPLEtBQUtDLFFBQUwsQ0FBYyxLQUFkLGNBQStCLEtBQUtGLElBQXBDLFlBQWlELElBQWpELEVBQXVEQyxFQUF2RCxDQUFQO0FBQ0Y7Ozs2QkFRTUEsRSxFQUFJO0FBQ1IsZUFBTyxLQUFLQyxRQUFMLENBQWMsUUFBZCxjQUFrQyxLQUFLRixJQUF2QyxZQUFvRCxJQUFwRCxFQUEwREMsRUFBMUQsQ0FBUDtBQUNGOzs7Z0NBUVNBLEUsRUFBSTtBQUNYLGVBQU8sS0FBS00sZ0JBQUwsYUFBZ0MsS0FBS1AsSUFBckMsWUFBa0QsSUFBbEQsRUFBd0RDLEVBQXhELENBQVA7QUFDRjs7O21DQVFZQSxFLEVBQUk7QUFDZCxlQUFPLEtBQUtPLGdCQUFMLGFBQWdDLEtBQUtSLElBQXJDLGdCQUFzRCxJQUF0RCxFQUE0REMsRUFBNUQsQ0FBUDtBQUNGOzs7aUNBU1VRLE8sRUFBU1IsRSxFQUFJO0FBQ3JCLGVBQU8sS0FBS0MsUUFBTCxDQUFjLEtBQWQsY0FBK0IsS0FBS0YsSUFBcEMsa0JBQXFEUyxPQUFyRCxFQUFnRSxJQUFoRSxFQUFzRVIsRUFBdEUsQ0FBUDtBQUNGOzs7b0NBU2FRLE8sRUFBU1IsRSxFQUFJO0FBQ3hCLGVBQU8sS0FBS0MsUUFBTCxDQUFjLE1BQWQsY0FBZ0MsS0FBS0YsSUFBckMsZ0JBQXNELEVBQUNVLE1BQU1ELE9BQVAsRUFBdEQsRUFBdUVSLEVBQXZFLENBQVA7QUFDRjs7O2tDQVVXUSxPLEVBQVNDLEksRUFBTVQsRSxFQUFJO0FBQzVCLGVBQU8sS0FBS0MsUUFBTCxDQUFjLE9BQWQsY0FBaUMsS0FBS0YsSUFBdEMsa0JBQXVEUyxPQUF2RCxFQUFrRSxFQUFDQyxNQUFNQSxJQUFQLEVBQWxFLEVBQWdGVCxFQUFoRixDQUFQO0FBQ0Y7OztvQ0FTYVEsTyxFQUFTUixFLEVBQUk7QUFDeEIsZUFBTyxLQUFLQyxRQUFMLENBQWMsUUFBZCxjQUFrQyxLQUFLRixJQUF2QyxrQkFBd0RTLE9BQXhELEVBQW1FLElBQW5FLEVBQXlFUixFQUF6RSxDQUFQO0FBQ0Y7Ozs7SUF2SmVVLHFCOztBQTBKbkJDLFNBQU9DLE9BQVAsR0FBaUJqQixJQUFqQiIsImZpbGUiOiJHaXN0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZVxuICogQGNvcHlyaWdodCAgMjAxMyBNaWNoYWVsIEF1ZnJlaXRlciAoRGV2ZWxvcG1lbnQgU2VlZCkgYW5kIDIwMTYgWWFob28gSW5jLlxuICogQGxpY2Vuc2UgICAgTGljZW5zZWQgdW5kZXIge0BsaW5rIGh0dHBzOi8vc3BkeC5vcmcvbGljZW5zZXMvQlNELTMtQ2xhdXNlLUNsZWFyLmh0bWwgQlNELTMtQ2xhdXNlLUNsZWFyfS5cbiAqICAgICAgICAgICAgIEdpdGh1Yi5qcyBpcyBmcmVlbHkgZGlzdHJpYnV0YWJsZS5cbiAqL1xuXG5pbXBvcnQgUmVxdWVzdGFibGUgZnJvbSAnLi9SZXF1ZXN0YWJsZSc7XG5cbi8qKlxuICogQSBHaXN0IGNhbiByZXRyaWV2ZSBhbmQgbW9kaWZ5IGdpc3RzLlxuICovXG5jbGFzcyBHaXN0IGV4dGVuZHMgUmVxdWVzdGFibGUge1xuICAgLyoqXG4gICAgKiBDcmVhdGUgYSBHaXN0LlxuICAgICogQHBhcmFtIHtzdHJpbmd9IGlkIC0gdGhlIGlkIG9mIHRoZSBnaXN0IChub3QgcmVxdWlyZWQgd2hlbiBjcmVhdGluZyBhIGdpc3QpXG4gICAgKiBAcGFyYW0ge1JlcXVlc3RhYmxlLmF1dGh9IFthdXRoXSAtIGluZm9ybWF0aW9uIHJlcXVpcmVkIHRvIGF1dGhlbnRpY2F0ZSB0byBHaXRodWJcbiAgICAqIEBwYXJhbSB7c3RyaW5nfSBbYXBpQmFzZT1odHRwczovL2FwaS5naXRodWIuY29tXSAtIHRoZSBiYXNlIEdpdGh1YiBBUEkgVVJMXG4gICAgKi9cbiAgIGNvbnN0cnVjdG9yKGlkLCBhdXRoLCBhcGlCYXNlKSB7XG4gICAgICBzdXBlcihhdXRoLCBhcGlCYXNlKTtcbiAgICAgIHRoaXMuX19pZCA9IGlkO1xuICAgfVxuXG4gICAvKipcbiAgICAqIEZldGNoIGEgZ2lzdC5cbiAgICAqIEBzZWUgaHR0cHM6Ly9kZXZlbG9wZXIuZ2l0aHViLmNvbS92My9naXN0cy8jZ2V0LWEtc2luZ2xlLWdpc3RcbiAgICAqIEBwYXJhbSB7UmVxdWVzdGFibGUuY2FsbGJhY2t9IFtjYl0gLSB3aWxsIHJlY2VpdmUgdGhlIGdpc3RcbiAgICAqIEByZXR1cm4ge1Byb21pc2V9IC0gdGhlIFByb21pc2UgZm9yIHRoZSBodHRwIHJlcXVlc3RcbiAgICAqL1xuICAgcmVhZChjYikge1xuICAgICAgcmV0dXJuIHRoaXMuX3JlcXVlc3QoJ0dFVCcsIGAvZ2lzdHMvJHt0aGlzLl9faWR9YCwgbnVsbCwgY2IpO1xuICAgfVxuXG4gICAvKipcbiAgICAqIENyZWF0ZSBhIG5ldyBnaXN0LlxuICAgICogQHNlZSBodHRwczovL2RldmVsb3Blci5naXRodWIuY29tL3YzL2dpc3RzLyNjcmVhdGUtYS1naXN0XG4gICAgKiBAcGFyYW0ge09iamVjdH0gZ2lzdCAtIHRoZSBkYXRhIGZvciB0aGUgbmV3IGdpc3RcbiAgICAqIEBwYXJhbSB7UmVxdWVzdGFibGUuY2FsbGJhY2t9IFtjYl0gLSB3aWxsIHJlY2VpdmUgdGhlIG5ldyBnaXN0IHVwb24gY3JlYXRpb25cbiAgICAqIEByZXR1cm4ge1Byb21pc2V9IC0gdGhlIFByb21pc2UgZm9yIHRoZSBodHRwIHJlcXVlc3RcbiAgICAqL1xuICAgY3JlYXRlKGdpc3QsIGNiKSB7XG4gICAgICByZXR1cm4gdGhpcy5fcmVxdWVzdCgnUE9TVCcsICcvZ2lzdHMnLCBnaXN0LCBjYilcbiAgICAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5fX2lkID0gcmVzcG9uc2UuZGF0YS5pZDtcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICAgICAgIH0pO1xuICAgfVxuXG4gICAvKipcbiAgICAqIERlbGV0ZSBhIGdpc3QuXG4gICAgKiBAc2VlIGh0dHBzOi8vZGV2ZWxvcGVyLmdpdGh1Yi5jb20vdjMvZ2lzdHMvI2RlbGV0ZS1hLWdpc3RcbiAgICAqIEBwYXJhbSB7UmVxdWVzdGFibGUuY2FsbGJhY2t9IFtjYl0gLSB3aWxsIHJlY2VpdmUgdHJ1ZSBpZiB0aGUgcmVxdWVzdCBzdWNjZWVkc1xuICAgICogQHJldHVybiB7UHJvbWlzZX0gLSB0aGUgUHJvbWlzZSBmb3IgdGhlIGh0dHAgcmVxdWVzdFxuICAgICovXG4gICBkZWxldGUoY2IpIHtcbiAgICAgIHJldHVybiB0aGlzLl9yZXF1ZXN0KCdERUxFVEUnLCBgL2dpc3RzLyR7dGhpcy5fX2lkfWAsIG51bGwsIGNiKTtcbiAgIH1cblxuICAgLyoqXG4gICAgKiBGb3JrIGEgZ2lzdC5cbiAgICAqIEBzZWUgaHR0cHM6Ly9kZXZlbG9wZXIuZ2l0aHViLmNvbS92My9naXN0cy8jZm9yay1hLWdpc3RcbiAgICAqIEBwYXJhbSB7UmVxdWVzdGFibGUuY2FsbGJhY2t9IFtjYl0gLSB0aGUgZnVuY3Rpb24gdGhhdCB3aWxsIHJlY2VpdmUgdGhlIGdpc3RcbiAgICAqIEByZXR1cm4ge1Byb21pc2V9IC0gdGhlIFByb21pc2UgZm9yIHRoZSBodHRwIHJlcXVlc3RcbiAgICAqL1xuICAgZm9yayhjYikge1xuICAgICAgcmV0dXJuIHRoaXMuX3JlcXVlc3QoJ1BPU1QnLCBgL2dpc3RzLyR7dGhpcy5fX2lkfS9mb3Jrc2AsIG51bGwsIGNiKTtcbiAgIH1cblxuICAgLyoqXG4gICAgKiBVcGRhdGUgYSBnaXN0LlxuICAgICogQHNlZSBodHRwczovL2RldmVsb3Blci5naXRodWIuY29tL3YzL2dpc3RzLyNlZGl0LWEtZ2lzdFxuICAgICogQHBhcmFtIHtPYmplY3R9IGdpc3QgLSB0aGUgbmV3IGRhdGEgZm9yIHRoZSBnaXN0XG4gICAgKiBAcGFyYW0ge1JlcXVlc3RhYmxlLmNhbGxiYWNrfSBbY2JdIC0gdGhlIGZ1bmN0aW9uIHRoYXQgcmVjZWl2ZXMgdGhlIEFQSSByZXN1bHRcbiAgICAqIEByZXR1cm4ge1Byb21pc2V9IC0gdGhlIFByb21pc2UgZm9yIHRoZSBodHRwIHJlcXVlc3RcbiAgICAqL1xuICAgdXBkYXRlKGdpc3QsIGNiKSB7XG4gICAgICByZXR1cm4gdGhpcy5fcmVxdWVzdCgnUEFUQ0gnLCBgL2dpc3RzLyR7dGhpcy5fX2lkfWAsIGdpc3QsIGNiKTtcbiAgIH1cblxuICAgLyoqXG4gICAgKiBTdGFyIGEgZ2lzdC5cbiAgICAqIEBzZWUgaHR0cHM6Ly9kZXZlbG9wZXIuZ2l0aHViLmNvbS92My9naXN0cy8jc3Rhci1hLWdpc3RcbiAgICAqIEBwYXJhbSB7UmVxdWVzdGFibGUuY2FsbGJhY2t9IFtjYl0gLSB3aWxsIHJlY2VpdmUgdHJ1ZSBpZiB0aGUgcmVxdWVzdCBpcyBzdWNjZXNzZnVsXG4gICAgKiBAcmV0dXJuIHtQcm9taXNlfSAtIHRoZSBQcm9taXNlIGZvciB0aGUgaHR0cCByZXF1ZXN0XG4gICAgKi9cbiAgIHN0YXIoY2IpIHtcbiAgICAgIHJldHVybiB0aGlzLl9yZXF1ZXN0KCdQVVQnLCBgL2dpc3RzLyR7dGhpcy5fX2lkfS9zdGFyYCwgbnVsbCwgY2IpO1xuICAgfVxuXG4gICAvKipcbiAgICAqIFVuc3RhciBhIGdpc3QuXG4gICAgKiBAc2VlIGh0dHBzOi8vZGV2ZWxvcGVyLmdpdGh1Yi5jb20vdjMvZ2lzdHMvI3Vuc3Rhci1hLWdpc3RcbiAgICAqIEBwYXJhbSB7UmVxdWVzdGFibGUuY2FsbGJhY2t9IFtjYl0gLSB3aWxsIHJlY2VpdmUgdHJ1ZSBpZiB0aGUgcmVxdWVzdCBpcyBzdWNjZXNzZnVsXG4gICAgKiBAcmV0dXJuIHtQcm9taXNlfSAtIHRoZSBQcm9taXNlIGZvciB0aGUgaHR0cCByZXF1ZXN0XG4gICAgKi9cbiAgIHVuc3RhcihjYikge1xuICAgICAgcmV0dXJuIHRoaXMuX3JlcXVlc3QoJ0RFTEVURScsIGAvZ2lzdHMvJHt0aGlzLl9faWR9L3N0YXJgLCBudWxsLCBjYik7XG4gICB9XG5cbiAgIC8qKlxuICAgICogQ2hlY2sgaWYgYSBnaXN0IGlzIHN0YXJyZWQgYnkgdGhlIHVzZXIuXG4gICAgKiBAc2VlIGh0dHBzOi8vZGV2ZWxvcGVyLmdpdGh1Yi5jb20vdjMvZ2lzdHMvI2NoZWNrLWlmLWEtZ2lzdC1pcy1zdGFycmVkXG4gICAgKiBAcGFyYW0ge1JlcXVlc3RhYmxlLmNhbGxiYWNrfSBbY2JdIC0gd2lsbCByZWNlaXZlIHRydWUgaWYgdGhlIGdpc3QgaXMgc3RhcnJlZCBhbmQgZmFsc2UgaWYgdGhlIGdpc3QgaXMgbm90IHN0YXJyZWRcbiAgICAqIEByZXR1cm4ge1Byb21pc2V9IC0gdGhlIFByb21pc2UgZm9yIHRoZSBodHRwIHJlcXVlc3RcbiAgICAqL1xuICAgaXNTdGFycmVkKGNiKSB7XG4gICAgICByZXR1cm4gdGhpcy5fcmVxdWVzdDIwNG9yNDA0KGAvZ2lzdHMvJHt0aGlzLl9faWR9L3N0YXJgLCBudWxsLCBjYik7XG4gICB9XG5cbiAgIC8qKlxuICAgICogTGlzdCB0aGUgZ2lzdCdzIGNvbW1lbnRzXG4gICAgKiBAc2VlIGh0dHBzOi8vZGV2ZWxvcGVyLmdpdGh1Yi5jb20vdjMvZ2lzdHMvY29tbWVudHMvI2xpc3QtY29tbWVudHMtb24tYS1naXN0XG4gICAgKiBAcGFyYW0ge1JlcXVlc3RhYmxlLmNhbGxiYWNrfSBbY2JdIC0gd2lsbCByZWNlaXZlIHRoZSBhcnJheSBvZiBjb21tZW50c1xuICAgICogQHJldHVybiB7UHJvbWlzZX0gLSB0aGUgcHJvbWlzZSBmb3IgdGhlIGh0dHAgcmVxdWVzdFxuICAgICovXG4gICBsaXN0Q29tbWVudHMoY2IpIHtcbiAgICAgIHJldHVybiB0aGlzLl9yZXF1ZXN0QWxsUGFnZXMoYC9naXN0cy8ke3RoaXMuX19pZH0vY29tbWVudHNgLCBudWxsLCBjYik7XG4gICB9XG5cbiAgIC8qKlxuICAgICogRmV0Y2ggb25lIG9mIHRoZSBnaXN0J3MgY29tbWVudHNcbiAgICAqIEBzZWUgaHR0cHM6Ly9kZXZlbG9wZXIuZ2l0aHViLmNvbS92My9naXN0cy9jb21tZW50cy8jZ2V0LWEtc2luZ2xlLWNvbW1lbnRcbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBjb21tZW50IC0gdGhlIGlkIG9mIHRoZSBjb21tZW50XG4gICAgKiBAcGFyYW0ge1JlcXVlc3RhYmxlLmNhbGxiYWNrfSBbY2JdIC0gd2lsbCByZWNlaXZlIHRoZSBjb21tZW50XG4gICAgKiBAcmV0dXJuIHtQcm9taXNlfSAtIHRoZSBQcm9taXNlIGZvciB0aGUgaHR0cCByZXF1ZXN0XG4gICAgKi9cbiAgIGdldENvbW1lbnQoY29tbWVudCwgY2IpIHtcbiAgICAgIHJldHVybiB0aGlzLl9yZXF1ZXN0KCdHRVQnLCBgL2dpc3RzLyR7dGhpcy5fX2lkfS9jb21tZW50cy8ke2NvbW1lbnR9YCwgbnVsbCwgY2IpO1xuICAgfVxuXG4gICAvKipcbiAgICAqIENvbW1lbnQgb24gYSBnaXN0XG4gICAgKiBAc2VlIGh0dHBzOi8vZGV2ZWxvcGVyLmdpdGh1Yi5jb20vdjMvZ2lzdHMvY29tbWVudHMvI2NyZWF0ZS1hLWNvbW1lbnRcbiAgICAqIEBwYXJhbSB7c3RyaW5nfSBjb21tZW50IC0gdGhlIGNvbW1lbnQgdG8gYWRkXG4gICAgKiBAcGFyYW0ge1JlcXVlc3RhYmxlLmNhbGxiYWNrfSBbY2JdIC0gdGhlIGZ1bmN0aW9uIHRoYXQgcmVjZWl2ZXMgdGhlIEFQSSByZXN1bHRcbiAgICAqIEByZXR1cm4ge1Byb21pc2V9IC0gdGhlIFByb21pc2UgZm9yIHRoZSBodHRwIHJlcXVlc3RcbiAgICAqL1xuICAgY3JlYXRlQ29tbWVudChjb21tZW50LCBjYikge1xuICAgICAgcmV0dXJuIHRoaXMuX3JlcXVlc3QoJ1BPU1QnLCBgL2dpc3RzLyR7dGhpcy5fX2lkfS9jb21tZW50c2AsIHtib2R5OiBjb21tZW50fSwgY2IpO1xuICAgfVxuXG4gICAvKipcbiAgICAqIEVkaXQgYSBjb21tZW50IG9uIHRoZSBnaXN0XG4gICAgKiBAc2VlIGh0dHBzOi8vZGV2ZWxvcGVyLmdpdGh1Yi5jb20vdjMvZ2lzdHMvY29tbWVudHMvI2VkaXQtYS1jb21tZW50XG4gICAgKiBAcGFyYW0ge251bWJlcn0gY29tbWVudCAtIHRoZSBpZCBvZiB0aGUgY29tbWVudFxuICAgICogQHBhcmFtIHtzdHJpbmd9IGJvZHkgLSB0aGUgbmV3IGNvbW1lbnRcbiAgICAqIEBwYXJhbSB7UmVxdWVzdGFibGUuY2FsbGJhY2t9IFtjYl0gLSB3aWxsIHJlY2VpdmUgdGhlIG1vZGlmaWVkIGNvbW1lbnRcbiAgICAqIEByZXR1cm4ge1Byb21pc2V9IC0gdGhlIHByb21pc2UgZm9yIHRoZSBodHRwIHJlcXVlc3RcbiAgICAqL1xuICAgZWRpdENvbW1lbnQoY29tbWVudCwgYm9keSwgY2IpIHtcbiAgICAgIHJldHVybiB0aGlzLl9yZXF1ZXN0KCdQQVRDSCcsIGAvZ2lzdHMvJHt0aGlzLl9faWR9L2NvbW1lbnRzLyR7Y29tbWVudH1gLCB7Ym9keTogYm9keX0sIGNiKTtcbiAgIH1cblxuICAgLyoqXG4gICAgKiBEZWxldGUgYSBjb21tZW50IG9uIHRoZSBnaXN0LlxuICAgICogQHNlZSBodHRwczovL2RldmVsb3Blci5naXRodWIuY29tL3YzL2dpc3RzL2NvbW1lbnRzLyNkZWxldGUtYS1jb21tZW50XG4gICAgKiBAcGFyYW0ge251bWJlcn0gY29tbWVudCAtIHRoZSBpZCBvZiB0aGUgY29tbWVudFxuICAgICogQHBhcmFtIHtSZXF1ZXN0YWJsZS5jYWxsYmFja30gW2NiXSAtIHdpbGwgcmVjZWl2ZSB0cnVlIGlmIHRoZSByZXF1ZXN0IHN1Y2NlZWRzXG4gICAgKiBAcmV0dXJuIHtQcm9taXNlfSAtIHRoZSBQcm9taXNlIGZvciB0aGUgaHR0cCByZXF1ZXN0XG4gICAgKi9cbiAgIGRlbGV0ZUNvbW1lbnQoY29tbWVudCwgY2IpIHtcbiAgICAgIHJldHVybiB0aGlzLl9yZXF1ZXN0KCdERUxFVEUnLCBgL2dpc3RzLyR7dGhpcy5fX2lkfS9jb21tZW50cy8ke2NvbW1lbnR9YCwgbnVsbCwgY2IpO1xuICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEdpc3Q7XG4iXX0=
//# sourceMappingURL=Gist.js.map
