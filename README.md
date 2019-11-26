# Maintainers wanted
[Apply within](https://github.com/github-tools/github/issues/539)

# Github.js

asdasd asdas dasd
asdasd
sd

## Usage

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
```html
<!-- just github-api source (5.3kb) -->
<script src="https://unpkg.com/github-api/dist/GitHub.min.js"></script>

<!-- standalone (20.3kb) -->
<script src="https://unpkg.com/github-api/dist/GitHub.bundle.min.js"></script>
```

[npm-package]: https://www.npmjs.com/package/github-api/
[unpkg]: https://unpkg.com/github-api/
[travis-ci]: https://travis-ci.org/github-tools/github

## Contributing

We welcome contributions of all types! This section will guide you through setting up your development environment.

### Setup

1. [Install Node](https://nodejs.org/en/) version 8,10 or 11. It can often help to use a Node version switcher such as [NVM](https://github.com/nvm-sh/nvm).
2. Fork this repo to your GitHub account.
3. Clone the fork to your development machine (`git clone https://github.com/{YOUR_USERNAME}/github`).
4. From the root of the cloned repo, run `npm install`.
5. Email jaredrewerts@gmail.com with the subject **GitHub API - Personal Access Token Request**

A personal access token for our test user, @github-tools-test, will be generated for you.

6. Set the environment variable `GHTOOLS_USER` to `github-tools-test`.

`export GHTOOLS_USER=github-tools-test`

7. Set the environment variable `GHTOOLS_PASSWORD` to the personal access token that was generated for you.

`export GHTOOLS_PASSWORD={YOUR_PAT}`

**NOTE** Windows users can use [this guide](http://www.dowdandassociates.com/blog/content/howto-set-an-environment-variable-in-windows-command-line-and-registry/) to learn about setting environment variables on Windows.

### Tests

The main way we write code for `github-api` is using test-driven development. We use Mocha to run our tests. Given that the bulk of this library is just interacting with GitHub's API, nearly all of our tests are integration tests. 

To run the test suite, run `npm run test`.
