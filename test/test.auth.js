var test = require('tape');
var Github = require("../");

var TEST_USERNAME = "mikedeboertest";
var TEST_PASSWORD = "test1324";

test("Basic Auth", function(t) {
    var timeout = setTimeout(function () { t.fail(); }, 10000);
    var github = new Github({
      username: TEST_USERNAME,
      password: TEST_PASSWORD,
      auth: "basic"
    });
    var user = github.getUser();
    
    t.equals(Object.keys(user).length, 10);
    t.equals(Object.keys(user).indexOf('repos') > -1, true); 
    clearTimeout(timeout);
    t.end(); 
    
});
