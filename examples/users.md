---
layout: default
---

# Users

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
