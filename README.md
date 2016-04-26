# Github.js

[![Downloads per month](https://img.shields.io/npm/dm/github-api.svg?maxAge=2592000)][npm-package]
[![Latest version](https://img.shields.io/npm/v/github-api.svg?maxAge=2592000)][npm-package]
[![Gitter](https://img.shields.io/gitter/room/michael/github.js.svg?maxAge=2592000)][gitter]
[![Travis](https://img.shields.io/travis/michael/github.svg?maxAge=2592000)][travis-ci]
[![Codecov](https://img.shields.io/codecov/c/github/michael/github.svg?maxAge=2592000)][codecov]

Github.js provides a minimal higher-level wrapper around Github's API. It was concieved in the context of
[Prose][prose], a content editor for GitHub.

## Installation
Github.js is available from `npm` or (soon) [cdnjs][cdnjs].

```
npm install github-api
```

## Compatibility

[![Sauce Test Status](https://saucelabs.com/browser-matrix/githubjs.svg)](https://saucelabs.com/u/githubjs)

**Note**: Starting from version 0.10.8, Github.js supports **Internet Explorer 9**. However, the underlying methodology
used under the hood to perform CORS requests (the `XDomainRequest` object), [has limitations](xhr-link).
In particular, requests must be targeted to the same scheme as the hosting page. This means that if a page is at
http://example.com, your target URL must also begin with HTTP. Similarly, if your page is at https://example.com, then
your target URL must also begin with HTTPS. For this reason, if your requests are sent to the GitHub API (the default),
which are served via HTTPS, your page must use HTTPS too.

## GitHub Tools

The team behind Github.js has created a whole organization, called [GitHub Tools](https://github.com/github-tools),
dedicated to GitHub and its API. In the near future this repository could be moved under the GitHub Tools organization
as well. In the meantime, we recommend you to take a look at other projects of the organization.

## Example

**TODO**

[cdnjs]: https://cdnjs.com/
[codecov]: https://codecov.io/github/michael/github?branch=master
[travis-ci]: https://travis-ci.org/michael/github
[gitter]: https://gitter.im/michael/github
[npm-package]: https://www.npmjs.com/package/github-api
[prose]: http://prose.io
[xhr-link]: http://blogs.msdn.com/b/ieinternals/archive/2010/05/13/xdomainrequest-restrictions-limitations-and-workarounds.aspx
