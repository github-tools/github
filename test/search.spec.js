import Github from '../src/Github';
import testUser from './fixtures/user.json';
import {assertSuccessful} from './helpers/callbacks';

describe('Search', function() {
   let github;

   before(function() {
      github = new Github({
         username: testUser.USERNAME,
         password: testUser.PASSWORD,
         auth: 'basic'
      });
   });

   it('should search repositories', function(done) {
      let search = github.search({
         q: 'tetris language:assembly',
         sort: 'stars',
         order: 'desc'
      });
      let options = undefined;

      search.repositories(options, assertSuccessful(done));
   });

   it('should search code', function(done) {
      let search = github.search({q: 'addClass in:file language:js repo:jquery/jquery'});
      let options = undefined;

      search.code(options, assertSuccessful(done));
   });

   it('should search issues', function(done) {
      let search = github.search({
         q: 'windows label:bug language:python state:open',
         sort: 'created',
         order: 'asc'
      });
      let options = undefined;

      search.issues(options, assertSuccessful(done));
   });

   it('should search users', function(done) {
      let search = github.search({q: 'tom repos:>42 followers:>1000'});
      let options = undefined;

      search.users(options, assertSuccessful(done));
   });
});
