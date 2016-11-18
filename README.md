# Github.js

[![Downloads per month](https://img.shields.io/npm/dm/github-api.svg?maxAge=2592000)][npm-package]
[![Latest version](https://img.shields.io/npm/v/github-api.svg?maxAge=3600)][npm-package]
[![Gitter](https://img.shields.io/gitter/room/michael/github.js.svg?maxAge=2592000)][gitter]
[![Travis](https://img.shields.io/travis/michael/github.svg?maxAge=60)][travis-ci]
<!-- [![Codecov](https://img.shields.io/codecov/c/github/michael/github.svg?maxAge=2592000)][codecov] -->

Github.js provides a minimal higher-level wrapper around Github's API.

## Usage

```javascript
/*
   Data can be retrieved from the API either using callbacks (as in versions < 1.0)
   or using a new promise-based API. The promise-based API returns the raw Axios
   request promise.
 */
import GitHub from 'github-api';

// unauthenticated client
const gh = new GitHub();
let gist = gh.getGist(); // not a gist yet
gist.create({
   public: true,
   description: 'My first gist',
   files: {
      "file1.txt": {
         content: "Aren't gists great!"
      }
   }
}).then(function({data}) {
   // Promises!
   let createdGist = data;
   return gist.read();
}).then(function({data}) {
   let retrievedGist = data;
   // do interesting things
});
```

```javascript
var GitHub = require('github-api');

// basic auth
var gh = new GitHub({
   username: 'FOO',
   password: 'NotFoo'
   /* also acceptable:
      token: 'MY_OAUTH_TOKEN'
    */
});

var me = gh.getUser(); // no user specified defaults to the user for whom credentials were provided
me.listNotifications(function(err, notifications) {
   // do some stuff
});

var clayreimann = gh.getUser('clayreimann');
clayreimann.listStarredRepos(function(err, repos) {
   // look at all the starred repos!
});
```

## API Documentation

[API documentation][docs] is hosted on github pages, and is generated from JSDoc; any contributions
should include updated JSDoc.

## Installation
Github.js is available from `npm` or [unpkg][unpkg].

```shell
npm install github-api
```

```html
<!-- just github-api source (5.3kb) -->
<script src="https://unpkg.com/github-api/dist/GitHub.min.js"></script>

<!-- standalone (20.3kb) -->
<script src="https://unpkg.com/github-api/dist/GitHub.bundle.min.js"></script>
```

## Compatibility
`Github.js` is tested on Node.js:
* 6.x

Note: `Github.js` uses Promise, hence it will not work in Node.js < 4 without polyfill.

## GitHub Tools

The team behind Github.js has created a whole organization, called [GitHub Tools](https://github.com/github-tools),
dedicated to GitHub and its API. In the near future this repository could be moved under the GitHub Tools organization
as well. In the meantime, we recommend you to take a look at other projects of the organization.

[codecov]: https://codecov.io/github/michael/github?branch=master
[docs]: http://michael.github.io/github/
[gitter]: https://gitter.im/michael/github
[npm-package]: https://www.npmjs.com/package/github-api/
[unpkg]: https://unpkg.com/github-api/
[travis-ci]: https://travis-ci.org/michael/github
