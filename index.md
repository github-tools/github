---
layout: landing
---

{:.centered}
Github.js is a javascript library that makes it easy to interact with GitHub's
REST API in Node and in the browser. It can be used with node-style callbacks or
modern promises.

#### API Documentation

Data can be retrieved from the API either using callbacks (as in versions < 1.0)
or using a new promise-based API. For now the promise-based API just returns the
raw HTTP request promise; this might change in the next version.

Below you can find the link to read the documentation for each of the versions
released so far, starting from version 1.0.0.

{%for entry in site.data.versions reversed %}
* [{{entry.version}}]({{site.baseurl}}/docs/{{entry.version}}/index.html)
{%endfor%}

#### Examples

* [Authorization][authorization-examples]
* [Gists][gist-examples]
* [Users][user-examples]
* [Organizations][organization-examples]
* [Webhooks][webhook-examples]
* [Rate Limit][ratelimit-examples]

#### Credits
* Base styles: [Milligram](milligram)

[milligram]: https://milligram.github.io/
[gist-examples]: {{site.baseurl}}/examples/gists
[user-examples]: {{site.baseurl}}/examples/users
[organization-examples]: {{site.baseurl}}/examples/organizations
[authorization-examples]: {{site.baseurl}}/examples/authorization
[webhook-examples]: {{site.baseurl}}/examples/webhooks
[ratelimit-examples]: {{site.baseurl}}/examples/ratelimit
