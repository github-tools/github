---
layout: default
---

## Reading and Manipulating Gists

```javascript
var GitHub = require('github-api');

// unauthenticated client
var gh = new GitHub();
var gist = gh.getGist(); // not a gist yet
gist.create({
   public: true,
   description: 'My first gist',
   files: {
      "file1.txt": {
         contents: "Aren't gists great!"
      }
   }
})
// Promises!
.then(function(httpResponse) {
   var gistJson = httpResponse.data;

   // Callbacks too
   gist.read(function(err, gist, xhr) {
      // if no error occurred then err == null
      // gistJson == httpResponse.data
      // xhr == httpResponse
   });
});
```
