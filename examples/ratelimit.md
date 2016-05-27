---
layout: default
---

## Checking the ratelimit

```javascript
var GitHub = require('github-api');

var gh = new GitHub();

// check our rate-limit status
// since we're unauthenticated the limit is 60 requests per hour
gh.getRateLimit().getRateLimit()
  .then(function(resp) {
      console.log('Limit remaining: ' + resp.data.rate.remaining);
      // date constructor takes epoch milliseconds and we get epoch seconds
      console.log('Reset date: ' + new Date(resp.data.rate.reset * 1000));
  }).catch(function(error) {
      console.log('Error fetching rate limit', error.message);
  });

```
