if (typeof require !== 'undefined') {
    var Github = require("../")
      , chai = require("chai");
}
chai.should();
var expect = chai.expect
  , TEST_USERNAME = "mikedeboertest"
  , TEST_PASSWORD = "test1324"
  , TEST_REPO = "github";

var github = new Github({
  username: TEST_USERNAME,
  password: TEST_PASSWORD,
  auth: "basic"
});

describe("Repo", function(){

  it("should return commit errors correctly", function(done){
    var repo = github.getRepo(TEST_USERNAME, TEST_REPO);
    repo.commit("broken-parent-hash", "broken-tree-hash", "commit message", function(err){
      if (err != null && err.request != null && err.request.status == 500) {
        done();
      } else {
        done(new Error("No `err` passed to .commit callback"));
      }
    });
  });

});
