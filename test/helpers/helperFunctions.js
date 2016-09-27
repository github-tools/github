export function getNextPage(linksHeader = '') {
   const links = linksHeader.split(/\s*,\s*/); // splits and strips the urls
   return links.reduce(function(nextUrl, link) {
      if (link.search(/rel="next"/) !== -1) {
         return (link.match(/<(.*)>/) || [])[1];
      }

      return nextUrl;
   }, undefined);
}

export function deleteRepo(repo, github) {
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

export function deleteTeam(team, github) {
   return new Promise((resolve, reject) => {
      github
         .getTeam(team.id)
         .deleteTeam()
         .then((removed) => {
            if(removed) console.log('team', team.name, 'deleted');
            resolve();
         });
   });
}
