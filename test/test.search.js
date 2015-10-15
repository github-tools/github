'use strict';

var test = require('tape'); //jshint ignore:line
var Github = require("../");
var test_user = require('./user.json');

test("User API", function(t) {
    var timeout = setTimeout(function () { t.fail(); }, 100000);
    var github = new Github({
        username: test_user.USERNAME,
        password: test_user.PASSWORD,
        auth: "basic"
    });
    // var user = github.getUser();


    t.test('Search.repositories', function(q) {
        var search = github.getSearch("tetris+language:assembly&sort=stars&order=desc");
        var options = null;

        search.repositories(options, function (err) {
            q.error(err, 'search repositories');
            q.end();
        });
    });

    t.test('Search.code', function(q) {
        var search = github.getSearch("addClass+in:file+language:js+repo:jquery/jquery");
        var options = null;

        search.code(options, function (err) {
            q.error(err, 'search code');
            q.end();
        });
    });

    t.test('Search.issues', function(q) {
        var search = github.getSearch("windows+label:bug+language:python+state:open&sort=created&order=asc");
        var options = null;

        search.issues(options, function (err) {
            q.error(err, 'search issues');
            q.end();
        });
    });

    t.test('Search.users', function(q) {
        var search = github.getSearch("tom+repos:%3E42+followers:%3E1000");
        var options = null;

        search.users(options, function (err) {
            q.error(err, 'search users');
            q.end();
        });
    });



    clearTimeout(timeout);
    t.end();
 });
