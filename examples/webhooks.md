---
layout: default
---

## List the webhooks for a user's repositories
```javascript
var GitHub = require("github-api");
var Promise = require("es6-promise").Promise;

var gh = new GitHub({
  username: 'foo',
  password: 'bar'
});

var user = 'slunk32';
gh.getUser(user).getRepos()
  // turn the json objects we fetched into `Repository`s
  .then(function(httpPromise) {
      return httpPromise.data.map(function(repoJson) {
          // console.log('repo '  repoJson.name);
          return gh.getRepo(user, repoJson.name);
      });
  })
  // Curry promises to fetch webhooks
   .then(function(repos) {
      console.log(repos);
      return Promise.all(repos.map(function(repo) {
          return repo.listHooks();
      }));
   })
   // Fetch the webhooks json
   .then(function(listOfListOfHooks) {
       listOfListOfHooks = listOfListOfHooks || []; // monkey-patch for non-authenticated users
       listOfListOfHooks.forEach(function(hooksHttpResonse) {
           console.log('hooks for '  hooksHttpResonse.config.url);
           console.log(hooksHttpResonse.data);
       });
   })
   .catch(function(error) {
       console.log('an error occurred fetching the webhooks', error);
   });
```

## Create a new webhook
```javascript
var GitHub = require("github-api");
var Promise = require("es6-promise").Promise;

var gh = new GitHub({
  username: 'foo',
  password: 'bar'
});

var fork = gh.getRepository('user', 'repo');

var hookDef = {
  "name" : "travis",
  "config" : {
    "user" : "your-Username",
    "token" : "00000000000000000000000000",
    "domain" : "http://notify.travis-ci.org",
    "content_type": "json"
  },
  "events" : ["push", "pull_request"],
  "active" : true
 }
fork.createHook(hookDef)
  .then(function({data: hook}) {
    console.log("A travis hook has been created which will trigger a build on push and pull request events...");
  });
```
