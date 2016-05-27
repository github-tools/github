---
layout: default
---

## Get an organization's repositories

```javascript
var GitHub = require('github-api');

// token auth
var gh = new GitHub({
   token: 'MY_OAUTH_TOKEN'
});

var yahoo = gh.getOrganization('yahoo');
yahoo.getRepos(function(err, repos) {
   // look at all the repos!
});
```
