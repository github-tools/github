'use strict';

var test = require('tape'); //jshint ignore:line
var Github = require("../");
var test_user = require('./user.json');

test("Issues API", function(t) {
	var github = new Github({
      username: test_user.USERNAME,
      password: test_user.PASSWORD,
      auth: "basic"
    });

    var issues = github.getIssues('mikedeboertest', 'TestRepo');

    t.test('issues.list', function(q) {
        issues.list({},function(err, issues) {
			t.error(err);
			t.equals(issues.length > 0, true, 'Issues not found');
			t.end();
        });
    });

    t.test('issues.comment', function(q) {
    	var issueToComment;
        issues.list({},function(err, issues) {
			issueToComment = issues[0]
        });

        issues.comment(issueToComment, 'Comment test', function(err,res){
        	t.error(err);
        	console.log(res);
        });
    });
});