# Github.js

Github.js provides a minimal higher-level wrapper around git's [plumbing commands](http://git-scm.com/book/en/Git-Internals-Plumbing-and-Porcelain), exposing an API for manipulating GitHub repositories on the file level. It is being developed in the context of [github-book](http://github.com/philschatz/github-book), an EPUB3 editor for GitHub.

This package can also be used in nodejs or as a requirejs module.

## Usage

### In a browser without requirejs

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
  token: "OAUTH_TOKEN"
  auth: "oauth"
});
```

### In a browser using requirejs

```js
define(['github-js'], function(Github) {
  github = new Github({
    username: "YOU_USER",
    password: "YOUR_PASSWORD",
    auth: "basic"
  });
});
```

### In Nodejs

Install instructions:

    npm install github-js

```js
var Github = require('github-js');
var github = Github.new({
  username: "YOU_USER",
  password: "YOUR_PASSWORD",
  auth: "basic"
});
```


## Repository API


```js
var repo = github.getRepo(username, reponame);
```

Show repository information

```js
repo.show()
.done(function(repo) {})
.fail(function(err)  {});
```

Get contents at a particular path.

```js
repo.contents("path/to/dir")
.done(function(contents) {});
```

Fork repository. This operation runs asynchronously. You may want to poll for `repo.contents` until the forked repo is ready.

```js
repo.fork()
.done(function() {})
.fail(function(err) {});
```

Create Pull Request.

```js
var pull = {
  title: message,
  body: "This pull request has been automatically generated.",
  base: "gh-pages",
  head: "michael" + ":" + "prose-patch",
};
repo.createPullRequest(pull)
.done(function(pullRequest) {})
.fail(function(err) {});
```


Retrieve all available branches (aka heads) of a repository.

```js
repo.listBranches()
.done(function(branches) {})
.fail(function(err) {});
```

Store contents at a certain path, where files that don't yet exist are created on the fly.

```js
repo.write('master', 'path/to/file', 'YOUR_NEW_CONTENTS', 'YOUR_COMMIT_MESSAGE')
.done(function() {})
.fail(function(err) {});
```

Not only can you can write files, you can of course read them.

```js
repo.read('master', 'path/to/file')
.done(function(data) {})
.fail(function(err) {});
```

Move a file from A to B.

```js
repo.move('master', 'path/to/file', 'path/to/new_file')
.done(function() {})
.fail(function(err) {});
```

Remove a file.

```js
repo.remove('master', 'path/to/file')
.done(function() {})
.fail(function(err) {});
```

Exploring files of a repository is easy too by accessing the top level tree object.

```js
repo.getTree('master')
.done(function(tree) {})
.fail(function(err) {});
```

If you want to access all blobs and trees recursively, you can add `?recursive=true`.

```js
repo.getTree('master?recursive=true')
.done(function(tree) {})
.fail(function(err) {});
```

Given a filepath, retrieve the reference blob or tree sha.

```js
repo.getSha('master', '/path/to/file')
.done(function(sha) {})
.fail(function(err) {});
```

For a given reference, get the corresponding commit sha.

```js
repo.getRef('heads/master')
.done(function(sha) {})
.fail(function(err) {});
```

Create a new reference.

```js
var refSpec = {
  "ref": "refs/heads/my-new-branch-name",
  "sha": "827efc6d56897b048c772eb4087f854f46256132"
};
repo.createRef(refSpec)
.done(function() {})
.fail(function(err) {});
```

Delete a reference.

```js
repo.deleteRef('heads/gh-pages')
.done(function() {})
.fail(function(err) {});
```


## User API


```js
var user = github.getUser();
```

List all repositories of the authenticated user.

```js
user.repos(username)
.done(function(repos) {})
.fail(function(err) {});
```

List organizations the autenticated user belongs to.

```js
user.orgs()
.done(function(orgs) {})
.fail(function(err) {});
```

List authenticated user's gists.

```js
user.gists(username)
.done(function(gists) {})
.fail(function(err) {});
```

Show user information for a particular username. Also works for organizations.

```js
user.show(username)
.done(function(user) {})
.fail(function(err) {});
```

List public repositories for a particular user.

```js
user.userRepos(username)
.done(function(repos) {})
.fail(function(err) {});
```

List repositories for a particular organization. Includes private repositories if you are authorized.

```js
user.orgRepos(orgname)
.done(function(repos) {})
.fail(function(err) {});
```

List all gists of a particular user. If username is ommitted gists of the current authenticated user are returned.

```js
user.userGists(username)
.done(function(gists) {})
.fail(function(err) {});
```

## Gist API

```js
var gist = github.getGist(3165654);
```

Read the contents of a Gist.

```js
gist.read()
.done(function(gist) {})
.fail(function(err) {});
```

Updating the contents of a Git. Please consult the documentation on [GitHub](http://developer.github.com/v3/gists/).

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
.done(function(gist) {})
.fail(function(err) {});
```


##Setup

Github.js has the following dependencies:

- Underscore
- Base64 (for basic auth). You can leave this if you are not using basic auth.

Include these before github.js :

```
<script src="lib/underscore-min.js">
<script src="lib/base64.js">
<script src="github.js">
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
