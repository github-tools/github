import expect from 'must';

import Github from '../lib/GitHub';
import testUser from './fixtures/user.json';
import {assertSuccessful, assertArray} from './helpers/callbacks';
import getTestRepoName from './helpers/getTestRepoName';

// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
describe('Organization', function() {
   let github;

   before(function() {
      github = new Github({
         username: testUser.USERNAME,
         password: testUser.PASSWORD,
         auth: 'basic'
      });

   });

   describe('reading', function() {
      let organization;

      before(function() {
         organization = github.getOrganization('openaddresses');
      });

      it('should show user\'s organisation repos', function(done) {
         organization.getRepos(assertArray(done));
      });
   });

   describe('creating/updating', function() {
      let organization;
      const testRepoName = getTestRepoName();

      before(function() {
         organization = github.getOrganization(testUser.ORGANIZATION);
      });

      it('should create an organisation repo', function(done) {
         const options = {
            name: testRepoName,
            description: 'test create organization repo',
            homepage: 'https://github.com/',
            private: false,
            has_issues: true,
            has_wiki: true,
            has_downloads: true
         };

         organization.createRepo(options, assertSuccessful(done, function(err, repo) {
            expect(repo.name).to.equal(testRepoName);
            expect(repo.full_name).to.equal(`${testUser.ORGANIZATION}/${testRepoName}`);
            done();
         }));
      });
   });
});
