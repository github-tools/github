# octokit.js

octokit.js provides a minimal higher-level wrapper around git's [plumbing commands](http://git-scm.com/book/en/Git-Internals-Plumbing-and-Porcelain),
exposing an API for manipulating GitHub repositories, users, groups, and gists.
It is being developed in the context of [github-book](http://github.com/philschatz/github-book), an EPUB3 editor for GitHub.

This package can also be used in `nodejs` or as an AMD module in the browser.

## Key Features

- Works in `nodejs`, a AMD module in the browser, a [bower](https://github.com/bower/bower) library
- Simple `read` and `write` methods for text and binary files
- Creating gists, Pull Requests, forks, and new Repositories
- `ETag` Caching
- Promises instead of callbacks (for better error-handling and progress updating)
- Progress Notifications for multistep operations
- Starring and Following repositories, users, and organizations
- Editing Team and Organization Membership
- User/Org/Repo events and notifications
- Listeners for rate limit changes
- Public Keys
- Hooks (commit, comment, etc)


## Usage

All asynchronous methods return a [Common-JS Promise](http://wiki.commonjs.org/wiki/Promises/A).
See [jQuery.Deferred](http://api.jquery.com/category/deferred-object/) or
[Node's Q](https://github.com/kriskowal/q) for more information.

### In a browser without requirejs

Create an Octokit instance.

```js
var gh = new Octokit({
  username: "YOU_USER",
  password: "YOUR_PASSWORD"
});
```

Or if you prefer OAuth, it looks like this:

```js
var gh = new Octokit({
  token: "OAUTH_TOKEN"
});
```

### In a browser using requirejs

```js
define(['octokit'], function(Octokit) {
  var gh = new Octokit({
    username: "YOU_USER",
    password: "YOUR_PASSWORD"
  });
});
```

### In Nodejs

Install instructions:

    npm install octokit --save

```js
var Octokit = require('octokit');
var gh = Octokit.new({
  username: "YOU_USER",
  password: "YOUR_PASSWORD"
});
```

### Using bower

This file can be included using the bower package manager:

    bower install octokit --save


## Repository API


```js
var repo = gh.getRepo(username, reponame);
```

Show repository information

```js
repo.getInfo()
.done(function(repo) {})
.fail(function(err) {});
```

List all branches in a Repository

```js
repo.getBranches()
.done(function(branches) {});
```

Fork a repository

```js
repo.fork()
.done(function() {});
```

Create a Pull Request

```js
repo.createPullRequest()
.done(function() {});
```

Get recent commits to the repository

```js
var options = {};
repo.getCommits(options)
.done(function(commits) {});
```

List Repository events

```js
repo.getEvents()
.done(function(events) {});
```

List Issue events for the repository

```js
repo.getIssueEvents()
.done(function(events) {});
```

List events for a network of Repositories

```js
repo.getNetworkEvents()
.done(function(events) {});
```

List unread notifications for authenticated user pertaining to this repository

```js
var options = {};
repo.getNotifications(options)
.done(function(events) {});
```

Get programming language counts (CoffeeScript, Ruby, Shell)

```js
repo.getLanguages()
.done(function(events) {});
```


### Branch API

Additional methods are available for a specific branch in a repository

Get the Default branch of a repository

```js
var branch = repo.getDefaultBranch();
```

Get a specific branch of a repository

```js
var branch = repo.getBranch("BRANCH_NAME");
```

Read a file from the branch

```js
var isBinary = false;
branch.read('PATH/TO/FILE.txt', isBinary)
.done(function(contents) {})
.fail(function(err) {});
```

Remove a file from the branch

```js
var message = "OPTIONAL COMMIT MESSAGE";
branch.remove('PATH/TO/FILE.txt', message)
.done(function() {});
```

Move a file

```js
var message = "OPTIONAL COMMIT MESSAGE";
branch.move('PATH/TO/FILE.txt', 'NEW/PATH/TO/FILE.txt', message)
.done(function() {});
```

Write a file (update or add)

```js
var content = "Contents of the file";
var message = "OPTIONAL COMMIT MESSAGE";
var isBinary = false;
branch.write('PATH/TO/FILE.txt', content, message, isBinary)
.done(function() {});
```

Write multiple files (update or add) in one commit

```js
var contents = {
  "FILE1.txt": "Contents of the file",
  "FILE2.txt": {isBase64: true, content: "BASE_64_ENCODED_STRING"}
}
branch.write(contents, message)
.done(function() {});
```

Get recent commits to a branch

```js
var options = {};
branch.getCommits(options)
.done(function(commits) {});
```

Create a new branch

```js
branch.createBranch("new-branch-name")
.done(function() {});
```


### Low-level Repo API

The methods on a branch or repo use the following low-level methods.

```js
repo.git.getRef(...)      .done(function(result) {});
repo.git.createRef(...)   .done(function(result) {});
repo.git.deleteRef(...)   .done(function(result) {});
repo.git.getBranches()    .done(function(result) {});
repo.git.getBlob(...)     .done(function(result) {});
repo.git.getSha(...)      .done(function(result) {});
repo.git.getTree(...)     .done(function(result) {});
repo.git.postBlob(...)    .done(function(result) {});
repo.git.updateTree(...)  .done(function(result) {});
repo.git.postTree(...)    .done(function(result) {});
repo.git.commit(...)      .done(function(result) {});
repo.git.updateHead(...)  .done(function(result) {});
repo.git.getCommits(...)  .done(function(result) {});
```


## User API


```js
var user = gh.getUser("ANY_GITHUB_USERNAME");
```

Show user information for a particular user. Also works for organizations.

```js
user.getInfo()
.done(function(user) {})
.fail(function(err) {});
```

List public repositories for a particular user.

```js
user.getRepos()
.done(function(repos) {});
```

List organizations the user is in.

```js
user.getOrgs()
.done(function(orgs) {});
```

List all gists of a particular user.

```js
user.getGists()
.done(function(gists) {});
```

List users following this user.

```js
user.getFollowers()
.done(function(users) {});
```

List users this user is following.

```js
user.getFollowing()
.done(function(users) {});
```

Get Received events for this user.

```js
user.getReceivedEvents()
.done(function(events) {});
```

Get all events for this user.

```js
user.getEvents()
.done(function(events) {});
```


## Authenticated User API

The Authenticated User contains the following methods in addition to all the methods in the **User API**.

Get the authenticated user.

```js
var user = gh.getUser();
```

List unread notifications for the user.

```js
gh.getNotifications()
.done(function(notifications) {})
.fail(function(err) {});
```

List private and public repositories of the current authenticated user.

```js
user.getRepos()
.done(function(repos) {});
```

Follow another user.

```js
var username "SOME_OTHER_USERNAME";
user.follow(username)
.done(function(orgs) {});
```

Stop following another user.

```js
var username "SOME_OTHER_USERNAME";
user.unfollow(username)
.done(function(orgs) {});
```


## Gist API

```js
var gist = gh.getGist(3165654);
```

Read the contents of a Gist.

```js
gist.read()
.done(function(gist) {});
```

Update the contents of a Gist. Please consult the documentation on [GitHub](http://developer.github.com/v3/gists/).

```js
var delta = {
  "description": "the description for this gist",
  "files": {
    "file1.txt": {
      "content": "updated file contents"
    },
    "old_name.txt": {
      "filename": "new_name.txt",
      "content": "modified contents"
    },
    "new_file.txt": {
      "content": "a new file"
    },
    "delete_this_file.txt": null
  }
};

gist.update(delta)
.done(function(gist) {});
```

Create a Gist

```js
var files = {
  'file1.txt': {content: 'String file contents'}
};

gh.getGist().create(files)
.done(function(gist) {});
```

Delete the Gist

```js
gist.delete()
.done(function(gist) {});
```

Fork the Gist

```js
gist.fork()
.done(function(gist) {});
```

Star the Gist

```js
gist.star()
.done(function() {});
```

Unstar the Gist

```js
gist.unstar()
.done(function() {});
```

Check if the Gist is starred

```js
gist.isStarred()
.done(function() {});
```


## Miscellaneous methods

Retreive a zen message (to test the API works).

```js
gh.getZen()
.done(function(msg) {})
.fail(function(err) {});
```

Add a listener for `rateLimit` changes

```js
function listener(rateLimitRemaining, rateLimit, method, path, data, raw, isBase64) {
  // ...
};
gh.onRateLimitChanged(listener);
```

List repositories for a particular organization. Includes private repositories if you are authorized.

```js
gh.getOrgRepos(orgname)
.done(function(repos) {});
```

## Progress Notifications

For multistep operations users can listen to updates by registering a listener at `promise.progress(function(obj) {})`.

For more details see jQuery's [deferred.progress documentation](http://api.jquery.com/deferred.progress/).



##Setup

`github-client` has the following dependencies:

- Underscore
- Base64 (for basic auth or binary files). You can leave this if you are not using basic auth or binary files.

If you are not using NodeJS or requireJS include these before `github-client`:

```
<script src="lib/underscore-min.js">
<script src="lib/base64.js">
```

## Change Log


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
