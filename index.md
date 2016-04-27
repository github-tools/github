---
layout: default
---
## [GitHub.js](https://github.com/michael/github)
{% include stars.html %}

Github.js is a javascript library that exposes GitHub's API to node and browser clients.

## Documentation

* [v1.0.0](/docs/1.0.0/index.html)

## Examples

```javascript
/*
   Data can be retrieved from the API either using callbacks (as in versions < 1.0)
   or using a new promise-based API. For now the promise-based API just returns the
   raw HTTP request promise; this might change in the next version.
 */
var GitHub = require('github-api');

// unauthenticated client
var gh = new GitHub();
var gist = gh.getGist(); // not a gist yet
gist.create({
   public: true,
   description: 'My first gist',
   files: {
      "file1.txt": {
         contents: "Aren't gists great!"
      }
   }
}).then(function(httpResponse) {
   // Promises!
   var gist = httpResponse.data;
   gist.read(function(err, gist, xhr) {
      // if no error occurred then err == null

      // gist == httpResponse.data

      // xhr == httpResponse
   });
});
```

```javascript
var GitHub = require('github-api');

// basic auth
var gh = new GitHub({
   username: 'FOO',
   password: 'NotFoo'
});

var me = gh.getUser();
me.getNotification(function(err, notifcations) {
   // do some stuff
});

var clayreimann = gh.getUser('clayreimann');
clayreimann.getStarredRepos()
   .then(function(httpPromise) {
      var repos = httpPromise.data;
   });
```

```javascript
var GitHub = require('github-api');

// token auth
var gh = new GitHub({
   token: 'MY_OAUTH_TOKEN'
});

var yahoo = gh.getOrganization('yahoo');
yahoo.getRepos(function(err, repos) {
   // look at all the repos!
})
```

#### Credits
* Site based on [Solo](http://chibicode.github.io/solo).
* 
