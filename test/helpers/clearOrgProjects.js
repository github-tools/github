import {getNextPage, deleteProject} from './helperFunctions.js';

module.exports = function(github, organization, cb) {
   let org = github.getOrganization(organization);

   // Override default function to delete team on each loop
   org._requestAllPages = function(path, options, cb) {
      return this._request('GET', path, options)
         .then((response) => {
            if (response.data instanceof Array) {
               let deletions = response.data
                  .map((project) => deleteProject(project, github));

               Promise.all(deletions).then(() => {
                 console.log('all org projects removed'); // eslint-disable-line
                  const nextUrl = getNextPage(response.headers.link);
                  if (nextUrl) {
                     console.log('next page'); //eslint-disable-line
                     return this._requestAllPages(nextUrl, options, cb);
                  }

                  cb(null);
               });
            }
         }).catch(cb);
   };

   // Read all projects (so delete with _requestAllPages inner call);
   org.listProjects(cb);
};
