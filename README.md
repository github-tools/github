Github.js
=============

Ever wanted to store a file on Github right from the browser? Here you are.


Expose API for a given repository.

```js
var github = new Github({
  username: "YOU_USER",
  password: "YOUR_PASSWORD",
  auth: "basic"
});

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

Listing all files of a repository is easy too.

```js
// Retrieve contents of a certain file (assumes UTF-8)

repo.list('master', 'path/to/file', function(err, data) {
  
});
```