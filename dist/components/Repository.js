(function (global, factory) {
   if (typeof define === "function" && define.amd) {
      define(['module', './Requestable', 'utf8', 'js-base64', 'debug'], factory);
   } else if (typeof exports !== "undefined") {
      factory(module, require('./Requestable'), require('utf8'), require('js-base64'), require('debug'));
   } else {
      var mod = {
         exports: {}
      };
      factory(mod, global.Requestable, global.utf8, global.jsBase64, global.debug);
      global.Repository = mod.exports;
   }
})(this, function (module, _Requestable2, _utf, _jsBase, _debug) {
   'use strict';

   var _Requestable3 = _interopRequireDefault(_Requestable2);

   var _utf2 = _interopRequireDefault(_utf);

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

   var log = (0, _debug2.default)('github:repository');

   /**
    * Respository encapsulates the functionality to create, query, and modify files.
    */

   var Repository = function (_Requestable) {
      _inherits(Repository, _Requestable);

      /**
       * Create a Repository.
       * @param {string} fullname - the full name of the repository
       * @param {Requestable.auth} [auth] - information required to authenticate to Github
       * @param {string} [apiBase=https://api.github.com] - the base Github API URL
       */
      function Repository(fullname, auth, apiBase) {
         _classCallCheck(this, Repository);

         var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Repository).call(this, auth, apiBase));

         _this.__fullname = fullname;
         _this.__currentTree = {
            branch: null,
            sha: null
         };
         return _this;
      }

      /**
       * Get a reference
       * @see https://developer.github.com/v3/git/refs/#get-a-reference
       * @param {string} ref - the reference to get
       * @param {Requestable.callback} [cb] - will receive the reference's refSpec or a list of refSpecs that match `ref`
       * @return {Promise} - the promise for the http request
       */


      _createClass(Repository, [{
         key: 'getRef',
         value: function getRef(ref, cb) {
            return this._request('GET', '/repos/' + this.__fullname + '/git/refs/' + ref, null, cb);
         }
      }, {
         key: 'createRef',
         value: function createRef(options, cb) {
            return this._request('POST', '/repos/' + this.__fullname + '/git/refs', options, cb);
         }
      }, {
         key: 'deleteRef',
         value: function deleteRef(ref, cb) {
            return this._request('DELETE', '/repos/' + this.__fullname + '/git/refs/' + ref, null, cb);
         }
      }, {
         key: 'deleteRepo',
         value: function deleteRepo(cb) {
            return this._request('DELETE', '/repos/' + this.__fullname, null, cb);
         }
      }, {
         key: 'listTags',
         value: function listTags(cb) {
            return this._request('GET', '/repos/' + this.__fullname + '/tags', null, cb);
         }
      }, {
         key: 'listPullRequests',
         value: function listPullRequests(options, cb) {
            options = options || {};
            return this._request('GET', '/repos/' + this.__fullname + '/pulls', options, cb);
         }
      }, {
         key: 'getPullRequest',
         value: function getPullRequest(number, cb) {
            return this._request('GET', '/repos/' + this.__fullname + '/pulls/' + number, null, cb);
         }
      }, {
         key: 'listPullRequestFiles',
         value: function listPullRequestFiles(number, cb) {
            return this._request('GET', '/repos/' + this.__fullname + '/pulls/' + number + '/files', null, cb);
         }
      }, {
         key: 'compareBranches',
         value: function compareBranches(base, head, cb) {
            return this._request('GET', '/repos/' + this.__fullname + '/compare/' + base + '...' + head, null, cb);
         }
      }, {
         key: 'listBranches',
         value: function listBranches(cb) {
            return this._request('GET', '/repos/' + this.__fullname + '/branches', null, cb);
         }
      }, {
         key: 'getBlob',
         value: function getBlob(sha, cb) {
            return this._request('GET', '/repos/' + this.__fullname + '/git/blobs/' + sha, null, cb, 'raw');
         }
      }, {
         key: 'getCommit',
         value: function getCommit(sha, cb) {
            return this._request('GET', '/repos/' + this.__fullname + '/git/commits/' + sha, null, cb);
         }
      }, {
         key: 'listCommits',
         value: function listCommits(options, cb) {
            options = options || {};

            options.since = this._dateToISO(options.since);
            options.until = this._dateToISO(options.until);

            return this._request('GET', '/repos/' + this.__fullname + '/commits', options, cb);
         }
      }, {
         key: 'getSingleCommit',
         value: function getSingleCommit(ref, cb) {
            ref = ref || '';
            return this._request('GET', '/repos/' + this.__fullname + '/commits/' + ref, null, cb);
         }
      }, {
         key: 'getSha',
         value: function getSha(branch, path, cb) {
            branch = branch ? '?ref=' + branch : '';
            return this._request('GET', '/repos/' + this.__fullname + '/contents/' + path + branch, null, cb);
         }
      }, {
         key: 'listStatuses',
         value: function listStatuses(sha, cb) {
            return this._request('GET', '/repos/' + this.__fullname + '/commits/' + sha + '/statuses', null, cb);
         }
      }, {
         key: 'getTree',
         value: function getTree(treeSHA, cb) {
            return this._request('GET', '/repos/' + this.__fullname + '/git/trees/' + treeSHA, null, cb);
         }
      }, {
         key: 'createBlob',
         value: function createBlob(content, cb) {
            var postBody = this._getContentObject(content);

            log('sending content', postBody);
            return this._request('POST', '/repos/' + this.__fullname + '/git/blobs', postBody, cb);
         }
      }, {
         key: '_getContentObject',
         value: function _getContentObject(content) {
            if (typeof content === 'string') {
               log('contet is a string');
               return {
                  content: _utf2.default.encode(content),
                  encoding: 'utf-8'
               };
            } else if (typeof Buffer !== 'undefined' && content instanceof Buffer) {
               log('We appear to be in Node');
               return {
                  content: content.toString('base64'),
                  encoding: 'base64'
               };
            } else if (typeof Blob !== 'undefined' && content instanceof Blob) {
               log('We appear to be in the browser');
               return {
                  content: _jsBase.Base64.encode(content),
                  encoding: 'base64'
               };
            } else {
               // eslint-disable-line
               log('Not sure what this content is: ' + (typeof content === 'undefined' ? 'undefined' : _typeof(content)) + ', ' + JSON.stringify(content));
               throw new Error('Unknown content passed to postBlob. Must be string or Buffer (node) or Blob (web)');
            }
         }
      }, {
         key: 'updateTree',
         value: function updateTree(baseTreeSHA, path, blobSHA, cb) {
            var newTree = {
               base_tree: baseTreeSHA, // eslint-disable-line
               tree: [{
                  path: path,
                  sha: blobSHA,
                  mode: '100644',
                  type: 'blob'
               }]
            };

            return this._request('POST', '/repos/' + this.__fullname + '/git/trees', newTree, cb);
         }
      }, {
         key: 'createTree',
         value: function createTree(tree, baseSHA, cb) {
            return this._request('POST', '/repos/' + this.__fullname + '/git/trees', {
               tree: tree,
               base_tree: baseSHA // eslint-disable-line
            }, cb);
         }
      }, {
         key: 'commit',
         value: function commit(parent, tree, message, cb) {
            var _this2 = this;

            var data = {
               message: message,
               tree: tree,
               parents: [parent]
            };

            return this._request('POST', '/repos/' + this.__fullname + '/git/commits', data, cb).then(function (response) {
               _this2.__currentTree.sha = response.data.sha; // Update latest commit
               return response;
            });
         }
      }, {
         key: 'updateHead',
         value: function updateHead(ref, commitSHA, force, cb) {
            return this._request('PATCH', '/repos/' + this.__fullname + '/git/refs/' + ref, {
               sha: commitSHA,
               force: force
            }, cb);
         }
      }, {
         key: 'getDetails',
         value: function getDetails(cb) {
            return this._request('GET', '/repos/' + this.__fullname, null, cb);
         }
      }, {
         key: 'getContributors',
         value: function getContributors(cb) {
            return this._request('GET', '/repos/' + this.__fullname + '/stats/contributors', null, cb);
         }
      }, {
         key: 'getCollaborators',
         value: function getCollaborators(cb) {
            return this._request('GET', '/repos/' + this.__fullname + '/collaborators', null, cb);
         }
      }, {
         key: 'isCollaborator',
         value: function isCollaborator(username, cb) {
            return this._request('GET', '/repos/' + this.__fullname + '/collaborators/' + username, null, cb);
         }
      }, {
         key: 'getContents',
         value: function getContents(ref, path, raw, cb) {
            path = path ? '' + encodeURI(path) : '';
            return this._request('GET', '/repos/' + this.__fullname + '/contents/' + path, {
               ref: ref
            }, cb, raw);
         }
      }, {
         key: 'getReadme',
         value: function getReadme(ref, raw, cb) {
            return this._request('GET', '/repos/' + this.__fullname + '/readme', {
               ref: ref
            }, cb, raw);
         }
      }, {
         key: 'fork',
         value: function fork(cb) {
            return this._request('POST', '/repos/' + this.__fullname + '/forks', null, cb);
         }
      }, {
         key: 'listForks',
         value: function listForks(cb) {
            return this._request('GET', '/repos/' + this.__fullname + '/forks', null, cb);
         }
      }, {
         key: 'createBranch',
         value: function createBranch(oldBranch, newBranch, cb) {
            var _this3 = this;

            if (typeof newBranch === 'function') {
               cb = newBranch;
               newBranch = oldBranch;
               oldBranch = 'master';
            }

            return this.getRef('heads/' + oldBranch).then(function (response) {
               var sha = response.data.object.sha;
               return _this3.createRef({
                  sha: sha,
                  ref: 'refs/heads/' + newBranch
               }, cb);
            });
         }
      }, {
         key: 'createPullRequest',
         value: function createPullRequest(options, cb) {
            return this._request('POST', '/repos/' + this.__fullname + '/pulls', options, cb);
         }
      }, {
         key: 'updatePullRequst',
         value: function updatePullRequst(number, options, cb) {
            return this._request('PATCH', '/repos/' + this.__fullname + '/pulls/' + number, options, cb);
         }
      }, {
         key: 'listHooks',
         value: function listHooks(cb) {
            return this._request('GET', '/repos/' + this.__fullname + '/hooks', null, cb);
         }
      }, {
         key: 'getHook',
         value: function getHook(id, cb) {
            return this._request('GET', '/repos/' + this.__fullname + '/hooks/' + id, null, cb);
         }
      }, {
         key: 'createHook',
         value: function createHook(options, cb) {
            return this._request('POST', '/repos/' + this.__fullname + '/hooks', options, cb);
         }
      }, {
         key: 'updateHook',
         value: function updateHook(id, options, cb) {
            return this._request('PATCH', '/repos/' + this.__fullname + '/hooks/' + id, options, cb);
         }
      }, {
         key: 'deleteHook',
         value: function deleteHook(id, cb) {
            return this._request('DELETE', this.__repoPath + '/hooks/' + id, null, cb);
         }
      }, {
         key: 'deleteFile',
         value: function deleteFile(branch, path, cb) {
            var _this4 = this;

            return this.getSha(branch, path).then(function (response) {
               var deleteCommit = {
                  message: 'Delete the file at \'' + path + '\'',
                  sha: response.data.sha,
                  branch: branch
               };
               return _this4._request('DELETE', '/repos/' + _this4.__fullname + '/contents/' + path, deleteCommit, cb);
            });
         }
      }, {
         key: 'move',
         value: function move(branch, oldPath, newPath, cb) {
            var _this5 = this;

            var oldSha = void 0;
            return this.getRef('heads/' + branch).then(function (_ref) {
               var object = _ref.data.object;
               return _this5.getTree(object.sha + '?recursive=true');
            }).then(function (_ref2) {
               var _ref2$data = _ref2.data;
               var tree = _ref2$data.tree;
               var sha = _ref2$data.sha;

               oldSha = sha;
               var newTree = tree.map(function (ref) {
                  if (ref.path === oldPath) {
                     ref.path = newPath;
                  }
                  if (ref.type === 'tree') {
                     delete ref.sha;
                  }
                  return ref;
               });
               return _this5.createTree(newTree);
            }).then(function (_ref3) {
               var tree = _ref3.data;
               return _this5.commit(oldSha, tree.sha, 'Renamed \'' + oldPath + '\' to \'' + newPath + '\'');
            }).then(function (_ref4) {
               var commit = _ref4.data;
               return _this5.updateHead('heads/' + branch, commit.sha, true, cb);
            });
         }
      }, {
         key: 'writeFile',
         value: function writeFile(branch, path, content, message, options, cb) {
            var _this6 = this;

            if (typeof options === 'function') {
               cb = options;
               options = {};
            }
            var filePath = path ? encodeURI(path) : '';
            var shouldEncode = options.encode !== false;
            var commit = {
               branch: branch,
               message: message,
               author: options.author,
               committer: options.committer,
               content: shouldEncode ? _jsBase.Base64.encode(content) : content
            };

            return this.getSha(branch, filePath).then(function (response) {
               commit.sha = response.data.sha;
               return _this6._request('PUT', '/repos/' + _this6.__fullname + '/contents/' + filePath, commit, cb);
            }, function () {
               return _this6._request('PUT', '/repos/' + _this6.__fullname + '/contents/' + filePath, commit, cb);
            });
         }
      }, {
         key: 'isStarred',
         value: function isStarred(cb) {
            return this._request204or404('/user/starred/' + this.__fullname, null, cb);
         }
      }, {
         key: 'star',
         value: function star(cb) {
            return this._request('PUT', '/user/starred/' + this.__fullname, null, cb);
         }
      }, {
         key: 'unstar',
         value: function unstar(cb) {
            return this._request('DELETE', '/user/starred/' + this.__fullname, null, cb);
         }
      }, {
         key: 'createRelease',
         value: function createRelease(options, cb) {
            return this._request('POST', '/repos/' + this.__fullname + '/releases', options, cb);
         }
      }, {
         key: 'updateRelease',
         value: function updateRelease(id, options, cb) {
            return this._request('PATCH', '/repos/' + this.__fullname + '/releases/' + id, options, cb);
         }
      }, {
         key: 'listReleases',
         value: function listReleases(cb) {
            return this._request('GET', '/repos/' + this.__fullname + '/releases', null, cb);
         }
      }, {
         key: 'getRelease',
         value: function getRelease(id, cb) {
            return this._request('GET', '/repos/' + this.__fullname + '/releases/' + id, null, cb);
         }
      }, {
         key: 'deleteRelease',
         value: function deleteRelease(id, cb) {
            return this._request('DELETE', '/repos/' + this.__fullname + '/releases/' + id, null, cb);
         }
      }, {
         key: 'mergePullRequest',
         value: function mergePullRequest(number, options, cb) {
            return this._request('PUT', '/repos/' + this.__fullname + '/pulls/' + number + '/merge', options, cb);
         }
      }]);

      return Repository;
   }(_Requestable3.default);

   module.exports = Repository;
});
//# sourceMappingURL=data:application/json;base64,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UDtBQUNGOzs7MENBVWdCLE0sRUFBUSxPLEVBQVMsRSxFQUFJO0FBQ25DLG1CQUFPLEtBQUssUUFBTCxDQUFjLEtBQWQsY0FBK0IsS0FBSyxVQUFwQyxlQUF3RCxNQUF4RCxhQUF3RSxPQUF4RSxFQUFpRixFQUFqRixDQUFQO0FBQ0Y7Ozs7OztBQUdKLFVBQU8sT0FBUCxHQUFpQixVQUFqQiIsImZpbGUiOiJSZXBvc2l0b3J5LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZVxuICogQGNvcHlyaWdodCAgMjAxMyBNaWNoYWVsIEF1ZnJlaXRlciAoRGV2ZWxvcG1lbnQgU2VlZCkgYW5kIDIwMTYgWWFob28gSW5jLlxuICogQGxpY2Vuc2UgICAgTGljZW5zZWQgdW5kZXIge0BsaW5rIGh0dHBzOi8vc3BkeC5vcmcvbGljZW5zZXMvQlNELTMtQ2xhdXNlLUNsZWFyLmh0bWwgQlNELTMtQ2xhdXNlLUNsZWFyfS5cbiAqICAgICAgICAgICAgIEdpdGh1Yi5qcyBpcyBmcmVlbHkgZGlzdHJpYnV0YWJsZS5cbiAqL1xuXG5pbXBvcnQgUmVxdWVzdGFibGUgZnJvbSAnLi9SZXF1ZXN0YWJsZSc7XG5pbXBvcnQgVXRmOCBmcm9tICd1dGY4JztcbmltcG9ydCB7XG4gICBCYXNlNjRcbn0gZnJvbSAnanMtYmFzZTY0JztcbmltcG9ydCBkZWJ1ZyBmcm9tICdkZWJ1Zyc7XG5jb25zdCBsb2cgPSBkZWJ1ZygnZ2l0aHViOnJlcG9zaXRvcnknKTtcblxuLyoqXG4gKiBSZXNwb3NpdG9yeSBlbmNhcHN1bGF0ZXMgdGhlIGZ1bmN0aW9uYWxpdHkgdG8gY3JlYXRlLCBxdWVyeSwgYW5kIG1vZGlmeSBmaWxlcy5cbiAqL1xuY2xhc3MgUmVwb3NpdG9yeSBleHRlbmRzIFJlcXVlc3RhYmxlIHtcbiAgIC8qKlxuICAgICogQ3JlYXRlIGEgUmVwb3NpdG9yeS5cbiAgICAqIEBwYXJhbSB7c3RyaW5nfSBmdWxsbmFtZSAtIHRoZSBmdWxsIG5hbWUgb2YgdGhlIHJlcG9zaXRvcnlcbiAgICAqIEBwYXJhbSB7UmVxdWVzdGFibGUuYXV0aH0gW2F1dGhdIC0gaW5mb3JtYXRpb24gcmVxdWlyZWQgdG8gYXV0aGVudGljYXRlIHRvIEdpdGh1YlxuICAgICogQHBhcmFtIHtzdHJpbmd9IFthcGlCYXNlPWh0dHBzOi8vYXBpLmdpdGh1Yi5jb21dIC0gdGhlIGJhc2UgR2l0aHViIEFQSSBVUkxcbiAgICAqL1xuICAgY29uc3RydWN0b3IoZnVsbG5hbWUsIGF1dGgsIGFwaUJhc2UpIHtcbiAgICAgIHN1cGVyKGF1dGgsIGFwaUJhc2UpO1xuICAgICAgdGhpcy5fX2Z1bGxuYW1lID0gZnVsbG5hbWU7XG4gICAgICB0aGlzLl9fY3VycmVudFRyZWUgPSB7XG4gICAgICAgICBicmFuY2g6IG51bGwsXG4gICAgICAgICBzaGE6IG51bGxcbiAgICAgIH07XG4gICB9XG5cbiAgIC8qKlxuICAgICogR2V0IGEgcmVmZXJlbmNlXG4gICAgKiBAc2VlIGh0dHBzOi8vZGV2ZWxvcGVyLmdpdGh1Yi5jb20vdjMvZ2l0L3JlZnMvI2dldC1hLXJlZmVyZW5jZVxuICAgICogQHBhcmFtIHtzdHJpbmd9IHJlZiAtIHRoZSByZWZlcmVuY2UgdG8gZ2V0XG4gICAgKiBAcGFyYW0ge1JlcXVlc3RhYmxlLmNhbGxiYWNrfSBbY2JdIC0gd2lsbCByZWNlaXZlIHRoZSByZWZlcmVuY2UncyByZWZTcGVjIG9yIGEgbGlzdCBvZiByZWZTcGVjcyB0aGF0IG1hdGNoIGByZWZgXG4gICAgKiBAcmV0dXJuIHtQcm9taXNlfSAtIHRoZSBwcm9taXNlIGZvciB0aGUgaHR0cCByZXF1ZXN0XG4gICAgKi9cbiAgIGdldFJlZihyZWYsIGNiKSB7XG4gICAgICByZXR1cm4gdGhpcy5fcmVxdWVzdCgnR0VUJywgYC9yZXBvcy8ke3RoaXMuX19mdWxsbmFtZX0vZ2l0L3JlZnMvJHtyZWZ9YCwgbnVsbCwgY2IpO1xuICAgfVxuXG4gICAvKipcbiAgICAqIENyZWF0ZSBhIHJlZmVyZW5jZVxuICAgICogQHNlZSBodHRwczovL2RldmVsb3Blci5naXRodWIuY29tL3YzL2dpdC9yZWZzLyNjcmVhdGUtYS1yZWZlcmVuY2VcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gdGhlIG9iamVjdCBkZXNjcmliaW5nIHRoZSByZWZcbiAgICAqIEBwYXJhbSB7UmVxdWVzdGFibGUuY2FsbGJhY2t9IFtjYl0gLSB3aWxsIHJlY2VpdmUgdGhlIHJlZlxuICAgICogQHJldHVybiB7UHJvbWlzZX0gLSB0aGUgcHJvbWlzZSBmb3IgdGhlIGh0dHAgcmVxdWVzdFxuICAgICovXG4gICBjcmVhdGVSZWYob3B0aW9ucywgY2IpIHtcbiAgICAgIHJldHVybiB0aGlzLl9yZXF1ZXN0KCdQT1NUJywgYC9yZXBvcy8ke3RoaXMuX19mdWxsbmFtZX0vZ2l0L3JlZnNgLCBvcHRpb25zLCBjYik7XG4gICB9XG5cbiAgIC8qKlxuICAgICogRGVsZXRlIGEgcmVmZXJlbmNlXG4gICAgKiBAc2VlIGh0dHBzOi8vZGV2ZWxvcGVyLmdpdGh1Yi5jb20vdjMvZ2l0L3JlZnMvI2RlbGV0ZS1hLXJlZmVyZW5jZVxuICAgICogQHBhcmFtIHtzdHJpbmd9IHJlZiAtIHRoZSBuYW1lIG9mIHRoZSByZWYgdG8gZGVsdGVcbiAgICAqIEBwYXJhbSB7UmVxdWVzdGFibGUuY2FsbGJhY2t9IFtjYl0gLSB3aWxsIHJlY2VpdmUgdHJ1ZSBpZiB0aGUgcmVxdWVzdCBpcyBzdWNjZXNzZnVsXG4gICAgKiBAcmV0dXJuIHtQcm9taXNlfSAtIHRoZSBwcm9taXNlIGZvciB0aGUgaHR0cCByZXF1ZXN0XG4gICAgKi9cbiAgIGRlbGV0ZVJlZihyZWYsIGNiKSB7XG4gICAgICByZXR1cm4gdGhpcy5fcmVxdWVzdCgnREVMRVRFJywgYC9yZXBvcy8ke3RoaXMuX19mdWxsbmFtZX0vZ2l0L3JlZnMvJHtyZWZ9YCwgbnVsbCwgY2IpO1xuICAgfVxuXG4gICAvKipcbiAgICAqIERlbGV0ZSBhIHJlcG9zaXRvcnlcbiAgICAqIEBzZWUgaHR0cHM6Ly9kZXZlbG9wZXIuZ2l0aHViLmNvbS92My9yZXBvcy8jZGVsZXRlLWEtcmVwb3NpdG9yeVxuICAgICogQHBhcmFtIHtSZXF1ZXN0YWJsZS5jYWxsYmFja30gW2NiXSAtIHdpbGwgcmVjZWl2ZSB0cnVlIGlmIHRoZSByZXF1ZXN0IGlzIHN1Y2Nlc3NmdWxcbiAgICAqIEByZXR1cm4ge1Byb21pc2V9IC0gdGhlIHByb21pc2UgZm9yIHRoZSBodHRwIHJlcXVlc3RcbiAgICAqL1xuICAgZGVsZXRlUmVwbyhjYikge1xuICAgICAgcmV0dXJuIHRoaXMuX3JlcXVlc3QoJ0RFTEVURScsIGAvcmVwb3MvJHt0aGlzLl9fZnVsbG5hbWV9YCwgbnVsbCwgY2IpO1xuICAgfVxuXG4gICAvKipcbiAgICAqIExpc3QgdGhlIHRhZ3Mgb24gYSByZXBvc2l0b3J5XG4gICAgKiBAc2VlIGh0dHBzOi8vZGV2ZWxvcGVyLmdpdGh1Yi5jb20vdjMvcmVwb3MvI2xpc3QtdGFnc1xuICAgICogQHBhcmFtIHtSZXF1ZXN0YWJsZS5jYWxsYmFja30gW2NiXSAtIHdpbGwgcmVjZWl2ZSB0aGUgdGFnIGRhdGFcbiAgICAqIEByZXR1cm4ge1Byb21pc2V9IC0gdGhlIHByb21pc2UgZm9yIHRoZSBodHRwIHJlcXVlc3RcbiAgICAqL1xuICAgbGlzdFRhZ3MoY2IpIHtcbiAgICAgIHJldHVybiB0aGlzLl9yZXF1ZXN0KCdHRVQnLCBgL3JlcG9zLyR7dGhpcy5fX2Z1bGxuYW1lfS90YWdzYCwgbnVsbCwgY2IpO1xuICAgfVxuXG4gICAvKipcbiAgICAqIExpc3QgdGhlIG9wZW4gcHVsbCByZXF1ZXN0cyBvbiB0aGUgcmVwb3NpdG9yeVxuICAgICogQHNlZSBodHRwczovL2RldmVsb3Blci5naXRodWIuY29tL3YzL3B1bGxzLyNsaXN0LXB1bGwtcmVxdWVzdHNcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gb3B0aW9ucyB0byBmaWx0ZXIgdGhlIHNlYXJjaFxuICAgICogQHBhcmFtIHtSZXF1ZXN0YWJsZS5jYWxsYmFja30gW2NiXSAtIHdpbGwgcmVjZWl2ZSB0aGUgbGlzdCBvZiBQUnNcbiAgICAqIEByZXR1cm4ge1Byb21pc2V9IC0gdGhlIHByb21pc2UgZm9yIHRoZSBodHRwIHJlcXVlc3RcbiAgICAqL1xuICAgbGlzdFB1bGxSZXF1ZXN0cyhvcHRpb25zLCBjYikge1xuICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgICByZXR1cm4gdGhpcy5fcmVxdWVzdCgnR0VUJywgYC9yZXBvcy8ke3RoaXMuX19mdWxsbmFtZX0vcHVsbHNgLCBvcHRpb25zLCBjYik7XG4gICB9XG5cbiAgIC8qKlxuICAgICogR2V0IGluZm9ybWF0aW9uIGFib3V0IGEgc3BlY2lmaWMgcHVsbCByZXF1ZXN0XG4gICAgKiBAc2VlIGh0dHBzOi8vZGV2ZWxvcGVyLmdpdGh1Yi5jb20vdjMvcHVsbHMvI2dldC1hLXNpbmdsZS1wdWxsLXJlcXVlc3RcbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBudW1iZXIgLSB0aGUgUFIgeW91IHdpc2ggdG8gZmV0Y2hcbiAgICAqIEBwYXJhbSB7UmVxdWVzdGFibGUuY2FsbGJhY2t9IFtjYl0gLSB3aWxsIHJlY2VpdmUgdGhlIFBSIGZyb20gdGhlIEFQSVxuICAgICogQHJldHVybiB7UHJvbWlzZX0gLSB0aGUgcHJvbWlzZSBmb3IgdGhlIGh0dHAgcmVxdWVzdFxuICAgICovXG4gICBnZXRQdWxsUmVxdWVzdChudW1iZXIsIGNiKSB7XG4gICAgICByZXR1cm4gdGhpcy5fcmVxdWVzdCgnR0VUJywgYC9yZXBvcy8ke3RoaXMuX19mdWxsbmFtZX0vcHVsbHMvJHtudW1iZXJ9YCwgbnVsbCwgY2IpO1xuICAgfVxuXG4gICAvKipcbiAgICAqIExpc3QgdGhlIGZpbGVzIG9mIGEgc3BlY2lmaWMgcHVsbCByZXF1ZXN0XG4gICAgKiBAc2VlIGh0dHBzOi8vZGV2ZWxvcGVyLmdpdGh1Yi5jb20vdjMvcHVsbHMvI2xpc3QtcHVsbC1yZXF1ZXN0cy1maWxlc1xuICAgICogQHBhcmFtIHtudW1iZXJ8c3RyaW5nfSBudW1iZXIgLSB0aGUgUFIgeW91IHdpc2ggdG8gZmV0Y2hcbiAgICAqIEBwYXJhbSB7UmVxdWVzdGFibGUuY2FsbGJhY2t9IFtjYl0gLSB3aWxsIHJlY2VpdmUgdGhlIGxpc3Qgb2YgZmlsZXMgZnJvbSB0aGUgQVBJXG4gICAgKiBAcmV0dXJuIHtQcm9taXNlfSAtIHRoZSBwcm9taXNlIGZvciB0aGUgaHR0cCByZXF1ZXN0XG4gICAgKi9cbiAgIGxpc3RQdWxsUmVxdWVzdEZpbGVzKG51bWJlciwgY2IpIHtcbiAgICAgIHJldHVybiB0aGlzLl9yZXF1ZXN0KCdHRVQnLCBgL3JlcG9zLyR7dGhpcy5fX2Z1bGxuYW1lfS9wdWxscy8ke251bWJlcn0vZmlsZXNgLCBudWxsLCBjYik7XG4gICB9XG5cbiAgIC8qKlxuICAgICogQ29tcGFyZSB0d28gYnJhbmNoZXMvY29tbWl0cy9yZXBvc2l0b3JpZXNcbiAgICAqIEBzZWUgaHR0cHM6Ly9kZXZlbG9wZXIuZ2l0aHViLmNvbS92My9yZXBvcy9jb21taXRzLyNjb21wYXJlLXR3by1jb21taXRzXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gYmFzZSAtIHRoZSBiYXNlIGNvbW1pdFxuICAgICogQHBhcmFtIHtzdHJpbmd9IGhlYWQgLSB0aGUgaGVhZCBjb21taXRcbiAgICAqIEBwYXJhbSB7UmVxdWVzdGFibGUuY2FsbGJhY2t9IGNiIC0gd2lsbCByZWNlaXZlIHRoZSBjb21wYXJpc29uXG4gICAgKiBAcmV0dXJuIHtQcm9taXNlfSAtIHRoZSBwcm9taXNlIGZvciB0aGUgaHR0cCByZXF1ZXN0XG4gICAgKi9cbiAgIGNvbXBhcmVCcmFuY2hlcyhiYXNlLCBoZWFkLCBjYikge1xuICAgICAgcmV0dXJuIHRoaXMuX3JlcXVlc3QoJ0dFVCcsIGAvcmVwb3MvJHt0aGlzLl9fZnVsbG5hbWV9L2NvbXBhcmUvJHtiYXNlfS4uLiR7aGVhZH1gLCBudWxsLCBjYik7XG4gICB9XG5cbiAgIC8qKlxuICAgICogTGlzdCBhbGwgdGhlIGJyYW5jaGVzIGZvciB0aGUgcmVwb3NpdG9yeVxuICAgICogQHNlZSBodHRwczovL2RldmVsb3Blci5naXRodWIuY29tL3YzL3JlcG9zLyNsaXN0LWJyYW5jaGVzXG4gICAgKiBAcGFyYW0ge1JlcXVlc3RhYmxlLmNhbGxiYWNrfSBjYiAtIHdpbGwgcmVjZWl2ZSB0aGUgbGlzdCBvZiBicmFuY2hlc1xuICAgICogQHJldHVybiB7UHJvbWlzZX0gLSB0aGUgcHJvbWlzZSBmb3IgdGhlIGh0dHAgcmVxdWVzdFxuICAgICovXG4gICBsaXN0QnJhbmNoZXMoY2IpIHtcbiAgICAgIHJldHVybiB0aGlzLl9yZXF1ZXN0KCdHRVQnLCBgL3JlcG9zLyR7dGhpcy5fX2Z1bGxuYW1lfS9icmFuY2hlc2AsIG51bGwsIGNiKTtcbiAgIH1cblxuICAgLyoqXG4gICAgKiBHZXQgYSByYXcgYmxvYiBmcm9tIHRoZSByZXBvc2l0b3J5XG4gICAgKiBAc2VlIGh0dHBzOi8vZGV2ZWxvcGVyLmdpdGh1Yi5jb20vdjMvZ2l0L2Jsb2JzLyNnZXQtYS1ibG9iXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gc2hhIC0gdGhlIHNoYSBvZiB0aGUgYmxvYiB0byBmZXRjaFxuICAgICogQHBhcmFtIHtSZXF1ZXN0YWJsZS5jYWxsYmFja30gY2IgLSB3aWxsIHJlY2VpdmUgdGhlIGJsb2IgZnJvbSB0aGUgQVBJXG4gICAgKiBAcmV0dXJuIHtQcm9taXNlfSAtIHRoZSBwcm9taXNlIGZvciB0aGUgaHR0cCByZXF1ZXN0XG4gICAgKi9cbiAgIGdldEJsb2Ioc2hhLCBjYikge1xuICAgICAgcmV0dXJuIHRoaXMuX3JlcXVlc3QoJ0dFVCcsIGAvcmVwb3MvJHt0aGlzLl9fZnVsbG5hbWV9L2dpdC9ibG9icy8ke3NoYX1gLCBudWxsLCBjYiwgJ3JhdycpO1xuICAgfVxuXG4gICAvKipcbiAgICAqIEdldCBhIGNvbW1pdCBmcm9tIHRoZSByZXBvc2l0b3J5XG4gICAgKiBAc2VlIGh0dHBzOi8vZGV2ZWxvcGVyLmdpdGh1Yi5jb20vdjMvcmVwb3MvY29tbWl0cy8jZ2V0LWEtc2luZ2xlLWNvbW1pdFxuICAgICogQHBhcmFtIHtzdHJpbmd9IHNoYSAtIHRoZSBzaGEgZm9yIHRoZSBjb21taXQgdG8gZmV0Y2hcbiAgICAqIEBwYXJhbSB7UmVxdWVzdGFibGUuY2FsbGJhY2t9IGNiIC0gd2lsbCByZWNlaXZlIHRoZSBjb21taXQgZGF0YVxuICAgICogQHJldHVybiB7UHJvbWlzZX0gLSB0aGUgcHJvbWlzZSBmb3IgdGhlIGh0dHAgcmVxdWVzdFxuICAgICovXG4gICBnZXRDb21taXQoc2hhLCBjYikge1xuICAgICAgcmV0dXJuIHRoaXMuX3JlcXVlc3QoJ0dFVCcsIGAvcmVwb3MvJHt0aGlzLl9fZnVsbG5hbWV9L2dpdC9jb21taXRzLyR7c2hhfWAsIG51bGwsIGNiKTtcbiAgIH1cblxuICAgLyoqXG4gICAgKiBMaXN0IHRoZSBjb21taXRzIG9uIGEgcmVwb3NpdG9yeSwgb3B0aW9uYWxseSBmaWx0ZXJpbmcgYnkgcGF0aCwgYXV0aG9yIG9yIHRpbWUgcmFuZ2VcbiAgICAqIEBzZWUgaHR0cHM6Ly9kZXZlbG9wZXIuZ2l0aHViLmNvbS92My9yZXBvcy9jb21taXRzLyNsaXN0LWNvbW1pdHMtb24tYS1yZXBvc2l0b3J5XG4gICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIC0gdGhlIGZpbHRlcmluZyBvcHRpb25zIGZvciBjb21taXRzXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuc2hhXSAtIHRoZSBTSEEgb3IgYnJhbmNoIHRvIHN0YXJ0IGZyb21cbiAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5wYXRoXSAtIHRoZSBwYXRoIHRvIHNlYXJjaCBvblxuICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmF1dGhvcl0gLSB0aGUgY29tbWl0IGF1dGhvclxuICAgICogQHBhcmFtIHsoRGF0ZXxzdHJpbmcpfSBbb3B0aW9ucy5zaW5jZV0gLSBvbmx5IGNvbW1pdHMgYWZ0ZXIgdGhpcyBkYXRlIHdpbGwgYmUgcmV0dXJuZWRcbiAgICAqIEBwYXJhbSB7KERhdGV8c3RyaW5nKX0gW29wdGlvbnMudW50aWxdIC0gb25seSBjb21taXRzIGJlZm9yZSB0aGlzIGRhdGUgd2lsbCBiZSByZXR1cm5lZFxuICAgICogQHBhcmFtIHtSZXF1ZXN0YWJsZS5jYWxsYmFja30gY2IgLSB3aWxsIHJlY2VpdmUgdGhlIGxpc3Qgb2YgY29tbWl0cyBmb3VuZCBtYXRjaGluZyB0aGUgY3JpdGVyaWFcbiAgICAqIEByZXR1cm4ge1Byb21pc2V9IC0gdGhlIHByb21pc2UgZm9yIHRoZSBodHRwIHJlcXVlc3RcbiAgICAqL1xuICAgbGlzdENvbW1pdHMob3B0aW9ucywgY2IpIHtcbiAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgICBvcHRpb25zLnNpbmNlID0gdGhpcy5fZGF0ZVRvSVNPKG9wdGlvbnMuc2luY2UpO1xuICAgICAgb3B0aW9ucy51bnRpbCA9IHRoaXMuX2RhdGVUb0lTTyhvcHRpb25zLnVudGlsKTtcblxuICAgICAgcmV0dXJuIHRoaXMuX3JlcXVlc3QoJ0dFVCcsIGAvcmVwb3MvJHt0aGlzLl9fZnVsbG5hbWV9L2NvbW1pdHNgLCBvcHRpb25zLCBjYik7XG4gICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIGEgc2luZ2xlIGNvbW1pdCBpbmZvcm1hdGlvbiBmb3IgYSByZXBvc2l0b3J5XG4gICAgICogQHNlZSBodHRwczovL2RldmVsb3Blci5naXRodWIuY29tL3YzL3JlcG9zL2NvbW1pdHMvI2dldC1hLXNpbmdsZS1jb21taXRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcmVmIC0gdGhlIHJlZmVyZW5jZSBmb3IgdGhlIGNvbW1pdC1pc2hcbiAgICAgKiBAcGFyYW0ge1JlcXVlc3RhYmxlLmNhbGxiYWNrfSBjYiAtIHdpbGwgcmVjZWl2ZSB0aGUgY29tbWl0IGluZm9ybWF0aW9uXG4gICAgICogQHJldHVybiB7UHJvbWlzZX0gLSB0aGUgcHJvbWlzZSBmb3IgdGhlIGh0dHAgcmVxdWVzdFxuICAgICAqL1xuICAgZ2V0U2luZ2xlQ29tbWl0KHJlZiwgY2IpIHtcbiAgICAgIHJlZiA9IHJlZiB8fCAnJztcbiAgICAgIHJldHVybiB0aGlzLl9yZXF1ZXN0KCdHRVQnLCBgL3JlcG9zLyR7dGhpcy5fX2Z1bGxuYW1lfS9jb21taXRzLyR7cmVmfWAsIG51bGwsIGNiKTtcbiAgIH1cblxuICAgLyoqXG4gICAgKiBHZXQgdGhhIHNoYSBmb3IgYSBwYXJ0aWN1bGFyIG9iamVjdCBpbiB0aGUgcmVwb3NpdG9yeS4gVGhpcyBpcyBhIGNvbnZlbmllbmNlIGZ1bmN0aW9uXG4gICAgKiBAc2VlIGh0dHBzOi8vZGV2ZWxvcGVyLmdpdGh1Yi5jb20vdjMvcmVwb3MvY29udGVudHMvI2dldC1jb250ZW50c1xuICAgICogQHBhcmFtIHtzdHJpbmd9IFticmFuY2hdIC0gdGhlIGJyYW5jaCB0byBsb29rIGluLCBvciB0aGUgcmVwb3NpdG9yeSdzIGRlZmF1bHQgYnJhbmNoIGlmIG9taXR0ZWRcbiAgICAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoIC0gdGhlIHBhdGggb2YgdGhlIGZpbGUgb3IgZGlyZWN0b3J5XG4gICAgKiBAcGFyYW0ge1JlcXVlc3RhYmxlLmNhbGxiYWNrfSBjYiAtIHdpbGwgcmVjZWl2ZSBhIGRlc2NyaXB0aW9uIG9mIHRoZSByZXF1ZXN0ZWQgb2JqZWN0LCBpbmNsdWRpbmcgYSBgU0hBYCBwcm9wZXJ0eVxuICAgICogQHJldHVybiB7UHJvbWlzZX0gLSB0aGUgcHJvbWlzZSBmb3IgdGhlIGh0dHAgcmVxdWVzdFxuICAgICovXG4gICBnZXRTaGEoYnJhbmNoLCBwYXRoLCBjYikge1xuICAgICAgYnJhbmNoID0gYnJhbmNoID8gYD9yZWY9JHticmFuY2h9YCA6ICcnO1xuICAgICAgcmV0dXJuIHRoaXMuX3JlcXVlc3QoJ0dFVCcsIGAvcmVwb3MvJHt0aGlzLl9fZnVsbG5hbWV9L2NvbnRlbnRzLyR7cGF0aH0ke2JyYW5jaH1gLCBudWxsLCBjYik7XG4gICB9XG5cbiAgIC8qKlxuICAgICogTGlzdCB0aGUgY29tbWl0IHN0YXR1c2VzIGZvciBhIHBhcnRpY3VsYXIgc2hhLCBicmFuY2gsIG9yIHRhZ1xuICAgICogQHNlZSBodHRwczovL2RldmVsb3Blci5naXRodWIuY29tL3YzL3JlcG9zL3N0YXR1c2VzLyNsaXN0LXN0YXR1c2VzLWZvci1hLXNwZWNpZmljLXJlZlxuICAgICogQHBhcmFtIHtzdHJpbmd9IHNoYSAtIHRoZSBzaGEsIGJyYW5jaCwgb3IgdGFnIHRvIGdldCBzdGF0dXNlcyBmb3JcbiAgICAqIEBwYXJhbSB7UmVxdWVzdGFibGUuY2FsbGJhY2t9IGNiIC0gd2lsbCByZWNlaXZlIHRoZSBsaXN0IG9mIHN0YXR1c2VzXG4gICAgKiBAcmV0dXJuIHtQcm9taXNlfSAtIHRoZSBwcm9taXNlIGZvciB0aGUgaHR0cCByZXF1ZXN0XG4gICAgKi9cbiAgIGxpc3RTdGF0dXNlcyhzaGEsIGNiKSB7XG4gICAgICByZXR1cm4gdGhpcy5fcmVxdWVzdCgnR0VUJywgYC9yZXBvcy8ke3RoaXMuX19mdWxsbmFtZX0vY29tbWl0cy8ke3NoYX0vc3RhdHVzZXNgLCBudWxsLCBjYik7XG4gICB9XG5cbiAgIC8qKlxuICAgICogR2V0IGEgZGVzY3JpcHRpb24gb2YgYSBnaXQgdHJlZVxuICAgICogQHNlZSBodHRwczovL2RldmVsb3Blci5naXRodWIuY29tL3YzL2dpdC90cmVlcy8jZ2V0LWEtdHJlZVxuICAgICogQHBhcmFtIHtzdHJpbmd9IHRyZWVTSEEgLSB0aGUgU0hBIG9mIHRoZSB0cmVlIHRvIGZldGNoXG4gICAgKiBAcGFyYW0ge1JlcXVlc3RhYmxlLmNhbGxiYWNrfSBjYiAtIHdpbGwgcmVjZWl2ZSB0aGUgY2FsbGJhY2sgZGF0YVxuICAgICogQHJldHVybiB7UHJvbWlzZX0gLSB0aGUgcHJvbWlzZSBmb3IgdGhlIGh0dHAgcmVxdWVzdFxuICAgICovXG4gICBnZXRUcmVlKHRyZWVTSEEsIGNiKSB7XG4gICAgICByZXR1cm4gdGhpcy5fcmVxdWVzdCgnR0VUJywgYC9yZXBvcy8ke3RoaXMuX19mdWxsbmFtZX0vZ2l0L3RyZWVzLyR7dHJlZVNIQX1gLCBudWxsLCBjYik7XG4gICB9XG5cbiAgIC8qKlxuICAgICogQ3JlYXRlIGEgYmxvYlxuICAgICogQHNlZSBodHRwczovL2RldmVsb3Blci5naXRodWIuY29tL3YzL2dpdC9ibG9icy8jY3JlYXRlLWEtYmxvYlxuICAgICogQHBhcmFtIHsoc3RyaW5nfEJ1ZmZlcnxCbG9iKX0gY29udGVudCAtIHRoZSBjb250ZW50IHRvIGFkZCB0byB0aGUgcmVwb3NpdG9yeVxuICAgICogQHBhcmFtIHtSZXF1ZXN0YWJsZS5jYWxsYmFja30gY2IgLSB3aWxsIHJlY2VpdmUgdGhlIGRldGFpbHMgb2YgdGhlIGNyZWF0ZWQgYmxvYlxuICAgICogQHJldHVybiB7UHJvbWlzZX0gLSB0aGUgcHJvbWlzZSBmb3IgdGhlIGh0dHAgcmVxdWVzdFxuICAgICovXG4gICBjcmVhdGVCbG9iKGNvbnRlbnQsIGNiKSB7XG4gICAgICBsZXQgcG9zdEJvZHkgPSB0aGlzLl9nZXRDb250ZW50T2JqZWN0KGNvbnRlbnQpO1xuXG4gICAgICBsb2coJ3NlbmRpbmcgY29udGVudCcsIHBvc3RCb2R5KTtcbiAgICAgIHJldHVybiB0aGlzLl9yZXF1ZXN0KCdQT1NUJywgYC9yZXBvcy8ke3RoaXMuX19mdWxsbmFtZX0vZ2l0L2Jsb2JzYCwgcG9zdEJvZHksIGNiKTtcbiAgIH1cblxuICAgLyoqXG4gICAgKiBHZXQgdGhlIG9iamVjdCB0aGF0IHJlcHJlc2VudHMgdGhlIHByb3ZpZGVkIGNvbnRlbnRcbiAgICAqIEBwYXJhbSB7c3RyaW5nfEJ1ZmZlcnxCbG9ifSBjb250ZW50IC0gdGhlIGNvbnRlbnQgdG8gc2VuZCB0byB0aGUgc2VydmVyXG4gICAgKiBAcmV0dXJuIHtPYmplY3R9IHRoZSByZXByZXNlbnRhdGlvbiBvZiBgY29udGVudGAgZm9yIHRoZSBHaXRIdWIgQVBJXG4gICAgKi9cbiAgIF9nZXRDb250ZW50T2JqZWN0KGNvbnRlbnQpIHtcbiAgICAgIGlmICh0eXBlb2YgY29udGVudCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgIGxvZygnY29udGV0IGlzIGEgc3RyaW5nJyk7XG4gICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgY29udGVudDogVXRmOC5lbmNvZGUoY29udGVudCksXG4gICAgICAgICAgICBlbmNvZGluZzogJ3V0Zi04J1xuICAgICAgICAgfTtcblxuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgQnVmZmVyICE9PSAndW5kZWZpbmVkJyAmJiBjb250ZW50IGluc3RhbmNlb2YgQnVmZmVyKSB7XG4gICAgICAgICBsb2coJ1dlIGFwcGVhciB0byBiZSBpbiBOb2RlJyk7XG4gICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgY29udGVudDogY29udGVudC50b1N0cmluZygnYmFzZTY0JyksXG4gICAgICAgICAgICBlbmNvZGluZzogJ2Jhc2U2NCdcbiAgICAgICAgIH07XG5cbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIEJsb2IgIT09ICd1bmRlZmluZWQnICYmIGNvbnRlbnQgaW5zdGFuY2VvZiBCbG9iKSB7XG4gICAgICAgICBsb2coJ1dlIGFwcGVhciB0byBiZSBpbiB0aGUgYnJvd3NlcicpO1xuICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGNvbnRlbnQ6IEJhc2U2NC5lbmNvZGUoY29udGVudCksXG4gICAgICAgICAgICBlbmNvZGluZzogJ2Jhc2U2NCdcbiAgICAgICAgIH07XG5cbiAgICAgIH0gZWxzZSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgICAgICAgIGxvZyhgTm90IHN1cmUgd2hhdCB0aGlzIGNvbnRlbnQgaXM6ICR7dHlwZW9mIGNvbnRlbnR9LCAke0pTT04uc3RyaW5naWZ5KGNvbnRlbnQpfWApO1xuICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGNvbnRlbnQgcGFzc2VkIHRvIHBvc3RCbG9iLiBNdXN0IGJlIHN0cmluZyBvciBCdWZmZXIgKG5vZGUpIG9yIEJsb2IgKHdlYiknKTtcbiAgICAgIH1cbiAgIH1cblxuICAgLyoqXG4gICAgKiBVcGRhdGUgYSB0cmVlIGluIEdpdFxuICAgICogQHNlZSBodHRwczovL2RldmVsb3Blci5naXRodWIuY29tL3YzL2dpdC90cmVlcy8jY3JlYXRlLWEtdHJlZVxuICAgICogQHBhcmFtIHtzdHJpbmd9IGJhc2VUcmVlU0hBIC0gdGhlIFNIQSBvZiB0aGUgdHJlZSB0byB1cGRhdGVcbiAgICAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoIC0gdGhlIHBhdGggZm9yIHRoZSBuZXcgZmlsZVxuICAgICogQHBhcmFtIHtzdHJpbmd9IGJsb2JTSEEgLSB0aGUgU0hBIGZvciB0aGUgYmxvYiB0byBwdXQgYXQgYHBhdGhgXG4gICAgKiBAcGFyYW0ge1JlcXVlc3RhYmxlLmNhbGxiYWNrfSBjYiAtIHdpbGwgcmVjZWl2ZSB0aGUgbmV3IHRyZWUgdGhhdCBpcyBjcmVhdGVkXG4gICAgKiBAcmV0dXJuIHtQcm9taXNlfSAtIHRoZSBwcm9taXNlIGZvciB0aGUgaHR0cCByZXF1ZXN0XG4gICAgKiBAZGVwcmVjYXRlZCB1c2Uge0BsaW5rIFJlcG9zaXRvcnkjY3JlYXRlVHJlZX0gaW5zdGVhZFxuICAgICovXG4gICB1cGRhdGVUcmVlKGJhc2VUcmVlU0hBLCBwYXRoLCBibG9iU0hBLCBjYikge1xuICAgICAgbGV0IG5ld1RyZWUgPSB7XG4gICAgICAgICBiYXNlX3RyZWU6IGJhc2VUcmVlU0hBLCAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG4gICAgICAgICB0cmVlOiBbe1xuICAgICAgICAgICAgcGF0aDogcGF0aCxcbiAgICAgICAgICAgIHNoYTogYmxvYlNIQSxcbiAgICAgICAgICAgIG1vZGU6ICcxMDA2NDQnLFxuICAgICAgICAgICAgdHlwZTogJ2Jsb2InXG4gICAgICAgICB9XVxuICAgICAgfTtcblxuICAgICAgcmV0dXJuIHRoaXMuX3JlcXVlc3QoJ1BPU1QnLCBgL3JlcG9zLyR7dGhpcy5fX2Z1bGxuYW1lfS9naXQvdHJlZXNgLCBuZXdUcmVlLCBjYik7XG4gICB9XG5cbiAgIC8qKlxuICAgICogQ3JlYXRlIGEgbmV3IHRyZWUgaW4gZ2l0XG4gICAgKiBAc2VlIGh0dHBzOi8vZGV2ZWxvcGVyLmdpdGh1Yi5jb20vdjMvZ2l0L3RyZWVzLyNjcmVhdGUtYS10cmVlXG4gICAgKiBAcGFyYW0ge09iamVjdH0gdHJlZSAtIHRoZSB0cmVlIHRvIGNyZWF0ZVxuICAgICogQHBhcmFtIHtzdHJpbmd9IGJhc2VTSEEgLSB0aGUgcm9vdCBzaGEgb2YgdGhlIHRyZWVcbiAgICAqIEBwYXJhbSB7UmVxdWVzdGFibGUuY2FsbGJhY2t9IGNiIC0gd2lsbCByZWNlaXZlIHRoZSBuZXcgdHJlZSB0aGF0IGlzIGNyZWF0ZWRcbiAgICAqIEByZXR1cm4ge1Byb21pc2V9IC0gdGhlIHByb21pc2UgZm9yIHRoZSBodHRwIHJlcXVlc3RcbiAgICAqL1xuICAgY3JlYXRlVHJlZSh0cmVlLCBiYXNlU0hBLCBjYikge1xuICAgICAgcmV0dXJuIHRoaXMuX3JlcXVlc3QoJ1BPU1QnLCBgL3JlcG9zLyR7dGhpcy5fX2Z1bGxuYW1lfS9naXQvdHJlZXNgLCB7XG4gICAgICAgICB0cmVlLFxuICAgICAgICAgYmFzZV90cmVlOiBiYXNlU0hBIC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgICAgIH0sIGNiKTtcbiAgIH1cblxuICAgLyoqXG4gICAgKiBBZGQgYSBjb21taXQgdG8gdGhlIHJlcG9zaXRvcnlcbiAgICAqIEBzZWUgaHR0cHM6Ly9kZXZlbG9wZXIuZ2l0aHViLmNvbS92My9naXQvY29tbWl0cy8jY3JlYXRlLWEtY29tbWl0XG4gICAgKiBAcGFyYW0ge3N0cmluZ30gcGFyZW50IC0gdGhlIFNIQSBvZiB0aGUgcGFyZW50IGNvbW1pdFxuICAgICogQHBhcmFtIHtzdHJpbmd9IHRyZWUgLSB0aGUgU0hBIG9mIHRoZSB0cmVlIGZvciB0aGlzIGNvbW1pdFxuICAgICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2UgLSB0aGUgY29tbWl0IG1lc3NhZ2VcbiAgICAqIEBwYXJhbSB7UmVxdWVzdGFibGUuY2FsbGJhY2t9IGNiIC0gd2lsbCByZWNlaXZlIHRoZSBjb21taXQgdGhhdCBpcyBjcmVhdGVkXG4gICAgKiBAcmV0dXJuIHtQcm9taXNlfSAtIHRoZSBwcm9taXNlIGZvciB0aGUgaHR0cCByZXF1ZXN0XG4gICAgKi9cbiAgIGNvbW1pdChwYXJlbnQsIHRyZWUsIG1lc3NhZ2UsIGNiKSB7XG4gICAgICBsZXQgZGF0YSA9IHtcbiAgICAgICAgIG1lc3NhZ2UsXG4gICAgICAgICB0cmVlLFxuICAgICAgICAgcGFyZW50czogW3BhcmVudF1cbiAgICAgIH07XG5cbiAgICAgIHJldHVybiB0aGlzLl9yZXF1ZXN0KCdQT1NUJywgYC9yZXBvcy8ke3RoaXMuX19mdWxsbmFtZX0vZ2l0L2NvbW1pdHNgLCBkYXRhLCBjYilcbiAgICAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5fX2N1cnJlbnRUcmVlLnNoYSA9IHJlc3BvbnNlLmRhdGEuc2hhOyAvLyBVcGRhdGUgbGF0ZXN0IGNvbW1pdFxuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgICAgICAgfSk7XG4gICB9XG5cbiAgIC8qKlxuICAgICogVXBkYXRlIGEgcmVmXG4gICAgKiBAc2VlIGh0dHBzOi8vZGV2ZWxvcGVyLmdpdGh1Yi5jb20vdjMvZ2l0L3JlZnMvI3VwZGF0ZS1hLXJlZmVyZW5jZVxuICAgICogQHBhcmFtIHtzdHJpbmd9IHJlZiAtIHRoZSByZWYgdG8gdXBkYXRlXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gY29tbWl0U0hBIC0gdGhlIFNIQSB0byBwb2ludCB0aGUgcmVmZXJlbmNlIHRvXG4gICAgKiBAcGFyYW0ge2Jvb2xlYW59IGZvcmNlIC0gaW5kaWNhdGVzIHdoZXRoZXIgdG8gZm9yY2Ugb3IgZW5zdXJlIGEgZmFzdC1mb3J3YXJkIHVwZGF0ZVxuICAgICogQHBhcmFtIHtSZXF1ZXN0YWJsZS5jYWxsYmFja30gY2IgLSB3aWxsIHJlY2VpdmUgdGhlIHVwZGF0ZWQgcmVmIGJhY2tcbiAgICAqIEByZXR1cm4ge1Byb21pc2V9IC0gdGhlIHByb21pc2UgZm9yIHRoZSBodHRwIHJlcXVlc3RcbiAgICAqL1xuICAgdXBkYXRlSGVhZChyZWYsIGNvbW1pdFNIQSwgZm9yY2UsIGNiKSB7XG4gICAgICByZXR1cm4gdGhpcy5fcmVxdWVzdCgnUEFUQ0gnLCBgL3JlcG9zLyR7dGhpcy5fX2Z1bGxuYW1lfS9naXQvcmVmcy8ke3JlZn1gLCB7XG4gICAgICAgICBzaGE6IGNvbW1pdFNIQSxcbiAgICAgICAgIGZvcmNlOiBmb3JjZVxuICAgICAgfSwgY2IpO1xuICAgfVxuXG4gICAvKipcbiAgICAqIEdldCBpbmZvcm1hdGlvbiBhYm91dCB0aGUgcmVwb3NpdG9yeVxuICAgICogQHNlZSBodHRwczovL2RldmVsb3Blci5naXRodWIuY29tL3YzL3JlcG9zLyNnZXRcbiAgICAqIEBwYXJhbSB7UmVxdWVzdGFibGUuY2FsbGJhY2t9IGNiIC0gd2lsbCByZWNlaXZlIHRoZSBpbmZvcm1hdGlvbiBhYm91dCB0aGUgcmVwb3NpdG9yeVxuICAgICogQHJldHVybiB7UHJvbWlzZX0gLSB0aGUgcHJvbWlzZSBmb3IgdGhlIGh0dHAgcmVxdWVzdFxuICAgICovXG4gICBnZXREZXRhaWxzKGNiKSB7XG4gICAgICByZXR1cm4gdGhpcy5fcmVxdWVzdCgnR0VUJywgYC9yZXBvcy8ke3RoaXMuX19mdWxsbmFtZX1gLCBudWxsLCBjYik7XG4gICB9XG5cbiAgIC8qKlxuICAgICogTGlzdCB0aGUgY29udHJpYnV0b3JzIHRvIHRoZSByZXBvc2l0b3J5XG4gICAgKiBAc2VlIGh0dHBzOi8vZGV2ZWxvcGVyLmdpdGh1Yi5jb20vdjMvcmVwb3MvI2xpc3QtY29udHJpYnV0b3JzXG4gICAgKiBAcGFyYW0ge1JlcXVlc3RhYmxlLmNhbGxiYWNrfSBjYiAtIHdpbGwgcmVjZWl2ZSB0aGUgbGlzdCBvZiBjb250cmlidXRvcnNcbiAgICAqIEByZXR1cm4ge1Byb21pc2V9IC0gdGhlIHByb21pc2UgZm9yIHRoZSBodHRwIHJlcXVlc3RcbiAgICAqL1xuICAgZ2V0Q29udHJpYnV0b3JzKGNiKSB7XG4gICAgICByZXR1cm4gdGhpcy5fcmVxdWVzdCgnR0VUJywgYC9yZXBvcy8ke3RoaXMuX19mdWxsbmFtZX0vc3RhdHMvY29udHJpYnV0b3JzYCwgbnVsbCwgY2IpO1xuICAgfVxuXG4gICAvKipcbiAgICAqIExpc3QgdGhlIHVzZXJzIHdobyBhcmUgY29sbGFib3JhdG9ycyBvbiB0aGUgcmVwb3NpdG9yeS4gVGhlIGN1cnJlbnRseSBhdXRoZW50aWNhdGVkIHVzZXIgbXVzdCBoYXZlXG4gICAgKiBwdXNoIGFjY2VzcyB0byB1c2UgdGhpcyBtZXRob2RcbiAgICAqIEBzZWUgaHR0cHM6Ly9kZXZlbG9wZXIuZ2l0aHViLmNvbS92My9yZXBvcy9jb2xsYWJvcmF0b3JzLyNsaXN0LWNvbGxhYm9yYXRvcnNcbiAgICAqIEBwYXJhbSB7UmVxdWVzdGFibGUuY2FsbGJhY2t9IGNiIC0gd2lsbCByZWNlaXZlIHRoZSBsaXN0IG9mIGNvbGxhYm9yYXRvcnNcbiAgICAqIEByZXR1cm4ge1Byb21pc2V9IC0gdGhlIHByb21pc2UgZm9yIHRoZSBodHRwIHJlcXVlc3RcbiAgICAqL1xuICAgZ2V0Q29sbGFib3JhdG9ycyhjYikge1xuICAgICAgcmV0dXJuIHRoaXMuX3JlcXVlc3QoJ0dFVCcsIGAvcmVwb3MvJHt0aGlzLl9fZnVsbG5hbWV9L2NvbGxhYm9yYXRvcnNgLCBudWxsLCBjYik7XG4gICB9XG5cbiAgIC8qKlxuICAgICogQ2hlY2sgaWYgYSB1c2VyIGlzIGEgY29sbGFib3JhdG9yIG9uIHRoZSByZXBvc2l0b3J5XG4gICAgKiBAc2VlIGh0dHBzOi8vZGV2ZWxvcGVyLmdpdGh1Yi5jb20vdjMvcmVwb3MvY29sbGFib3JhdG9ycy8jY2hlY2staWYtYS11c2VyLWlzLWEtY29sbGFib3JhdG9yXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gdXNlcm5hbWUgLSB0aGUgdXNlciB0byBjaGVja1xuICAgICogQHBhcmFtIHtSZXF1ZXN0YWJsZS5jYWxsYmFja30gY2IgLSB3aWxsIHJlY2VpdmUgdHJ1ZSBpZiB0aGUgdXNlciBpcyBhIGNvbGxhYm9yYXRvciBhbmQgZmFsc2UgaWYgdGhleSBhcmUgbm90XG4gICAgKiBAcmV0dXJuIHtQcm9taXNlfSAtIHRoZSBwcm9taXNlIGZvciB0aGUgaHR0cCByZXF1ZXN0IHtCb29sZWFufSBbZGVzY3JpcHRpb25dXG4gICAgKi9cbiAgIGlzQ29sbGFib3JhdG9yKHVzZXJuYW1lLCBjYikge1xuICAgICAgcmV0dXJuIHRoaXMuX3JlcXVlc3QoJ0dFVCcsIGAvcmVwb3MvJHt0aGlzLl9fZnVsbG5hbWV9L2NvbGxhYm9yYXRvcnMvJHt1c2VybmFtZX1gLCBudWxsLCBjYik7XG4gICB9XG5cbiAgIC8qKlxuICAgICogR2V0IHRoZSBjb250ZW50cyBvZiBhIHJlcG9zaXRvcnlcbiAgICAqIEBzZWUgaHR0cHM6Ly9kZXZlbG9wZXIuZ2l0aHViLmNvbS92My9yZXBvcy9jb250ZW50cy8jZ2V0LWNvbnRlbnRzXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gcmVmIC0gdGhlIHJlZiB0byBjaGVja1xuICAgICogQHBhcmFtIHtzdHJpbmd9IHBhdGggLSB0aGUgcGF0aCBjb250YWluaW5nIHRoZSBjb250ZW50IHRvIGZldGNoXG4gICAgKiBAcGFyYW0ge2Jvb2xlYW59IHJhdyAtIGB0cnVlYCBpZiB0aGUgcmVzdWx0cyBzaG91bGQgYmUgcmV0dXJuZWQgcmF3IGluc3RlYWQgb2YgR2l0SHViJ3Mgbm9ybWFsaXplZCBmb3JtYXRcbiAgICAqIEBwYXJhbSB7UmVxdWVzdGFibGUuY2FsbGJhY2t9IGNiIC0gd2lsbCByZWNlaXZlIHRoZSBmZXRjaGVkIGRhdGFcbiAgICAqIEByZXR1cm4ge1Byb21pc2V9IC0gdGhlIHByb21pc2UgZm9yIHRoZSBodHRwIHJlcXVlc3RcbiAgICAqL1xuICAgZ2V0Q29udGVudHMocmVmLCBwYXRoLCByYXcsIGNiKSB7XG4gICAgICBwYXRoID0gcGF0aCA/IGAke2VuY29kZVVSSShwYXRoKX1gIDogJyc7XG4gICAgICByZXR1cm4gdGhpcy5fcmVxdWVzdCgnR0VUJywgYC9yZXBvcy8ke3RoaXMuX19mdWxsbmFtZX0vY29udGVudHMvJHtwYXRofWAsIHtcbiAgICAgICAgIHJlZlxuICAgICAgfSwgY2IsIHJhdyk7XG4gICB9XG5cbiAgIC8qKlxuICAgICogR2V0IHRoZSBSRUFETUUgb2YgYSByZXBvc2l0b3J5XG4gICAgKiBAc2VlIGh0dHBzOi8vZGV2ZWxvcGVyLmdpdGh1Yi5jb20vdjMvcmVwb3MvY29udGVudHMvI2dldC10aGUtcmVhZG1lXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gcmVmIC0gdGhlIHJlZiB0byBjaGVja1xuICAgICogQHBhcmFtIHtib29sZWFufSByYXcgLSBgdHJ1ZWAgaWYgdGhlIHJlc3VsdHMgc2hvdWxkIGJlIHJldHVybmVkIHJhdyBpbnN0ZWFkIG9mIEdpdEh1YidzIG5vcm1hbGl6ZWQgZm9ybWF0XG4gICAgKiBAcGFyYW0ge1JlcXVlc3RhYmxlLmNhbGxiYWNrfSBjYiAtIHdpbGwgcmVjZWl2ZSB0aGUgZmV0Y2hlZCBkYXRhXG4gICAgKiBAcmV0dXJuIHtQcm9taXNlfSAtIHRoZSBwcm9taXNlIGZvciB0aGUgaHR0cCByZXF1ZXN0XG4gICAgKi9cbiAgIGdldFJlYWRtZShyZWYsIHJhdywgY2IpIHtcbiAgICAgIHJldHVybiB0aGlzLl9yZXF1ZXN0KCdHRVQnLCBgL3JlcG9zLyR7dGhpcy5fX2Z1bGxuYW1lfS9yZWFkbWVgLCB7XG4gICAgICAgICByZWZcbiAgICAgIH0sIGNiLCByYXcpO1xuICAgfVxuXG4gICAvKipcbiAgICAqIEZvcmsgYSByZXBvc2l0b3J5XG4gICAgKiBAc2VlIGh0dHBzOi8vZGV2ZWxvcGVyLmdpdGh1Yi5jb20vdjMvcmVwb3MvZm9ya3MvI2NyZWF0ZS1hLWZvcmtcbiAgICAqIEBwYXJhbSB7UmVxdWVzdGFibGUuY2FsbGJhY2t9IGNiIC0gd2lsbCByZWNlaXZlIHRoZSBpbmZvcm1hdGlvbiBhYm91dCB0aGUgbmV3bHkgY3JlYXRlZCBmb3JrXG4gICAgKiBAcmV0dXJuIHtQcm9taXNlfSAtIHRoZSBwcm9taXNlIGZvciB0aGUgaHR0cCByZXF1ZXN0XG4gICAgKi9cbiAgIGZvcmsoY2IpIHtcbiAgICAgIHJldHVybiB0aGlzLl9yZXF1ZXN0KCdQT1NUJywgYC9yZXBvcy8ke3RoaXMuX19mdWxsbmFtZX0vZm9ya3NgLCBudWxsLCBjYik7XG4gICB9XG5cbiAgIC8qKlxuICAgICogTGlzdCBhIHJlcG9zaXRvcnkncyBmb3Jrc1xuICAgICogQHNlZSBodHRwczovL2RldmVsb3Blci5naXRodWIuY29tL3YzL3JlcG9zL2ZvcmtzLyNsaXN0LWZvcmtzXG4gICAgKiBAcGFyYW0ge1JlcXVlc3RhYmxlLmNhbGxiYWNrfSBjYiAtIHdpbGwgcmVjZWl2ZSB0aGUgbGlzdCBvZiByZXBvc2l0b3JpZXMgZm9ya2VkIGZyb20gdGhpcyBvbmVcbiAgICAqIEByZXR1cm4ge1Byb21pc2V9IC0gdGhlIHByb21pc2UgZm9yIHRoZSBodHRwIHJlcXVlc3RcbiAgICAqL1xuICAgbGlzdEZvcmtzKGNiKSB7XG4gICAgICByZXR1cm4gdGhpcy5fcmVxdWVzdCgnR0VUJywgYC9yZXBvcy8ke3RoaXMuX19mdWxsbmFtZX0vZm9ya3NgLCBudWxsLCBjYik7XG4gICB9XG5cbiAgIC8qKlxuICAgICogQ3JlYXRlIGEgbmV3IGJyYW5jaCBmcm9tIGFuIGV4aXN0aW5nIGJyYW5jaC5cbiAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb2xkQnJhbmNoPW1hc3Rlcl0gLSB0aGUgbmFtZSBvZiB0aGUgZXhpc3RpbmcgYnJhbmNoXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gbmV3QnJhbmNoIC0gdGhlIG5hbWUgb2YgdGhlIG5ldyBicmFuY2hcbiAgICAqIEBwYXJhbSB7UmVxdWVzdGFibGUuY2FsbGJhY2t9IGNiIC0gd2lsbCByZWNlaXZlIHRoZSBjb21taXQgZGF0YSBmb3IgdGhlIGhlYWQgb2YgdGhlIG5ldyBicmFuY2hcbiAgICAqIEByZXR1cm4ge1Byb21pc2V9IC0gdGhlIHByb21pc2UgZm9yIHRoZSBodHRwIHJlcXVlc3RcbiAgICAqL1xuICAgY3JlYXRlQnJhbmNoKG9sZEJyYW5jaCwgbmV3QnJhbmNoLCBjYikge1xuICAgICAgaWYgKHR5cGVvZiBuZXdCcmFuY2ggPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgIGNiID0gbmV3QnJhbmNoO1xuICAgICAgICAgbmV3QnJhbmNoID0gb2xkQnJhbmNoO1xuICAgICAgICAgb2xkQnJhbmNoID0gJ21hc3Rlcic7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLmdldFJlZihgaGVhZHMvJHtvbGRCcmFuY2h9YClcbiAgICAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgbGV0IHNoYSA9IHJlc3BvbnNlLmRhdGEub2JqZWN0LnNoYTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZVJlZih7XG4gICAgICAgICAgICAgICBzaGEsXG4gICAgICAgICAgICAgICByZWY6IGByZWZzL2hlYWRzLyR7bmV3QnJhbmNofWBcbiAgICAgICAgICAgIH0sIGNiKTtcbiAgICAgICAgIH0pO1xuICAgfVxuXG4gICAvKipcbiAgICAqIENyZWF0ZSBhIG5ldyBwdWxsIHJlcXVlc3RcbiAgICAqIEBzZWUgaHR0cHM6Ly9kZXZlbG9wZXIuZ2l0aHViLmNvbS92My9wdWxscy8jY3JlYXRlLWEtcHVsbC1yZXF1ZXN0XG4gICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIHRoZSBwdWxsIHJlcXVlc3QgZGVzY3JpcHRpb25cbiAgICAqIEBwYXJhbSB7UmVxdWVzdGFibGUuY2FsbGJhY2t9IGNiIC0gd2lsbCByZWNlaXZlIHRoZSBuZXcgcHVsbCByZXF1ZXN0XG4gICAgKiBAcmV0dXJuIHtQcm9taXNlfSAtIHRoZSBwcm9taXNlIGZvciB0aGUgaHR0cCByZXF1ZXN0XG4gICAgKi9cbiAgIGNyZWF0ZVB1bGxSZXF1ZXN0KG9wdGlvbnMsIGNiKSB7XG4gICAgICByZXR1cm4gdGhpcy5fcmVxdWVzdCgnUE9TVCcsIGAvcmVwb3MvJHt0aGlzLl9fZnVsbG5hbWV9L3B1bGxzYCwgb3B0aW9ucywgY2IpO1xuICAgfVxuXG4gICAvKipcbiAgICAqIFVwZGF0ZSBhIHB1bGwgcmVxdWVzdFxuICAgICogQHNlZSBodHRwczovL2RldmVsb3Blci5naXRodWIuY29tL3YzL3B1bGxzLyN1cGRhdGUtYS1wdWxsLXJlcXVlc3RcbiAgICAqIEBwYXJhbSB7bnVtYmVyfHN0cmluZ30gbnVtYmVyIC0gdGhlIG51bWJlciBvZiB0aGUgcHVsbCByZXF1ZXN0IHRvIHVwZGF0ZVxuICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSB0aGUgcHVsbCByZXF1ZXN0IGRlc2NyaXB0aW9uXG4gICAgKiBAcGFyYW0ge1JlcXVlc3RhYmxlLmNhbGxiYWNrfSBbY2JdIC0gd2lsbCByZWNlaXZlIHRoZSBwdWxsIHJlcXVlc3QgaW5mb3JtYXRpb25cbiAgICAqIEByZXR1cm4ge1Byb21pc2V9IC0gdGhlIHByb21pc2UgZm9yIHRoZSBodHRwIHJlcXVlc3RcbiAgICAqL1xuICAgdXBkYXRlUHVsbFJlcXVzdChudW1iZXIsIG9wdGlvbnMsIGNiKSB7XG4gICAgICByZXR1cm4gdGhpcy5fcmVxdWVzdCgnUEFUQ0gnLCBgL3JlcG9zLyR7dGhpcy5fX2Z1bGxuYW1lfS9wdWxscy8ke251bWJlcn1gLCBvcHRpb25zLCBjYik7XG4gICB9XG5cbiAgIC8qKlxuICAgICogTGlzdCB0aGUgaG9va3MgZm9yIHRoZSByZXBvc2l0b3J5XG4gICAgKiBAc2VlIGh0dHBzOi8vZGV2ZWxvcGVyLmdpdGh1Yi5jb20vdjMvcmVwb3MvaG9va3MvI2xpc3QtaG9va3NcbiAgICAqIEBwYXJhbSB7UmVxdWVzdGFibGUuY2FsbGJhY2t9IGNiIC0gd2lsbCByZWNlaXZlIHRoZSBsaXN0IG9mIGhvb2tzXG4gICAgKiBAcmV0dXJuIHtQcm9taXNlfSAtIHRoZSBwcm9taXNlIGZvciB0aGUgaHR0cCByZXF1ZXN0XG4gICAgKi9cbiAgIGxpc3RIb29rcyhjYikge1xuICAgICAgcmV0dXJuIHRoaXMuX3JlcXVlc3QoJ0dFVCcsIGAvcmVwb3MvJHt0aGlzLl9fZnVsbG5hbWV9L2hvb2tzYCwgbnVsbCwgY2IpO1xuICAgfVxuXG4gICAvKipcbiAgICAqIEdldCBhIGhvb2sgZm9yIHRoZSByZXBvc2l0b3J5XG4gICAgKiBAc2VlIGh0dHBzOi8vZGV2ZWxvcGVyLmdpdGh1Yi5jb20vdjMvcmVwb3MvaG9va3MvI2dldC1zaW5nbGUtaG9va1xuICAgICogQHBhcmFtIHtudW1iZXJ9IGlkIC0gdGhlIGlkIG9mIHRoZSB3ZWJvb2tcbiAgICAqIEBwYXJhbSB7UmVxdWVzdGFibGUuY2FsbGJhY2t9IGNiIC0gd2lsbCByZWNlaXZlIHRoZSBkZXRhaWxzIG9mIHRoZSB3ZWJvb2tcbiAgICAqIEByZXR1cm4ge1Byb21pc2V9IC0gdGhlIHByb21pc2UgZm9yIHRoZSBodHRwIHJlcXVlc3RcbiAgICAqL1xuICAgZ2V0SG9vayhpZCwgY2IpIHtcbiAgICAgIHJldHVybiB0aGlzLl9yZXF1ZXN0KCdHRVQnLCBgL3JlcG9zLyR7dGhpcy5fX2Z1bGxuYW1lfS9ob29rcy8ke2lkfWAsIG51bGwsIGNiKTtcbiAgIH1cblxuICAgLyoqXG4gICAgKiBBZGQgYSBuZXcgaG9vayB0byB0aGUgcmVwb3NpdG9yeVxuICAgICogQHNlZSBodHRwczovL2RldmVsb3Blci5naXRodWIuY29tL3YzL3JlcG9zL2hvb2tzLyNjcmVhdGUtYS1ob29rXG4gICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIHRoZSBjb25maWd1cmF0aW9uIGRlc2NyaWJpbmcgdGhlIG5ldyBob29rXG4gICAgKiBAcGFyYW0ge1JlcXVlc3RhYmxlLmNhbGxiYWNrfSBjYiAtIHdpbGwgcmVjZWl2ZSB0aGUgbmV3IHdlYmhvb2tcbiAgICAqIEByZXR1cm4ge1Byb21pc2V9IC0gdGhlIHByb21pc2UgZm9yIHRoZSBodHRwIHJlcXVlc3RcbiAgICAqL1xuICAgY3JlYXRlSG9vayhvcHRpb25zLCBjYikge1xuICAgICAgcmV0dXJuIHRoaXMuX3JlcXVlc3QoJ1BPU1QnLCBgL3JlcG9zLyR7dGhpcy5fX2Z1bGxuYW1lfS9ob29rc2AsIG9wdGlvbnMsIGNiKTtcbiAgIH1cblxuICAgLyoqXG4gICAgKiBFZGl0IGFuIGV4aXN0aW5nIHdlYmhvb2tcbiAgICAqIEBzZWUgaHR0cHM6Ly9kZXZlbG9wZXIuZ2l0aHViLmNvbS92My9yZXBvcy9ob29rcy8jZWRpdC1hLWhvb2tcbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBpZCAtIHRoZSBpZCBvZiB0aGUgd2ViaG9va1xuICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSB0aGUgbmV3IGRlc2NyaXB0aW9uIG9mIHRoZSB3ZWJob29rXG4gICAgKiBAcGFyYW0ge1JlcXVlc3RhYmxlLmNhbGxiYWNrfSBjYiAtIHdpbGwgcmVjZWl2ZSB0aGUgdXBkYXRlZCB3ZWJob29rXG4gICAgKiBAcmV0dXJuIHtQcm9taXNlfSAtIHRoZSBwcm9taXNlIGZvciB0aGUgaHR0cCByZXF1ZXN0XG4gICAgKi9cbiAgIHVwZGF0ZUhvb2soaWQsIG9wdGlvbnMsIGNiKSB7XG4gICAgICByZXR1cm4gdGhpcy5fcmVxdWVzdCgnUEFUQ0gnLCBgL3JlcG9zLyR7dGhpcy5fX2Z1bGxuYW1lfS9ob29rcy8ke2lkfWAsIG9wdGlvbnMsIGNiKTtcbiAgIH1cblxuICAgLyoqXG4gICAgKiBEZWxldGUgYSB3ZWJob29rXG4gICAgKiBAc2VlIGh0dHBzOi8vZGV2ZWxvcGVyLmdpdGh1Yi5jb20vdjMvcmVwb3MvaG9va3MvI2RlbGV0ZS1hLWhvb2tcbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBpZCAtIHRoZSBpZCBvZiB0aGUgd2ViaG9vayB0byBiZSBkZWxldGVkXG4gICAgKiBAcGFyYW0ge1JlcXVlc3RhYmxlLmNhbGxiYWNrfSBjYiAtIHdpbGwgcmVjZWl2ZSB0cnVlIGlmIHRoZSBjYWxsIGlzIHN1Y2Nlc3NmdWxcbiAgICAqIEByZXR1cm4ge1Byb21pc2V9IC0gdGhlIHByb21pc2UgZm9yIHRoZSBodHRwIHJlcXVlc3RcbiAgICAqL1xuICAgZGVsZXRlSG9vayhpZCwgY2IpIHtcbiAgICAgIHJldHVybiB0aGlzLl9yZXF1ZXN0KCdERUxFVEUnLCBgJHt0aGlzLl9fcmVwb1BhdGh9L2hvb2tzLyR7aWR9YCwgbnVsbCwgY2IpO1xuICAgfVxuXG4gICAvKipcbiAgICAqIERlbGV0ZSBhIGZpbGUgZnJvbSBhIGJyYW5jaFxuICAgICogQHNlZSBodHRwczovL2RldmVsb3Blci5naXRodWIuY29tL3YzL3JlcG9zL2NvbnRlbnRzLyNkZWxldGUtYS1maWxlXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gYnJhbmNoIC0gdGhlIGJyYW5jaCB0byBkZWxldGUgZnJvbSwgb3IgdGhlIGRlZmF1bHQgYnJhbmNoIGlmIG5vdCBzcGVjaWZpZWRcbiAgICAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoIC0gdGhlIHBhdGggb2YgdGhlIGZpbGUgdG8gcmVtb3ZlXG4gICAgKiBAcGFyYW0ge1JlcXVlc3RhYmxlLmNhbGxiYWNrfSBjYiAtIHdpbGwgcmVjZWl2ZSB0aGUgY29tbWl0IGluIHdoaWNoIHRoZSBkZWxldGUgb2NjdXJyZWRcbiAgICAqIEByZXR1cm4ge1Byb21pc2V9IC0gdGhlIHByb21pc2UgZm9yIHRoZSBodHRwIHJlcXVlc3RcbiAgICAqL1xuICAgZGVsZXRlRmlsZShicmFuY2gsIHBhdGgsIGNiKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRTaGEoYnJhbmNoLCBwYXRoKVxuICAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBkZWxldGVDb21taXQgPSB7XG4gICAgICAgICAgICAgICBtZXNzYWdlOiBgRGVsZXRlIHRoZSBmaWxlIGF0ICcke3BhdGh9J2AsXG4gICAgICAgICAgICAgICBzaGE6IHJlc3BvbnNlLmRhdGEuc2hhLFxuICAgICAgICAgICAgICAgYnJhbmNoXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3JlcXVlc3QoJ0RFTEVURScsIGAvcmVwb3MvJHt0aGlzLl9fZnVsbG5hbWV9L2NvbnRlbnRzLyR7cGF0aH1gLCBkZWxldGVDb21taXQsIGNiKTtcbiAgICAgICAgIH0pO1xuICAgfVxuXG4gICAvKipcbiAgICAqIENoYW5nZSBhbGwgcmVmZXJlbmNlcyBpbiBhIHJlcG8gZnJvbSBvbGRQYXRoIHRvIG5ld19wYXRoXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gYnJhbmNoIC0gdGhlIGJyYW5jaCB0byBjYXJyeSBvdXQgdGhlIHJlZmVyZW5jZSBjaGFuZ2UsIG9yIHRoZSBkZWZhdWx0IGJyYW5jaCBpZiBub3Qgc3BlY2lmaWVkXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gb2xkUGF0aCAtIG9yaWdpbmFsIHBhdGhcbiAgICAqIEBwYXJhbSB7c3RyaW5nfSBuZXdQYXRoIC0gbmV3IHJlZmVyZW5jZSBwYXRoXG4gICAgKiBAcGFyYW0ge1JlcXVlc3RhYmxlLmNhbGxiYWNrfSBjYiAtIHdpbGwgcmVjZWl2ZSB0aGUgY29tbWl0IGluIHdoaWNoIHRoZSBtb3ZlIG9jY3VycmVkXG4gICAgKiBAcmV0dXJuIHtQcm9taXNlfSAtIHRoZSBwcm9taXNlIGZvciB0aGUgaHR0cCByZXF1ZXN0XG4gICAgKi9cbiAgIG1vdmUoYnJhbmNoLCBvbGRQYXRoLCBuZXdQYXRoLCBjYikge1xuICAgICAgbGV0IG9sZFNoYTtcbiAgICAgIHJldHVybiB0aGlzLmdldFJlZihgaGVhZHMvJHticmFuY2h9YClcbiAgICAgICAgIC50aGVuKCh7ZGF0YToge29iamVjdH19KSA9PiB0aGlzLmdldFRyZWUoYCR7b2JqZWN0LnNoYX0/cmVjdXJzaXZlPXRydWVgKSlcbiAgICAgICAgIC50aGVuKCh7ZGF0YToge3RyZWUsIHNoYX19KSA9PiB7XG4gICAgICAgICAgICBvbGRTaGEgPSBzaGE7XG4gICAgICAgICAgICBsZXQgbmV3VHJlZSA9IHRyZWUubWFwKChyZWYpID0+IHtcbiAgICAgICAgICAgICAgIGlmIChyZWYucGF0aCA9PT0gb2xkUGF0aCkge1xuICAgICAgICAgICAgICAgICAgcmVmLnBhdGggPSBuZXdQYXRoO1xuICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgaWYgKHJlZi50eXBlID09PSAndHJlZScpIHtcbiAgICAgICAgICAgICAgICAgIGRlbGV0ZSByZWYuc2hhO1xuICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgcmV0dXJuIHJlZjtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlVHJlZShuZXdUcmVlKTtcbiAgICAgICAgIH0pXG4gICAgICAgICAudGhlbigoe2RhdGE6IHRyZWV9KSA9PiB0aGlzLmNvbW1pdChvbGRTaGEsIHRyZWUuc2hhLCBgUmVuYW1lZCAnJHtvbGRQYXRofScgdG8gJyR7bmV3UGF0aH0nYCkpXG4gICAgICAgICAudGhlbigoe2RhdGE6IGNvbW1pdH0pID0+IHRoaXMudXBkYXRlSGVhZChgaGVhZHMvJHticmFuY2h9YCwgY29tbWl0LnNoYSwgdHJ1ZSwgY2IpKTtcbiAgIH1cblxuICAgLyoqXG4gICAgKiBXcml0ZSBhIGZpbGUgdG8gdGhlIHJlcG9zaXRvcnlcbiAgICAqIEBzZWUgaHR0cHM6Ly9kZXZlbG9wZXIuZ2l0aHViLmNvbS92My9yZXBvcy9jb250ZW50cy8jdXBkYXRlLWEtZmlsZVxuICAgICogQHBhcmFtIHtzdHJpbmd9IGJyYW5jaCAtIHRoZSBuYW1lIG9mIHRoZSBicmFuY2hcbiAgICAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoIC0gdGhlIHBhdGggZm9yIHRoZSBmaWxlXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gY29udGVudCAtIHRoZSBjb250ZW50cyBvZiB0aGUgZmlsZVxuICAgICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2UgLSB0aGUgY29tbWl0IG1lc3NhZ2VcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gLSBjb21taXQgb3B0aW9uc1xuICAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zLmF1dGhvcl0gLSB0aGUgYXV0aG9yIG9mIHRoZSBjb21taXRcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucy5jb21taXRlcl0gLSB0aGUgY29tbWl0dGVyXG4gICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmVuY29kZV0gLSB0cnVlIGlmIHRoZSBjb250ZW50IHNob3VsZCBiZSBiYXNlNjQgZW5jb2RlZFxuICAgICogQHBhcmFtIHtSZXF1ZXN0YWJsZS5jYWxsYmFja30gY2IgLSB3aWxsIHJlY2VpdmUgdGhlIG5ldyBjb21taXRcbiAgICAqIEByZXR1cm4ge1Byb21pc2V9IC0gdGhlIHByb21pc2UgZm9yIHRoZSBodHRwIHJlcXVlc3RcbiAgICAqL1xuICAgd3JpdGVGaWxlKGJyYW5jaCwgcGF0aCwgY29udGVudCwgbWVzc2FnZSwgb3B0aW9ucywgY2IpIHtcbiAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgY2IgPSBvcHRpb25zO1xuICAgICAgICAgb3B0aW9ucyA9IHt9O1xuICAgICAgfVxuICAgICAgbGV0IGZpbGVQYXRoID0gcGF0aCA/IGVuY29kZVVSSShwYXRoKSA6ICcnO1xuICAgICAgbGV0IHNob3VsZEVuY29kZSA9IG9wdGlvbnMuZW5jb2RlICE9PSBmYWxzZTtcbiAgICAgIGxldCBjb21taXQgPSB7XG4gICAgICAgICBicmFuY2gsXG4gICAgICAgICBtZXNzYWdlLFxuICAgICAgICAgYXV0aG9yOiBvcHRpb25zLmF1dGhvcixcbiAgICAgICAgIGNvbW1pdHRlcjogb3B0aW9ucy5jb21taXR0ZXIsXG4gICAgICAgICBjb250ZW50OiBzaG91bGRFbmNvZGUgPyBCYXNlNjQuZW5jb2RlKGNvbnRlbnQpIDogY29udGVudFxuICAgICAgfTtcblxuICAgICAgcmV0dXJuIHRoaXMuZ2V0U2hhKGJyYW5jaCwgZmlsZVBhdGgpXG4gICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgIGNvbW1pdC5zaGEgPSByZXNwb25zZS5kYXRhLnNoYTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9yZXF1ZXN0KCdQVVQnLCBgL3JlcG9zLyR7dGhpcy5fX2Z1bGxuYW1lfS9jb250ZW50cy8ke2ZpbGVQYXRofWAsIGNvbW1pdCwgY2IpO1xuICAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3JlcXVlc3QoJ1BVVCcsIGAvcmVwb3MvJHt0aGlzLl9fZnVsbG5hbWV9L2NvbnRlbnRzLyR7ZmlsZVBhdGh9YCwgY29tbWl0LCBjYik7XG4gICAgICAgICB9KTtcbiAgIH1cblxuICAgLyoqXG4gICAgKiBDaGVjayBpZiBhIHJlcG9zaXRvcnkgaXMgc3RhcnJlZCBieSB5b3VcbiAgICAqIEBzZWUgaHR0cHM6Ly9kZXZlbG9wZXIuZ2l0aHViLmNvbS92My9hY3Rpdml0eS9zdGFycmluZy8jY2hlY2staWYteW91LWFyZS1zdGFycmluZy1hLXJlcG9zaXRvcnlcbiAgICAqIEBwYXJhbSB7UmVxdWVzdGFibGUuY2FsbGJhY2t9IGNiIC0gd2lsbCByZWNlaXZlIHRydWUgaWYgdGhlIHJlcG9zaXRvcnkgaXMgc3RhcnJlZCBhbmQgZmFsc2UgaWYgdGhlIHJlcG9zaXRvcnlcbiAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzIG5vdCBzdGFycmVkXG4gICAgKiBAcmV0dXJuIHtQcm9taXNlfSAtIHRoZSBwcm9taXNlIGZvciB0aGUgaHR0cCByZXF1ZXN0IHtCb29sZWFufSBbZGVzY3JpcHRpb25dXG4gICAgKi9cbiAgIGlzU3RhcnJlZChjYikge1xuICAgICAgcmV0dXJuIHRoaXMuX3JlcXVlc3QyMDRvcjQwNChgL3VzZXIvc3RhcnJlZC8ke3RoaXMuX19mdWxsbmFtZX1gLCBudWxsLCBjYik7XG4gICB9XG5cbiAgIC8qKlxuICAgICogU3RhciBhIHJlcG9zaXRvcnlcbiAgICAqIEBzZWUgaHR0cHM6Ly9kZXZlbG9wZXIuZ2l0aHViLmNvbS92My9hY3Rpdml0eS9zdGFycmluZy8jc3Rhci1hLXJlcG9zaXRvcnlcbiAgICAqIEBwYXJhbSB7UmVxdWVzdGFibGUuY2FsbGJhY2t9IGNiIC0gd2lsbCByZWNlaXZlIHRydWUgaWYgdGhlIHJlcG9zaXRvcnkgaXMgc3RhcnJlZFxuICAgICogQHJldHVybiB7UHJvbWlzZX0gLSB0aGUgcHJvbWlzZSBmb3IgdGhlIGh0dHAgcmVxdWVzdFxuICAgICovXG4gICBzdGFyKGNiKSB7XG4gICAgICByZXR1cm4gdGhpcy5fcmVxdWVzdCgnUFVUJywgYC91c2VyL3N0YXJyZWQvJHt0aGlzLl9fZnVsbG5hbWV9YCwgbnVsbCwgY2IpO1xuICAgfVxuXG4gICAvKipcbiAgICAqIFVuc3RhciBhIHJlcG9zaXRvcnlcbiAgICAqIEBzZWUgaHR0cHM6Ly9kZXZlbG9wZXIuZ2l0aHViLmNvbS92My9hY3Rpdml0eS9zdGFycmluZy8jdW5zdGFyLWEtcmVwb3NpdG9yeVxuICAgICogQHBhcmFtIHtSZXF1ZXN0YWJsZS5jYWxsYmFja30gY2IgLSB3aWxsIHJlY2VpdmUgdHJ1ZSBpZiB0aGUgcmVwb3NpdG9yeSBpcyB1bnN0YXJyZWRcbiAgICAqIEByZXR1cm4ge1Byb21pc2V9IC0gdGhlIHByb21pc2UgZm9yIHRoZSBodHRwIHJlcXVlc3RcbiAgICAqL1xuICAgdW5zdGFyKGNiKSB7XG4gICAgICByZXR1cm4gdGhpcy5fcmVxdWVzdCgnREVMRVRFJywgYC91c2VyL3N0YXJyZWQvJHt0aGlzLl9fZnVsbG5hbWV9YCwgbnVsbCwgY2IpO1xuICAgfVxuXG4gICAvKipcbiAgICAqIENyZWF0ZSBhIG5ldyByZWxlYXNlXG4gICAgKiBAc2VlIGh0dHBzOi8vZGV2ZWxvcGVyLmdpdGh1Yi5jb20vdjMvcmVwb3MvcmVsZWFzZXMvI2NyZWF0ZS1hLXJlbGVhc2VcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gdGhlIGRlc2NyaXB0aW9uIG9mIHRoZSByZWxlYXNlXG4gICAgKiBAcGFyYW0ge1JlcXVlc3RhYmxlLmNhbGxiYWNrfSBjYiAtIHdpbGwgcmVjZWl2ZSB0aGUgbmV3bHkgY3JlYXRlZCByZWxlYXNlXG4gICAgKiBAcmV0dXJuIHtQcm9taXNlfSAtIHRoZSBwcm9taXNlIGZvciB0aGUgaHR0cCByZXF1ZXN0XG4gICAgKi9cbiAgIGNyZWF0ZVJlbGVhc2Uob3B0aW9ucywgY2IpIHtcbiAgICAgIHJldHVybiB0aGlzLl9yZXF1ZXN0KCdQT1NUJywgYC9yZXBvcy8ke3RoaXMuX19mdWxsbmFtZX0vcmVsZWFzZXNgLCBvcHRpb25zLCBjYik7XG4gICB9XG5cbiAgIC8qKlxuICAgICogRWRpdCBhIHJlbGVhc2VcbiAgICAqIEBzZWUgaHR0cHM6Ly9kZXZlbG9wZXIuZ2l0aHViLmNvbS92My9yZXBvcy9yZWxlYXNlcy8jZWRpdC1hLXJlbGVhc2VcbiAgICAqIEBwYXJhbSB7c3RyaW5nfSBpZCAtIHRoZSBpZCBvZiB0aGUgcmVsZWFzZVxuICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSB0aGUgZGVzY3JpcHRpb24gb2YgdGhlIHJlbGVhc2VcbiAgICAqIEBwYXJhbSB7UmVxdWVzdGFibGUuY2FsbGJhY2t9IGNiIC0gd2lsbCByZWNlaXZlIHRoZSBtb2RpZmllZCByZWxlYXNlXG4gICAgKiBAcmV0dXJuIHtQcm9taXNlfSAtIHRoZSBwcm9taXNlIGZvciB0aGUgaHR0cCByZXF1ZXN0XG4gICAgKi9cbiAgIHVwZGF0ZVJlbGVhc2UoaWQsIG9wdGlvbnMsIGNiKSB7XG4gICAgICByZXR1cm4gdGhpcy5fcmVxdWVzdCgnUEFUQ0gnLCBgL3JlcG9zLyR7dGhpcy5fX2Z1bGxuYW1lfS9yZWxlYXNlcy8ke2lkfWAsIG9wdGlvbnMsIGNiKTtcbiAgIH1cblxuICAgLyoqXG4gICAgKiBHZXQgaW5mb3JtYXRpb24gYWJvdXQgYWxsIHJlbGVhc2VzXG4gICAgKiBAc2VlIGh0dHBzOi8vZGV2ZWxvcGVyLmdpdGh1Yi5jb20vdjMvcmVwb3MvcmVsZWFzZXMvI2xpc3QtcmVsZWFzZXMtZm9yLWEtcmVwb3NpdG9yeVxuICAgICogQHBhcmFtIHtSZXF1ZXN0YWJsZS5jYWxsYmFja30gY2IgLSB3aWxsIHJlY2VpdmUgdGhlIHJlbGVhc2UgaW5mb3JtYXRpb25cbiAgICAqIEByZXR1cm4ge1Byb21pc2V9IC0gdGhlIHByb21pc2UgZm9yIHRoZSBodHRwIHJlcXVlc3RcbiAgICAqL1xuICAgbGlzdFJlbGVhc2VzKGNiKSB7XG4gICAgICByZXR1cm4gdGhpcy5fcmVxdWVzdCgnR0VUJywgYC9yZXBvcy8ke3RoaXMuX19mdWxsbmFtZX0vcmVsZWFzZXNgLCBudWxsLCBjYik7XG4gICB9XG5cbiAgIC8qKlxuICAgICogR2V0IGluZm9ybWF0aW9uIGFib3V0IGEgcmVsZWFzZVxuICAgICogQHNlZSBodHRwczovL2RldmVsb3Blci5naXRodWIuY29tL3YzL3JlcG9zL3JlbGVhc2VzLyNnZXQtYS1zaW5nbGUtcmVsZWFzZVxuICAgICogQHBhcmFtIHtzdHJpZ259IGlkIC0gdGhlIGlkIG9mIHRoZSByZWxlYXNlXG4gICAgKiBAcGFyYW0ge1JlcXVlc3RhYmxlLmNhbGxiYWNrfSBjYiAtIHdpbGwgcmVjZWl2ZSB0aGUgcmVsZWFzZSBpbmZvcm1hdGlvblxuICAgICogQHJldHVybiB7UHJvbWlzZX0gLSB0aGUgcHJvbWlzZSBmb3IgdGhlIGh0dHAgcmVxdWVzdFxuICAgICovXG4gICBnZXRSZWxlYXNlKGlkLCBjYikge1xuICAgICAgcmV0dXJuIHRoaXMuX3JlcXVlc3QoJ0dFVCcsIGAvcmVwb3MvJHt0aGlzLl9fZnVsbG5hbWV9L3JlbGVhc2VzLyR7aWR9YCwgbnVsbCwgY2IpO1xuICAgfVxuXG4gICAvKipcbiAgICAqIERlbGV0ZSBhIHJlbGVhc2VcbiAgICAqIEBzZWUgaHR0cHM6Ly9kZXZlbG9wZXIuZ2l0aHViLmNvbS92My9yZXBvcy9yZWxlYXNlcy8jZGVsZXRlLWEtcmVsZWFzZVxuICAgICogQHBhcmFtIHtzdHJpbmd9IGlkIC0gdGhlIHJlbGVhc2UgdG8gYmUgZGVsZXRlZFxuICAgICogQHBhcmFtIHtSZXF1ZXN0YWJsZS5jYWxsYmFja30gY2IgLSB3aWxsIHJlY2VpdmUgdHJ1ZSBpZiB0aGUgb3BlcmF0aW9uIGlzIHN1Y2Nlc3NmdWxcbiAgICAqIEByZXR1cm4ge1Byb21pc2V9IC0gdGhlIHByb21pc2UgZm9yIHRoZSBodHRwIHJlcXVlc3RcbiAgICAqL1xuICAgZGVsZXRlUmVsZWFzZShpZCwgY2IpIHtcbiAgICAgIHJldHVybiB0aGlzLl9yZXF1ZXN0KCdERUxFVEUnLCBgL3JlcG9zLyR7dGhpcy5fX2Z1bGxuYW1lfS9yZWxlYXNlcy8ke2lkfWAsIG51bGwsIGNiKTtcbiAgIH1cblxuICAgLyoqXG4gICAgKiBNZXJnZSBhIHB1bGwgcmVxdWVzdFxuICAgICogQHNlZSBodHRwczovL2RldmVsb3Blci5naXRodWIuY29tL3YzL3B1bGxzLyNtZXJnZS1hLXB1bGwtcmVxdWVzdC1tZXJnZS1idXR0b25cbiAgICAqIEBwYXJhbSB7bnVtYmVyfHN0cmluZ30gbnVtYmVyIC0gdGhlIG51bWJlciBvZiB0aGUgcHVsbCByZXF1ZXN0IHRvIG1lcmdlXG4gICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIHRoZSBtZXJnZSBvcHRpb25zIGZvciB0aGUgcHVsbCByZXF1ZXN0XG4gICAgKiBAcGFyYW0ge1JlcXVlc3RhYmxlLmNhbGxiYWNrfSBbY2JdIC0gd2lsbCByZWNlaXZlIHRoZSBtZXJnZSBpbmZvcm1hdGlvbiBpZiB0aGUgb3BlcmF0aW9uIGlzIHN1Y2Nlc3NmdWxcbiAgICAqIEByZXR1cm4ge1Byb21pc2V9IC0gdGhlIHByb21pc2UgZm9yIHRoZSBodHRwIHJlcXVlc3RcbiAgICAqL1xuICAgbWVyZ2VQdWxsUmVxdWVzdChudW1iZXIsIG9wdGlvbnMsIGNiKSB7XG4gICAgICByZXR1cm4gdGhpcy5fcmVxdWVzdCgnUFVUJywgYC9yZXBvcy8ke3RoaXMuX19mdWxsbmFtZX0vcHVsbHMvJHtudW1iZXJ9L21lcmdlYCwgb3B0aW9ucywgY2IpO1xuICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFJlcG9zaXRvcnk7XG4iXX0=
//# sourceMappingURL=Repository.js.map
