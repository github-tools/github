'use strict';

var testUser, imageB64, imageBlob;

if (typeof window === 'undefined') { // We're in NodeJS
   var Github = require('../');
   var callbackWithError = require('./helpers.js');
   var fs = require('fs');
   var path = require('path');

   testUser = require('./user.json');
   imageBlob = fs.readFileSync(path.join(__dirname, 'gh.png')); // This is a Buffer().
   imageB64 = imageBlob.toString('base64');

   // Module dependencies
   var chai = require('chai');

   // Use should flavour for Mocha
   var should = chai.should();
} else if (typeof window._phantom !== 'undefined') {
   // We're in the Phantom
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
   // We're in the browser
   // jscs:disable
   imageB64 = 'iVBORw0KGgoAAAANSUhEUgAAACsAAAAmCAAAAAB4qD3CAAABgElEQVQ4y9XUsUocURQGYN/pAyMWBhGtrEIMiFiooGuVIoYsSBAsRSQvYGFWC4uFhUBYsilXLERQsDA20YAguIbo5PQp3F3inVFTheSvZoavGO79z+mJP0/Pv2nPtlfLpfLq9tljNquO62S8mj1kmy/8nrHm/Xaz1930bt5n1+SzVmyrilItsod9ON0td1V59xR9hwV2HsMRsbfROLo4amzsRcQw5vO2CZPJEU5CM2cXYTCxg7CY2mwIVhK7AkNZYg9g4CqxVwNwkNg6zOTKMQP1xFZgKWeXoJLYdSjl7BysJ7YBIzk7Ap8TewLOE3oOTtIz6y/64bfQn55ZTIAPd2gNTOTurcbzp7z50v1y/Pq2Q7Wczca8vFjG6LvbMo92hiPL96xO+eYVPkVExMdONetFXZ+l+eP9cuV7RER8a9PZwrloTXv2tfv285ZOt4rnrTXlydxCu9sZmGrdN8eXC3ATERHXsHD5wC7ZL3HdsaX9R3bUzlb7YWvn/9ipf93+An8cHsx3W3WHAAAAAElFTkSuQmCC';
   imageBlob = new Blob();

   // jscs:enable
}

var repoTest = Math.floor(Math.random() * (100000 - 0)) + 0;

describe('Repository', function() {
   var github, repo, user;

   before(function() {
      if (typeof window !== 'undefined') testUser = window.__fixtures__['test/user'];
      github = new Github({
         username: testUser.USERNAME,
         password: testUser.PASSWORD,
         auth: 'basic'
      });
      user = github.getUser();
   });

   describe('read from repository', function() {
      before(function() {
         repo = github.getRepo('michael', 'github');
      });

      it('should show repo', function(done) {
         repo.show(callbackWithError(done, function(err, res) {
            should.not.exist(err);
            res.full_name.should.equal('michael/github'); // jscs:ignore
            done();
         }));
      });

      it('should show repo contents', function(done) {
         repo.contents('master', './', callbackWithError(done, function(err) {
            // @TODO write better assertion.
            should.not.exist(err);

            done();
         }));
      });

      it('should fork repo', function(done) {
         repo.fork(callbackWithError(done, function(err) {
            // @TODO write better assertion.
            should.not.exist(err);

            done();
         }));
      });

      it('should list forks of repo', function(done) {
         repo.listForks(callbackWithError(done, function(err) {
            // @TODO write better assertion.
            should.not.exist(err);

            done();
         }));
      });

      it('should show repo contributors', function(done) {
         repo.contributors(callbackWithError(done, function(err, res) {
            should.not.exist(err);
            res.should.be.instanceof(Array);
            res.should.have.length.above(1);
            should.exist(res[0].author);
            should.exist(res[0].total);
            should.exist(res[0].weeks);

            done();
         }));
      });

      // @TODO repo.branch, repo.pull

      it('should list repo branches', function(done) {
         repo.listBranches(callbackWithError(done, function(err) {
            should.not.exist(err);

            done();
         }));
      });

      it('should read repo', function(done) {
         repo.read('master', 'README.md', callbackWithError(done, function(err, res) {
            should.not.exist(err);
            res.indexOf('# Github.js').should.be.above(-1);
            done();
         }));
      });

      it('should get commit from repo', function(done) {
         repo.getCommit('master', '20fcff9129005d14cc97b9d59b8a3d37f4fb633b',
            callbackWithError(done, function(err, commit) {
               should.not.exist(err);
               commit.message.should.equal('v0.10.4');
               commit.author.date.should.equal('2015-03-20T17:01:42Z');
               done();
            })
         );
      });

      it('should get statuses for a SHA from a repo', function(done) {
         repo.getStatuses('20fcff9129005d14cc97b9d59b8a3d37f4fb633b', callbackWithError(done, function(err, statuses) {
            should.not.exist(err);
            statuses.length.should.equal(6);
            statuses.every(function(status) {
               return status.url === 'https://api.github.com/repos/michael/github/statuses/20fcff9129005d14cc97b9d59b8a3d37f4fb633b';
            }).should.equal(true);
            done();
         }));
      });

      it('should get a SHA from a repo', function(done) {
         repo.getSha('master', '.gitignore', callbackWithError(done, function(err, sha) {
            should.not.exist(err);
            done();
         }));
      });

      it('should get a repo by fullname', function(done) {
         var repo2 = github.getRepo('michael/github');

         repo2.show(callbackWithError(done, function(err, res) {
            should.not.exist(err);
            res.full_name.should.equal('michael/github'); // jscs:ignore
            done();
         }));
      });
   });

   describe('creating new repository', function() {
      before(function() {
         repo = github.getRepo(testUser.USERNAME, repoTest);
      });

      it('should create repo', function(done) {
         var newRepo = {
            name: repoTest
         };

         user.createRepo(newRepo, callbackWithError(done, function(err, res) {
            should.not.exist(err);
            res.name.should.equal(repoTest.toString());

            done();
         }));
      });

      it('should write to repo', function(done) {
         repo.write('master', 'TEST.md', 'THIS IS A TEST', 'Creating test', callbackWithError(done, function(err) {
            // @TODO write a better assertion.
            should.not.exist(err);
            done();
         }));
      });

      it('should write to repo branch', function(done) {
         repo.branch('master', 'dev', callbackWithError(done, function(err) {
            should.not.exist(err);
            repo.write('dev', 'TEST.md', 'THIS IS AN UPDATED TEST', 'Updating test',
               callbackWithError(done, function(err) {
                  should.not.exist(err);
                  repo.read('dev', 'TEST.md', callbackWithError(done, function(err, res) {
                     should.not.exist(err);
                     res.should.equal('THIS IS AN UPDATED TEST');
                     done();
                  }));
               })
            );
         }));
      });

      it('should get ref from repo', function(done) {
         repo.getRef('heads/master', callbackWithError(done, function(err) {
            // @TODO write better assertion
            should.not.exist(err);
            done();
         }));
      });

      it('should create ref on repo', function(done) {
         repo.getRef('heads/master', callbackWithError(done, function(err, sha) {
            should.not.exist(err);
            var refSpec = {
               ref: 'refs/heads/new-test-branch', sha: sha
            };

            repo.createRef(refSpec, callbackWithError(done, function(err) {
               // @TODO write better assertion
               should.not.exist(err);
               done(err);
            }));
         }));
      });

      it('should delete ref on repo', function(done) {
         repo.deleteRef('heads/new-test-branch', callbackWithError(done, function(err) {
            // @TODO write better assertion
            should.not.exist(err);
            done();
         }));
      });

      it('should list tags on repo', function(done) {
         repo.listTags(callbackWithError(done, function(err) {
            // @TODO write better assertion
            should.not.exist(err);
            done();
         }));
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

         repo.listPulls(options, callbackWithError(done, function(err, pull_list) {
            should.not.exist(err);
            pull_list.should.be.instanceof(Array);
            pull_list.should.have.length(10);
            should.exist(pull_list[0].title);
            should.exist(pull_list[0].body);
            should.exist(pull_list[0].url);
            done();
         }));
      });

      it('should get pull requests on repo', function(done) {
         var repo = github.getRepo('michael', 'github');

         repo.getPull(153, callbackWithError(done, function(err) {
            // @TODO write better assertion
            should.not.exist(err);
            done();
         }));
      });

      it('should delete a file on the repo', function(done) {
         repo.write('master', 'REMOVE-TEST.md', 'THIS IS A TEST', 'Remove test', callbackWithError(done, function(err) {
            should.not.exist(err);
            repo.remove('master', 'REMOVE-TEST.md', function(err) {
               done(err);
            });
         }));
      });

      it('should use repo.delete as an alias for repo.remove', function(done) {
         repo.write('master', 'REMOVE-TEST.md', 'THIS IS A TEST', 'Remove test', callbackWithError(done, function(err) {
            should.not.exist(err);
            repo.delete('master', 'REMOVE-TEST.md', function(err) {
               done(err);
            });
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

         repo.write('dev', 'TEST.md', 'THIS IS A TEST BY AUTHOR AND COMMITTER', 'Updating', options,
            callbackWithError(done, function(err, res) {
               should.not.exist(err);
               repo.getCommit('dev', res.commit.sha, callbackWithError(done, function(err, commit) {
                  should.not.exist(err);
                  commit.author.name.should.equal('Author Name');
                  commit.author.email.should.equal('author@example.com');
                  commit.committer.name.should.equal('Committer Name');
                  commit.committer.email.should.equal('committer@example.com');

                  done();
               }));
            })
         );
      });

      it('should be able to write CJK unicode to repo', function(done) {
         repo.write('master', '中文测试.md', 'THIS IS A TEST', 'Creating test', callbackWithError(done, function(err) {
            // @TODO write better assertion
            should.not.exist(err);
            done();
         }));
      });

      it('should be able to write unicode to repo', function(done) {
         repo.write('master', 'TEST_unicode.md', '\u2014', 'Long dash unicode', callbackWithError(done, function(err) {
            if (err) console.log(err);
            should.not.exist(err);
            repo.read('master', 'TEST_unicode.md', callbackWithError(done, function(err, obj) {
               should.not.exist(err);
               obj.should.equal('\u2014');
               done();
            }));
         }));
      });

      it('should pass a regression test for _request (#14)', function(done) {
         repo.getRef('heads/master', callbackWithError(done, function(err, sha) {
            should.not.exist(err);
            var refSpec = {
               ref: 'refs/heads/testing-14', sha: sha
            };

            repo.createRef(refSpec, callbackWithError(done, function(err) {
               should.not.exist(err);

               // Triggers GET:
               // https://api.github.com/repos/michael/cmake_cdt7_stalled/git/refs/heads/prose-integration
               repo.getRef('heads/master', callbackWithError(done, function(err) {
                  should.not.exist(err);

                  // Triggers DELETE:
                  // https://api.github.com/repos/michael/cmake_cdt7_stalled/git/refs/heads/prose-integration
                  repo.deleteRef('heads/testing-14', callbackWithError(done, function(err, res, xhr) {
                     should.not.exist(err);
                     xhr.status.should.equal(204);
                     done();
                  }));
               }));
            }));
         }));
      });

      it('should be able to write an image to the repo', function(done) {
         var options = {
            encode: false
         };

         repo.write('master', 'TEST_image.png', imageB64, 'Image test', options, callbackWithError(done, function(err) {
            if (err) console.log(err);
            should.not.exist(err);
            done();
         }));
      });

      it('should be able to write a blob to the repo', function(done) {
         repo.postBlob('String test', callbackWithError(done, function(err) { // Test strings
            should.not.exist(err);
            repo.postBlob(imageBlob, callbackWithError(done, function(err) { // Test non-strings
               should.not.exist(err);
               done(err);
            }));
         }));
      });
   });

   describe('deleting a repository', function() {
      before(function() {
         repo = github.getRepo(testUser.USERNAME, repoTest);
      });

      it('should delete the repo', function(done) {
         repo.deleteRepo(callbackWithError(done, function(err, res) {
            should.not.exist(err);
            res.should.be.true; // jshint ignore:line
            done();
         }));
      });
   });

   describe('returns commit errors correctly', function() {
      before(function() {
         repo = github.getRepo(testUser.USERNAME, testUser.REPO);
      });

      it('should fail on broken commit', function(done) {
         repo.commit('broken-parent-hash', 'broken-tree-hash', 'commit message', callbackWithError(done, function(err) {
            should.exist(err);
            should.exist(err.request);
            err.status.should.equal(422);
            done();
         }));
      });
   });
});
