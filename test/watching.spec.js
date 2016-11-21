import expect from 'must';

import Github from '../lib/GitHub';
import testUser from './fixtures/user.json';
import altUser from './fixtures/alt-user.json';
import getTestRepoName from './helpers/getTestRepoName';

describe('Watching', function() {
   const testRepoName = getTestRepoName();
   let githubUser;
   let githubAltUser;
   let organization;

   before(function() {
      githubUser = new Github({
         username: testUser.USERNAME,
         password: testUser.PASSWORD,
         auth: 'basic'
      });

      githubAltUser = new Github({
         username: altUser.USERNAME,
         password: altUser.PASSWORD,
         auth: 'basic'
      });

      organization = githubUser.getOrganization(testUser.ORGANIZATION);

      const options = {
         name: testRepoName,
         description: 'test repo watchers',
         homepage: 'https://github.com/',
         private: false,
         has_issues: false, // eslint-disable-line
         has_wiki: false,  // eslint-disable-line
         has_downloads: false // eslint-disable-line
      };

      return organization.createRepo(options);
   });

   it('should list watchers', function() {
      return githubUser.watching()
        .listWatchers(testUser.ORGANIZATION, 'fixed-test-repo-1')
        .then(({data}) => {
           const watchers = data.map((x) => x.login);
           expect(watchers).must.include('mikedeboertest');
        });
   });

   it('should add a subscription to a repo', function() {
      const watching = githubAltUser.watching();

      return watching.subscribe(testUser.ORGANIZATION, testRepoName)
         .then(({data}) => {
            expect(data.subscribed).to.be.true();
            expect(data.ignored).to.be.false();
         });
   });

   it('should ignore a repo', function() {
      const watching = githubAltUser.watching();

      return watching.ignore(testUser.ORGANIZATION, testRepoName)
         .then(({data}) => {
            expect(data.subscribed).to.be.false();
            expect(data.ignored).to.be.true();
         });
   });

   it('should remove subscription settings', function() {
      const watching = githubAltUser.watching();

      return watching.removeSubscription(testUser.ORGANIZATION, testRepoName)
         .then((result) => {
            expect(result).to.be.true();
         });
   });
});
