var test = require('tape');
var Github = require("../");
var test_user = require('./user.json');

test("Basic Auth - Pass", function(t) {
    var timeout = setTimeout(function () { t.fail(); }, 10000);
    var github = new Github({
      username: test_user.USERNAME,
      password: test_user.PASSWORD,
      auth: "basic"
    });
    var user = github.getUser();
    
    t.equals(Object.keys(user).length, 10);
    t.equals(Object.keys(user).indexOf('repos') > -1, true); 
    clearTimeout(timeout);
    t.end(); 
    
});

