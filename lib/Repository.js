'use strict';

/*!
 * @overview  Repository.js
 *
 * @copyright (c) 2015 Michael Aufreiter, Development Seed
 *            Github.js is freely distributable.
 * @license   Licensed under BSD-3-Clause-Clear
 *
 *            For all details and documentation:
 *            http://substance.io/michael/github
 */

var debug = require('debug')('Github:Repository');
var inherits = require('inherits');
var Base64 = require('js-base64').Base64;

var Requestable = require('./helpers/Requestable');
var User = require('./User');

function Repository(options) {
   Repository.super_.call(this, options);
   this.repo = options.name;
   this.user = options.user;
   this.fullname = options.fullname;

   if (this.fullname) {
      this.repoPath = '/repos/' + this.fullname;
   } else {
      this.repoPath = '/repos/' + this.user + '/' + this.repo;
   }

   this.currentTree = {
      branch: null,
      sha: null
   };
}

inherits(Repository, Requestable);

// Uses the cache if branch has not been changed
// -------
Repository.prototype._updateTree = function(branch, cb) {
   if (branch === this.currentTree.branch && this.currentTree.sha) {
      return cb(null, this.currentTree.sha);
   }

   this.getRef('heads/' + branch, function(err, sha) {
      this.currentTree.branch = branch;
      this.currentTree.sha = sha;
      cb(err, sha);
   });
};

Repository.prototype.getRef = function(ref, cb) {
   this._request('GET', this.repoPath + '/git/refs/' + ref, null, function(err, res, xhr) {
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
Repository.prototype.createRef = function(options, cb) {
   this._request('POST', this.repoPath + '/git/refs', options, cb);
};

// Delete a reference
// --------
//
// Repo.deleteRef('heads/gh-pages')
// repo.deleteRef('tags/v1.0')
Repository.prototype.deleteRef = function(ref, cb) {
   this._request('DELETE', this.repoPath + '/git/refs/' + ref, null, cb);
};

Repository.prototype.createRepo = function(options, cb) {
   this._request('POST', '/user/repos', options, cb);
};

Repository.prototype.deleteRepo = function(cb) {
   this._request('DELETE', this.repoPath, null, cb);
};

Repository.prototype.listTags = function(cb) {
   this._request('GET', this.repoPath + '/tags', null, function(err, tags, xhr) {
      if (err) {
         return cb(err);
      }

      cb(null, tags, xhr);
   });
};

Repository.prototype.listPulls = function(options, cb) {
   options = options || {};
   var url = this.repoPath + '/pulls';
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

   this._request('GET', url, null, function(err, pulls, xhr) {
      if (err) return cb(err);
      cb(null, pulls, xhr);
   });
};

Repository.prototype.getPull = function(number, cb) {
   this._request('GET', this.repoPath + '/pulls/' + number, null, function(err, pull, xhr) {
      if (err) return cb(err);
      cb(null, pull, xhr);
   });
};

Repository.prototype.compare = function(base, head, cb) {
   this._request('GET', this.repoPath + '/compare/' + base + '...' + head, null, function(err, diff, xhr) {
      if (err) return cb(err);
      cb(null, diff, xhr);
   });
};

Repository.prototype.listBranches = function(cb) {
   this._request('GET', this.repoPath + '/git/refs/heads', null, function(err, heads, xhr) {
      if (err) return cb(err);
      cb(null, heads.map(function(head) {
         return head.ref.replace(/^refs\/heads\//, '');
      }), xhr);
   });
};

Repository.prototype.getBlob = function(sha, cb) {
   this._request('GET', this.repoPath + '/git/blobs/' + sha, null, cb, 'raw');
};

Repository.prototype.getCommit = function(branch, sha, cb) {
   this._request('GET', this.repoPath + '/git/commits/' + sha, null, function(err, commit, xhr) {
      if (err) return cb(err);
      cb(null, commit, xhr);
   });
};

Repository.prototype.getSha = function(branch, path, cb) {
   if (!path || path === '') return this.getRef('heads/' + branch, cb);

   this._request('GET', this.repoPath + '/contents/' + path + (branch ? '?ref=' + branch : ''),
      null, function(err, pathContent, xhr) {
         debug(err);

         if (err) return cb(err);
         cb(null, pathContent.sha, xhr);
      });
};

Repository.prototype.getStatuses = function(sha, cb) {
   this._request('GET', this.repoPath + '/statuses/' + sha, null, cb);
};

Repository.prototype.getTree = function(tree, cb) {
   this._request('GET', this.repoPath + '/git/trees/' + tree, null, function(err, res, xhr) {
      if (err) return cb(err);
      cb(null, res.tree, xhr);
   });
};

Repository.prototype.postBlob = function(content, cb) {
   if (typeof (content) === 'string') {
      content = {
         content: content,
         encoding: 'utf-8'
      };
   } else {
      content = {
         content: Base64.encode(content),
         encoding: 'base64'
      };
   }

   this._request('POST', this.repoPath + '/git/blobs', content, function(err, res) {
      if (err) return cb(err);
      cb(null, res.sha);
   });
};

Repository.prototype.updateTree = function(baseTree, path, blob, cb) {
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

   this._request('POST', this.repoPath + '/git/trees', data, function(err, res) {
      if (err) return cb(err);
      cb(null, res.sha);
   });
};

Repository.prototype.postTree = function(tree, cb) {
   this._request('POST', this.repoPath + '/git/trees', {
      tree: tree
   }, function(err, res) {
      if (err) return cb(err);
      cb(null, res.sha);
   });
};

Repository.prototype.commit = function(parent, tree, message, cb) {
   var user = new User(this.__requestableConfig);
   var that = this;

   user.show(null, function(err, userData) {
      if (err) return cb(err);
      var data = {
         message: message,
         author: {
            name: that.__requestableConfig.user,
            email: userData.email
         },
         parents: [
           parent
         ],
         tree: tree
      };

      that._request('POST', that.repoPath + '/git/commits', data, function(err, res) {
         if (err) return cb(err);
         that.currentTree.sha = res.sha; // Update latest commit
         cb(null, res.sha);
      });
   });
};

Repository.prototype.updateHead = function(head, commit, cb) {
   this._request('PATCH', this.repoPath + '/git/refs/heads/' + head, {
      sha: commit
   }, function(err) {
      cb(err);
   });
};

Repository.prototype.show = function(cb) {
   this._request('GET', this.repoPath, null, cb);
};

Repository.prototype.contributors = function (cb, retry) {
   retry = retry || 1000;
   var that = this;

   this._request('GET', this.repoPath + '/stats/contributors', null, function (err, data, xhr) {
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

Repository.prototype.contents = function(ref, path, cb) {
   path = encodeURI(path);
   this._request('GET', this.repoPath + '/contents' + (path ? '/' + path : ''), {
      ref: ref
   }, cb);
};

Repository.prototype.fork = function(cb) {
   this._request('POST', this.repoPath + '/forks', null, cb);
};

Repository.prototype.listForks = function(cb) {
   this._request('GET', this.repoPath + '/forks', null, cb);
};

Repository.prototype.branch = function(oldBranch, newBranch, cb) {
   var that = this;

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

Repository.prototype.createPullRequest = function(options, cb) {
   this._request('POST', this.repoPath + '/pulls', options, cb);
};

Repository.prototype.listHooks = function(cb) {
   this._request('GET', this.repoPath + '/hooks', null, cb);
};

Repository.prototype.getHook = function(id, cb) {
   this._request('GET', this.repoPath + '/hooks/' + id, null, cb);
};

Repository.prototype.createHook = function(options, cb) {
   this._request('POST', this.repoPath + '/hooks', options, cb);
};

Repository.prototype.editHook = function(id, options, cb) {
   this._request('PATCH', this.repoPath + '/hooks/' + id, options, cb);
};

Repository.prototype.deleteHook = function(id, cb) {
   this._request('DELETE', this.repoPath + '/hooks/' + id, null, cb);
};

Repository.prototype.read = function(branch, path, cb) {
   this._request('GET', this.repoPath + '/contents/' + encodeURI(path) + (branch ? '?ref=' + branch : ''),
      null, function(err, obj, xhr) {
         if (err && err.error === 404) return cb('not found', null, null);

         if (err) return cb(err);
         cb(null, obj, xhr);
      }, true);
};

Repository.prototype.remove = Repository.prototype.delete = function(branch, path, cb) {
   var that = this;

   this.getSha(branch, path, function(err, sha) {
      if (err) return cb(err);

      that._request('DELETE', that.repoPath + '/contents/' + path, {
         message: path + ' is removed',
         sha: sha,
         branch: branch
      }, cb);
   });
};

Repository.prototype.move = function(branch, path, newPath, cb) {
   var that = this;

   this._updateTree(branch, function(err, latestCommit) {
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

Repository.prototype.write = function(branch, path, content, message, options, cb) {
   var that = this;

   if (typeof cb === 'undefined') {
      cb = options;
      options = {};
   }

   options = options || {};

   var committer = options.committer;
   var author = options.author;

   this.getSha(branch, encodeURI(path), function(err, sha) {
      var writeOptions = {
         message: message,
         content: Base64.encode(content),
         branch: branch,
         committer: committer,
         author: author
      };

      // If no error, we set the sha to overwrite an existing file
      if (!(err && err.error !== 404)) writeOptions.sha = sha;
      that._request('PUT', that.repoPath + '/contents/' + encodeURI(path), writeOptions, cb);
   });
};

Repository.prototype.getCommits = function(options, cb) {
   options = options || {};
   var url = this.repoPath + '/commits';
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

   this._request('GET', url, null, cb);
};

module.exports = Repository;
