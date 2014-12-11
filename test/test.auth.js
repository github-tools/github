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
    
    user.notifications(function(err, res) {
        t.error(err, 'user is authd');
    });
    
    clearTimeout(timeout);
    t.end(); 
    
});

test("Basic Auth - Fail", function(t) {
    var timeout = setTimeout(function () { t.fail(); }, 10000);
    var github = new Github({
      username: test_user.USERNAME,
      password: 'fake124',
      auth: "basic"
    });
    var user = github.getUser();

    user.notifications(function(err, res) {
        t.ok(err, 'user is not authd');
        t.equals(JSON.parse(err.request.responseText).message, 'Bad credentials', 'confirm error');
    });

    clearTimeout(timeout);
    t.end();
 
});
