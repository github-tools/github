## Change Log

### 1.0.0
Complete rewrite in ES2015.

* Promise-ified the API
* Auto-generation of documentation
* Modularized codebase
* Refactored tests to run primarially in mocha

#### Breaking changes
* Search API no longer takes a string it now takes an object with properties `q`, `sort`, and `order` to make
   the parts of the query easier to grok and to better match GitHub's API
* `Repository.getSha` now returns the same data as GitHub's API. If the reqeusted object is not a directory then the
   response will contain a property `SHA`, and if the reqeusted object is a directory then the contents of the
   directory are `stat`ed
* `Repository.getRef` now returns the `refspec` from GitHub's API.
* `Repository.delete` has been removed
