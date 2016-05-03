---
layout: default
---

{:.centered}
Github.js is a javascript library that makes it easy to interact with GitHub's
REST API in Node and in the browser. It can be used with node-style callbacks or
modern promises.

## API Documentation

Data can be retrieved from the API either using callbacks (as in versions < 1.0)
or using a new promise-based API. For now the promise-based API just returns the
raw HTTP request promise; this might change in the next version.

{%for entry in site.data.versions %}
* [{{entry.version}}]({{site.baseurl}}/docs/{{entry.version}}/index.html)
{%endfor%}

## Examples

* [Authorization][authorization]
* [Gists][gists]
* [Users][users]
* [Organizations][organizations]
* Repositories

#### Credits
* Base styles: [Milligram](milligram)

[milligram]: https://milligram.github.io/
[gists]: {{site.baseurl}}/examples/gists
[users]: {{site.baseurl}}/examples/users
[organizations]: {{site.baseurl}}/examples/organizations
[authorization]: {{site.baseurl}}/examples/authorization
