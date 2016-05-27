---
layout: default
---

# Users

Note that when you `getUser()` you will get a user that represents the authenticated user. This will
slightly change the calls to GitHub. In general you should have to worry about the differences between
Listing [your repos](https://developer.github.com/v3/repos/#list-your-repositories) and listing
[a user's repos](https://developer.github.com/v3/repos/#list-user-repositories) because things should just work.

```javascript
import GitHub from 'github-api';

// basic auth
const gh = new GitHub({
   username: 'FOO',
   password: 'NotFoo'
});

const me = gh.getUser();
me.listNotification(function(err, notifcations) {
   // do some stuff
});

const clayreimann = gh.getUser('clayreimann');
clayreimann.listStarredRepos()
   .then(function({data: reposJson}) {
     console.log(`clayreimann has ${reposJson.length} repos!`);
   });
```
