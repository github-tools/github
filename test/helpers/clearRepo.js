import {getNextPage, deleteRepo} from './helperFunctions.js';

module.exports = function(github, cb) {
   let user = github.getUser();

   // Override default function to delete repo on each loop
   user._requestAllPages = function(path, options, cb) {
      return this._request('GET', path, options)
         .then((response) => {
            if (response.data instanceof Array) {
               let deletions = response.data
                  .map((repo) => deleteRepo(repo, github));

               Promise.all(deletions).then(() => {
                  console.log('all user repos removed'); // eslint-disable-line
                  const nextUrl = getNextPage(response.headers.link);
                  if (nextUrl) {
                     console.log('next page'); // eslint-disable-line
                     return this._requestAllPages(nextUrl, options, cb);
                  }

                  cb(null);
               });
            }
         }).catch(cb);
   };

   // Read all repos (so delete with _requestAllPages inner call);
   user.listRepos(cb);
};
