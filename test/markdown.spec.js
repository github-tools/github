import expect from 'must';

import Github from '../lib/GitHub';
import testUser from './fixtures/user.json';

describe('Markdown', function() {
   let github;
   let markdown;

   before(function() {
      github = new Github({
         username: testUser.USERNAME,
         password: testUser.PASSWORD,
         auth: 'basic',
      });

      markdown = github.getMarkdown();
   });

   it('should convert markdown to html as plain Markdown', function(done) {
      const options = {
         text: 'Hello world github/linguist#1 **cool**, and #1!',
      };

      markdown.render(options)
         .then(function({data: html}) {
            expect(html).to.be('<p>Hello world github/linguist#1 <strong>cool</strong>, and #1!</p>\n');
            done();
         }).catch(done);
   });

   it('should convert markdown to html as GFM', function(done) {
      const options = {
         text: 'Hello world github/linguist#1 **cool**, and #1!',
         mode: 'gfm',
         context: 'github/gollum',
      };
      markdown.render(options)
         .then(function({data: html}) {
            expect(html).to.be('<p>Hello world <a href="https://github.com/github/linguist/issues/1" class="issue-link js-issue-link" data-url="https://github.com/github/linguist/issues/1" data-id="1012654" data-error-text="Failed to load issue title" data-permission-text="Issue title is private">github/linguist#1</a> <strong>cool</strong>, and <a href="https://github.com/gollum/gollum/issues/1" class="issue-link js-issue-link" data-url="https://github.com/gollum/gollum/issues/1" data-id="183433" data-error-text="Failed to load issue title" data-permission-text="Issue title is private">#1</a>!</p>'); // eslint-disable-line
            done();
         }).catch(done);
   });
});
