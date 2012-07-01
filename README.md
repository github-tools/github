# Github.js

Github.js provides a minimal higher-level wrapper around git's [plumbing commands](http://git-scm.com/book/en/Git-Internals-Plumbing-and-Porcelain), exposing an API for manipulating GitHub repositories on the file level. It is being developed in the context of Prose, a content editor for GitHub.

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
  token: "OAUTH_TOKEN"
  auth: "oauth"
});
```

## Repository API


```js
var repo = github.getRepo(reponame);
```

Retrieve all available branches (aka heads) of a repository.

```js
repo.listBranches(function(err, branches) {
  
});
```

Store contents at a certain path, where files that don't yet exist are created on the fly.

```js
repo.write('master', 'path/to/file', 'YOUR_NEW_CONTENTS', 'YOUR_COMMIT_MESSAGE', function(err) {
  
});
```

Not only can you can write files, you can of course read them.

```js
repo.read('master', 'path/to/file', function(err, data) {
  
});
```

Move a file from A to B.

```js
repo.move('master', 'path/to/file', 'path/to/new_file', function(err) {
  
});
```

Remove a file.

```js
repo.remove('master', 'path/to/file', function(err) {
  
});
```

Listing all files of a repository is easy too.

```js
repo.list('master', 'path/to/file', function(err, data) {
  
});
```

## User API


```js
var user = github.getUser();
```

List all repositories of the authenticated user.

```js
user.repos(username, function(err, orgs) {
  
});
```

List organizations the autenticated user belongs to.

```js
user.orgs(function(err, orgs) {
  
});
```

Show user information for a particular username. Also works for organizations.

```js
user.show(username, function(err, user) {
  
});
```

List public repositories for a particular user.

```js
user.userRepos(username, function(err, repos) {
  
});
```

List repositories for a particular organization. Includes private repositories if you are authorized.

```js
user.orgRepos(orgname, function(err, repos) {
  
});
```

## Tests

Github.js is automatically™ tested by the users of [Prose](http://prose.io). Because of that, we decided to save some time by not maintaining a test suite. Yes, you heard right. :)


## Change Log

### O.6.X

Adds support for organizations and fixes an encoding issue.

### O.5.X

Smart caching of latest commit sha. 

### 0.4.X

Added support for [OAuth](http://developer.github.com/v3/oauth/).

### 0.3.X

Support for Moving and removing files.

### 0.2.X

Consider commit messages.

### 0.1.X

Initial version.