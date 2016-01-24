'use strict';

var Github = require('../src/github.js');
var testUser = require('./user.json');
var github, repo, user, imageB64, imageBlob;

if (typeof window === 'undefined') { // We're in NodeJS
   var fs = require('fs');
   var path = require('path');

   imageBlob = fs.readFileSync(path.join(__dirname, 'gh.png')); // This is a Buffer().
   imageB64 = imageBlob.toString('base64');
} else { // We're in the browser
   if (typeof window._phantom !== 'undefined') {
      var xhr = new XMLHttpRequest();

      xhr.responseType = 'blob';
      xhr.open('GET', 'base/test/gh.png');
      xhr.onload = function() {
         var reader = new FileReader();

         reader.onloadend = function() {
            imageB64 = btoa(reader.result);
            imageBlob = reader.result;
            console.log(imageBlob);
         };

         reader.readAsBinaryString(xhr.response);
      };

      xhr.send();
   } else {
      // jscs:disable
      imageB64 = 'iVBORw0KGgoAAAANSUhEUgAAACsAAAAmCAAAAAB4qD3CAAABgElEQVQ4y9XUsUocURQGYN/pAyMWBhGtrEIMiFiooGuVIoYsSBAsRSQvYGFWC4uFhUBYsilXLERQsDA20YAguIbo5PQp3F3inVFTheSvZoavGO79z+mJP0/Pv2nPtlfLpfLq9tljNquO62S8mj1kmy/8nrHm/Xaz1930bt5n1+SzVmyrilItsod9ON0td1V59xR9hwV2HsMRsbfROLo4amzsRcQw5vO2CZPJEU5CM2cXYTCxg7CY2mwIVhK7AkNZYg9g4CqxVwNwkNg6zOTKMQP1xFZgKWeXoJLYdSjl7BysJ7YBIzk7Ap8TewLOE3oOTtIz6y/64bfQn55ZTIAPd2gNTOTurcbzp7z50v1y/Pq2Q7Wczca8vFjG6LvbMo92hiPL96xO+eYVPkVExMdONetFXZ+l+eP9cuV7RER8a9PZwrloTXv2tfv285ZOt4rnrTXlydxCu9sZmGrdN8eXC3ATERHXsHD5wC7ZL3HdsaX9R3bUzlb7YWvn/9ipf93+An8cHsx3W3WHAAAAAElFTkSuQmCC';
      imageBlob = new Blob();
      // jscs:enable
   }
}

describe('Github.Repository', function() {
   before(function() {
      github = new Github({
         username: testUser.USERNAME,
         password: testUser.PASSWORD,
         auth: 'basic'
      });

      repo = github.getRepo('michael', 'github');
   });

   it('should show repo', function(done) {
      repo.show(function(err, res) {
         should.not.exist(err);
         res.full_name.should.equal('michael/github'); // jscs:ignore
         done();
      });
   });

   it('should get blob', function(done) {
      repo.getSha('master', 'README.md', function(err, sha) {
         repo.getBlob(sha, function(err, content) {
            should.not.exist(err);

            content.indexOf('# Github.js').should.be.above(-1);

            done();
         });
      });
   });

   it('should show repo contents', function(done) {
      repo.contents('master', '', function(err, contents) {
         should.not.exist(err);
         contents.should.be.instanceof(Array);

         var readme = contents.filter(function(content) {
            return content.path === 'README.md';
         });

         readme.should.have.length(1);
         readme[0].should.have.property('type', 'file');

         done();
      });
   });

   it('should get tree', function(done) {
      repo.getTree('master', function(err, tree) {
         should.not.exist(err);

         tree.should.be.instanceof(Array);
         tree.should.have.length.above(0);

         done();
      });
   });

   it('should fork repo', function(done) {
      repo.fork(function(err) {
         should.not.exist(err);

         // @TODO write better assertion.
         done();
      });
   });

   it('should list forks of repo', function(done) {
      repo.listForks(function(err) {
         should.not.exist(err);

         // @TODO write better assertion.
         done();
      });
   });

   it('should list commits with no options', function(done) {
      repo.getCommits(null, function(err, commits) {
         should.not.exist(err);
         commits.should.be.instanceof(Array);
         commits.should.have.length.above(0);
         commits[0].should.have.property('commit');
         commits[0].should.have.property('author');

         done();
      });
   });

   it('should list commits with all options', function(done) {
      var sinceDate = new Date(2015, 0, 1);
      var untilDate = new Date(2016, 0, 20);
      var options = {
         sha: 'master',
         path: 'test',
         author: 'AurelioDeRosa',
         since: sinceDate,
         until: untilDate
      };

      repo.getCommits(options, function(err, commits) {
         should.not.exist(err);
         commits.should.be.instanceof(Array);
         commits.should.have.length.above(0);
         commits[0].should.have.property('commit');
         commits[0].should.have.deep.property('author.login', 'AurelioDeRosa');
         (new Date(commits[0].commit.author.date)).getTime().should.be.within(sinceDate.getTime(), untilDate.getTime());

         done();
      });
   });

   it('should show repo contributors', function(done) {
      repo.contributors(function(err, res) {
         should.not.exist(err);
         res.should.be.instanceof(Array);
         res.should.have.length.above(1);
         should.exist(res[0].author);
         should.exist(res[0].total);
         should.exist(res[0].weeks);
         done();
      });
   });

   // @TODO repo.branch, repo.pull

   it('should list repo branches', function(done) {
      repo.listBranches(function(err) {
         should.not.exist(err);
         done();
      });
   });

   it('should read repo', function(done) {
      repo.read('master', 'README.md', function(err, res) {
         res.indexOf('# Github.js').should.be.above(-1);
         done();
      });
   });

   it('should get commit from repo', function(done) {
      repo.getCommit('master', '20fcff9129005d14cc97b9d59b8a3d37f4fb633b', function(err, commit) {
         should.not.exist(err);
         commit.message.should.equal('v0.10.4');
         commit.author.date.should.equal('2015-03-20T17:01:42Z');
         done();
      });
   });

   it('should get statuses for a SHA from a repo', function(done) {
      repo.getStatuses('20fcff9129005d14cc97b9d59b8a3d37f4fb633b', function(err, statuses) {
         statuses.length.should.equal(6);
         statuses.every(function(status) {
            return status.url === 'https://api.github.com/repos/michael/github/statuses/20fcff9129005d14cc97b9d59b8a3d37f4fb633b';
         }).should.equal(true);
         done();
      });
   });

   it('should get a SHA from a repo', function(done) {
      repo.getSha('master', '.gitignore', function(err) {
         should.not.exist(err);
         done();
      });
   });

   it('should get a repo by fullname', function(done) {
      var repo2 = github.getRepo('michael/github');

      repo2.show(function(err, res) {
         should.not.exist(err);
         res.full_name.should.equal('michael/github'); // jscs:ignore
         done();
      });
   });

   it('should check if the repo is starred', function(done) {
      repo.isStarred('michael', 'github', function(err) {
         err.error.should.equal(404);
         done();
      });
   });
});

var repoTest = Math.floor(Math.random() * 100000);

describe('Creating new Github.Repository', function() {
   before(function() {
      github = new Github({
         username: testUser.USERNAME,
         password: testUser.PASSWORD,
         auth: 'basic'
      });

      user = github.getUser();
      repo = github.getRepo(testUser.USERNAME, repoTest);
   });

   it('should create repo', function(done) {
      user.createRepo({
         name: repoTest
      }, function(err, res) {
         should.not.exist(err);
         res.name.should.equal(repoTest.toString());
         done();
      });
   });

   it('should write to repo', function(done) {
      repo.write('master', 'TEST.md', 'THIS IS A TEST', 'Creating test', function(err) {
         should.not.exist(err);

         repo.read('master', 'TEST.md', function(err, res) {
            should.not.exist(err);
            res.should.equal('THIS IS A TEST');

            done();
         });
      });
   });

   it('should write to repo branch', function(done) {
      repo.branch('master', 'dev', function(err) {
         should.not.exist(err);
         repo.write('dev', 'TEST.md', 'THIS IS AN UPDATED TEST', 'Updating test', function(err) {
            should.not.exist(err);
            repo.read('dev', 'TEST.md', function(err, res) {
               should.not.exist(err);
               res.should.equal('THIS IS AN UPDATED TEST');

               done();
            });
         });
      });
   });

   it('should compare two branches', function(done) {
      repo.branch('master', 'compare', function() {
         repo.write('compare', 'TEST.md', 'THIS IS AN UPDATED TEST', 'Updating test', function() {
            repo.compare('master', 'compare', function(err, diff) {
               should.not.exist(err);

               diff.should.have.property('total_commits', 1);
               diff.should.have.deep.property('files[0].filename', 'TEST.md');

               done();
            });
         });
      });
   });

   it('should submit a pull request', function(done) {
      var baseBranch = 'master';
      var headBranch = 'pull-request';
      var pullRequestTitle = 'Test pull request';
      var pullRequestBody = 'This is a test pull request';

      repo.branch(baseBranch, headBranch, function() {
         repo.write(headBranch, 'TEST.md', 'THIS IS AN UPDATED TEST', 'Updating test', function() {
            repo.createPullRequest(
               {
                  title: pullRequestTitle,
                  body: pullRequestBody,
                  base: baseBranch,
                  head: headBranch
               },
               function(err, pullRequest) {
                  should.not.exist(err);

                  pullRequest.should.have.property('number').above(0);
                  pullRequest.should.have.property('title', pullRequestTitle);
                  pullRequest.should.have.property('body', pullRequestBody);

                  done();
               }
            );
         });
      });
   });

   it('should get ref from repo', function(done) {
      repo.getRef('heads/master', function(err) {
         should.not.exist(err);

         // @TODO write better assertion
         done();
      });
   });

   it('should create ref on repo', function(done) {
      repo.getRef('heads/master', function(err, sha) {
         var refSpec = {
            ref: 'refs/heads/new-test-branch', sha: sha
         };

         repo.createRef(refSpec, function(err) {
            should.not.exist(err);

            // @TODO write better assertion
            done();
         });
      });
   });

   it('should delete ref on repo', function(done) {
      repo.deleteRef('heads/new-test-branch', function(err) {
         should.not.exist(err);

         // @TODO write better assertion
         done();
      });
   });

   it('should list tags on repo', function(done) {
      repo.listTags(function(err) {
         should.not.exist(err);

         // @TODO write better assertion
         done();
      });
   });

   it('should list pulls on repo', function(done) {
      var repo = github.getRepo('michael', 'github');
      var options = {
         state: 'all',
         sort: 'updated',
         direction: 'desc',
         page: 1,
         per_page: 10
      };

      repo.listPulls(options, function(err, pull_list) {
         should.not.exist(err);
         pull_list.should.be.instanceof(Array);
         pull_list.should.have.length(10);
         should.exist(pull_list[0].title);
         should.exist(pull_list[0].body);
         should.exist(pull_list[0].url);
         done();
      });
   });

   it('should get pull requests on repo', function(done) {
      var repo = github.getRepo('michael', 'github');

      repo.getPull(153, function(err) {
         should.not.exist(err);

         // @TODO write better assertion
         done();
      });
   });

   it('should delete a file on the repo', function(done) {
      repo.write('master', 'REMOVE-TEST.md', 'THIS IS A TEST', 'Remove test', function(err) {
         should.not.exist(err);

         repo.remove('master', 'REMOVE-TEST.md', function(err) {
            should.not.exist(err);
            done();
         });
      });
   });

   it('should use repo.delete as an alias for repo.remove', function(done) {
      repo.write('master', 'REMOVE-TEST.md', 'THIS IS A TEST', 'Remove test', function(err) {
         should.not.exist(err);

         repo.delete('master', 'REMOVE-TEST.md', function(err) {
            should.not.exist(err);
            done();
         });
      });
   });

   it('should write author and committer to repo', function(done) {
      var options = {
         author: {
            name: 'Author Name', email: 'author@example.com'
         },
         committer: {
            name: 'Committer Name', email: 'committer@example.com'
         }
      };

      repo.write('dev', 'TEST.md', 'THIS IS A TEST BY AUTHOR AND COMMITTER', 'Updating', options, function(err, res) {
         should.not.exist(err);
         repo.getCommit('dev', res.commit.sha, function(err, commit) {
            should.not.exist(err);
            commit.author.name.should.equal('Author Name');
            commit.author.email.should.equal('author@example.com');
            commit.committer.name.should.equal('Committer Name');
            commit.committer.email.should.equal('committer@example.com');

            done();
         });
      });
   });

   it('should be able to write CJK unicode to repo', function(done) {
      repo.write('master', '中文测试.md', 'THIS IS A TEST', 'Creating test', function(err) {
         should.not.exist(err);

         // @TODO write better assertion
         done();
      });
   });

   it('should be able to write unicode to repo', function(done) {
      repo.write('master', 'TEST_unicode.md', '\u2014', 'Long dash unicode', function(err) {
         should.not.exist(err);

         if (err) console.log(err);
         repo.read('master', 'TEST_unicode.md', function(err, obj) {
            should.not.exist(err);
            obj.should.equal('\u2014');

            done();
         });
      });
   });

   it('should pass a regression test for _request (#14)', function(done) {
      repo.getRef('heads/master', function(err, sha) {
         var refSpec = {
            ref: 'refs/heads/testing-14', sha: sha
         };

         repo.createRef(refSpec, function(err) {
            should.not.exist(err);

            // Triggers GET:
            // https://api.github.com/repos/michael/cmake_cdt7_stalled/git/refs/heads/prose-integration
            repo.getRef('heads/master', function(err) {
               should.not.exist(err);

               // Triggers DELETE:
               // https://api.github.com/repos/michael/cmake_cdt7_stalled/git/refs/heads/prose-integration
               repo.deleteRef('heads/testing-14', function(err, res, xhr) {
                  should.not.exist(err);
                  xhr.status.should.equal(204);
                  done();
               });
            });
         });
      });
   });

   it('should be able to write an image to the repo', function(done) {
      repo.write('master', 'TEST_image.png', imageB64, 'Image test', {
         encode: false
      }, function(err) {
         if (err) console.log(err);
         should.not.exist(err);
         done();
      });
   });

   it('should be able to write a blob to the repo', function(done) {
      repo.postBlob('String test', function(err) { // Test strings
         should.not.exist(err);

         repo.postBlob(imageBlob, function(err) { // Test non-strings
            should.not.exist(err);
            done();
         });
      });
   });

   it('should star the repo', function(done) {
      repo.star(testUser.USERNAME, repoTest, function(err) {
         should.not.exist(err);

         repo.isStarred(testUser.USERNAME, repoTest, function(err) {
            should.not.exist(err);
            done();
         });
      });
   });

   it('should unstar the repo', function(done) {
      repo.unstar(testUser.USERNAME, repoTest, function(err) {
         should.not.exist(err);

         repo.isStarred(testUser.USERNAME, repoTest, function(err) {
            err.error.should.equal(404);
            done();
         });
      });
   });
});

describe('deleting a Github.Repository', function() {
   before(function() {
      github = new Github({
         username: testUser.USERNAME,
         password: testUser.PASSWORD,
         auth: 'basic'
      });
      repo = github.getRepo(testUser.USERNAME, repoTest);
   });

   it('should delete the repo', function(done) {
      repo.deleteRepo(function(err, res) {
         should.not.exist(err);
         res.should.be.true; // jshint ignore:line
         done();
      });
   });
});

describe('Repo returns commit errors correctly', function() {
   before(function() {
      github = new Github({
         username: testUser.USERNAME,
         password: testUser.PASSWORD,
         auth: 'basic'
      });
      repo = github.getRepo(testUser.USERNAME, testUser.REPO);
   });

   it('should fail on broken commit', function(done) {
      repo.commit('broken-parent-hash', 'broken-tree-hash', 'commit message', function(err) {
         should.exist(err);
         should.exist(err.request);
         err.error.should.equal(422);
         done();
      });
   });
});
