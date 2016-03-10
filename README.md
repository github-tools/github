# Github.js

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/michael/github?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge) [![Stories in Ready](https://badge.waffle.io/michael/github.png?label=ready&title=Ready)](https://waffle.io/michael/github) [![Build Status](https://travis-ci.org/michael/github.svg?branch=master)](https://travis-ci.org/michael/github) [![codecov.io](https://codecov.io/github/michael/github/coverage.svg?branch=master)](https://codecov.io/github/michael/github?branch=master)

Github.js provides a minimal higher-level wrapper around git's [plumbing commands](http://git-scm.com/book/en/Git-Internals-Plumbing-and-Porcelain), exposing an API for manipulating GitHub repositories on the file level. It was formerly developed in the context of [Prose](http://prose.io), a content editor for GitHub.

## Installation

Either grab `github.js` from this repo or install Github.js via npm:

```
npm install github-api
```

Alternatively, you can install the library using Bower:

```
bower install github-api
```

## Compatibility

[![Sauce Test Status](https://saucelabs.com/browser-matrix/githubjs.svg)](https://saucelabs.com/u/githubjs)

**Note**: Starting from version 0.10.8, Github.js supports **Internet Explorer 9**. However, the underlying
methodology used under the hood to perform CORS requests (the `XDomainRequest` object),
[has limitations](http://blogs.msdn.com/b/ieinternals/archive/2010/05/13/xdomainrequest-restrictions-limitations-and-workarounds.aspx).
In particular, requests must be targeted to the same scheme as the hosting page. This means that if a page is at
http://example.com, your target URL must also begin with HTTP. Similarly, if your page is at https://example.com, then
your target URL must also begin with HTTPS. For this reason, if your requests are sent to the GitHub API (the default),
which are served via HTTPS, your page must use HTTPS too.

## GitHub Tools

The team behind Github.js has created a whole organization, called [GitHub Tools](https://github.com/github-tools),
dedicated to GitHub and its API. In the near future this repository could be moved under the GitHub Tools organization
as well. In the meantime, we recommend you to take a look at other projects of the organization.

## Usage

Create a Github instance.

```js
var github = new Github({
  username: "YOU_USER",
  password: "YOUR_PASSWORD",
  auth: "basic"
});
```

Or if you prefer OAuth, it looks like this:

```js
var github = new Github({
  token: "OAUTH_TOKEN",
  auth: "oauth"
});
```

Some information, such as public Gists, can be accessed without any authentication. For such use cases, you can create
a Github instance as follows:

```js
var github = new Github();
```

In conclusion, you can use:
* Authorised App Tokens (via client/secret pairs), used for bigger applications, created in web-flows/on the fly
* Personal Access Tokens (simpler to set up), used on command lines, scripts etc, created in GitHub web UI
* No authorization

See these pages for more info:

[Creating an access token for command-line use](https://help.github.com/articles/creating-an-access-token-for-command-line-use)

[Github API OAuth Overview](http://developer.github.com/v3/oauth)

Enterprise Github instances may be specified using the `apiUrl` option:

```js
var github = new Github({
  apiUrl: "https://serverName/api/v3",
  ...
});
```

## Repository API


```js
var repo = github.getRepo(username, reponame);
```

Show repository information

```js
repo.show(function(err, repo) {});
```

Delete a repository

```js
repo.deleteRepo(function(err, res) {});
```

Get contents at a particular path in a particular branch.

```js
repo.contents(branch, "path/to/dir", function(err, contents) {});
```

Fork repository. This operation runs asynchronously. You may want to poll for `repo.contents` until the forked repo is ready.

```js
repo.fork(function(err) {});
```

List forks.

```js
repo.listForks(function(err, forks) {});
```

Create new branch for repo. You can omit oldBranchName to default to "master".

```js
repo.branch(oldBranchName, newBranchName, function(err) {});
```

List Pull Requests.

```js
var state = 'open'; //or 'closed', or 'all'
repo.listPulls(state, function(err, pullRequests) {});
```

Get details of a Pull Request.

```js
var pullRequestID = 123;
repo.getPull(pullRequestID, function(err, pullRequestInfo) {});
```

Create Pull Request.

```js
var pull = {
  title: message,
  body: "This pull request has been automatically generated by Prose.io.",
  base: "gh-pages",
  head: "michael" + ":" + "prose-patch"
};
repo.createPullRequest(pull, function(err, pullRequest) {});
```

Retrieve all available branches (aka heads) of a repository.

```js
repo.listBranches(function(err, branches) {});
```

Get list of statuses for a particular commit.

```js
repo.getStatuses(sha, function(err, statuses) {});
```

Store content at a certain path. If the file specified in the path exists, the content is updated. If the file doesn't exist, it's created on the fly. You can also provide an optional object literal, (`options` in the example below) containing information about the author and the committer.

```js
var options = {
  author: {name: 'Author Name', email: 'author@example.com'},
  committer: {name: 'Committer Name', email: 'committer@example.com'},
  encode: true // Whether to base64 encode the file. (default: true)
}
repo.write('master', 'path/to/file', 'YOUR_NEW_CONTENTS', 'YOUR_COMMIT_MESSAGE', options, function(err) {});
```

Not only can you can write files, you can of course read them.

```js
repo.read('master', 'path/to/file', function(err, data) {});
```

Move a file from A to B.

```js
repo.move('master', 'path/to/file', 'path/to/new_file', function(err) {});
```

Remove a file.

```js
repo.remove('master', 'path/to/file', function(err) {});
```

Get information about a particular commit.

```js
repo.getCommit('master', sha, function(err, commit) {});
```

Exploring files of a repository is easy too by accessing the top level tree object.

```js
repo.getTree('master', function(err, tree) {});
```

If you want to access all blobs and trees recursively, you can add `?recursive=true`.

```js
repo.getTree('master?recursive=true', function(err, tree) {});
```

Given a filepath, retrieve the reference blob or tree sha.

```js
repo.getSha('master', '/path/to/file', function(err, sha) {});
```

For a given reference, get the corresponding commit sha.

```js
repo.getRef('heads/master', function(err, sha) {});
```

Create a new reference.

```js
var refSpec = {
  "ref": "refs/heads/my-new-branch-name",
  "sha": "827efc6d56897b048c772eb4087f854f46256132"
};
repo.createRef(refSpec, function(err) {});
```

Delete a reference.

```js
repo.deleteRef('heads/gh-pages', function(err) {});
```

Get contributors list with additions, deletions, and commit counts.

```js
repo.contributors(function(err, data) {});
```

Check if a repository is starred.

```js
repo.isStarred(owner, repository, function(err) {});
```

Star a repository.

```js
repo.star(owner, repository, function(err) {});
```

Unstar a repository.

```js
repo.unstar(owner, repository, function(err) {});
```

## User API


```js
var user = github.getUser();
```

List repositories of the authenticated user, including private repositories and repositories in which the user is a
collaborator and not an owner.

```js
user.repos(options, function(err, repos) {});
```

List organizations the authenticated user belongs to.

```js
user.orgs(function(err, orgs) {});
```

List authenticated user's gists.

```js
user.gists(function(err, gists) {});
```

List unread notifications for the authenticated user.

```js
user.notifications(options, function(err, notifications) {});
```

Show user information for a particular username. Also works for organizations. Pass in a falsy value (null, '', etc)
for 'username' to retrieve user information for the currently authorized user.

```js
user.show(username, function(err, user) {});
```

List public repositories for a particular user.

```js
user.userRepos(username, options, function(err, repos) {});
```

List starred repositories for a particular user.

```js
user.userStarred(username, function(err, repos) {});
```

Create a new repo for the authenticated user

```js
user.createRepo({"name": "test"}, function(err, res) {});
```
Repo description, homepage, private/public can also be set.
For a full list of options see the docs [here](https://developer.github.com/v3/repos/#create)


List repositories for a particular organization. Includes private repositories if you are authorized.

```js
user.orgRepos(orgname, function(err, repos) {});
```

List all gists of a particular user. If username is ommitted gists of the current authenticated user are returned.

```js
user.userGists(username, function(err, gists) {});
```

## Gist API

```js
var gist = github.getGist(3165654);
```

Read the contents of a Gist.

```js
gist.read(function(err, gist) {

});
```

Updating the contents of a Gist. Please consult the documentation on [GitHub](http://developer.github.com/v3/gists/).

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

gist.update(delta, function(err, gist) {

});
```
## Issues API

```js
var issues = github.getIssues(username, reponame);
```

To read all the issues of a given repository

```js
issues.list(options, function(err, issues) {});
```

To create an issue

```js
var options = {
  title: "Found a bug",
  body: "I'm having a problem with this.",
  assignee: "assignee_username",
  milestone: 1,
  labels: [
    "Label1",
    "Label2"
  ]
};

issues.create(options, function(err, issue) {});
```

To comment in a issue

```js
issues.comment(issue, comment, function(err, comment) {});
```

To edit an issue

```js
var options = {
  title: "Found a bug",
  body: "I'm having a problem with this.",
  assignee: "assignee_username",
  milestone: 1,
  state: "open",
  labels: [
    "Label1",
    "Label2"
  ]
};

issues.edit(issue, options, function (err, issue) {});
```

To get an issue

```js
issues.get(issue, function (err, issue) {});
```

## Search API

```js
var search = github.getSearch(query);
```

### Search repositories

Suppose you want to search for popular Tetris repositories written in Assembly. Your query might look like this:

```js
var search = github.getSearch("tetris+language:assembly&sort=stars&order=desc");
search.repositories(options, function (err, repositories) {});
```

### Search code

Suppose you want to find the definition of the addClass function inside jQuery. Your query would look something like this:

```js
var search = github.getSearch("addClass+in:file+language:js+repo:jquery/jquery");
search.code(options, function (err, codes) {});
```

### Search issues

Let’s say you want to find the oldest unresolved Python bugs on Windows. Your query might look something like this:

```js
var search = github.getSearch("windows+label:bug+language:python+state:open&sort=created&order=asc");
search.issues(options, function (err, issues) {});
```

### Search users

Imagine you’re looking for a list of popular users. You might try out this query:

```js
var search = github.getSearch("tom+repos:%3E42+followers:%3E1000");
search.users(options, function (err, users) {});
```

Here, we’re looking at users with the name Tom. We’re only interested in those with more than 42 repositories, and only if they have over 1,000 followers.

## Rate Limit API

```js
var rateLimit = github.getRateLimit();
```

Get the rate limit.

```js
rateLimit.getRateLimit(function (err, rateInfo) {});
```

## Change Log

### 0.12.0

Change all Search endpoints to use _requestAllPages. This is technically a breaking change because callers will need to flatten the results now

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
