# Github Promise API
# ======
#
# This class provides a Promise API for accessing github (see `jQuery.Deferred()`).
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
    listeners = []

    constructor: (options={}) ->
      # Provide an option to override the default URL
      options.rootURL = options.rootURL or 'https://api.github.com'

      # **HACK:** Reset rateLimit listeners when credentials change
      listeners = []

      _request = (method, path, data, raw, isBase64) ->
        getURL = ->
          url = options.rootURL + path
          url + ((if (/\?/).test(url) then '&' else '?')) + (new Date()).getTime()

        # Support binary data by overriding the response mimeType
        mimeType = undefined
        mimeType = 'text/plain; charset=x-user-defined' if isBase64

        headers = {
          'Accept': 'application/vnd.github.raw'
        }

        # Set the `User-Agent` because it is required and NodeJS
        # does not send one by default.
        # See http://developer.github.com/v3/#user-agent-required
        headers['User-Agent'] = userAgent if userAgent

        if (options.auth is 'oauth' and options.token) or (options.auth is 'basic' and options.username and options.password)
          if options.auth is 'oauth'
            auth = "token #{options.token}"
          else
            auth = 'Basic ' + base64encode("#{options.username}:#{options.password}")
          headers['Authorization'] = auth


        xhr = jQuery.ajax {
          url: getURL()
          type: method
          #accepts: 'application/vnd.github.raw'
          contentType: 'application/json'
          mimeType: mimeType
          headers: headers

          processData: false # Don't convert to QueryString
          data: !raw and data and JSON.stringify(data) or data
          dataType: 'json' unless raw

          # Update the `rateLimit*`
          complete: (xhr, xmlhttpr) =>
            rateLimit = parseFloat(xhr.getResponseHeader 'X-RateLimit-Limit')
            rateLimitRemaining = parseFloat(xhr.getResponseHeader 'X-RateLimit-Remaining')

            for listener in listeners
              listener(rateLimitRemaining, rateLimit)
        }


        # Parse the error if one occurs
        xhr
        .then (data, textStatus, jqXHR) ->
          ret = new jQuery.Deferred()
          # Convert the response to a Base64 encoded string
          if 'GET' == method and isBase64
            # Convert raw data to binary chopping off the higher-order bytes in each char.
            # Useful for Base64 encoding.
            converted = ''
            for i in [0..data.length]
              converted += String.fromCharCode(data.charCodeAt(i) & 0xff)
            converted

            ret.resolve(converted, textStatus, jqXHR)
          else
            ret.resolve(data, textStatus, jqXHR)
        .then null, (xhr, msg, desc) ->
          if xhr.getResponseHeader('Content-Type') != 'application/json; charset=utf-8'
            return {error: xhr.responseText, status: xhr.status, _xhr: xhr}

          json = JSON.parse xhr.responseText
          return {error: json, status: xhr.status, _xhr: xhr}

        # Return the promise
        .promise()

    # Add a listener that fires when the `rateLimitRemaining` changes as a result of
    # communicating with github.
    onRateLimitChanged: (listener) ->
      listeners.push listener

    # Request a random zen quote (test the API)
    # -------
    getZen: ->
      # Send `data` to `null` and the `raw` flag to `true`
      _request 'GET', '/zen', null, true

    # List organization repositories
    # -------
    getOrgRepos: (orgName) ->
      _request 'GET', "/orgs/#{orgName}/repos?type=all&per_page=1000&sort=updated&direction=desc", null


    # Github Users API
    # =======
    class User

      # Private var that stores the root path
      _rootPath = null

      # Store the username
      constructor: (username=null) ->
        if username
          _rootPath = "/users/#{username}"
        else
          _rootPath = "/user"

      # Retrieve user information
      # -------
      getInfo: ->
        _request 'GET', "#{_rootPath}", null

      # List user repositories
      # -------
      getRepos: ->
        _request 'GET', "#{_rootPath}/repos?type=all&per_page=1000&sort=updated", null

      # List user organizations
      # -------
      getOrgs: ->
        _request 'GET', "#{_rootPath}/orgs", null

      # List a user's gists
      # -------
      getGists: ->
        _request 'GET', "#{_rootPath}/gists", null

      # List followers of a user
      # -------
      getFollowers: ->
        _request 'GET', "#{_rootPath}/followers", null

      # List who this user is following
      # -------
      getFollowing: ->
        _request 'GET', "#{_rootPath}/following", null


    # Authenticated User API
    # =======
    class AuthenticatedUser extends User

      # List authenticated user's gists
      # -------
      getGists: ->
        _request 'GET', '/gists', null

      # List unread notifications for authenticated user
      # -------
      getNotifications: ->
        _request 'GET', '/notifications', null

      # Follow a user
      # -------
      follow: (username) ->
        _request 'PUT', "/user/following/#{username}", null

      # Unfollow user
      # -------
      unfollow: (username) ->
        _request 'DELETE', "/user/following/#{username}", null


    # Repository API
    # =======
    class Repository
      constructor: (@options) ->
        repo = @options.name
        user = @options.user
        @repoPath = "/repos/#{user}/#{repo}"
        @currentTree =
          branch: null
          sha: null


      # Uses the cache if branch has not been changed
      # -------
      _updateTree: (branch) ->
        # Since this method always returns a promise, wrap the result in a deferred
        return (new jQuery.Deferred()).resolve(@currentTree.sha) if branch is @currentTree.branch and @currentTree.sha

        @getRef("heads/#{branch}")
        .then (sha) =>
          @currentTree.branch = branch
          @currentTree.sha = sha
          return sha
        # Return the promise
        .promise()

      # Get a particular reference
      # -------
      getRef: (ref) ->
        _request('GET', "#{@repoPath}/git/refs/#{ref}", null)
        .then (res) =>
          return res.object.sha
        # Return the promise
        .promise()


      # Create a new reference
      # --------
      #
      # {
      #   "ref": "refs/heads/my-new-branch-name",
      #   "sha": "827efc6d56897b048c772eb4087f854f46256132"
      # }
      createRef: (options) ->
        _request 'POST', "#{@repoPath}/git/refs", options


      # Delete a reference
      # --------
      #
      # repo.deleteRef('heads/gh-pages')
      # repo.deleteRef('tags/v1.0')
      deleteRef: (ref) ->
        _request 'DELETE', "#{@repoPath}/git/refs/#{ref}", @options


      # List all branches of a repository
      # -------
      listBranches: ->
        _request('GET', "#{@repoPath}/git/refs/heads", null)
        .then (heads) =>
          return _.map(heads, (head) ->
            _.last head.ref.split("/")
          )
        # Return the promise
        .promise()


      # List commits on a repository.
      # -------
      # Takes an object of optional paramaters:
      #
      # - sha: SHA or branch to start listing commits from
      # - path: Only commits containing this file path will be returned
      # - author: GitHub login, name, or email by which to filter by commit author
      # - since: ISO 8601 date - only commits after this date will be returned
      # - until: ISO 8601 date - only commits before this date will be returned
      getCommits: (options={}) ->
        options = _.extend {}, options

        # Convert a Date object to a string
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

        _request('GET', "#{@repoPath}/commits#{queryString}", null)

        # Return the promise
        .promise()


      # Retrieve the contents of a blob
      # -------
      getBlob: (sha, isBase64) ->
        _request 'GET', "#{@repoPath}/git/blobs/#{sha}", null, 'raw', isBase64


      # For a given file path, get the corresponding sha (blob for files, tree for dirs)
      # -------
      getSha: (branch, path) ->
        # Just use head if path is empty
        return @getRef "heads/#{branch}" if path is ''

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
      getTree: (tree) ->
        _request('GET', "#{@repoPath}/git/trees/#{tree}", null)
        .then (res) =>
          return res.tree
        # Return the promise
        .promise()


      # Post a new blob object, getting a blob SHA back
      # -------
      postBlob: (content, isBase64) ->
        if typeof (content) is 'string'
          content =
            content: content
            encoding: 'utf-8'

        content.encoding = 'base64' if isBase64

        _request('POST', "#{@repoPath}/git/blobs", content)
        .then (res) =>
          return res.sha
        # Return the promise
        .promise()


      # Update an existing tree adding a new blob object getting a tree SHA back
      # -------
      updateTree: (baseTree, path, blob) ->
        data =
          base_tree: baseTree
          tree: [
            path: path
            mode: '100644'
            type: 'blob'
            sha: blob
          ]

        _request('POST', "#{@repoPath}/git/trees", data)
        .then (res) =>
          return res.sha
        # Return the promise
        .promise()


      # Post a new tree object having a file path pointer replaced
      # with a new blob SHA getting a tree SHA back
      # -------
      postTree: (tree) ->
        _request('POST', "#{@repoPath}/git/trees", {tree: tree})
        .then (res) =>
          return res.sha
        # Return the promise
        .promise()


      # Create a new commit object with the current commit SHA as the parent
      # and the new tree SHA, getting a commit SHA back
      # -------
      commit: (parent, tree, message) ->
        data =
          message: message
          author:
            name: @options.username

          parents: [parent]
          tree: tree

        _request('POST', "#{@repoPath}/git/commits", data)
        .then (res) =>
          @currentTree.sha = res.sha # update latest commit
          return res.sha
        # Return the promise
        .promise()


      # Update the reference of your head to point to the new commit SHA
      # -------
      updateHead: (head, commit) ->
        _request 'PATCH', "#{@repoPath}/git/refs/heads/#{head}", {sha: commit}


      # Get repository information
      # -------
      getInfo: () ->
        _request 'GET', @repoPath, null

      # Get repository information (DEPRECATED)
      # -------
      show: () ->
        _request 'GET', @repoPath, null


      # Get contents
      # --------
      contents: (branch, path) ->
        _request 'GET', "#{@repoPath}/contents?ref=#{branch}", {path: path}


      # Fork repository
      # -------
      fork: ->
        _request 'POST', "#{@repoPath}/forks", null


      # Create pull request
      # --------
      createPullRequest: (options) ->
        _request 'POST', "#{@repoPath}/pulls", options


      # Read file at given path
      # -------
      # Set `isBase64=true` to get back a base64 encoded binary file
      read: (branch, path, isBase64) ->
        @getSha(branch, path)
        .then (sha) =>
          @getBlob(sha, isBase64)
        # Return the promise
        .promise()


      # Remove a file from the tree
      # -------
      remove: (branch, path) ->
        @_updateTree(branch)
        .then (latestCommit) =>
          @getTree("#{latestCommit}?recursive=true")
          .then (tree) =>

            # Update Tree
            newTree = _.reject(tree, (ref) ->
              ref.path is path
            )
            _.each newTree, (ref) ->
              delete ref.sha  if ref.type is 'tree'

            @postTree(newTree)
            .then (rootTree) =>
              @commit(latestCommit, rootTree, "Deleted #{path}")
              .then (commit) =>
                @updateHead(branch, commit)
                .then (res) =>
                  # Finally, return the result
                  return res

        # Return the promise
        .promise()


      # Move a file to a new location
      # -------
      move: (branch, path, newPath) ->
        @_updateTree(branch)
        .then (latestCommit) =>
          @getTree("#{latestCommit}?recursive=true")
          .then (tree) =>

            # Update Tree
            _.each tree, (ref) ->
              ref.path = newPath  if ref.path is path
              delete ref.sha  if ref.type is 'tree'

            @postTree(tree)
            .then (rootTree) =>
              @commit(latestCommit, rootTree, "Deleted #{path}")
              .then (commit) =>
                @updateHead(branch, commit)
                .then (res) =>
                  # Finally, return the result
                  return res
        # Return the promise
        .promise()


      # Write file contents to a given branch and path
      # -------
      # To write base64 encoded data set `isBase64==true`
      write: (branch, path, content, message, isBase64) ->
        @_updateTree(branch)
        .then (latestCommit) =>
          @postBlob(content, isBase64)
          .then (blob) =>
            @updateTree(latestCommit, path, blob)
            .then (tree) =>
              @commit(latestCommit, tree, message)
              .then (commit) =>
                @updateHead(branch, commit)
                .then (res) =>
                  # Finally, return the result
                  return res
        # Return the promise
        .promise()


    class Gist
      constructor: (@options) ->
        id = @options.id
        @gistPath = "/gists/#{id}"


      # Read the gist
      # --------
      read: ->
        _request 'GET', @gistPath, null


      # Create the gist
      # --------
      # {
      #  "description": "the description for this gist",
      #    "public": true,
      #    "files": {
      #      "file1.txt": {
      #        "content": "String file contents"
      #      }
      #    }
      # }
      create: (options) ->
        _request 'POST', "/gists", options


      # Delete the gist
      # --------
      delete: ->
        _request 'DELETE', @gistPath, null


      # Fork a gist
      # --------
      fork: ->
        _request 'POST', "#{@gistPath}/fork", null


      # Update a gist with the new stuff
      # --------
      update: (options) ->
        _request 'PATCH', @gistPath, options


    # Top Level API
    # -------
    getRepo: (user, repo) ->
      new Repository(
        user: user
        name: repo
      )

    # API for viewing info for arbitrary users or the current user
    # if no arguments are provided.
    getUser: (username=null) ->
      if username
        new User(username)
      else
        new AuthenticatedUser()

    getGist: (id) ->
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
else if define?
  # If the browser has the native Base64 encode function `btoa` use it.
  # Otherwise, try to use the javascript Base64 code.
  if @btoa
    define 'github', ['underscore', 'jquery'], (_, jQuery) ->
      return makeGithub _, jQuery, @btoa
  else
    define 'github', ['underscore', 'jquery', 'base64'], (_, jQuery, Base64) ->
      return makeGithub _, jQuery, Base64.encode

# If a global jQuery and underscore is loaded then use it
else if @_ and @jQuery and (@btoa or @Base64)
  # Use the `btoa` function if it is defined (Webkit/Mozilla) and fail back to
  # `Base64.encode` otherwise (IE)
  encode = @btoa or Base64.encode
  @Github = makeGithub @_, @jQuery, encode

# Otherwise, throw an error
else
  err = (msg) ->
    console?.error? msg
    throw msg

  err 'Underscore not included' if not @_
  err 'jQuery not included' if not @jQuery
  err 'Base64 not included' if not @Base64 and not @btoa
