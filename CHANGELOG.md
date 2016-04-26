## Change Log

### 1.0.0
Complete rewrite in ES2015.

* Renamed many of the APIs for better internal consistency.
* Promise-ified the API
* Modularized code to potentially allow for custom builds
* Refactored tests to run primarially in mocha
* Auto-generation of documentation

### 0.10.X

Create and delete repositories
Repos - getCommit

### 0.9.X

Paging (introduced at tail end of 0.8.X, note: different callbacks for success & errors now)

### 0.8.X

Fixes and tweaks, simpler auth, CI tests, node.js support, Raw+JSON, UTF8, plus:
Users - follow, unfollow, get info, notifications
Gists - create
Issues - get
Repos - createRepo, deleteRepo, createBranch, star, unstar, isStarred, getCommits, listTags, listPulls, getPull, compare
Hooks - listHooks, getHook, createHook, editHook, deleteHook

### 0.7.X

Switched to a native `request` implementation (thanks @mattpass). Adds support for GitHub gists, forks and pull requests.

### 0.6.X

Adds support for organizations and fixes an encoding issue.

### 0.5.X

Smart caching of latest commit sha.

### 0.4.X

Added support for [OAuth](http://developer.github.com/v3/oauth/).

### 0.3.X

Support for Moving and removing files.

### 0.2.X

Consider commit messages.

### 0.1.X

Initial version.
