---
layout: default
---

## Reading and manipulating gists

```javascript
var GitHub = require('github-api');

// unauthenticated client
var gh = new GitHub({
  username: 'foo',
  password: 'bar'
});

var gist = gh.getGist(); // not a gist yet
var data = {
   public: true,
   description: 'My first gist',
   files: {
      "file1.txt": {
         contents: "Aren't gists great!"
      }
   }
};

gist.create(data)
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
