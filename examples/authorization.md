---
layout: default
---

## Authorization and Making Requests

The library currently supports most authentication schemes that GitHub
provides.

```javascript
var GitHub = require('github-api');

// by default all requests are unauthenticated
// unauthenticated clients are limited to 60 request per hour
var noAuth = new GitHub();

// you can authenticate with username and password
var passwordAuth = new GitHub({
  username: 'MY_USERNAME',
  password: 'MY_PASSWORD'
});

// you can also provide an OAuth token to authenticate the requests
var oauthAuth = new GitHub({
  token: 'MY_OAUTH_TOKEN'
});
```
