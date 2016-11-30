import expect from 'must';

import Github from '../lib/GitHub';
import testUser from './fixtures/user.json';
import {assertSuccessful, assertArray} from './helpers/callbacks';
import getTestRepoName from './helpers/getTestRepoName';

describe('Organization', function() {
   let github;
   const ORG_NAME = 'github-tools';
   const MEMBER_NAME = 'clayreimann';
   let createdProject;

   before(function() {
      github = new Github({
         username: testUser.USERNAME,
         password: testUser.PASSWORD,
         auth: 'basic',
      });
      return;
   });

   after(function() {
      return github.getProject(createdProject.id).deleteProject();
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

               const hasClayReimann = members.some((member) => member.login === MEMBER_NAME);
               expect(hasClayReimann).to.be.true();

               done();
            }).catch(done);
      });

      it('should test for membership', function() {
         return organization.isMember(MEMBER_NAME)
            .then(function(isMember) {
               expect(isMember).to.be.true();
            });
      });
   });

   describe('creating/updating', function() {
      let organization;
      const testRepoName = getTestRepoName();

      before(function() {
         organization = github.getOrganization(testUser.ORGANIZATION);
      });

      it('should create an organization repo', function(done) {
         const options = {
            name: testRepoName,
            description: 'test create organization repo',
            homepage: 'https://github.com/',
            private: false,
            has_issues: true, // eslint-disable-line
            has_wiki: true,  // eslint-disable-line
            has_downloads: true // eslint-disable-line
         };

         organization.createRepo(options, assertSuccessful(done, function(err, repo) {
            expect(repo.name).to.equal(testRepoName);
            expect(repo.full_name).to.equal(`${testUser.ORGANIZATION}/${testRepoName}`); // eslint-disable-line
            done();
         }));
      });

      it('should create an organization team', function(done) {
         const options = {
            name: testRepoName,
            description: 'Created by unit tests',
            privacy: 'secret',
         };

         organization.createTeam(options, assertSuccessful(done, function(err, team) {
            expect(team.name).to.equal(testRepoName);
            expect(team.organization.login).to.equal(testUser.ORGANIZATION); // jscs:ignore
            done();
         }));
      });

      it('should list the teams in the organization', function() {
         return organization.getTeams()
           .then(({data}) => {
              const hasTeam = data.some((member) => member.slug === testRepoName);

              expect(hasTeam).to.be.true();
           });
      });

      it('should create a project', function(done) {
         organization.createProject({
            name: testRepoName,
            body: 'body',
         }, assertSuccessful(done, function(err, project) {
            createdProject = project;
            expect(project).to.own('name', testRepoName);
            expect(project).to.own('body', 'body');
            done();
         }));
      });

      it('should list repo projects', function(done) {
         organization.listProjects(assertSuccessful(done, function(err, projects) {
            expect(projects).to.be.an.array();

            const hasProject = projects.some((project) => project.name === testRepoName);

            expect(hasProject).to.be.true();
            done();
         }));
      });
   });
});
