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
   return github
         .getRepo(repo.owner.login, repo.name)
         .deleteRepo()
         .then((removed) => {
            if (removed) {
              console.log(repo.full_name, 'deleted'); // eslint-disable-line
            }
         });
}

export function deleteTeam(team, github) {
   return github
         .getTeam(team.id)
         .deleteTeam()
         .then((removed) => {
            if (removed) {
              console.log('team', team.name, 'deleted'); //eslint-disable-line
            }
         });
}

export function deleteProject(project, github) {
   return github
         .getProject(project.id)
         .deleteProject()
         .then((removed) => {
            if (removed) {
              console.log('project', project.name, 'deleted'); //eslint-disable-line
            }
         });
}
