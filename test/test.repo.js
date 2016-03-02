'use strict';

var Github = require('../src/github.js');

var expect = require('must');
var testUser = require('./fixtures/user.json');
var loadImage = require('./fixtures/imageBlob');
var assertSuccessful = require('./helpers').assertSuccessful;
var assertFailure = require('./helpers').assertFailure;

describe('Github.Repository', function() {
   var github, remoteRepo, user, imageB64, imageBlob;
   var testRepoName = Math.floor(Math.random() * 100000).toString();
   var v10_4sha = '20fcff9129005d14cc97b9d59b8a3d37f4fb633b';
   var statusUrl = 'https://api.github.com/repos/michael/github/statuses/20fcff9129005d14cc97b9d59b8a3d37f4fb633b';

   before(function(done) {
      github = new Github({
         username: testUser.USERNAME,
         password: testUser.PASSWORD,
         auth: 'basic'
      });

      loadImage(function(b64, blob) {
         imageB64 = b64;
         imageBlob = blob;
         done();
      });
   });

   describe('reading', function() {
      before(function() {
         remoteRepo = github.getRepo('michael', 'github');
      });

      it('should show repo', function(done) {
         remoteRepo.show(assertSuccessful(done, function(err, repo) {
            expect(repo).to.have.own('full_name', 'michael/github');

            done();
         }));
      });

      it('should get blob', function(done) {
         remoteRepo.getSha('master', 'README.md', assertSuccessful(done, function(err, sha) {
            remoteRepo.getBlob(sha, assertSuccessful(done, function(err, content) {
               expect(content).to.be.include('# Github.js');

               done();
            }));
         }));
      });

      it('should show repo contents', function(done) {
         remoteRepo.contents('master', '', assertSuccessful(done, function(err, contents) {
            expect(contents).to.be.an.array();

            var readme = contents.filter(function(content) {
               return content.path === 'README.md';
            });

            expect(readme).to.have.length(1);
            expect(readme[0]).to.have.own('type', 'file');

            done();
         }));
      });

      it('should get tree', function(done) {
         remoteRepo.getTree('master', assertSuccessful(done, function(err, tree) {
            expect(tree).to.be.an.array();
            expect(tree.length).to.be.above(0);

            done();
         }));
      });

      it('should fork repo', function(done) {
         remoteRepo.fork(assertSuccessful(done));
      });

      it('should list forks of repo', function(done) {
         remoteRepo.listForks(assertSuccessful(done, function(err, forks) {
            expect(forks).to.be.an.array();
            expect(forks.length).to.be.above(0);
            done();
         }));
      });

      it('should list commits with no options', function(done) {
         remoteRepo.getCommits(null, assertSuccessful(done, function(err, commits) {
            expect(commits).to.be.an.array();
            expect(commits.length).to.be.above(0);

            expect(commits[0]).to.have.own('commit');
            expect(commits[0]).to.have.own('author');

            done();
         }));
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

         remoteRepo.getCommits(options, assertSuccessful(done, function(err, commits) {
            expect(commits).to.be.an.array();
            expect(commits.length).to.be.above(0);

            var commit = commits[0];
            var commitDate = new Date(commit.commit.author.date);

            expect(commit).to.have.own('commit');
            expect(commit.author).to.have.own('login', 'AurelioDeRosa');
            expect(commitDate.getTime()).to.be.between(sinceDate.getTime(), untilDate.getTime());
            done();
         }));
      });

      it('should show repo contributors', function(done) {
         remoteRepo.contributors(assertSuccessful(done, function(err, contributors) {
            expect(contributors).to.be.an.array();
            expect(contributors.length).to.be.above(1);

            var contributor = contributors[0];

            expect(contributor).to.have.own('author');
            expect(contributor).to.have.own('total');
            expect(contributor).to.have.own('weeks');

            done();
         }));
      });

      it('should show repo collaborators', function(done) {
         remoteRepo.collaborators(assertSuccessful(done, function(err, collaborators) {
            expect(collaborators).to.be.an.array();
            expect(collaborators).to.have.length(1);

            var collaborator = collaborators[0];

            expect(collaborator).to.have.own('login', testUser.USERNAME);
            expect(collaborator).to.have.own('id');
            expect(collaborator).to.have.own('permissions');

            done();
         }));
      });

      // @TODO repo.branch, repo.pull

      it('should list repo branches', function(done) {
         remoteRepo.listBranches(assertSuccessful(done));
      });

      it('should read repo', function(done) {
         remoteRepo.read('master', 'README.md', assertSuccessful(done, function(err, text) {
            expect(text).to.contain('# Github.js');

            done();
         }));
      });

      it('should get commit from repo', function(done) {
         remoteRepo.getCommit('master', v10_4sha, assertSuccessful(done, function(err, commit) {
            expect(commit.message).to.equal('v0.10.4');
            expect(commit.author.date).to.equal('2015-03-20T17:01:42Z');

            done();
         }));
      });

      it('should get statuses for a SHA from a repo', function(done) {
         remoteRepo.getStatuses(v10_4sha, assertSuccessful(done, function(err, statuses) {
            expect(statuses).to.be.an.array();
            expect(statuses.length).to.equal(6);

            var correctUrls = statuses.every(function(status) {
               return status.url === statusUrl;
            });

            expect(correctUrls).to.be(true);

            done();
         }));
      });

      it('should get a SHA from a repo', function(done) {
         remoteRepo.getSha('master', '.gitignore', assertSuccessful(done));
      });

      it('should get a repo by fullname', function(done) {
         var repoByName = github.getRepo('michael/github');

         repoByName.show(assertSuccessful(done, function(err, repo) {
            expect(repo).to.have.own('full_name', 'michael/github');

            done();
         }));
      });

      it('should test whether user is collaborator', function(done) {
         remoteRepo.isCollaborator(testUser.USERNAME, assertSuccessful(done));
      });

      it('should check if the repo is starred', function(done) {
         remoteRepo.isStarred('michael', 'github', assertFailure(done, function(err) {
            expect(err.error).to.be(404);

            done();
         }));
      });
   });

   describe('creating/modifiying', function() {
      var fileName = 'test.md';

      var initialText = 'This is a test.';
      var initialMessage = 'Test file create.';

      var updatedText = 'This file has been updated.';
      var updatedMessage = 'Test file update.';

      var fileToDelete = 'tmp.md';
      var deleteMessage = 'Removing file';

      var unicodeFileName = '\u4E2D\u6587\u6D4B\u8BD5.md';
      var unicodeText = '\u00A1\u00D3i de m\u00ED, que verg\u00FCenza!';
      var unicodeMessage = 'Such na\u00EFvet\u00E9\u2026';

      var imageFileName = 'image.png';

      var releaseTag = 'foo';
      var releaseName = 'My awesome release';
      var releaseBody = 'Foo bar bazzy baz';
      var sha, releaseId;

      before(function() {
         user = github.getUser();
         remoteRepo = github.getRepo(testUser.USERNAME, testRepoName);
      });

      // 200ms between tests so that Github has a chance to settle
      beforeEach(function(done) {
         setTimeout(done, 200);
      });

      it('should create repo', function(done) {
         var repoDef = {
            name: testRepoName
         };

         user.createRepo(repoDef, assertSuccessful(done, function(err, repo) {
            expect(repo).to.have.own('name', testRepoName);

            done();
         }));
      });

      it('should write to repo', function(done) {
         remoteRepo.write('master', fileName, initialText, initialMessage, assertSuccessful(done, function() {
            remoteRepo.read('master', fileName, assertSuccessful(done, function(err, fileText) {
               expect(fileText).to.be(initialText);

               done();
            }));
         }));
      });

      it('should write to repo branch', function(done) {
         remoteRepo.branch('master', 'dev', assertSuccessful(done, function() {
            remoteRepo.write('dev', fileName, updatedText, updatedMessage, assertSuccessful(done, function() {
               remoteRepo.read('dev', fileName, assertSuccessful(done, function(err, fileText) {
                  expect(fileText).to.be(updatedText);

                  done();
               }));
            }));
         }));
      });

      it('should compare two branches', function(done) {
         remoteRepo.branch('master', 'compare', assertSuccessful(done, function() {
            remoteRepo.write('compare', fileName, updatedText, updatedMessage, assertSuccessful(done, function() {
               remoteRepo.compare('master', 'compare', assertSuccessful(done, function(err, diff) {
                  expect(diff).to.have.own('total_commits', 1);
                  expect(diff.files[0]).to.have.own('filename', fileName);

                  done();
               }));
            }));
         }));
      });

      it('should submit a pull request', function(done) {
         var baseBranch = 'master';
         var headBranch = 'pull-request';
         var pullRequestTitle = 'Test pull request';
         var pullRequestBody = 'This is a test pull request';
         var pr = {
            title: pullRequestTitle,
            body: pullRequestBody,
            base: baseBranch,
            head: headBranch
         };

         remoteRepo.branch(baseBranch, headBranch, assertSuccessful(done, function() {
            remoteRepo.write(headBranch, fileName, updatedText, updatedMessage, assertSuccessful(done, function() {
               remoteRepo.createPullRequest(pr, assertSuccessful(done, function(err, pullRequest) {
                  expect(pullRequest).to.have.own('number');
                  expect(pullRequest.number).to.be.above(0);
                  expect(pullRequest).to.have.own('title', pullRequestTitle);
                  expect(pullRequest).to.have.own('body', pullRequestBody);

                  done();
               }));
            }));
         }));
      });

      it('should get ref from repo', function(done) {
         remoteRepo.getRef('heads/master', assertSuccessful(done));
      });

      it('should create ref on repo', function(done) {
         remoteRepo.getRef('heads/master', assertSuccessful(done, function(err, sha) {
            var refSpec = {
               ref: 'refs/heads/new-test-branch', sha: sha
            };

            remoteRepo.createRef(refSpec, assertSuccessful(done));
         }));
      });

      it('should delete ref on repo', function(done) {
         remoteRepo.deleteRef('heads/new-test-branch', assertSuccessful(done));
      });

      it('should list tags on repo', function(done) {
         remoteRepo.listTags(assertSuccessful(done));
      });

      it('should list pulls on repo', function(done) {
         var options = {
            state: 'all',
            sort: 'updated',
            direction: 'desc',
            page: 1,
            per_page: 10
         };

         remoteRepo.listPulls(options, assertSuccessful(done, function(err, pullRequests) {
            expect(pullRequests).to.be.an.array();
            expect(pullRequests).to.have.length(1);

            done();
         }));
      });

      it('should get pull requests on repo', function(done) {
         var repo = github.getRepo('michael', 'github');

         repo.getPull(153, assertSuccessful(done, function(err, pr) {
            expect(pr).to.have.own('title');
            expect(pr).to.have.own('body');
            expect(pr).to.have.own('url');

            done();
         }));
      });

      it('should delete a file on the repo', function(done) {
         remoteRepo.write('master', fileToDelete, initialText, deleteMessage, assertSuccessful(done, function() {
            remoteRepo.remove('master', fileToDelete, assertSuccessful(done));
         }));
      });

      it('should use repo.delete as an alias for repo.remove', function(done) {
         remoteRepo.write('master', fileToDelete, initialText, deleteMessage, assertSuccessful(done, function() {
            remoteRepo.delete('master', fileToDelete, assertSuccessful(done));
         }));
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

         remoteRepo.write('dev', fileName, initialText, initialMessage, options, assertSuccessful(done, function(e, r) {
            remoteRepo.getCommit('dev', r.commit.sha, assertSuccessful(done, function(err, commit) {
               expect(commit.author.name).to.be('Author Name');
               expect(commit.author.email).to.be('author@example.com');
               expect(commit.committer.name).to.be('Committer Name');
               expect(commit.committer.email).to.be('committer@example.com');

               done();
            }));
         }));
      });

      it('should be able to write all the unicode', function(done) {
         remoteRepo.write('master', unicodeFileName, unicodeText, unicodeMessage, assertSuccessful(done,
            function(err, commit) {
               expect(commit.content.name).to.be(unicodeFileName);
               expect(commit.commit.message).to.be(unicodeMessage);

               remoteRepo.read('master', unicodeFileName, assertSuccessful(done, function(err, fileText) {
                  expect(fileText).to.be(unicodeText);

                  done();
               }));
            }));
      });

      it('should pass a regression test for _request (#14)', function(done) {
         remoteRepo.getRef('heads/master', assertSuccessful(done, function(err, sha) {
            var refSpec = {
               ref: 'refs/heads/testing-14', sha: sha
            };

            remoteRepo.createRef(refSpec, assertSuccessful(done, function() {
               // Triggers GET:
               // https://api.github.com/repos/michael/cmake_cdt7_stalled/git/refs/heads/prose-integration
               remoteRepo.getRef('heads/master', assertSuccessful(done, function() {
                  // Triggers DELETE:
                  // https://api.github.com/repos/michael/cmake_cdt7_stalled/git/refs/heads/prose-integration
                  remoteRepo.deleteRef('heads/testing-14', assertSuccessful(done, function(err, res, xhr) {
                     expect(xhr.status).to.be(204);

                     done();
                  }));
               }));
            }));
         }));
      });

      it('should be able to write an image to the repo', function(done) {
         var opts = {
            encode: false
         };

         remoteRepo.write('master', imageFileName, imageB64, initialMessage, opts, assertSuccessful(done,
            function(err, commit) {
               sha = commit.sha;

               done();
            }));
      });

      it('should be able to write a string blob to the repo', function(done) {
         remoteRepo.postBlob('String test', assertSuccessful(done));
      });

      it('should be able to write a file blob to the repo', function(done) {
         remoteRepo.postBlob(imageBlob, assertSuccessful(done));
      });

      it('should star the repo', function(done) {
         remoteRepo.star(testUser.USERNAME, testRepoName, assertSuccessful(done, function() {
            remoteRepo.isStarred(testUser.USERNAME, testRepoName, assertSuccessful(done));
         }));
      });

      it('should unstar the repo', function(done) {
         remoteRepo.unstar(testUser.USERNAME, testRepoName, assertSuccessful(done, function() {
            remoteRepo.isStarred(testUser.USERNAME, testRepoName, assertFailure(done, function(err) {
               expect(err.error).to.be(404);

               done();
            }));
         }));
      });

      it('should fail on broken commit', function(done) {
         remoteRepo.commit('broken-parent-hash', 'broken-tree-hash', initialMessage, assertFailure(done, function(err) {
            expect(err.error).to.be(422);

            done();
         }));
      });

      it('should create a release', function(done) {
         var options = {
            tag_name: releaseTag,
            target_commitish: sha
         };

         remoteRepo.createRelease(options, assertSuccessful(done, function(err, res) {
            releaseId = res.id;
            done();
         }));
      });

      it('should edit a release', function(done) {
         var options = {
            name: releaseName,
            body: releaseBody
         };

         remoteRepo.editRelease(releaseId, options, assertSuccessful(done, function(err, release) {
            expect(release).to.have.own('name', releaseName);
            expect(release).to.have.own('body', releaseBody);

            done();
         }));
      });

      it('should read a release', function(done) {
         remoteRepo.getRelease(releaseId, assertSuccessful(done, function(err, release) {
            expect(release).to.have.own('name', releaseName);

            done();
         }));
      });

      it('should delete a release', function(done) {
         remoteRepo.deleteRelease(releaseId, assertSuccessful(done));
      });
   });

   describe('deleting', function() {
      before(function() {
         remoteRepo = github.getRepo(testUser.USERNAME, testRepoName);
      });

      // 200ms between tests so that Github has a chance to settle
      beforeEach(function(done) {
         setTimeout(done, 200);
      });

      it('should delete the repo', function(done) {
         remoteRepo.deleteRepo(assertSuccessful(done, function(err, result) {
            expect(result).to.be(true);

            done();
         }));
      });
   });
});
