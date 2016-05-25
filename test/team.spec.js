import expect from 'must';

import Github from '../lib/GitHub';
import testUser from './fixtures/user.json';
import {assertFailure} from './helpers/callbacks';
import getTestRepoName from './helpers/getTestRepoName';

const altUser = {
   USERNAME: 'mtscout6-test'
};

function createTestTeam() {
   const name = getTestRepoName();

   const github = new Github({
      username: testUser.USERNAME,
      password: testUser.PASSWORD,
      auth: 'basic'
   });

   const org = github.getOrganization(testUser.ORGANIZATION);

   return org.createTeam({
      name,
      privacy: 'closed'
   }).then(({data: result}) => {
      const team = github.getTeam(result.id);
      return {team, name};
   });
}

let team;
let name;

describe('Team', function() { // Isolate tests that are based on a fixed team
   before(function() {
      const github = new Github({
         username: testUser.USERNAME,
         password: testUser.PASSWORD,
         auth: 'basic'
      });

      team = github.getTeam(2027812); // github-api-tests/fixed-test-team-1
   });

   it('should get membership for a given user', function() {
      return team.getMembership(altUser.USERNAME)
         .then(function({data}) {
            expect(data.state).to.equal('active');
            expect(data.role).to.equal('member');
         });
   });

   it('should list the users in the team', function() {
      return team.listMembers()
         .then(function({data: members}) {
            expect(members).to.be.an.array();

            let hasTestUser = members.reduce(
               (found, member) => member.login === testUser.USERNAME || found,
               false
            );

            expect(hasTestUser).to.be.true();
         });
   });

   it('should get team repos', function() {
      return team.listRepos()
         .then(({data}) => {
            const hasRepo = data.reduce(
               (found, repo) => repo.name === 'fixed-test-repo-1' || found,
               false
            );

            expect(hasRepo).to.be.true();
         });
   });

   it('should get team', function() {
      return team.getTeam()
         .then(({data}) => {
            expect(data.name).to.equal('Fixed Test Team 1');
         });
   });

   it('should check if team manages repo', function() {
      return team.isManagedRepo(testUser.ORGANIZATION, 'fixed-test-repo-1')
         .then((result) => {
            expect(result).to.be.true();
         });
   });
});

describe('Team', function() { // Isolate tests that need a new team per test
   beforeEach(function() {
      return createTestTeam()
         .then((x) => {
            team = x.team;
            name = x.name;
         });
   });

   // Test for Team deletion
   afterEach(function(done) {
      team.deleteTeam()
         .then(() => team.getTeam(assertFailure(done)));
   });

   it('should update team', function() {
      const newName = `${name}-updated`;
      return team.editTeam({name: newName})
         .then(function({data}) {
            expect(data.name).to.equal(newName);
         });
   });

   it('should add membership for a given user', function() {
      return team.addMembership(testUser.USERNAME)
         .then(({data}) => {
            const {state, role} = data;
            expect(state === 'active' || state === 'pending').to.be.true();
            expect(role).to.equal('member');
         });
   });

   it('should add membership as a maintainer for a given user', function() {
      return team.addMembership(altUser.USERNAME, {role: 'maintainer'})
         .then(({data}) => {
            const {state, role} = data;
            expect(state === 'active' || state === 'pending').to.be.true();
            expect(role).to.equal('maintainer');
         });
   });

   it('should add/remove team management of repo', function() {
      return team.manageRepo(testUser.ORGANIZATION, 'fixed-test-repo-1', {permission: 'pull'})
         .then((result) => {
            expect(result).to.be.true();
            return team.unmanageRepo(testUser.ORGANIZATION, 'fixed-test-repo-1');
         })
         .then((result) => {
            expect(result).to.be.true();
         });
   });
});
