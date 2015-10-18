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
			q.error(err);
			t.equals(issues.length > 0, true, 'Issues!');
			q.end();
        });
        t.end();
    });

    t.test('issues.comment', function(q) {
        issues.list({},function(err, issuesList) {
			issues.comment(issuesList[0], 'Comment test', function(err, res){
				q.error(err);
				t.equals(res.body, 'Comment test', 'Comments!');
				q.end();
	        });  
        });
    });


});