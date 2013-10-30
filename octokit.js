(function() {
  var Octokit, encode, err, jQuery, makeOctokit, moduleName, najax, _, _i, _len, _ref,
    _this = this,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  makeOctokit = function(_, jQuery, base64encode, userAgent) {
    var Octokit;
    Octokit = (function() {
      function Octokit(clientOptions) {
        var AuthenticatedUser, Branch, ETagResponse, Gist, GitRepo, Organization, Repository, Team, User, clearCache, notifyEnd, notifyStart, toQueryString, _cachedETags, _client, _listeners, _request;
        if (clientOptions == null) {
          clientOptions = {};
        }
        _.defaults(clientOptions, {
          rootURL: 'https://api.github.com',
          useETags: true
        });
        _client = this;
        _listeners = [];
        ETagResponse = (function() {
          function ETagResponse(eTag, data, textStatus, jqXHR) {
            this.eTag = eTag;
            this.data = data;
            this.textStatus = textStatus;
            this.jqXHR = jqXHR;
          }

          return ETagResponse;

        })();
        _cachedETags = {};
        notifyStart = function(promise, path) {
          return promise.notify({
            type: 'start',
            path: path
          });
        };
        notifyEnd = function(promise, path) {
          return promise.notify({
            type: 'end',
            path: path
          });
        };
        _request = function(method, path, data, options) {
          var ajaxConfig, auth, headers, jqXHR, mimeType, promise,
            _this = this;
          if (options == null) {
            options = {
              raw: false,
              isBase64: false,
              isBoolean: false
            };
          }
          mimeType = void 0;
          if (options.isBase64) {
            mimeType = 'text/plain; charset=x-user-defined';
          }
          headers = {
            'Accept': 'application/vnd.github.raw'
          };
          if (userAgent) {
            headers['User-Agent'] = userAgent;
          }
          if (path in _cachedETags) {
            headers['If-None-Match'] = _cachedETags[path].eTag;
          } else {
            headers['If-Modified-Since'] = 'Thu, 01 Jan 1970 00:00:00 GMT';
          }
          if (clientOptions.token || (clientOptions.username && clientOptions.password)) {
            if (clientOptions.token) {
              auth = "token " + clientOptions.token;
            } else {
              auth = 'Basic ' + base64encode("" + clientOptions.username + ":" + clientOptions.password);
            }
            headers['Authorization'] = auth;
          }
          promise = new jQuery.Deferred();
          ajaxConfig = {
            url: clientOptions.rootURL + path,
            type: method,
            contentType: 'application/json',
            mimeType: mimeType,
            headers: headers,
            processData: false,
            data: !options.raw && data && JSON.stringify(data) || data,
            dataType: !options.raw ? 'json' : void 0
          };
          if (options.isBoolean) {
            ajaxConfig.statusCode = {
              204: function() {
                notifyEnd(promise, path);
                return promise.resolve(true);
              },
              404: function() {
                notifyEnd(promise, path);
                return promise.resolve(false);
              }
            };
          }
          jqXHR = jQuery.ajax(ajaxConfig);
          jqXHR.always(function() {
            var listener, rateLimit, rateLimitRemaining, _i, _len, _results;
            notifyEnd(promise, path);
            rateLimit = parseFloat(jqXHR.getResponseHeader('X-RateLimit-Limit'));
            rateLimitRemaining = parseFloat(jqXHR.getResponseHeader('X-RateLimit-Remaining'));
            _results = [];
            for (_i = 0, _len = _listeners.length; _i < _len; _i++) {
              listener = _listeners[_i];
              _results.push(listener(rateLimitRemaining, rateLimit, method, path, data, options));
            }
            return _results;
          });
          jqXHR.done(function(data, textStatus) {
            var converted, eTag, eTagResponse, i, _i, _ref;
            if (304 === jqXHR.status) {
              if (clientOptions.useETags && _cachedETags[path]) {
                eTagResponse = _cachedETags[path];
                return promise.resolve(eTagResponse.data, eTagResponse.textStatus, eTagResponse.jqXHR);
              } else {
                return promise.resolve(jqXHR.responseText, textStatus, jqXHR);
              }
            } else if (204 === jqXHR.status && options.isBoolean) {
              return promise.resolve(true, textStatus, jqXHR);
            } else {
              if ('GET' === method && options.isBase64) {
                converted = '';
                for (i = _i = 0, _ref = data.length; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
                  converted += String.fromCharCode(data.charCodeAt(i) & 0xff);
                }
                data = converted;
              }
              if ('GET' === method && jqXHR.getResponseHeader('ETag') && clientOptions.useETags) {
                eTag = jqXHR.getResponseHeader('ETag');
                _cachedETags[path] = new ETagResponse(eTag, data, textStatus, jqXHR);
              }
              return promise.resolve(data, textStatus, jqXHR);
            }
          }).fail(function(unused, msg, desc) {
            var json;
            if (options.isBoolean && 404 === jqXHR.status) {
              return promise.resolve(false);
            } else {
              if (jqXHR.getResponseHeader('Content-Type') !== 'application/json; charset=utf-8') {
                return promise.reject({
                  error: jqXHR.responseText,
                  status: jqXHR.status,
                  _jqXHR: jqXHR
                });
              } else {
                if (jqXHR.responseText) {
                  json = JSON.parse(jqXHR.responseText);
                } else {
                  json = '';
                }
                return promise.reject({
                  error: json,
                  status: jqXHR.status,
                  _jqXHR: jqXHR
                });
              }
            }
          });
          notifyStart(promise, path);
          return promise.promise();
        };
        toQueryString = function(options) {
          var params;
          if (_.isEmpty(options)) {
            return '';
          }
          params = [];
          _.each(_.pairs(options), function(_arg) {
            var key, value;
            key = _arg[0], value = _arg[1];
            return params.push("" + key + "=" + (encodeURIComponent(value)));
          });
          return "?" + (params.join('&'));
        };
        this.clearCache = clearCache = function() {
          return _cachedETags = {};
        };
        this.onRateLimitChanged = function(listener) {
          return _listeners.push(listener);
        };
        this.getZen = function() {
          return _request('GET', '/zen', null, {
            raw: true
          });
        };
        this.getAllUsers = function(since) {
          var options;
          if (since == null) {
            since = null;
          }
          options = {};
          if (since) {
            options.since = since;
          }
          return _request('GET', '/users', options);
        };
        this.getOrgRepos = function(orgName, type) {
          if (type == null) {
            type = 'all';
          }
          return _request('GET', "/orgs/" + orgName + "/repos?type=" + type + "&per_page=1000&sort=updated&direction=desc", null);
        };
        this.getPublicGists = function(since) {
          var getDate, options;
          if (since == null) {
            since = null;
          }
          options = null;
          getDate = function(time) {
            if (Date === time.constructor) {
              return time.toISOString();
            }
            return time;
          };
          if (since) {
            options = {
              since: getDate(since)
            };
          }
          return _request('GET', '/gists/public', options);
        };
        this.getPublicEvents = function() {
          return _request('GET', '/events', null);
        };
        this.getNotifications = function(options) {
          var getDate, queryString;
          if (options == null) {
            options = {};
          }
          getDate = function(time) {
            if (Date === time.constructor) {
              return time.toISOString();
            }
            return time;
          };
          if (options.since) {
            options.since = getDate(options.since);
          }
          queryString = toQueryString(options);
          return _request('GET', "/notifications" + queryString, null);
        };
        User = (function() {
          function User(_username) {
            var _cachedInfo, _rootPath;
            if (_username == null) {
              _username = null;
            }
            if (_username) {
              _rootPath = "/users/" + _username;
            } else {
              _rootPath = "/user";
            }
            _cachedInfo = null;
            this.getInfo = function(force) {
              var promise;
              if (force == null) {
                force = false;
              }
              if (force) {
                _cachedInfo = null;
              }
              if (_cachedInfo) {
                promise = new jQuery.Deferred();
                promise.resolve(_cachedInfo);
                return promise;
              }
              return _request('GET', "" + _rootPath, null).done(function(info) {
                return _cachedInfo = info;
              });
            };
            this.getRepos = function() {
              return _request('GET', "" + _rootPath + "/repos?type=all&per_page=1000&sort=updated", null);
            };
            this.getOrgs = function() {
              return _request('GET', "" + _rootPath + "/orgs", null);
            };
            this.getGists = function() {
              return _request('GET', "" + _rootPath + "/gists", null);
            };
            this.getFollowers = function() {
              return _request('GET', "" + _rootPath + "/followers", null);
            };
            this.getFollowing = function() {
              return _request('GET', "" + _rootPath + "/following", null);
            };
            this.isFollowing = function(user) {
              return _request('GET', "" + _rootPath + "/following/" + user, null, {
                isBoolean: true
              });
            };
            this.getPublicKeys = function() {
              return _request('GET', "" + _rootPath + "/keys", null);
            };
            this.getReceivedEvents = function(onlyPublic) {
              var isPublic;
              if (!_username) {
                throw new Error('BUG: This does not work for authenticated users yet!');
              }
              isPublic = '';
              if (onlyPublic) {
                isPublic = '/public';
              }
              return _request('GET', "/users/" + _username + "/received_events" + isPublic, null);
            };
            this.getEvents = function(onlyPublic) {
              var isPublic;
              if (!_username) {
                throw new Error('BUG: This does not work for authenticated users yet!');
              }
              isPublic = '';
              if (onlyPublic) {
                isPublic = '/public';
              }
              return _request('GET', "/users/" + _username + "/events" + isPublic, null);
            };
          }

          return User;

        })();
        AuthenticatedUser = (function(_super) {
          __extends(AuthenticatedUser, _super);

          function AuthenticatedUser() {
            AuthenticatedUser.__super__.constructor.call(this);
            this.updateInfo = function(options) {
              return _request('PATCH', '/user', options);
            };
            this.getGists = function() {
              return _request('GET', '/gists', null);
            };
            this.follow = function(username) {
              return _request('PUT', "/user/following/" + username, null);
            };
            this.unfollow = function(username) {
              return _request('DELETE', "/user/following/" + username, null);
            };
            this.getEmails = function() {
              return _request('GET', '/user/emails', null);
            };
            this.addEmail = function(emails) {
              if (!_.isArray(emails)) {
                emails = [emails];
              }
              return _request('POST', '/user/emails', emails);
            };
            this.addEmail = function(emails) {
              if (!_.isArray(emails)) {
                emails = [emails];
              }
              return _request('DELETE', '/user/emails', emails);
            };
            this.getPublicKey = function(id) {
              return _request('GET', "/user/keys/" + id, null);
            };
            this.addPublicKey = function(title, key) {
              return _request('POST', "/user/keys", {
                title: title,
                key: key
              });
            };
            this.updatePublicKey = function(id, options) {
              return _request('PATCH', "/user/keys/" + id, options);
            };
            this.createRepo = function(name, options) {
              if (options == null) {
                options = {};
              }
              options.name = name;
              return _request('POST', "/user/repos", options);
            };
          }

          return AuthenticatedUser;

        })(User);
        Team = (function() {
          function Team(id) {
            this.id = id;
            this.getInfo = function() {
              return _request('GET', "/teams/" + this.id, null);
            };
            this.updateTeam = function(options) {
              return _request('PATCH', "/teams/" + this.id, options);
            };
            this.remove = function() {
              return _request('DELETE', "/teams/" + this.id);
            };
            this.getMembers = function() {
              return _request('GET', "/teams/" + this.id + "/members");
            };
            this.isMember = function(user) {
              return _request('GET', "/teams/" + this.id + "/members/" + user, null, {
                isBoolean: true
              });
            };
            this.addMember = function(user) {
              return _request('PUT', "/teams/" + this.id + "/members/" + user);
            };
            this.removeMember = function(user) {
              return _request('DELETE', "/teams/" + this.id + "/members/" + user);
            };
            this.getRepos = function() {
              return _request('GET', "/teams/" + this.id + "/repos");
            };
            this.addRepo = function(orgName, repoName) {
              return _request('PUT', "/teams/" + this.id + "/repos/" + orgName + "/" + repoName);
            };
            this.removeRepo = function(orgName, repoName) {
              return _request('DELETE', "/teams/" + this.id + "/repos/" + orgName + "/" + repoName);
            };
          }

          return Team;

        })();
        Organization = (function() {
          function Organization(name) {
            this.name = name;
            this.getInfo = function() {
              return _request('GET', "/orgs/" + this.name, null);
            };
            this.updateInfo = function(options) {
              return _request('PATCH', "/orgs/" + this.name, options);
            };
            this.getTeams = function() {
              return _request('GET', "/orgs/" + this.name + "/teams", null);
            };
            this.createTeam = function(name, repoNames, permission) {
              var options;
              if (repoNames == null) {
                repoNames = null;
              }
              if (permission == null) {
                permission = 'pull';
              }
              options = {
                name: name,
                permission: permission
              };
              if (repoNames) {
                options.repo_names = repoNames;
              }
              return _request('POST', "/orgs/" + this.name + "/teams", options);
            };
            this.getMembers = function() {
              return _request('GET', "/orgs/" + this.name + "/members", null);
            };
            this.isMember = function(user) {
              return _request('GET', "/orgs/" + this.name + "/members/" + user, null, {
                isBoolean: true
              });
            };
            this.removeMember = function(user) {
              return _request('DELETE', "/orgs/" + this.name + "/members/" + user, null);
            };
            this.createRepo = function(name, options) {
              if (options == null) {
                options = {};
              }
              options.name = name;
              return _request('POST', "/orgs/" + this.name + "/repos", options);
            };
          }

          return Organization;

        })();
        GitRepo = (function() {
          function GitRepo(repoUser, repoName) {
            var _repoPath;
            this.repoUser = repoUser;
            this.repoName = repoName;
            _repoPath = "/repos/" + this.repoUser + "/" + this.repoName;
            this.deleteRepo = function() {
              return _request('DELETE', "" + _repoPath);
            };
            this._updateTree = function(branch) {
              return this.getRef("heads/" + branch).promise();
            };
            this.getRef = function(ref) {
              var _this = this;
              return _request('GET', "" + _repoPath + "/git/refs/" + ref, null).then(function(res) {
                return res.object.sha;
              }).promise();
            };
            this.createRef = function(options) {
              return _request('POST', "" + _repoPath + "/git/refs", options);
            };
            this.deleteRef = function(ref) {
              return _request('DELETE', "" + _repoPath + "/git/refs/" + ref, this.options);
            };
            this.getBranches = function() {
              var _this = this;
              return _request('GET', "" + _repoPath + "/git/refs/heads", null).then(function(heads) {
                return _.map(heads, function(head) {
                  return _.last(head.ref.split("/"));
                });
              }).promise();
            };
            this.getBlob = function(sha, isBase64) {
              return _request('GET', "" + _repoPath + "/git/blobs/" + sha, null, {
                raw: true,
                isBase64: isBase64
              });
            };
            this.getSha = function(branch, path) {
              var _this = this;
              if (path === '') {
                return this.getRef("heads/" + branch);
              }
              return this.getTree(branch, {
                recursive: true
              }).then(function(tree) {
                var file;
                file = _.select(tree, function(file) {
                  return file.path === path;
                })[0];
                if (file != null ? file.sha : void 0) {
                  return file != null ? file.sha : void 0;
                }
                return (new jQuery.Deferred()).reject({
                  message: 'SHA_NOT_FOUND'
                });
              }).promise();
            };
            this.getContents = function(path, sha) {
              var queryString,
                _this = this;
              if (sha == null) {
                sha = null;
              }
              queryString = '';
              if (sha !== null) {
                queryString = toQueryString({
                  ref: sha
                });
              }
              return _request('GET', "" + _repoPath + "/contents/" + path + queryString, null, {
                raw: true
              }).then(function(contents) {
                return contents;
              }).promise();
            };
            this.getTree = function(tree, options) {
              var queryString,
                _this = this;
              if (options == null) {
                options = null;
              }
              queryString = toQueryString(options);
              return _request('GET', "" + _repoPath + "/git/trees/" + tree + queryString, null).then(function(res) {
                return res.tree;
              }).promise();
            };
            this.postBlob = function(content, isBase64) {
              var _this = this;
              if (typeof content === 'string') {
                if (isBase64) {
                  content = base64encode(content);
                }
                content = {
                  content: content,
                  encoding: 'utf-8'
                };
              }
              if (isBase64) {
                content.encoding = 'base64';
              }
              return _request('POST', "" + _repoPath + "/git/blobs", content).then(function(res) {
                return res.sha;
              }).promise();
            };
            this.updateTreeMany = function(baseTree, newTree) {
              var data,
                _this = this;
              data = {
                base_tree: baseTree,
                tree: newTree
              };
              return _request('POST', "" + _repoPath + "/git/trees", data).then(function(res) {
                return res.sha;
              }).promise();
            };
            this.postTree = function(tree) {
              var _this = this;
              return _request('POST', "" + _repoPath + "/git/trees", {
                tree: tree
              }).then(function(res) {
                return res.sha;
              }).promise();
            };
            this.commit = function(parents, tree, message) {
              var data;
              if (!_.isArray(parents)) {
                parents = [parents];
              }
              data = {
                message: message,
                parents: parents,
                tree: tree
              };
              return _request('POST', "" + _repoPath + "/git/commits", data).then(function(commit) {
                return commit.sha;
              }).promise();
            };
            this.updateHead = function(head, commit) {
              return _request('PATCH', "" + _repoPath + "/git/refs/heads/" + head, {
                sha: commit
              });
            };
            this.getCommit = function(sha) {
              return _request('GET', "" + _repoPath + "/commits/" + sha, null);
            };
            this.getCommits = function(options) {
              var getDate, queryString;
              if (options == null) {
                options = {};
              }
              options = _.extend({}, options);
              getDate = function(time) {
                if (Date === time.constructor) {
                  return time.toISOString();
                }
                return time;
              };
              if (options.since) {
                options.since = getDate(options.since);
              }
              if (options.until) {
                options.until = getDate(options.until);
              }
              queryString = toQueryString(options);
              return _request('GET', "" + _repoPath + "/commits" + queryString, null).promise();
            };
          }

          return GitRepo;

        })();
        Branch = (function() {
          function Branch(git, getRef) {
            var _getRef, _git;
            _git = git;
            _getRef = getRef || function() {
              throw new Error('BUG: No way to fetch branch ref!');
            };
            this.getCommit = function(sha) {
              return _git.getCommit(sha);
            };
            this.getCommits = function(options) {
              if (options == null) {
                options = {};
              }
              options = _.extend({}, options);
              return _getRef().then(function(branch) {
                options.sha = branch;
                return _git.getCommits(options);
              }).promise();
            };
            this.createBranch = function(newBranchName) {
              var _this = this;
              return _getRef().then(function(branch) {
                return _git.getSha(branch, '').then(function(sha) {
                  return _git.createRef({
                    sha: sha,
                    ref: "refs/heads/" + newBranchName
                  });
                });
              }).promise();
            };
            this.read = function(path, isBase64) {
              var _this = this;
              return _getRef().then(function(branch) {
                return _git.getSha(branch, path).then(function(sha) {
                  return _git.getBlob(sha, isBase64).then(function(bytes) {
                    return {
                      sha: sha,
                      content: bytes
                    };
                  });
                });
              }).promise();
            };
            this.contents = function(path) {
              var _this = this;
              return _getRef().then(function(branch) {
                return _git.getSha(branch, '').then(function(sha) {
                  return _git.getContents(path, sha).then(function(contents) {
                    return contents;
                  });
                });
              }).promise();
            };
            this.remove = function(path, message) {
              var _this = this;
              if (message == null) {
                message = "Removed " + path;
              }
              return _getRef().then(function(branch) {
                return _git._updateTree(branch).then(function(latestCommit) {
                  return _git.getTree(latestCommit, {
                    recursive: true
                  }).then(function(tree) {
                    var newTree;
                    newTree = _.reject(tree, function(ref) {
                      return ref.path === path;
                    });
                    _.each(newTree, function(ref) {
                      if (ref.type === 'tree') {
                        return delete ref.sha;
                      }
                    });
                    return _git.postTree(newTree).then(function(rootTree) {
                      return _git.commit(latestCommit, rootTree, message).then(function(commit) {
                        return _git.updateHead(branch, commit).then(function(res) {
                          return res;
                        });
                      });
                    });
                  });
                });
              }).promise();
            };
            this.move = function(path, newPath, message) {
              var _this = this;
              if (message == null) {
                message = "Moved " + path;
              }
              return _getRef().then(function(branch) {
                return _git._updateTree(branch).then(function(latestCommit) {
                  return _git.getTree(latestCommit, {
                    recursive: true
                  }).then(function(tree) {
                    _.each(tree, function(ref) {
                      if (ref.path === path) {
                        ref.path = newPath;
                      }
                      if (ref.type === 'tree') {
                        return delete ref.sha;
                      }
                    });
                    return _git.postTree(tree).then(function(rootTree) {
                      return _git.commit(latestCommit, rootTree, message).then(function(commit) {
                        return _git.updateHead(branch, commit).then(function(res) {
                          return res;
                        });
                      });
                    });
                  });
                });
              }).promise();
            };
            this.write = function(path, content, message, isBase64, parentCommitSha) {
              var contents;
              if (message == null) {
                message = "Changed " + path;
              }
              if (parentCommitSha == null) {
                parentCommitSha = null;
              }
              contents = {};
              contents[path] = {
                content: content,
                isBase64: isBase64
              };
              return this.writeMany(contents, message, parentCommitSha).promise();
            };
            this.writeMany = function(contents, message, parentCommitShas) {
              var _this = this;
              if (message == null) {
                message = "Changed Multiple";
              }
              if (parentCommitShas == null) {
                parentCommitShas = null;
              }
              return _getRef().then(function(branch) {
                var afterParentCommitShas;
                afterParentCommitShas = function(parentCommitShas) {
                  var promises;
                  promises = _.map(_.pairs(contents), function(_arg) {
                    var content, data, isBase64, path,
                      _this = this;
                    path = _arg[0], data = _arg[1];
                    content = data.content || data;
                    isBase64 = data.isBase64 || false;
                    return _git.postBlob(content, isBase64).then(function(blob) {
                      return {
                        path: path,
                        mode: '100644',
                        type: 'blob',
                        sha: blob
                      };
                    });
                  });
                  return jQuery.when.apply(jQuery, promises).then(function(newTree1, newTree2, newTreeN) {
                    var newTrees;
                    newTrees = _.toArray(arguments);
                    return _git.updateTreeMany(parentCommitShas, newTrees).then(function(tree) {
                      return _git.commit(parentCommitShas, tree, message).then(function(commitSha) {
                        return _git.updateHead(branch, commitSha).then(function(res) {
                          return res.object;
                        });
                      });
                    });
                  });
                };
                if (parentCommitShas) {
                  return afterParentCommitShas(parentCommitShas);
                } else {
                  return _git._updateTree(branch).then(afterParentCommitShas);
                }
              }).promise();
            };
          }

          return Branch;

        })();
        Repository = (function() {
          function Repository(options) {
            var _repo, _user;
            this.options = options;
            _user = this.options.user;
            _repo = this.options.name;
            this.git = new GitRepo(_user, _repo);
            this.repoPath = "/repos/" + _user + "/" + _repo;
            this.currentTree = {
              branch: null,
              sha: null
            };
            this.getBranches = function() {
              return this.git.getBranches();
            };
            this.getBranch = function(branchName) {
              var getRef,
                _this = this;
              getRef = function() {
                var deferred;
                deferred = new jQuery.Deferred();
                deferred.resolve(branchName);
                return deferred;
              };
              return new Branch(this.git, getRef);
            };
            this.getDefaultBranch = function() {
              var getRef,
                _this = this;
              getRef = function() {
                return _this.getInfo().then(function(info) {
                  return info.master_branch;
                });
              };
              return new Branch(this.git, getRef);
            };
            this.getInfo = function() {
              return _request('GET', this.repoPath, null);
            };
            this.getContents = function(branch, path) {
              return _request('GET', "" + this.repoPath + "/contents?ref=" + branch, {
                path: path
              });
            };
            this.fork = function() {
              return _request('POST', "" + this.repoPath + "/forks", null);
            };
            this.createPullRequest = function(options) {
              return _request('POST', "" + this.repoPath + "/pulls", options);
            };
            this.getCommits = function(options) {
              return this.git.getCommits(options);
            };
            this.getEvents = function() {
              return _request('GET', "" + this.repoPath + "/events", null);
            };
            this.getIssueEvents = function() {
              return _request('GET', "" + this.repoPath + "/issues/events", null);
            };
            this.getNetworkEvents = function() {
              return _request('GET', "/networks/" + _owner + "/" + _repo + "/events", null);
            };
            this.getNotifications = function(options) {
              var getDate, queryString;
              if (options == null) {
                options = {};
              }
              getDate = function(time) {
                if (Date === time.constructor) {
                  return time.toISOString();
                }
                return time;
              };
              if (options.since) {
                options.since = getDate(options.since);
              }
              queryString = toQueryString(options);
              return _request('GET', "" + this.repoPath + "/notifications" + queryString, null);
            };
            this.getCollaborators = function() {
              return _request('GET', "" + this.repoPath + "/collaborators", null);
            };
            this.isCollaborator = function(username) {
              if (username == null) {
                username = null;
              }
              if (!username) {
                throw new Error('BUG: username is required');
              }
              return _request('GET', "" + this.repoPath + "/collaborators/" + username, null, {
                isBoolean: true
              });
            };
            this.canCollaborate = function() {
              var _this = this;
              if (!(clientOptions.password || clientOptions.token)) {
                return (new jQuery.Deferred()).resolve(false);
              }
              return _client.getLogin().then(function(login) {
                if (!login) {
                  return false;
                } else {
                  return _this.isCollaborator(login);
                }
              }).then(null, function(err) {
                return false;
              });
            };
            this.getHooks = function() {
              return _request('GET', "" + this.repoPath + "/hooks", null);
            };
            this.getHook = function(id) {
              return _request('GET', "" + this.repoPath + "/hooks/" + id, null);
            };
            this.createHook = function(name, config, events, active) {
              var data;
              if (events == null) {
                events = ['push'];
              }
              if (active == null) {
                active = true;
              }
              data = {
                name: name,
                config: config,
                events: events,
                active: active
              };
              return _request('POST', "" + this.repoPath + "/hooks", data);
            };
            this.editHook = function(id, config, events, addEvents, removeEvents, active) {
              var data;
              if (config == null) {
                config = null;
              }
              if (events == null) {
                events = null;
              }
              if (addEvents == null) {
                addEvents = null;
              }
              if (removeEvents == null) {
                removeEvents = null;
              }
              if (active == null) {
                active = null;
              }
              data = {};
              if (config !== null) {
                data.config = config;
              }
              if (events !== null) {
                data.events = events;
              }
              if (addEvents !== null) {
                data.add_events = addEvents;
              }
              if (removeEvents !== null) {
                data.remove_events = removeEvents;
              }
              if (active !== null) {
                data.active = active;
              }
              return _request('PATCH', "" + this.repoPath + "/hooks/" + id, data);
            };
            this.testHook = function(id) {
              return _request('POST', "" + this.repoPath + "/hooks/" + id + "/tests", null);
            };
            this.deleteHook = function(id) {
              return _request('DELETE', "" + this.repoPath + "/hooks/" + id, null);
            };
            this.getLanguages = function() {
              return _request('GET', "" + this.repoPath + "/languages", null);
            };
          }

          return Repository;

        })();
        Gist = (function() {
          function Gist(options) {
            var id, _gistPath;
            this.options = options;
            id = this.options.id;
            _gistPath = "/gists/" + id;
            this.read = function() {
              return _request('GET', _gistPath, null);
            };
            this.create = function(files, isPublic, description) {
              if (isPublic == null) {
                isPublic = false;
              }
              if (description == null) {
                description = null;
              }
              options = {
                isPublic: isPublic,
                files: files
              };
              if (description != null) {
                options.description = description;
              }
              return _request('POST', "/gists", options);
            };
            this["delete"] = function() {
              return _request('DELETE', _gistPath, null);
            };
            this.fork = function() {
              return _request('POST', "" + _gistPath + "/forks", null);
            };
            this.update = function(files, description) {
              if (description == null) {
                description = null;
              }
              options = {
                files: files
              };
              if (description != null) {
                options.description = description;
              }
              return _request('PATCH', _gistPath, options);
            };
            this.star = function() {
              return _request('PUT', "" + _gistPath + "/star");
            };
            this.unstar = function() {
              return _request('DELETE', "" + _gistPath + "/star");
            };
            this.isStarred = function() {
              return _request('GET', "" + _gistPath, null, {
                isBoolean: true
              });
            };
          }

          return Gist;

        })();
        this.getRepo = function(user, repo) {
          if (!user) {
            throw new Error('BUG! user argument is required');
          }
          if (!repo) {
            throw new Error('BUG! repo argument is required');
          }
          return new Repository({
            user: user,
            name: repo
          });
        };
        this.getUser = function(login) {
          if (login == null) {
            login = null;
          }
          if (login) {
            return new User(login);
          } else if (clientOptions.password || clientOptions.token) {
            return new AuthenticatedUser();
          } else {
            return null;
          }
        };
        this.getGist = function(id) {
          return new Gist({
            id: id
          });
        };
        this.getLogin = function() {
          var ret;
          if (clientOptions.password || clientOptions.token) {
            return new User().getInfo().then(function(info) {
              return info.login;
            });
          } else {
            ret = new jQuery.Deferred();
            ret.resolve(null);
            return ret;
          }
        };
      }

      return Octokit;

    })();
    return Octokit;
  };

  if (typeof exports !== "undefined" && exports !== null) {
    _ = require('underscore');
    jQuery = require('jquery-deferred');
    najax = require('najax');
    jQuery.ajax = najax;
    encode = function(str) {
      var buffer;
      buffer = new Buffer(str, 'binary');
      return buffer.toString('base64');
    };
    Octokit = makeOctokit(_, jQuery, encode, 'octokit');
    exports["new"] = function(options) {
      return new Octokit(options);
    };
  } else if (this.define != null) {
    _ref = ['github', 'octokit'];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      moduleName = _ref[_i];
      if (this.btoa) {
        this.define(moduleName, ['underscore', 'jquery'], function(_, jQuery) {
          return makeOctokit(_, jQuery, this.btoa);
        });
      } else {
        this.define(moduleName, ['underscore', 'jquery', 'base64'], function(_, jQuery, Base64) {
          return makeOctokit(_, jQuery, Base64.encode);
        });
      }
    }
  } else if (this._ && this.jQuery && (this.btoa || this.Base64)) {
    encode = this.btoa || this.Base64.encode;
    Octokit = makeOctokit(this._, this.jQuery, encode);
    if (this.Octokit == null) {
      this.Octokit = Octokit;
    }
    if (this.Github == null) {
      this.Github = Octokit;
    }
  } else {
    err = function(msg) {
      if (typeof console !== "undefined" && console !== null) {
        if (typeof console.error === "function") {
          console.error(msg);
        }
      }
      throw msg;
    };
    if (!this._) {
      err('Underscore not included');
    }
    if (!this.jQuery) {
      err('jQuery not included');
    }
    if (!this.Base64 && !this.btoa) {
      err('Base64 not included');
    }
  }

}).call(this);
