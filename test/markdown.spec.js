import expect from 'must';

import Github from '../lib/GitHub';
import testUser from './fixtures/user.json';
import {assertSuccessful} from './helpers/callbacks';

describe('Markdown', function() {
    let github;
    let markdown;

    before(function() {
        github = new Github({
            username: testUser.USERNAME,
               password: testUser.PASSWORD,
               auth: 'basic'
        });

        markdown = github.getMarkdown();
    });

    it('should convert markdown to html as plain Markdown', function(done) {
        const options = {
            text: 'Hello world github/linguist#1 **cool**, and #1!'
        }

        markdown.render(options, assertSuccessful(done, function(err, html) {
            expect(html).must.be('<p>Hello world github/linguist#1 <strong>cool</strong>, and #1!</p>');
            done();
        }));
    });

    it('should convert markdown to html as GFM', function(done) {
        const options = {
            text: 'Hello world github/linguist#1 **cool**, and #1!',
            mode: 'gmf',
            context: 'github/gollum'
        }
        markdown.render(options, assertSuccessful(done, function(err, html) {
            expect(html).must.be('<p>Hello world <a href="http://github.com/github/linguist/issues/1" class="issue-link" title="This is a simple issue">github/linguist#1</a> <strong>cool</strong>, and <a href="http://github.com/github/gollum/issues/1" class="issue-link" title="This is another issue">#1</a>!</p>')
            done();
        }));
    });
});
