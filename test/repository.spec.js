import expect from 'must';

import Github from '../lib/GitHub';
import wait from './helpers/wait';
import testUser from './fixtures/user.json';
import loadImage from './fixtures/imageBlob';
import {assertSuccessful, assertFailure} from './helpers/callbacks';
import getTestRepoName from './helpers/getTestRepoName';

describe('Repository', function() {
   let github;
   let user;
   let imageB64;
   let imageBlob;
   const testRepoName = getTestRepoName();
   const v10SHA = '20fcff9129005d14cc97b9d59b8a3d37f4fb633b';
   const statusUrl =
    'https://api.github.com/repos/github-tools/github/statuses/20fcff9129005d14cc97b9d59b8a3d37f4fb633b';

   before(function(done) {
      github = new Github({
         username: testUser.USERNAME,
         password: testUser.PASSWORD,
      });

      loadImage(function(b64, blob) {
         imageB64 = b64;
         imageBlob = blob;
         done();
      });
   });

   describe('reading', function() {
      let remoteRepo;

      before(function() {
         remoteRepo = github.getRepo('github-tools', 'github');
      });

      it('should get repo details', function(done) {
         remoteRepo.getDetails(assertSuccessful(done, function(err, repo) {
            expect(repo).to.have.own('full_name', 'github-tools/github');

            done();
         }));
      });

      it('should get blob', function(done) {
         remoteRepo.getSha('master', 'README.md', assertSuccessful(done, function(err, response) {
            remoteRepo.getBlob(response.sha, assertSuccessful(done, function(err, content) {
               expect(content).to.be.include('# Github.js');

               done();
            }));
         }));
      });

      it('should get a branch', function(done) {
         remoteRepo.getBranch('master', assertSuccessful(done, function(err, content) {
            expect(content.name).to.be('master');

            done();
         }));
      });

      it('should show repo contents', function(done) {
         remoteRepo.getContents('master', '', false, assertSuccessful(done, function(err, contents) {
            expect(contents).to.be.an.array();

            const readme = contents.filter(function(content) {
               return content.path === 'README.md';
            });

            expect(readme).to.have.length(1);
            expect(readme[0]).to.have.own('type', 'file');

            done();
         }));
      });

      it('should show repo content raw', function(done) {
         remoteRepo.getContents('master', 'README.md', 'raw', assertSuccessful(done, function(err, text) {
            expect(text).to.contain('# Github.js');

            done();
         }));
      });

      it('should show repo readme', function(done) {
         remoteRepo.getReadme('master', 'raw', assertSuccessful(done, function(err, text) {
            expect(text).to.contain('# Github.js');

            done();
         }));
      });

      it('should get ref from repo', function(done) {
         remoteRepo.getRef('heads/master', assertSuccessful(done));
      });

      it('should get tree', function(done) {
         remoteRepo.getTree('master', assertSuccessful(done, function(err, response) {
            let {tree} = response;
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
         remoteRepo.listCommits(null, assertSuccessful(done, function(err, commits) {
            expect(commits).to.be.an.array();
            expect(commits.length).to.be.above(0);

            expect(commits[0]).to.have.own('commit');
            expect(commits[0]).to.have.own('author');

            done();
         }));
      });

      it('should list commits with all options', function(done) {
         const since = new Date(2015, 0, 1);
         const until = new Date(2016, 0, 20);
         const options = {
            sha: 'master',
            path: 'test',
            author: 'AurelioDeRosa',
            since,
            until,
         };

         remoteRepo.listCommits(options, assertSuccessful(done, function(err, commits) {
            expect(commits).to.be.an.array();
            expect(commits.length).to.be.above(0);

            const commit = commits[0];
            const commitDate = new Date(commit.commit.author.date);

            expect(commit).to.have.own('commit');
            expect(commit.author).to.have.own('login', 'AurelioDeRosa');
            expect(commitDate.getTime()).to.be.between(since.getTime(), until.getTime());
            done();
         }));
      });

      it('should get the latest commit from master', function(done) {
         remoteRepo.getSingleCommit('master', assertSuccessful(done, function(err, commit) {
            expect(commit).to.have.own('sha');
            expect(commit).to.have.own('commit');
            expect(commit).to.have.own('author');

            done();
         }));
      });

      it('should fail when null ref is passed', function(done) {
         remoteRepo.getSingleCommit(null, assertFailure(done, function(err) {
            expect(err.response.status).to.be(404);
            done();
         }));
      });

      it('should show repo contributors', function(done) {
         remoteRepo.getContributors(assertSuccessful(done, function(err, contributors) {
            if (!(contributors instanceof Array)) {
               console.log(JSON.stringify(contributors, null, 2)); // eslint-disable-line
            }
            expect(contributors).to.be.an.array();
            expect(contributors.length).to.be.above(1);

            const contributor = contributors[0];

            expect(contributor).to.have.own('login');
            expect(contributor).to.have.own('contributions');

            done();
         }));
      });

      it('should show repo contributor stats', function(done) {
         remoteRepo.getContributorStats(assertSuccessful(done, function(err, contributors) {
            if (!(contributors instanceof Array)) {
               console.log(JSON.stringify(contributors, null, 2)); // eslint-disable-line
            }
            expect(contributors).to.be.an.array();
            expect(contributors.length).to.be.above(1);

            const contributor = contributors[0];

            expect(contributor).to.have.own('author');
            expect(contributor).to.have.own('total');
            expect(contributor).to.have.own('weeks');

            done();
         }));
      });

      // @TODO repo.branch, repo.pull

      it('should list repo branches', function(done) {
         remoteRepo.listBranches(assertSuccessful(done));
      });

      it('should get commit from repo', function(done) {
         remoteRepo.getCommit(v10SHA, assertSuccessful(done, function(err, commit) {
            expect(commit.message).to.equal('v0.10.4');
            expect(commit.author.date).to.equal('2015-03-20T17:01:42Z');

            done();
         }));
      });

      it('should get statuses for a SHA from a repo', function(done) {
         remoteRepo.listStatuses(v10SHA, assertSuccessful(done, function(err, statuses) {
            expect(statuses).to.be.an.array();
            expect(statuses.length).to.equal(6);

            const correctUrls = statuses.every(function(status) {
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
         const repoByName = github.getRepo('github-tools/github');

         repoByName.getDetails(assertSuccessful(done, function(err, repo) {
            expect(repo).to.have.own('full_name', 'github-tools/github');

            done();
         }));
      });

      it('should check if the repo is starred', function(done) {
         remoteRepo.isStarred(assertSuccessful(done, function(err, result) {
            expect(result).to.equal(false);

            done();
         }));
      });
   });

   describe('creating/modifiying', function() {
      const fileName = 'test.md';

      const initialText = 'This is a test.';
      const initialMessage = 'This is my 44 character long commit message.';

      const updatedText = 'This file has been updated.';
      const updatedMessage = 'This is my 51 character long update commit message.';

      const fileToDelete = 'tmp.md';
      const deleteMessage = 'This is my 51 character long delete commit message.';

      const unicodeFileName = '\u4E2D\u6587\u6D4B\u8BD5.md';
      const unicodeText = '\u00A1\u00D3i de m\u00ED, que verg\u00FCenza!';
      const unicodeMessage = 'Such na\u00EFvet\u00E9\u2026';

      const imageFileName = 'image.png';

      const releaseTag = 'foo';
      const releaseName = 'My awesome release';
      const releaseBody = 'This is my 49 character long release description.';
      let sha;
      let releaseId;
      let remoteRepo;

      before(function() {
         user = github.getUser();
         remoteRepo = github.getRepo(testUser.USERNAME, testRepoName);
      });

      // 200ms between tests so that Github has a chance to settle
      beforeEach(function(done) {
         setTimeout(done, 200);
      });

      it('should create repo', function(done) {
         const repoDef = {
            name: testRepoName,
         };

         user.createRepo(repoDef, assertSuccessful(done, function(err, repo) {
            expect(repo).to.have.own('name', testRepoName);

            done();
         }));
      });

      it('should be able to edit repository information', function(done) {
         const options = {
            name: testRepoName,
            description: 'New short description',
            homepage: 'http://example.com',
         };

         remoteRepo.updateRepository(options, assertSuccessful(done,
            function(err, repository) {
               expect(repository).to.have.own('homepage', options.homepage);
               expect(repository).to.have.own('description', options.description);
               expect(repository).to.have.own('name', testRepoName);
               done();
            }));
      });

      it('should show repo collaborators', function(done) {
         remoteRepo.getCollaborators(assertSuccessful(done, function(err, collaborators) {
            if (!(collaborators instanceof Array)) {
               console.log(JSON.stringify(collaborators, null, 2)); // eslint-disable-line
            }
            expect(collaborators).to.be.an.array();
            expect(collaborators).to.have.length(1);

            const collaborator = collaborators[0];

            expect(collaborator).to.have.own('login', testUser.USERNAME);
            expect(collaborator).to.have.own('id');
            expect(collaborator).to.have.own('permissions');

            done();
         }));
      });

      it('should test whether user is collaborator', function(done) {
         remoteRepo.isCollaborator(testUser.USERNAME, assertSuccessful(done));
      });

      it('should write to repo', function(done) {
         remoteRepo.writeFile('master', fileName, initialText, initialMessage, assertSuccessful(done, function() {
            wait()().then(() => remoteRepo.getContents('master', fileName, 'raw',
            assertSuccessful(done, function(err, fileText) {
               expect(fileText).to.be(initialText);

               done();
            })));
         }));
      });

      it('should rename files', function(done) {
         remoteRepo.writeFile('master', fileName, initialText, initialMessage, assertSuccessful(done, function() {
            wait()().then(() => remoteRepo.move('master', fileName, 'new_name', assertSuccessful(done, function() {
               wait()().then(() => remoteRepo.getContents('master', fileName, 'raw', assertFailure(done, function(err) {
                  expect(err.response.status).to.be(404);
                  remoteRepo.getContents('master', 'new_name', 'raw', assertSuccessful(done, function(err, fileText) {
                     expect(fileText).to.be(initialText);

                     done();
                  }));
               })));
            })));
         }));
      });

      it('should create a new branch', function(done) {
         remoteRepo.createBranch('master', 'dev', assertSuccessful(done, function(err, branch) {
            expect(branch).to.have.property('ref', 'refs/heads/dev');
            expect(branch.object).to.have.property('sha');

            done();
         }));
      });

      it('should write to repo branch', function(done) {
         remoteRepo.writeFile('dev', fileName, updatedText, updatedMessage, assertSuccessful(done, function() {
            remoteRepo.getContents('dev', fileName, 'raw', assertSuccessful(done, function(err, fileText) {
               expect(fileText).to.be(updatedText);

               done();
            }));
         }));
      });

      it('should compare two branches', function(done) {
         remoteRepo.createBranch('master', 'compare', assertSuccessful(done, function() {
            remoteRepo.writeFile('compare', fileName, updatedText, updatedMessage, assertSuccessful(done, function() {
               remoteRepo.compareBranches('master', 'compare', assertSuccessful(done, function(err, diff) {
                  expect(diff).to.have.own('total_commits', 1);
                  expect(diff.files[0]).to.have.own('filename', fileName);

                  done();
               }));
            }));
         }));
      });

      it('should submit a pull request', function(done) {
         const base = 'master';
         const head = 'pull-request';
         const title = 'Test pull request';
         const body = 'This is a test pull request';
         const prSpec = {title, body, base, head};

         remoteRepo.createBranch(base, head, assertSuccessful(done, function() {
            remoteRepo.writeFile(head, fileName, updatedText, updatedMessage, assertSuccessful(done, function() {
               remoteRepo.createPullRequest(prSpec, assertSuccessful(done, function(err, pullRequest) {
                  expect(pullRequest).to.have.own('number');
                  expect(pullRequest.number).to.be.above(0);
                  expect(pullRequest).to.have.own('title', title);
                  expect(pullRequest).to.have.own('body', body);

                  done();
               }));
            }));
         }));
      });

      it('should create ref on repo', function(done) {
         remoteRepo.getRef('heads/master', assertSuccessful(done, function(err, refSpec) {
            let newRef = {
               ref: 'refs/heads/new-test-branch',
               sha: refSpec.object.sha,
            };
            remoteRepo.createRef(newRef, assertSuccessful(done));
         }));
      });

      it('should update commit status', function(done) {
         const status = {
            state: 'success',
            target_url: 'http://example.com', // eslint-disable-line camelcase
            description: 'Build was successful!',
         };
         remoteRepo.getRef('heads/master', assertSuccessful(done, function(err, refSpec) {
            remoteRepo.updateStatus(refSpec.object.sha, status, assertSuccessful(done,
            function(err, updated) {
               expect(updated).to.have.own('state', status.state);
               expect(updated).to.have.own('target_url', status.target_url);
               expect(updated).to.have.own('description', status.description);
               expect(updated).to.have.own('context', 'default');
               done();
            }));
         }));
      });

      it('should delete ref on repo', function(done) {
         remoteRepo.deleteRef('heads/new-test-branch', assertSuccessful(done));
      });

      it('should list tags on repo', function(done) {
         remoteRepo.listTags(assertSuccessful(done));
      });

      it('should list pulls on repo', function(done) {
         const filterOpts = {
            state: 'all',
            sort: 'updated',
            direction: 'desc',
            page: 1,
            per_page: 10 //eslint-disable-line
         };

         remoteRepo.listPullRequests(filterOpts, assertSuccessful(done, function(err, pullRequests) {
            expect(pullRequests).to.be.an.array();
            expect(pullRequests).to.have.length(1);

            done();
         }));
      });

      it('should get pull requests on repo', function(done) {
         const repo = github.getRepo('github-tools', 'github');

         repo.getPullRequest(153, assertSuccessful(done, function(err, pr) {
            expect(pr).to.have.own('title');
            expect(pr).to.have.own('body');
            expect(pr).to.have.own('url');

            done();
         }));
      });

      it('should delete a file on the repo', function(done) {
         remoteRepo.writeFile('master', fileToDelete, initialText, deleteMessage, assertSuccessful(done, function() {
            remoteRepo.deleteFile('master', fileToDelete, assertSuccessful(done));
         }));
      });

      it('should write author and committer to repo', function(done) {
         const options = {
            author: {name: 'Author Name', email: 'author@example.com'},
            committer: {name: 'Committer Name', email: 'committer@example.com'},
         };

         remoteRepo.writeFile('dev',
            fileName, initialText, initialMessage, options,
            assertSuccessful(done, function(error, commit) {
               remoteRepo.getCommit(commit.commit.sha, assertSuccessful(done, function(err, commit2) {
                  const author = commit2.author;
                  const committer = commit2.committer;
                  expect(author.name).to.be('Author Name');
                  expect(author.email).to.be('author@example.com');
                  expect(committer.name).to.be('Committer Name');
                  expect(committer.email).to.be('committer@example.com');

                  done();
               }));
            })
         );
      });

      it('should be able to write all the unicode', function(done) {
         remoteRepo.writeFile('master', unicodeFileName, unicodeText, unicodeMessage, assertSuccessful(done,
            function(err, commit) {
               expect(commit.content.name).to.be(unicodeFileName);
               expect(commit.commit.message).to.be(unicodeMessage);

               remoteRepo.getContents('master', unicodeFileName, 'raw', assertSuccessful(done, function(err, fileText) {
                  expect(fileText).to.be(unicodeText);

                  done();
               }));
            }));
      });

      it('should pass a regression test for _request (#14)', function(done) {
         remoteRepo.getRef('heads/master', assertSuccessful(done, function(err, refSpec) {
            let newRef = {
               ref: 'refs/heads/testing-14',
               sha: refSpec.object.sha,
            };

            remoteRepo.createRef(newRef, assertSuccessful(done, function() {
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
         const opts = {
            encode: false,
         };

         remoteRepo.writeFile('master', imageFileName, imageB64, initialMessage, opts, assertSuccessful(done,
            function(err, commit) {
               sha = commit.sha;

               done();
            }));
      });

      it('should be able to write a string blob to the repo', function(done) {
         remoteRepo.createBlob('String test', assertSuccessful(done));
      });

      it('should be able to write a file blob to the repo', function(done) {
         remoteRepo.createBlob(imageBlob, assertSuccessful(done));
      });

      it('should star the repo', function(done) {
         remoteRepo.star(assertSuccessful(done, function() {
            remoteRepo.isStarred(assertSuccessful(done));
         }));
      });

      it('should unstar the repo', function(done) {
         remoteRepo.unstar(assertSuccessful(done, function() {
            remoteRepo.isStarred(assertSuccessful(done, function(_, isStarred) {
               expect(isStarred).to.be(false);
               done();
            }));
         }));
      });

      it('should fail on broken commit', function(done) {
         remoteRepo.commit('broken-parent-hash', 'broken-tree-hash', initialMessage, assertFailure(done, function(err) {
            expect(err.response.status).to.be(422);
            done();
         }));
      });

      it('should create a release', function(done) {
         const releaseDef = {
            name: releaseName,
            tag_name: releaseTag, // eslint-disable-line
            target_commitish: sha  // eslint-disable-line
         };

         remoteRepo.createRelease(releaseDef, assertSuccessful(done, function(err, res) {
            releaseId = res.id;
            done();
         }));
      });

      it('should edit a release', function(done) {
         const releaseDef = {
            name: releaseName,
            body: releaseBody,
         };

         remoteRepo.updateRelease(releaseId, releaseDef, assertSuccessful(done, function(err, release) {
            expect(release).to.have.own('name', releaseName);
            expect(release).to.have.own('body', releaseBody);

            done();
         }));
      });

      it('should read all releases', function(done) {
         remoteRepo.listReleases(assertSuccessful(done, function(err, releases) {
            expect(releases).to.be.an.array();
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

      it('should create a project', function(done) {
         remoteRepo.createProject({
            name: 'test-project',
            body: 'body',
         }, assertSuccessful(done, function(err, project) {
            expect(project).to.own('name', 'test-project');
            expect(project).to.own('body', 'body');
            done();
         }));
      });

      it('should list repo projects', function(done) {
         remoteRepo.listProjects(assertSuccessful(done, function(err, projects) {
            expect(projects).to.be.an.array();
            expect(projects.length).to.equal(1);
            done();
         }));
      });
   });

   describe('deleting', function() {
      let remoteRepo;
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
