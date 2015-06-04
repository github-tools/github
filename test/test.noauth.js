'use strict';

var test = require('tape'); //jshint ignore:line
var Github = require("../");
var test_user = require('./user.json');

test("Unauthenticated - Pass", function(t) {
  var timeout = setTimeout(function () { t.fail(); }, 10000);
  var github = new Github({});
  var gist = github.getGist("564a4e3f4b8c683a6186");
  
  gist.read(function(err) {
    t.error(err, "gist was read");
  });
  
  clearTimeout(timeout);
  t.end(); 
});

test("Basic Auth - Fail", function(t) {
  var timeout = setTimeout(function () { t.fail(); }, 10000);
  var github = new Github({});
  var gist = github.getGist("564a4e3f4b8c683a6186");

  gist.read(function(err) {
      t.ok(err, 'gist was not read');
      t.equals(JSON.parse(err.request.responseText).message);
  });

  clearTimeout(timeout);
  t.end();
});
