function getNextPage(linksHeader = '') {
   const links = linksHeader.split(/\s*,\s*/); // splits and strips the urls
   return links.reduce(function(nextUrl, link) {
      if (link.search(/rel="next"/) !== -1) {
         return (link.match(/<(.*)>/) || [])[1];
      }

      return nextUrl;
   }, undefined);
}

function deleteRepo(repo, github) {
   return new Promise((resolve, reject) => {
      github
         .getRepo(repo.owner.login, repo.name)
         .deleteRepo()
         .then((removed) => {
            if(removed) console.log(repo.full_name, 'deleted');
            resolve();
         });
   });
}

module.exports = function(github, cb) {
   let user = github.getUser();

   // Override default function to delete repo on each loop
   user._requestAllPages = function(path, options, cb) {
      return this._request('GET', path, options)
         .then((response) => {
            if (response.data instanceof Array) {
               let deletions = response.data
                  .map((repo) => deleteRepo(repo, github))

                  Promise.all(deletions).then(() => {
                     console.log('all user repos removed');
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
   user.listRepos(cb);
}
