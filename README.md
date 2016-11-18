# Github.js

[![Downloads per month](https://img.shields.io/npm/dm/github-api.svg?maxAge=2592000)][npm-package]
[![Latest version](https://img.shields.io/npm/v/github-api.svg?maxAge=3600)][npm-package]
[![Gitter](https://img.shields.io/gitter/room/michael/github.js.svg?maxAge=2592000)][gitter]
[![Travis](https://img.shields.io/travis/michael/github.svg?maxAge=60)][travis-ci]
<!-- [![Codecov](https://img.shields.io/codecov/c/github/michael/github.svg?maxAge=2592000)][codecov] -->

Github.js provides a minimal higher-level wrapper around Github's API. It was concieved in the context of
[Prose][prose], a content editor for GitHub.

## [Read the docs][docs]

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

## Compatibility
Github.js is tested on Node:
* 6.x
* 5.x
* 4.x
* 0.12

## GitHub Tools

The team behind Github.js has created a whole organization, called [GitHub Tools](https://github.com/github-tools),
dedicated to GitHub and its API. In the near future this repository could be moved under the GitHub Tools organization
as well. In the meantime, we recommend you to take a look at other projects of the organization.

## Samples

```javascript
/*
   Data can be retrieved from the API either using callbacks (as in versions < 1.0)
   or using a new promise-based API. For now the promise-based API just returns the
   raw HTTP request promise; this might change in the next version.
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
   let gistJson = data;
   gist.read(function(err, gist, xhr) {
      // if no error occurred then err == null

      // gistJson === httpResponse.data

      // xhr === httpResponse
   });
});
```

```javascript
import GitHub from 'github-api';

// basic auth
const gh = new GitHub({
   username: 'FOO',
   password: 'NotFoo'
});

const me = gh.getUser();
me.listNotifications(function(err, notifications) {
   // do some stuff
});

const clayreimann = gh.getUser('clayreimann');
clayreimann.listStarredRepos()
   .then(function({data: reposJson}) {
      // do stuff with reposJson
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

[codecov]: https://codecov.io/github/michael/github?branch=master
[docs]: http://michael.github.io/github/
[gitter]: https://gitter.im/michael/github
[npm-package]: https://www.npmjs.com/package/github-api/
[unpkg]: https://unpkg.com/github-api/
[prose]: http://prose.io
[travis-ci]: https://travis-ci.org/michael/github
[xhr-link]: http://blogs.msdn.com/b/ieinternals/archive/2010/05/13/xdomainrequest-restrictions-limitations-and-workarounds.aspx
