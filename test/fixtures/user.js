let user;

if (process.env.GHTOOLS_USER) {
   user = {
      'USERNAME': process.env.GHTOOLS_USER,
      'PASSWORD': process.env.GHTOOLS_PASSWORD,
      'REPO': 'github',
      'ORGANIZATION': 'github-api-tests',
   };
} else {
   throw new Error('No testing account set up. Please email jaredrewerts@gmail.com to get access.');
}
export default user;
