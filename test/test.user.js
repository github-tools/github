var test = require('tape');
var Github = require("../");
var test_user = require('./user.json');

test("User API", function(t) {
    var timeout = setTimeout(function () { t.fail(); }, 100000);
    var github = new Github({
      username: test_user.USERNAME,
      password: test_user.PASSWORD,
      auth: "basic"
    });
    var user = github.getUser();

    user.orgs(function(err, res) {
        t.error(err, 'user orgs');
    });

    user.gists(function(err, res) {
        t.error(err, 'user gists');
    });

    user.notifications(function(err, res) {
        t.error(err, 'user notifications');
    });

    user.show('ingalls', function(err, res) {
        t.error(err, 'user show');
    });

    user.userRepos(test_user.USERNAME, function(err, res) {
        t.error(err, 'alt user repos');
    });

    user.userGists(test_user.USERNAME, function(err, res) {
        t.error(err, 'alt user gists');
    });

    user.orgRepos('openaddresses', function(err, res) {
        t.error(err, 'org users');
    });

    user.follow('ingalls', function(err, res) {
        t.error(err, 'follow ingalls');
    });

    user.unfollow('ingalls', function(err, res) {
        t.error(err, 'unfollow ingalls');
    });
    clearTimeout(timeout);
    t.end();

});
