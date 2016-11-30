import expect from 'must';
import nock from 'nock';

import Github from '../lib/GitHub';
import testUser from './fixtures/user.json';

describe('Search', function() {
   this.timeout(20 * 1000); // eslint-disable-line no-invalid-this
   let github;

   before(function() {
      github = new Github({
         username: testUser.USERNAME,
         password: testUser.PASSWORD,
         auth: 'basic',
      });
      nock.load('test/fixtures/search.json');
   });

   it('should search repositories', function() {
      let options;
      let search = github.search({
         q: 'tetris language:assembly',
         sort: 'stars',
         order: 'desc',
      });

      return search.forRepositories(options)
         .then(function({data}) {
            expect(data).to.be.an.array();
            expect(data.length).to.be.above(0);
         });
   });

   it('should search code', function() {
      let options;
      let search = github.search({
         q: 'addClass in:file language:js repo:jquery/jquery',
      });

      return search.forCode(options)
         .then(function({data}) {
            expect(data).to.be.an.array();
            expect(data.length).to.be.above(0);
         });
   });

   it('should search issues', function() {
      let options;
      let search = github.search({
         q: 'windows pip label:bug language:python state:open ',
         sort: 'created',
         order: 'asc',
      });

      return search.forIssues(options)
         .then(function({data}) {
            expect(data).to.be.an.array();
            expect(data.length).to.be.above(0);
         });
   });

   it('should search users', function() {
      let options;
      let search = github.search({
         q: 'tom repos:>42 followers:>1000',
      });

      return search.forUsers(options)
         .then(function({data}) {
            expect(data).to.be.an.array();
            expect(data.length).to.be.above(0);
         });
   });

   after(function() {
      nock.cleanAll();
      nock.restore();
   });
});
