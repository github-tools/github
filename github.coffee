# Github Promise API
# ======
#
# This class provides a Promise API for accessing GitHub
# (see [jQuery.Deferred](http://api.jquery.com/jQuery.deferred)).
# Most methods return a Promise object whose value is resolved when `.then(doneFn, failFn)`
# is called.
#

# Based on Github.js 0.7.0
#
#     (c) 2012 Michael Aufreiter, Development Seed
#     Github.js is freely distributable under the MIT license.
#     For all details and documentation:
#     http://substance.io/michael/github

# Generate a Github class
# =========
#
# Depending on how this is loaded (nodejs, requirejs, globals)
# the actual underscore, jQuery.ajax/Deferred, and base64 encode functions may differ.
makeGithub = (_, jQuery, base64encode, userAgent) =>
  class Github

    # HTTP Request Abstraction
    # =======
    #
    _request = null

    # These are updated whenever a request is made
    _listeners = []

    constructor: (clientOptions={}) ->
      # Provide an option to override the default URL
      clientOptions.rootURL = clientOptions.rootURL or 'https://api.github.com'


      _request = (method, path, data, options={raw:false, isBase64:false, isBoolean:false}) ->
        getURL = ->
          url = clientOptions.rootURL + path
          url + ((if (/\?/).test(url) then '&' else '?')) + (new Date()).getTime()

        # Support binary data by overriding the response mimeType
        mimeType = undefined
        mimeType = 'text/plain; charset=x-user-defined' if options.isBase64

        headers = {
          'Accept': 'application/vnd.github.raw'
        }

        # Set the `User-Agent` because it is required and NodeJS
        # does not send one by default.
        # See http://developer.github.com/v3/#user-agent-required
        headers['User-Agent'] = userAgent if userAgent

        if (clientOptions.auth is 'oauth' and clientOptions.token) or (clientOptions.auth is 'basic' and clientOptions.username and clientOptions.password)
          if clientOptions.auth is 'oauth'
            auth = "token #{clientOptions.token}"
          else
            auth = 'Basic ' + base64encode("#{clientOptions.username}:#{clientOptions.password}")
          headers['Authorization'] = auth

        ajaxConfig =
          url: getURL()
          type: method
          contentType: 'application/json'
          mimeType: mimeType
          headers: headers

          processData: false # Don't convert to QueryString
          data: !options.raw and data and JSON.stringify(data) or data
          dataType: 'json' unless options.raw

        # If the request is a boolean yes/no question GitHub will indicate
        # via the HTTP Status of 204 (No Content) or 404 instead of a 200.
        # Also, jQuery will never call `xhr.resolve` so we need to use a
        # different promise later on.
        if options.isBoolean
          booleanPromise = new jQuery.Deferred()
          ajaxConfig.statusCode =
            # a Boolean 'yes'
            204: () => booleanPromise.resolve(true)
            # a Boolean 'no'
            404: () => booleanPromise.resolve(false)

        xhr = jQuery.ajax(ajaxConfig)

        xhr.always =>
          # Fire listeners when the request completes or fails
          rateLimit = parseFloat(xhr.getResponseHeader 'X-RateLimit-Limit')
          rateLimitRemaining = parseFloat(xhr.getResponseHeader 'X-RateLimit-Remaining')

          for listener in _listeners
            listener(rateLimitRemaining, rateLimit, method, path, data, options)

        promise = if options.isBoolean
          # If the request fails for something other than 404
          # then reject the promise.
          # 404 means 'false'
          xhr.fail (err) -> booleanPromise.reject(err) if err.status != 404

          # Set the promise returned to be the boolean promise
          # instead of `xhr` (see above on the `isBoolean` option)
          booleanPromise

        else

          # Return the result and Base64 encode it if `options.isBase64` flag is set.
          xhr.then (data, textStatus, jqXHR) ->
            ret = new jQuery.Deferred()
            # Convert the response to a Base64 encoded string
            if 'GET' == method and options.isBase64
              # Convert raw data to binary chopping off the higher-order bytes in each char.
              # Useful for Base64 encoding.
              converted = ''
              for i in [0..data.length]
                converted += String.fromCharCode(data.charCodeAt(i) & 0xff)
              converted

              ret.resolve(converted, textStatus, jqXHR)
            else
              ret.resolve(data, textStatus, jqXHR)

          # Parse the error if one occurs
          .then null, (xhr, msg, desc) ->
            if xhr.getResponseHeader('Content-Type') != 'application/json; charset=utf-8'
              return {error: xhr.responseText, status: xhr.status, _xhr: xhr}

            json = JSON.parse xhr.responseText
            return {error: json, status: xhr.status, _xhr: xhr}

        # Return the promise
        return promise.promise()

      # Add a listener that fires when the `rateLimitRemaining` changes as a result of
      # communicating with github.
      @onRateLimitChanged = (listener) ->
        _listeners.push listener

      # Random zen quote (test the API)
      # -------
      @getZen = () ->
        # Send `data` to `null` and the `raw` flag to `true`
        _request 'GET', '/zen', null, {raw:true}

      # Get all users
      # -------
      @getAllUsers = (since=null) ->
        options = {}
        options.since = since if since
        _request 'GET', '/users', options

      # List public repositories for an Organization
      # -------
      @getOrgRepos = (orgName) ->
        _request 'GET', "/orgs/#{orgName}/repos?type=all&per_page=1000&sort=updated&direction=desc", null

      # Get public Gists on all of GitHub
      # -------
      @getPublicGists = (since=null) ->
        options = null
        # Converts a Date object to a string
        getDate = (time) ->
          return time.toISOString() if Date == time.constructor
          return time

        options = {since: getDate(since)} if since
        _request 'GET', '/gists/public', options

      # List Public Events on all of GitHub
      # -------
      @getPublicEvents = () ->
        _request 'GET', '/events', null


      # List unread notifications for authenticated user
      # -------
      # Optional arguments:
      #
      # - `all`: `true` to show notifications marked as read.
      # - `participating`: `true` to show only notifications in which the user is directly participating or mentioned.
      # - `since`: Optional time.
      @getNotifications = (options={}) ->
        # Converts a Date object to a string
        getDate = (time) ->
          return time.toISOString() if Date == time.constructor
          return time

        options.since = getDate(options.since) if options.since
        _request 'GET', '/notifications', options



      # Github Users API
      # =======
      class User

        # Private var that stores the root path.
        # Use a different URL if this user is the authenticated user
        _rootPath = null
        _username = null

        # Store the username
        constructor: (username=null) ->
          _username = username
          if username
            _rootPath = "/users/#{username}"
          else
            _rootPath = "/user"

          # Retrieve user information
          # -------
          @getInfo = () ->
            _request 'GET', "#{_rootPath}", null

          # List user repositories
          # -------
          @getRepos = () ->
            _request 'GET', "#{_rootPath}/repos?type=all&per_page=1000&sort=updated", null

          # List user organizations
          # -------
          @getOrgs = () ->
            _request 'GET', "#{_rootPath}/orgs", null

          # List a user's gists
          # -------
          @getGists = () ->
            _request 'GET', "#{_rootPath}/gists", null

          # List followers of a user
          # -------
          @getFollowers = () ->
            _request 'GET', "#{_rootPath}/followers", null

          # List who this user is following
          # -------
          @getFollowing = () ->
            _request 'GET', "#{_rootPath}/following", null

          # Check if this user is following another user
          # -------
          @isFollowing = (user) ->
            _request 'GET', "#{_rootPath}/following/#{user}", null, {isBoolean:true}

          # List public keys for a user
          # -------
          @getPublicKeys = () ->
            _request 'GET', "#{_rootPath}/keys", null


          # Get Received events for this user
          # -------
          @getReceivedEvents = (onlyPublic) ->
            throw 'BUG: This does not work for authenticated users yet!' if not _username
            isPublic = ''
            isPublic = '/public' if onlyPublic
            _request 'GET', "/users/#{_username}/received_events#{isPublic}", null

          # Get all events for this user
          # -------
          @getEvents = (onlyPublic) ->
            throw 'BUG: This does not work for authenticated users yet!' if not _username
            isPublic = ''
            isPublic = '/public' if onlyPublic
            _request 'GET', "/users/#{_username}/events#{isPublic}", null


      # Authenticated User API
      # =======
      class AuthenticatedUser extends User

        constructor: () ->
          super()

          # Update the authenticated user
          # -------
          #
          # Valid options:
          # - `name`: String
          # - `email` : Publicly visible email address
          # - `blog`: String
          # - `company`: String
          # - `location`: String
          # - `hireable`: Boolean
          # - `bio`: String
          @updateInfo = (options) ->
            _request 'PATCH', '/user', options

          # List authenticated user's gists
          # -------
          @getGists = () ->
            _request 'GET', '/gists', null

          # Follow a user
          # -------
          @follow = (username) ->
            _request 'PUT', "/user/following/#{username}", null

          # Unfollow user
          # -------
          @unfollow = (username) ->
            _request 'DELETE', "/user/following/#{username}", null

          # Get Emails associated with this user
          # -------
          @getEmails = () ->
            _request 'GET', '/user/emails', null

          # Add Emails associated with this user
          # -------
          @addEmail = (emails) ->
            emails = [emails] if !_.isArray(emails)
            _request 'POST', '/user/emails', emails

          # Remove Emails associated with this user
          # -------
          @addEmail = (emails) ->
            emails = [emails] if !_.isArray(emails)
            _request 'DELETE', '/user/emails', emails

          # Get a single public key
          # -------
          @getPublicKey = (id) ->
            _request 'GET', "/user/keys/#{id}", null

          # Add a public key
          # -------
          @addPublicKey = (title, key) ->
            _request 'POST', "/user/keys", {title: title, key: key}

          # Update a public key
          # -------
          @updatePublicKey = (id, options) ->
            _request 'PATCH', "/user/keys/#{id}", options



      # Organization API
      # =======

      class Team
        constructor: (@id) ->
          @getInfo = () ->
            _request 'GET', "/teams/#{@id}", null

          # - `name`
          # - `permission`
          @updateTeam = (options) ->
            _request 'PATCH', "/teams/#{@id}", options

          @remove = () ->
            _request 'DELETE', "/teams/#{@id}"

          @getMembers = () ->
            _request 'GET', "/teams/#{@id}/members"

          @isMember = (user) ->
            _request 'GET', "/teams/#{@id}/members/#{user}", null, {isBoolean:true}

          @addMember = (user) ->
            _request 'PUT', "/teams/#{@id}/members/#{user}"

          @removeMember = (user) ->
            _request 'DELETE', "/teams/#{@id}/members/#{user}"

          @getRepos = () ->
            _request 'GET', "/teams/#{@id}/repos"

          @addRepo = (orgName, repoName) ->
            _request 'PUT', "/teams/#{@id}/repos/#{orgName}/#{repoName}"

          @removeRepo = (orgName, repoName) ->
            _request 'DELETE', "/teams/#{@id}/repos/#{orgName}/#{repoName}"

      class Organization
        constructor: (@name) ->

          @getInfo = () ->
            _request 'GET', "/orgs/#{@name}", null

          # - `billing_email`: Billing email address. This address is not publicized.
          # - `company`
          # - `email`
          # - `location`
          # - `name`
          @updateInfo = (options) ->
            _request 'PATCH', "/orgs/#{@name}", options

          @getTeams = () ->
            _request 'GET', "/orgs/#{@name}/teams", null

          # `permission` can be one of `pull`, `push`, or `admin`
          @createTeam = (name, repoNames=null, permission='pull') ->
            options = {name: name, permission: permission}
            options.repo_names = repoNames if repoNames
            _request 'POST', "/orgs/#{@name}/teams", options

          @getMembers = () ->
            _request 'GET', "/orgs/#{@name}/members", null

          @isMember = (user) ->
            _request 'GET', "/orgs/#{@name}/members/#{user}", null, {isBoolean:true}

          @removeMember = (user) ->
            _request 'DELETE', "/orgs/#{@name}/members/#{user}", null


      # Repository API
      # =======

      # Low-level class for manipulating a Git Repository
      # -------
      class GitRepo

        # Private variables
        _repoPath = null
        _currentTree =
          branch: null
          sha: null


        constructor: (@repoUser, @repoName) ->
          _repoPath = "/repos/#{@repoUser}/#{@repoName}"


          # Uses the cache if branch has not been changed
          # -------
          @_updateTree = (branch) ->
            # Since this method always returns a promise, wrap the result in a deferred
            if branch is _currentTree.branch and _currentTree.sha
              return (new jQuery.Deferred()).resolve(_currentTree.sha)

            @getRef("heads/#{branch}")
            .then (sha) =>
              _currentTree.branch = branch
              _currentTree.sha = sha
              return sha
            # Return the promise
            .promise()


          # Get a particular reference
          # -------
          @getRef = (ref) ->
            _request('GET', "#{_repoPath}/git/refs/#{ref}", null)
            .then (res) =>
              return res.object.sha
            # Return the promise
            .promise()


          # Create a new reference
          # --------
          #
          #     {
          #       "ref": "refs/heads/my-new-branch-name",
          #       "sha": "827efc6d56897b048c772eb4087f854f46256132"
          #     }
          @createRef = (options) ->
            _request 'POST', "#{_repoPath}/git/refs", options


          # Delete a reference
          # --------
          #
          #     repo.deleteRef('heads/gh-pages')
          #     repo.deleteRef('tags/v1.0')
          @deleteRef = (ref) ->
            _request 'DELETE', "#{_repoPath}/git/refs/#{ref}", @options


          # List all branches of a repository
          # -------
          @getBranches = () ->
            _request('GET', "#{_repoPath}/git/refs/heads", null)
            .then (heads) =>
              return _.map(heads, (head) ->
                _.last head.ref.split("/")
              )
            # Return the promise
            .promise()


          # Retrieve the contents of a blob
          # -------
          @getBlob = (sha, isBase64) ->
            _request 'GET', "#{_repoPath}/git/blobs/#{sha}", null, {raw:true, isBase64:isBase64}


          # For a given file path, get the corresponding sha (blob for files, tree for dirs)
          # -------
          @getSha = (branch, path) ->
            # Just use head if path is empty
            return @getRef("heads/#{branch}") if path is ''

            @getTree("#{branch}?recursive=true")
            .then (tree) =>
              file = _.select(tree, (file) ->
                file.path is path
              )[0]
              return file?.sha if file?.sha

              # Return a promise that has failed if no sha was found
              (new jQuery.Deferred()).reject {message: 'SHA_NOT_FOUND'}

            # Return the promise
            .promise()


          # Retrieve the tree a commit points to
          # -------
          @getTree = (tree) ->
            _request('GET', "#{_repoPath}/git/trees/#{tree}", null)
            .then (res) =>
              return res.tree
            # Return the promise
            .promise()


          # Post a new blob object, getting a blob SHA back
          # -------
          @postBlob = (content, isBase64) ->
            if typeof (content) is 'string'
              content =
                content: content
                encoding: 'utf-8'

            content.encoding = 'base64' if isBase64

            _request('POST', "#{_repoPath}/git/blobs", content)
            .then (res) =>
              return res.sha
            # Return the promise
            .promise()


          # Update an existing tree adding a new blob object getting a tree SHA back
          # -------
          @updateTree = (baseTree, path, blob) ->
            data =
              base_tree: baseTree
              tree: [
                path: path
                mode: '100644'
                type: 'blob'
                sha: blob
              ]

            _request('POST', "#{_repoPath}/git/trees", data)
            .then (res) =>
              return res.sha
            # Return the promise
            .promise()


          # Post a new tree object having a file path pointer replaced
          # with a new blob SHA getting a tree SHA back
          # -------
          @postTree = (tree) ->
            _request('POST', "#{_repoPath}/git/trees", {tree: tree})
            .then (res) =>
              return res.sha
            # Return the promise
            .promise()


          # Create a new commit object with the current commit SHA as the parent
          # and the new tree SHA, getting a commit SHA back
          # -------
          @commit = (parent, tree, message) ->
            data =
              message: message
              author:
                name: @options.username

              parents: [parent]
              tree: tree

            _request('POST', "#{_repoPath}/git/commits", data)
            .then (res) =>
              _currentTree.sha = res.sha # update latest commit
              return res.sha
            # Return the promise
            .promise()


          # Update the reference of your head to point to the new commit SHA
          # -------
          @updateHead = (head, commit) ->
            _request 'PATCH', "#{_repoPath}/git/refs/heads/#{head}", {sha: commit}


          # List commits on a repository.
          # -------
          # Takes an object of optional paramaters:
          #
          # - `sha`: SHA or branch to start listing commits from
          # - `path`: Only commits containing this file path will be returned
          # - `author`: GitHub login, name, or email by which to filter by commit author
          # - `since`: ISO 8601 date - only commits after this date will be returned
          # - `until`: ISO 8601 date - only commits before this date will be returned
          @getCommits = (options={}) ->
            options = _.extend {}, options

            # Converts a Date object to a string
            getDate = (time) ->
              return time.toISOString() if Date == time.constructor
              return time

            options.since = getDate(options.since) if options.since
            options.until = getDate(options.until) if options.until

            queryString = ''
            if not _.isEmpty(options)
              params = []
              _.each _.pairs(options), ([key, value]) ->
                params.push "#{key}=#{encodeURIComponent(value)}"
              queryString = "?#{params.join('&')}"

            _request('GET', "#{_repoPath}/commits#{queryString}", null)
            # Return the promise
            .promise()


      # Branch Class
      # -------
      # Provides common methods that may require several git operations.
      class Branch
        # Local variables
        _git = null
        _getRef = -> throw 'BUG: No way to fetch branch ref!'

        constructor: (git, getRef) ->
          _git = git
          _getRef = getRef

          # List commits on a branch.
          # -------
          # Takes an object of optional paramaters:
          #
          # - `path`: Only commits containing this file path will be returned
          # - `author`: GitHub login, name, or email by which to filter by commit author
          # - `since`: ISO 8601 date - only commits after this date will be returned
          # - `until`: ISO 8601 date - only commits before this date will be returned
          @getCommits = (options={}) ->
            options = _.extend {}, options
            # Limit to the current branch
            _getRef()
            .then (branch) ->
              options.sha = branch
              _git.getCommits(options)

            # Return the promise
            .promise()


          # Read file at given path
          # -------
          # Set `isBase64=true` to get back a base64 encoded binary file
          @read = (path, isBase64) ->
            _getRef()
            .then (branch) =>
              _git.getSha(branch, path)
              .then (sha) =>
                _git.getBlob(sha, isBase64)
            # Return the promise
            .promise()


          # Remove a file from the tree
          # -------
          @remove = (path, message="Removed #{path}") ->
            _getRef()
            .then (branch) =>
              _git._updateTree(branch)
              .then (latestCommit) =>
                _git.getTree("#{latestCommit}?recursive=true")
                .then (tree) =>

                  # Update Tree
                  newTree = _.reject(tree, (ref) ->
                    ref.path is path
                  )
                  _.each newTree, (ref) ->
                    delete ref.sha  if ref.type is 'tree'

                  _git.postTree(newTree)
                  .then (rootTree) =>
                    _git.commit(latestCommit, rootTree, message)
                    .then (commit) =>
                      _git.updateHead(branch, commit)
                      .then (res) =>
                        # Finally, return the result
                        return res

            # Return the promise
            .promise()


          # Move a file to a new location
          # -------
          @move = (path, newPath, message="Moved #{path}") ->
            _getRef()
            .then (branch) =>
              _git._updateTree(branch)
              .then (latestCommit) =>
                _git.getTree("#{latestCommit}?recursive=true")
                .then (tree) =>

                  # Update Tree
                  _.each tree, (ref) ->
                    ref.path = newPath  if ref.path is path
                    delete ref.sha  if ref.type is 'tree'

                  _git.postTree(tree)
                  .then (rootTree) =>
                    _git.commit(latestCommit, rootTree, message)
                    .then (commit) =>
                      _git.updateHead(branch, commit)
                      .then (res) =>
                        # Finally, return the result
                        return res
            # Return the promise
            .promise()


          # Write file contents to a given branch and path
          # -------
          # To write base64 encoded data set `isBase64==true`
          @write = (path, content, message="Changed #{path}", isBase64) ->
            _getRef()
            .then (branch) =>
              _git._updateTree(branch)
              .then (latestCommit) =>
                _git.postBlob(content, isBase64)
                .then (blob) =>
                  _git.updateTree(latestCommit, path, blob)
                  .then (tree) =>
                    _git.commit(latestCommit, tree, message)
                    .then (commit) =>
                      _git.updateHead(branch, commit)
                      .then (res) =>
                        # Finally, return the result
                        return res
            # Return the promise
            .promise()


      # Repository Class
      # -------
      # Provides methods for operating on the entire repository
      # and ways to operate on a `Branch`.
      class Repository

        # Private fields
        _user = null
        _repo = null
        _client = null

        constructor: (@options) ->
          _user = @options.user
          _repo = @options.name
          _client = @options.client

          # Set the `git` instance variable
          @git = new GitRepo(_user, _repo)
          @repoPath = "/repos/#{_user}/#{_repo}"
          @currentTree =
            branch: null
            sha: null

          # List all branches of a repository
          # -------
          @getBranches = () -> @git.getBranches()


          # Get a branch of a repository
          # -------
          @getBranch = (branchName) ->
            getRef = =>
              deferred = new jQuery.Deferred()
              deferred.resolve(branchName)
              deferred
            new Branch(@git, getRef)


          # Get the default branch of a repository
          # -------
          @getDefaultBranch = () ->
            # Calls getInfo() to get the default branch name
            getRef = =>
              @getInfo()
              .then (info) =>
                return info.master_branch
            new Branch(@git, getRef)


          # Get repository information
          # -------
          @getInfo = () ->
            _request 'GET', @repoPath, null

          # Get contents
          # --------
          @contents = (branch, path) ->
            _request 'GET', "#{@repoPath}/contents?ref=#{branch}", {path: path}


          # Fork repository
          # -------
          @fork = () ->
            _request 'POST', "#{@repoPath}/forks", null


          # Create pull request
          # --------
          @createPullRequest = (options) ->
            _request 'POST', "#{@repoPath}/pulls", options


          # Get recent commits to the repository
          # --------
          # Takes an object of optional paramaters:
          #
          # - `path`: Only commits containing this file path will be returned
          # - `author`: GitHub login, name, or email by which to filter by commit author
          # - `since`: ISO 8601 date - only commits after this date will be returned
          # - `until`: ISO 8601 date - only commits before this date will be returned
          @getCommits = (options) ->
            @git.getCommits(options)


          # List repository events
          # -------
          @getEvents = () ->
            _request 'GET', "#{@repoPath}/events", null

          # List Issue events for a Repository
          # -------
          @getIssueEvents = () ->
            _request 'GET', "#{@repoPath}/issues/events", null

          # List events for a network of Repositories
          # -------
          @getNetworkEvents = () ->
            _request 'GET', "/networks/#{_owner}/#{_repo}/events", null


          # List unread notifications for authenticated user
          # -------
          # Optional arguments:
          #
          # - `all`: `true` to show notifications marked as read.
          # - `participating`: `true` to show only notifications in which the user is directly participating or mentioned.
          # - `since`: Optional time.
          @getNotifications = (options={}) ->
            # Converts a Date object to a string
            getDate = (time) ->
              return time.toISOString() if Date == time.constructor
              return time

            options.since = getDate(options.since) if options.since
            _request 'GET', "#{@repoPath}/notifications", options

          # List Collaborators
          # -------
          # When authenticating as an organization owner of an organization-owned repository,
          # all organization owners are included in the list of collaborators.
          # Otherwise, only users with access to the repository are returned in the collaborators list.
          @getCollaborators = () ->
            _request 'GET', "#{@repoPath}/collaborators", null

          @isCollaborator = (username=null) ->
            throw 'BUG: username is required' if not username
            _request 'GET', "#{@repoPath}/collaborators/#{username}", null, {isBoolean:true}


      # Gist API
      # -------
      class Gist
        constructor: (@options) ->
          id = @options.id
          @gistPath = "/gists/#{id}"


          # Read the gist
          # --------
          @read = () ->
            _request 'GET', @gistPath, null


          # Create the gist
          # --------
          #
          # Files contains a hash with the filename as the key and
          # `{content: 'File Contents Here'}` as the value.
          #
          # Example:
          #
          #     { "file1.txt": {
          #         "content": "String file contents"
          #       }
          #     }
          @create = (files, isPublic=false, description=null) ->
            options =
              isPublic: isPublic
              files: files
            options.description = description if description?
            _request 'POST', "/gists", options


          # Delete the gist
          # --------
          @delete = () ->
            _request 'DELETE', @gistPath, null


          # Fork a gist
          # --------
          @fork = () ->
            _request 'POST', "#{@gistPath}/forks", null


          # Update a gist with the new stuff
          # --------
          # `files` are files that make up this gist.
          # The key of which should be an optional string filename
          # and the value another optional hash with parameters:
          #
          # - `content`: Optional string - Updated file contents
          # - `filename`: Optional string - New name for this file.
          #
          # **NOTE:** All files from the previous version of the gist are carried
          # over by default if not included in the hash. Deletes can be performed
          # by including the filename with a null hash.
          @update = (files, description=null) ->
            options = {files: files}
            options.description = description if description?
            _request 'PATCH', @gistPath, options

          # Star a gist
          # -------
          @star = () ->
            _request 'PUT', "#{@gistPath}/star"

          # Unstar a gist
          # -------
          @unstar = () ->
            _request 'DELETE', "#{@gistPath}/star"

          # Check if a gist is starred
          # -------
          @isStarred = () ->
            _request 'GET', "#{@gistPath}", null, {isBoolean:true}


      # Top Level API
      # -------
      @getRepo = (user, repo) ->
        new Repository(
          user: user
          name: repo
          # Store this so we can get the active user.
          # Used for finding if the current user can collaborate
          client: @
        )

      # API for viewing info for arbitrary users or the current user
      # if no arguments are provided.
      @getUser = (username=null) ->
        if username
          new User(username)
        else
          new AuthenticatedUser()

      @getGist = (id) ->
        new Gist(id: id)



  # Return the class for assignment
  return Github

# Register with nodejs, requirejs, or as a global
# -------
# Depending on the context this file is called, register it appropriately

# If using this as a nodejs module use `jquery-deferred` and `najax` to make a jQuery object
if exports?
  _ = require 'underscore'
  jQuery = require 'jquery-deferred'
  najax = require 'najax'
  jQuery.ajax = najax
  # Encode using native Base64
  encode = (str) ->
    buffer = new Buffer str, 'binary'
    buffer.toString 'base64'
  Github = makeGithub _, jQuery, encode, 'github-client' # `User-Agent` (for nodejs)
  exports.new = (options) -> new Github(options)

# If requirejs is detected then load this module asynchronously
else if @define?
  # If the browser has the native Base64 encode function `btoa` use it.
  # Otherwise, try to use the javascript Base64 code.
  if @btoa
    @define 'github', ['underscore', 'jquery'], (_, jQuery) ->
      return makeGithub _, jQuery, @btoa
  else
    @define 'github', ['underscore', 'jquery', 'base64'], (_, jQuery, Base64) ->
      return makeGithub _, jQuery, Base64.encode

# If a global jQuery and underscore is loaded then use it
else if @_ and @jQuery and (@btoa or @Base64)
  # Use the `btoa` function if it is defined (Webkit/Mozilla) and fail back to
  # `Base64.encode` otherwise (IE)
  encode = @btoa or @Base64.encode
  @Github = makeGithub @_, @jQuery, encode

# Otherwise, throw an error
else
  err = (msg) ->
    console?.error? msg
    throw msg

  err 'Underscore not included' if not @_
  err 'jQuery not included' if not @jQuery
  err 'Base64 not included' if not @Base64 and not @btoa
