import fs from 'fs';
import nock from 'nock';
import path from 'path';
import GitHub from '../../lib/GitHub';
import testUser from './user.json';

const gh = new GitHub();

let fileName;
gh.getRateLimit().getRateLimit()
   .then((resp) => {
      if (resp.data.rate.remaining === 0) {
         fileName = 'repos-ratelimit-exhausted.js';
      } else {
         fileName = 'repos-ratelimit-ok.js';
      }
      nock.recorder.rec({
         dont_print: true
      });
      gh.getUser(testUser.USERNAME).listRepos();
      setTimeout(() => {
         const fixtures = nock.recorder.play();
         const filePath = path.join(__dirname, fileName);
         const text = ('/* eslint-disable */\n' +
                       'import nock from \'nock\';\n' +
                       'export default function fixture() {\n' +
                       '   let scope;\n' +
                       '   scope = ' + fixtures.join('\nscope = ').trim().replace(/\n/g, '\n   ') + '\n' +
                       '   return scope;\n' +
                       '}\n');
         fs.writeFileSync(filePath, text);
         console.log('Wrote fixture data to', fileName);
      }, 10000);
   }).catch(console.error);
