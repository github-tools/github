/*!
 * @overview  Github.js
 *
 * @copyright (c) 2013 Michael Aufreiter, Development Seed
 *            Github.js is freely distributable.
 *
 * @license   Licensed under BSD-3-Clause-Clear
 *
 *            For all details and documentation:
 *            http://substance.io/michael/github
 */

(function (root, factory) {
   // UMD boilerplate from https://github.com/umdjs/umd/blob/master/returnExportsGlobal.js
   'use strict';

   /* istanbul ignore next */
   if (typeof define === 'function' && define.amd) {
      // AMD. Register as an anonymous module.
      define(['xmlhttprequest', 'js-base64'], function (XMLHttpRequest, b64encode) {
         return (root.Github = factory(XMLHttpRequest.XMLHttpRequest, b64encode.Base64.encode));
      });
   } else if (typeof module === 'object' && module.exports) {
      if (typeof window !== 'undefined') { // jscs:ignore
         module.exports = factory(window.XMLHttpRequest, window.btoa);
      } else { // jscs:ignore
         module.exports = factory(require('xmlhttprequest').XMLHttpRequest, require('js-base64').Base64.encode);
      }
   } else {
      // Browser globals
      var b64encode = function(str) {
         return root.btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
            return String.fromCharCode('0x' + p1);
         }));
      };

      root.Github = factory(root.XMLHttpRequest, b64encode);
   }
}(this, function (XMLHttpRequest, b64encode) {
   'use strict';

   // Initial Setup
   // -------------

   var Github = function(options) {
      var API_URL = options.apiUrl || 'https://api.github.com';

      // HTTP Request Abstraction
      // =======
      //
      // I'm not proud of this and neither should you be if you were responsible for the XMLHttpRequest spec.

      var _request = Github._request = function _request(method, path, data, cb, raw, sync) {
         function getURL() {
            var url = path.indexOf('//') >= 0 ? path : API_URL + path;

            url += ((/\?/).test(url) ? '&' : '?');

            if (data && typeof data === 'object' && ['GET', 'HEAD', 'DELETE'].indexOf(method) > -1) {
               for(var param in data) {
                  if (data.hasOwnProperty(param))
                    url += '&' + encodeURIComponent(param) + '=' + encodeURIComponent(data[param]);
               }
            }

            return url + (typeof window !== 'undefined' ? '&' + new Date().getTime() : '');
         }

         var xhr = new XMLHttpRequest();

         xhr.open(method, getURL(), !sync);

         if (!sync) {
            xhr.onreadystatechange = function () {
               if (this.readyState === 4) {
                  if (this.status >= 200 && this.status < 300 || this.status === 304) {
                     cb(null, raw ? this.responseText : this.responseText ? JSON.parse(this.responseText) : true, this);
                  } else {
                     cb({
                        path: path, request: this, error: this.status
                     });
                  }
               }
            };
         }

         if (!raw) {
            xhr.dataType = 'json';
            xhr.setRequestHeader('Accept', 'application/vnd.github.v3+json');
         } else {
            xhr.setRequestHeader('Accept', 'application/vnd.github.v3.raw+json');
         }

         xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');

         if ((options.token) || (options.username && options.password)) {
            var authorization = options.token ? 'token ' + options.token :
               'Basic ' + b64encode(options.username + ':' + options.password);

            xhr.setRequestHeader('Authorization', authorization);
         }

         if (data) {
            xhr.send(JSON.stringify(data));
         } else {
            xhr.send();
         }

         if (sync) {
            return xhr.response;
         }
      };

      var _requestAllPages = Github._requestAllPages = function _requestAllPages(path, cb) {
         var results = [];

         (function iterate() {
            _request('GET', path, null, function(err, res, xhr) {
               if (err) {
                  return cb(err);
               }

               results.push.apply(results, res);

               var links = (xhr.getResponseHeader('link') || '').split(/\s*,\s*/g);
               var next = null;

               links.forEach(function(link) {
                  next = /rel="next"/.test(link) ? link : next;
               });

               if (next) {
                  next = (/<(.*)>/.exec(next) || [])[1];
               }

               if (!next) {
                  cb(err, results);
               } else {
                  path = next;
                  iterate();
               }
            });
         })();
      };

      // User API
      // =======

      Github.User = function() {
         this.repos = function(options, cb) {
            if (arguments.length === 1 && typeof arguments[0] === 'function') {
               cb = options;
               options = {};
            }

            options = options || {};

            var url = '/user/repos';
            var params = [];

            params.push('type=' + encodeURIComponent(options.type || 'all'));
            params.push('sort=' + encodeURIComponent(options.sort || 'updated'));
            params.push('per_page=' + encodeURIComponent(options.per_page || '1000')); // jscs:ignore

            if (options.page) {
               params.push('page=' + encodeURIComponent(options.page));
            }

            url += '?' + params.join('&');

            _request('GET', url, null, cb);
         };

         // List user organizations
         // -------

         this.orgs = function(cb) {
            _request('GET', '/user/orgs', null, cb);
         };

         // List authenticated user's gists
         // -------

         this.gists = function(cb) {
            _request('GET', '/gists', null, cb);
         };

         // List authenticated user's unread notifications
         // -------

         this.notifications = function(options, cb) {
            if (arguments.length === 1 && typeof arguments[0] === 'function') {
               cb = options;
               options = {};
            }

            options = options || {};
            var url = '/notifications';
            var params = [];

            if (options.all) {
               params.push('all=true');
            }

            if (options.participating) {
               params.push('participating=true');
            }

            if (options.since) {
               var since = options.since;

               if (since.constructor === Date) {
                  since = since.toISOString();
               }

               params.push('since=' + encodeURIComponent(since));
            }

            if (options.before) {
               var before = options.before;

               if (before.constructor === Date) {
                  before = before.toISOString();
               }

               params.push('before=' + encodeURIComponent(before));
            }

            if (options.page) {
               params.push('page=' + encodeURIComponent(options.page));
            }

            if (params.length > 0) {
               url += '?' + params.join('&');
            }

            _request('GET', url, null, cb);
         };

         // Show user information
         // -------

         this.show = function(username, cb) {
            var command = username ? '/users/' + username : '/user';

            _request('GET', command, null, cb);
         };

         // List user repositories
         // -------

         this.userRepos = function(username, cb) {
            // Github does not always honor the 1000 limit so we want to iterate over the data set.
            _requestAllPages('/users/' + username + '/repos?type=all&per_page=1000&sort=updated', cb);
         };

         // List user starred repositories
         // -------

         this.userStarred = function(username, cb) {
            // Github does not always honor the 1000 limit so we want to iterate over the data set.
            _requestAllPages('/users/' + username + '/starred?type=all&per_page=1000', function(err, res) {
               cb(err, res);
            });
         };

         // List a user's gists
         // -------

         this.userGists = function(username, cb) {
            _request('GET', '/users/' + username + '/gists', null, cb);
         };

         // List organization repositories
         // -------

         this.orgRepos = function(orgname, cb) {
            // Github does not always honor the 1000 limit so we want to iterate over the data set.
            _requestAllPages('/orgs/' + orgname + '/repos?type=all&&page_num=1000&sort=updated&direction=desc', cb);
         };

         // Follow user
         // -------

         this.follow = function(username, cb) {
            _request('PUT', '/user/following/' + username, null, cb);
         };

         // Unfollow user
         // -------

         this.unfollow = function(username, cb) {
            _request('DELETE', '/user/following/' + username, null, cb);
         };

         // Create a repo
         // -------
         this.createRepo = function(options, cb) {
            _request('POST', '/user/repos', options, cb);
         };
      };

      // Repository API
      // =======

      Github.Repository = function(options) {
         var repo = options.name;
         var user = options.user;
         var fullname = options.fullname;

         var that = this;
         var repoPath;

         if (fullname) {
            repoPath = '/repos/' + fullname;
         } else {
            repoPath = '/repos/' + user + '/' + repo;
         }

         var currentTree = {
            branch: null,
            sha: null
         };

         // Delete a repo
         // --------

         this.deleteRepo = function(cb) {
            _request('DELETE', repoPath, options, cb);
         };

         // Uses the cache if branch has not been changed
         // -------

         function updateTree(branch, cb) {
            if (branch === currentTree.branch && currentTree.sha) {
               return cb(null, currentTree.sha);
            }

            that.getRef('heads/' + branch, function(err, sha) {
               currentTree.branch = branch;
               currentTree.sha = sha;
               cb(err, sha);
            });
         }

         // Get a particular reference
         // -------

         this.getRef = function(ref, cb) {
            _request('GET', repoPath + '/git/refs/' + ref, null, function(err, res, xhr) {
               if (err) {
                  return cb(err);
               }

               cb(null, res.object.sha, xhr);
            });
         };

         // Create a new reference
         // --------
         //
         // {
         //   "ref": "refs/heads/my-new-branch-name",
         //   "sha": "827efc6d56897b048c772eb4087f854f46256132"
         // }

         this.createRef = function(options, cb) {
            _request('POST', repoPath + '/git/refs', options, cb);
         };

         // Delete a reference
         // --------
         //
         // Repo.deleteRef('heads/gh-pages')
         // repo.deleteRef('tags/v1.0')

         this.deleteRef = function(ref, cb) {
            _request('DELETE', repoPath + '/git/refs/' + ref, options, function(err, res, xhr) {
               cb(err, res, xhr);
            });
         };

         // Create a repo
         // -------

         this.createRepo = function(options, cb) {
            _request('POST', '/user/repos', options, cb);
         };

         // Delete a repo
         // --------

         this.deleteRepo = function(cb) {
            _request('DELETE', repoPath, options, cb);
         };

         // List all tags of a repository
         // -------

         this.listTags = function(cb) {
            _request('GET', repoPath + '/tags', null, function(err, tags, xhr) {
               if (err) {
                  return cb(err);
               }

               cb(null, tags, xhr);
            });
         };

         // List all pull requests of a respository
         // -------

         this.listPulls = function(options, cb) {
            options = options || {};
            var url = repoPath + '/pulls';
            var params = [];

            if (typeof options === 'string') {
               // Backward compatibility
               params.push('state=' + options);
            } else {
               if (options.state) {
                  params.push('state=' + encodeURIComponent(options.state));
               }

               if (options.head) {
                  params.push('head=' + encodeURIComponent(options.head));
               }

               if (options.base) {
                  params.push('base=' + encodeURIComponent(options.base));
               }

               if (options.sort) {
                  params.push('sort=' + encodeURIComponent(options.sort));
               }

               if (options.direction) {
                  params.push('direction=' + encodeURIComponent(options.direction));
               }

               if (options.page) {
                  params.push('page=' + options.page);
               }

               if (options.per_page) {
                  params.push('per_page=' + options.per_page);
               }
            }

            if (params.length > 0) {
               url += '?' + params.join('&');
            }

            _request('GET', url, null, function(err, pulls, xhr) {
               if (err) return cb(err);
               cb(null, pulls, xhr);
            });
         };

         // Gets details for a specific pull request
         // -------

         this.getPull = function(number, cb) {
            _request('GET', repoPath + '/pulls/' + number, null, function(err, pull, xhr) {
               if (err) return cb(err);
               cb(null, pull, xhr);
            });
         };

         // Retrieve the changes made between base and head
         // -------

         this.compare = function(base, head, cb) {
            _request('GET', repoPath + '/compare/' + base + '...' + head, null, function(err, diff, xhr) {
               if (err) return cb(err);
               cb(null, diff, xhr);
            });
         };

         // List all branches of a repository
         // -------

         this.listBranches = function(cb) {
            _request('GET', repoPath + '/git/refs/heads', null, function(err, heads, xhr) {
               if (err) return cb(err);
               cb(null, heads.map(function(head) {
                  return head.ref.replace(/^refs\/heads\//, '');
               }), xhr);
            });
         };

         // Retrieve the contents of a blob
         // -------

         this.getBlob = function(sha, cb) {
            _request('GET', repoPath + '/git/blobs/' + sha, null, cb, 'raw');
         };

         // For a given file path, get the corresponding sha (blob for files, tree for dirs)
         // -------

         this.getCommit = function(branch, sha, cb) {
            _request('GET', repoPath + '/git/commits/' + sha, null, function(err, commit, xhr) {
               if (err) return cb(err);
               cb(null, commit, xhr);
            });
         };

         // For a given file path, get the corresponding sha (blob for files, tree for dirs)
         // -------

         this.getSha = function(branch, path, cb) {
            if (!path || path === '') return that.getRef('heads/' + branch, cb);
            _request('GET', repoPath + '/contents/' + path + (branch ? '?ref=' + branch : ''),
               null, function(err, pathContent, xhr) {
                  if (err) return cb(err);
                  cb(null, pathContent.sha, xhr);
               });
         };

         // Retrieve the tree a commit points to
         // -------

         this.getTree = function(tree, cb) {
            _request('GET', repoPath + '/git/trees/' + tree, null, function(err, res, xhr) {
               if (err) return cb(err);
               cb(null, res.tree, xhr);
            });
         };

         // Post a new blob object, getting a blob SHA back
         // -------

         this.postBlob = function(content, cb) {
            if (typeof (content) === 'string') {
               content = {
                  content: content,
                  encoding: 'utf-8'
               };
            } else {
               content = {
                  content: b64encode(content),
                  encoding: 'base64'
               };
            }

            _request('POST', repoPath + '/git/blobs', content, function(err, res) {
               if (err) return cb(err);
               cb(null, res.sha);
            });
         };

         // Update an existing tree adding a new blob object getting a tree SHA back
         // -------

         this.updateTree = function(baseTree, path, blob, cb) {
            var data = {
               base_tree: baseTree,
               tree: [
            {
               path: path,
               mode: '100644',
               type: 'blob',
               sha: blob
            }
          ]
            };

            _request('POST', repoPath + '/git/trees', data, function(err, res) {
               if (err) return cb(err);
               cb(null, res.sha);
            });
         };

         // Post a new tree object having a file path pointer replaced
         // with a new blob SHA getting a tree SHA back
         // -------

         this.postTree = function(tree, cb) {
            _request('POST', repoPath + '/git/trees', {
               tree: tree
            }, function(err, res) {
               if (err) return cb(err);
               cb(null, res.sha);
            });
         };

         // Create a new commit object with the current commit SHA as the parent
         // and the new tree SHA, getting a commit SHA back
         // -------

         this.commit = function(parent, tree, message, cb) {
            var user = new Github.User();

            user.show(null, function(err, userData) {
               if (err) return cb(err);
               var data = {
                  message: message,
                  author: {
                     name: options.user,
                     email: userData.email
                  },
                  parents: [
                    parent
                  ],
                  tree: tree
               };

               _request('POST', repoPath + '/git/commits', data, function(err, res) {
                  if (err) return cb(err);
                  currentTree.sha = res.sha; // Update latest commit
                  cb(null, res.sha);
               });
            });
         };

         // Update the reference of your head to point to the new commit SHA
         // -------

         this.updateHead = function(head, commit, cb) {
            _request('PATCH', repoPath + '/git/refs/heads/' + head, {
               sha: commit
            }, function(err) {
               cb(err);
            });
         };

         // Show repository information
         // -------

         this.show = function(cb) {
            _request('GET', repoPath, null, cb);
         };

         // Show repository contributors
         // -------

         this.contributors = function (cb, retry) {
            retry = retry || 1000;
            var that = this;

            _request('GET', repoPath + '/stats/contributors', null, function (err, data, xhr) {
               if (err) return cb(err);

               if (xhr.status === 202) {
                  setTimeout(
              function () {
                 that.contributors(cb, retry);
              },
              retry
            );
               } else {
                  cb(err, data, xhr);
               }
            });
         };

         // Get contents
         // --------

         this.contents = function(ref, path, cb) {
            path = encodeURI(path);
            _request('GET', repoPath + '/contents' + (path ? '/' + path : ''), {
               ref: ref
            }, cb);
         };

         // Fork repository
         // -------

         this.fork = function(cb) {
            _request('POST', repoPath + '/forks', null, cb);
         };

         // Branch repository
         // --------

         this.branch = function(oldBranch, newBranch, cb) {
            if (arguments.length === 2 && typeof arguments[1] === 'function') {
               cb = newBranch;
               newBranch = oldBranch;
               oldBranch = 'master';
            }

            this.getRef('heads/' + oldBranch, function(err, ref) {
               if (err && cb) return cb(err);
               that.createRef({
                  ref: 'refs/heads/' + newBranch,
                  sha: ref
               }, cb);
            });
         };

         // Create pull request
         // --------

         this.createPullRequest = function(options, cb) {
            _request('POST', repoPath + '/pulls', options, cb);
         };

         // List hooks
         // --------

         this.listHooks = function(cb) {
            _request('GET', repoPath + '/hooks', null, cb);
         };

         // Get a hook
         // --------

         this.getHook = function(id, cb) {
            _request('GET', repoPath + '/hooks/' + id, null, cb);
         };

         // Create a hook
         // --------

         this.createHook = function(options, cb) {
            _request('POST', repoPath + '/hooks', options, cb);
         };

         // Edit a hook
         // --------

         this.editHook = function(id, options, cb) {
            _request('PATCH', repoPath + '/hooks/' + id, options, cb);
         };

         // Delete a hook
         // --------

         this.deleteHook = function(id, cb) {
            _request('DELETE', repoPath + '/hooks/' + id, null, cb);
         };

         // Read file at given path
         // -------

         this.read = function(branch, path, cb) {
            _request('GET', repoPath + '/contents/' + encodeURI(path) + (branch ? '?ref=' + branch : ''),
               null, function(err, obj, xhr) {
                  if (err && err.error === 404) return cb('not found', null, null);

                  if (err) return cb(err);
                  cb(null, obj, xhr);
               }, true);
         };

         // Remove a file
         // -------

         this.remove = function(branch, path, cb) {
            that.getSha(branch, path, function(err, sha) {
               if (err) return cb(err);
               _request('DELETE', repoPath + '/contents/' + path, {
                  message: path + ' is removed',
                  sha: sha,
                  branch: branch
               }, cb);
            });
         };

         // Alias for repo.remove for backwards comapt.
         // -------
         this.delete = this.remove;

         // Move a file to a new location
         // -------

         this.move = function(branch, path, newPath, cb) {
            updateTree(branch, function(err, latestCommit) {
               that.getTree(latestCommit + '?recursive=true', function(err, tree) {
                  // Update Tree
                  tree.forEach(function(ref) {
                     if (ref.path === path) ref.path = newPath;

                     if (ref.type === 'tree') delete ref.sha;
                  });

                  that.postTree(tree, function(err, rootTree) {
                     that.commit(latestCommit, rootTree, 'Deleted ' + path , function(err, commit) {
                        that.updateHead(branch, commit, function(err) {
                           cb(err);
                        });
                     });
                  });
               });
            });
         };

         // Write file contents to a given branch and path
         // -------

         this.write = function(branch, path, content, message, options, cb) {
            if (typeof cb === 'undefined') {
               cb = options;
               options = {};
            }

            that.getSha(branch, encodeURI(path), function(err, sha) {
               var writeOptions = {
                  message: message,
                  content: typeof options.encode === 'undefined' || options.encode ? b64encode(content) : content,
                  branch: branch,
                  committer: options && options.committer ? options.committer : undefined,
                  author: options && options.author ? options.author : undefined
               };

               // If no error, we set the sha to overwrite an existing file
               if (!(err && err.error !== 404)) writeOptions.sha = sha;
               _request('PUT', repoPath + '/contents/' + encodeURI(path), writeOptions, cb);
            });
         };

         // List commits on a repository. Takes an object of optional paramaters:
         // sha: SHA or branch to start listing commits from
         // path: Only commits containing this file path will be returned
         // since: ISO 8601 date - only commits after this date will be returned
         // until: ISO 8601 date - only commits before this date will be returned
         // -------

         this.getCommits = function(options, cb) {
            options = options || {};
            var url = repoPath + '/commits';
            var params = [];

            if (options.sha) {
               params.push('sha=' + encodeURIComponent(options.sha));
            }

            if (options.path) {
               params.push('path=' + encodeURIComponent(options.path));
            }

            if (options.since) {
               var since = options.since;

               if (since.constructor === Date) {
                  since = since.toISOString();
               }

               params.push('since=' + encodeURIComponent(since));
            }

            if (options.until) {
               var until = options.until;

               if (until.constructor === Date) {
                  until = until.toISOString();
               }

               params.push('until=' + encodeURIComponent(until));
            }

            if (options.page) {
               params.push('page=' + options.page);
            }

            if (options.perpage) {
               params.push('per_page=' + options.perpage);
            }

            if (params.length > 0) {
               url += '?' + params.join('&');
            }

            _request('GET', url, null, cb);
         };
      };

      // Gists API
      // =======

      Github.Gist = function(options) {
         var id = options.id;
         var gistPath = '/gists/' + id;

         // Read the gist
         // --------

         this.read = function(cb) {
            _request('GET', gistPath, null, cb);
         };

         // Create the gist
         // --------
         // {
         //  "description": "the description for this gist",
         //    "public": true,
         //    "files": {
         //      "file1.txt": {
         //        "content": "String file contents"
         //      }
         //    }
         // }

         this.create = function(options, cb) {
            _request('POST', '/gists', options, cb);
         };

         // Delete the gist
         // --------

         this.delete = function(cb) {
            _request('DELETE', gistPath, null, cb);
         };

         // Fork a gist
         // --------

         this.fork = function(cb) {
            _request('POST', gistPath + '/fork', null, cb);
         };

         // Update a gist with the new stuff
         // --------

         this.update = function(options, cb) {
            _request('PATCH', gistPath, options, cb);
         };

         // Star a gist
         // --------

         this.star = function(cb) {
            _request('PUT', gistPath + '/star', null, cb);
         };

         // Untar a gist
         // --------

         this.unstar = function(cb) {
            _request('DELETE', gistPath + '/star', null, cb);
         };

         // Check if a gist is starred
         // --------

         this.isStarred = function(cb) {
            _request('GET', gistPath + '/star', null, cb);
         };
      };

      // Issues API
      // ==========

      Github.Issue = function(options) {
         var path = '/repos/' + options.user + '/' + options.repo + '/issues';

         this.list = function(options, cb) {
            var query = [];

            for(var key in options) {
               if (options.hasOwnProperty(key)) {
                  query.push(encodeURIComponent(key) + '=' + encodeURIComponent(options[key]));
               }
            }

            _requestAllPages(path + '?' + query.join('&'), cb);
         };

         this.comment = function(issue, comment, cb) {
            _request('POST', issue.comments_url, {
               body: comment
            }, function(err, res) {
               cb(err, res);
            });
         };
      };

      // Search API
      // ==========

      Github.Search = function(options) {
         var path = '/search/';
         var query = '?q=' + options.query;

         this.repositories = function(options, cb) {
            _request('GET', path + 'repositories' + query, options, cb);
         };

         this.code = function(options, cb) {
            _request('GET', path + 'code' + query, options, cb);
         };

         this.issues = function(options, cb) {
            _request('GET', path + 'issues' + query, options, cb);
         };

         this.users = function(options, cb) {
            _request('GET', path + 'users' + query, options, cb);
         };
      };

      return Github;
   };

   // Top Level API
   // -------

   Github.getIssues = function(user, repo) {
      return new Github.Issue({
         user: user, repo: repo
      });
   };

   Github.getRepo = function(user, repo) {
      if (!repo) {
         var fullname = user;

         return new Github.Repository({
            fullname: fullname
         });
      } else {
         return new Github.Repository({
            user: user, name: repo
         });
      }
   };

   Github.getUser = function() {
      return new Github.User();
   };

   Github.getGist = function(id) {
      return new Github.Gist({
         id: id
      });
   };

   Github.getSearch = function(query) {
      return new Github.Search({
         query: query
      });
   };

   return Github;
}));
