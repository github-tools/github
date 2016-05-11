import expect from 'must';

import Github from '../lib/GitHub';
import testUser from './fixtures/user.json';
import {assertSuccessful, assertArray} from './helpers/callbacks';
import getTestRepoName from './helpers/getTestRepoName';

describe('Organization', function() {
   let github;
   const ORG_NAME = 'github-tools';

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
         organization = github.getOrganization(ORG_NAME);
      });

      it('should show user\'s organisation repos', function(done) {
         organization.getRepos(assertArray(done));
      });

      it('should list the users in the organization', function(done) {
         organization.listMembers()
            .then(function({data: members}) {
               expect(members).to.be.an.array();

               let hasClayReimann = members.reduce((found, member) => member.login === 'clayreimann' || found, false);
               expect(hasClayReimann).to.be.true();

               done();
            }).catch(done);
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
            has_issues: true, // jscs:ignore
            has_wiki: true, // jscs:ignore
            has_downloads: true // jscs:ignore
         };

         organization.createRepo(options, assertSuccessful(done, function(err, repo) {
            expect(repo.name).to.equal(testRepoName);
            expect(repo.full_name).to.equal(`${testUser.ORGANIZATION}/${testRepoName}`); // jscs:ignore
            done();
         }));
      });
   });
});
