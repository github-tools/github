Github.js
=============

Ever wanted to store a file on Github right from the browser? Here you are.

```js
var github = new Github({
  username: "YOU_USER",
  password: "YOUR_PASSWORD",
  auth: "basic"
});

// Expose API for a given repository

var repo = github.getRepo(reponame);

// Store contents at a certain path (assumes UTF-8)
// Files that don't yet exist are created on the fly.

repo.write('path/to/file', 'YOUR_NEW_CONTENTS', 'YOUR_COMMIT_MESSAGE', function(err) {
  
});
```

Not only can you can write files, you can of course read them:

```js
// Retrieve contents of a certain file (assumes UTF-8)

repo.read('path/to/file', function(err, data) {
  
});
```