(function() {

  // Helpers
  // -------

  function randomString(length) {
    var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
    var res = '';
    for (var i=0; i<length; i++) {
      var rnum = Math.floor(Math.random() * chars.length);
      res += chars.substring(rnum,rnum+1);
    }
    return res;
  }

  var USERNAME = "github-api-test",
      PASSWORD = "api-test-12",
      REPO     = "github-api-test";

  suite('Github', function(){
    setup(function() {
      // ...
    });

    suite('#Github API', function(){
      test('should return repo information', function() {
        var github = new Github({username: USERNAME, password: PASSWORD, auth: "basic"});
        var repo = github.getRepo(REPO);

        repo.show(function(err, repo) {
          // TODO: implement
        });
      });

      test('should be capable of writing files', function() {
        var github = new Github({username: USERNAME, password: PASSWORD, auth: "basic"});
        var repo = github.getRepo(REPO);

        repo.write(randomString(20) + ".md", "h3. Hello World!", function(err, commit) {
          // TODO: 

          repo.write("path/to/"+randomString(20) + ".md", "h3. Hello World!", function(err, commit) {
            // TODO: 
          });
        });
      });

      test('should be capable of wrting files to directories that do not yet exist', function() {

      });

    });
  });

}).call(this);


