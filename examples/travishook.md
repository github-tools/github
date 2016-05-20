'''javascript
    var options = {
        "name" : "travis",
        "config" : {
                    "user" : "your-Username",
                    "token" : "00000000000000000000000000",
                    "domain" : "http://notify.travis-ci.org",
                    "content_type": "json"
                    },
        "events" : ["push", "pull_request"],
        "active" : true
    }
    //create the git-travis hook
    try{
        fork.createHook(options, function(){
            console.log("A travis hook has been created which will trigger a build on push and pull request events...");
        });   
    }
    catch(err){     
        console.log(err);
    }
'''
