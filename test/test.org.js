// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
import expect from 'must';

import Github from '../src/Github';
import testUser from './fixtures/user.json';
import {assertSuccessful} from './helpers/callbacks';

describe('Organization', function() {
   let github;
   let organization;

   before(function() {
      github = new Github({
         username: testUser.USERNAME,
         password: testUser.PASSWORD,
         auth: 'basic'
      });

      organization = github.getOrg();
   });

   it('should create an organisation repo', function(done) {
      const testRepoName = Math.floor(Math.random() * 100000).toString();
      const options = {
         orgname: testUser.ORGANIZATION,
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
