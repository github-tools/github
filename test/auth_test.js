if (typeof require !== 'undefined') {
    var Github = require("../")
      , chai = require("chai");
}
chai.should();
var expect = chai.expect
  , TEST_USERNAME = "mikedeboertest"
  , TEST_PASSWORD = "test1324";

// var util = require("util");

describe("Auth", function(){
  this.timeout(10000);
  it("should authenticate with basic auth", function(done){
    var github = new Github({
      username: TEST_USERNAME,
      password: TEST_PASSWORD,
      auth: "basic"
    });
    var user = github.getUser();
    user.repos(function(err, repos) {
      // console.error(util.inspect(err));
      expect(err).to.be.null;
      repos.should.be.ok;
      repos.length.should.be.above(1);
      done();

    });

  });
});