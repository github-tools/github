import {getNextPage, deleteTeam} from './helperFunctions.js';

module.exports = function(github, organization, cb) {
   let org = github.getOrganization(organization);

   // Override default function to delete team on each loop
   org._requestAllPages = function(path, options, cb) {
      return this._request('GET', path, options)
         .then((response) => {
            if (response.data instanceof Array) {
               let deletions = response.data
                  .map((team) => {
                     deleteTeam(team, github)
                  });

                  Promise.all(deletions).then(() => {
                     console.log('all org teams removed');
                     const nextUrl = getNextPage(response.headers.link);
                     if (nextUrl) {
                        console.log('next page');
                        return this._requestAllPages(nextUrl, options, cb);
                     }

                     cb(null);
                  });
            }
         }).catch(cb);
   };

   // Read all repos (so delete with _requestAllPages inner call);
   org.getTeams(cb);
}
