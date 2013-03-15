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
class Github

  # HTTP Request Abstraction
  # =======
  #
  _request = null

  # These are updated whenever a request is made
  listeners = []

  constructor: (options) ->
    # Provide an option to override the default URL
    options.rootURL = options.rootURL or 'https://api.github.com'

    # **HACK:** Reset rateLimit listeners when credentials change
    listeners = []

    _request = (method, path, data, raw) ->
      getURL = ->
        url = options.rootURL + path
        url + ((if (/\?/).test(url) then '&' else '?')) + (new Date()).getTime()

      xhr = jQuery.ajax {
        url: getURL()
        type: method
        #accepts: 'application/vnd.github.raw'
        contentType: 'application/json'
        headers: {
          'Accept': 'application/vnd.github.raw'
        }

        processData: false # Don't convert to QueryString
        data: !raw and data and JSON.stringify(data) or data
        dataType: 'json' unless raw

        beforeSend: (xhr) =>
          if (options.auth is 'oauth' and options.token) or (options.auth is 'basic' and options.username and options.password)
            if options.auth is 'oauth'
              auth = "token #{options.token}"
            else
              auth = 'Basic ' + Base64.encode("#{options.username}:#{options.password}")
            xhr.setRequestHeader 'Authorization', auth

        # Update the `rateLimit*`
        complete: (xhr, xmlhttpr) =>
          rateLimit = parseFloat(xhr.getResponseHeader 'X-RateLimit-Limit')
          rateLimitRemaining = parseFloat(xhr.getResponseHeader 'X-RateLimit-Remaining')

          jQuery.each listeners, (i, listener) ->
            listener(rateLimitRemaining, rateLimit)
      }


      # Parse the error if one occurs
      xhr
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

  # User API
  # =======
  class User
    repos: ->
      _request 'GET', '/user/repos?type=all&per_page=1000&sort=updated', null

    # List user organizations
    # -------
    orgs: ->
      _request 'GET', '/user/orgs', null

    # List authenticated user's gists
    # -------
    gists: ->
      _request 'GET', '/gists', null

    # Show user information
    # -------
    show: (username) ->
      command = (if username then "/users/#{username}" else '/user')
      _request 'GET', command, null

    # List user repositories
    # -------
    userRepos: (username) ->
      _request 'GET', "/users/#{username}/repos?type=all&per_page=1000&sort=updated", null

    # List a user's gists
    # -------
    userGists: (username) ->
      _request 'GET', "/users/#{username}/gists", null

    # List organization repositories
    # -------
    orgRepos: (orgname) ->
      _request 'GET', "/orgs/#{orgname}/repos?type=all&per_page=1000&sort=updated&direction=desc", null

    # Follow user
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


    # Retrieve the contents of a blob
    # -------
    getBlob: (sha) ->
      _request 'GET', "#{@repoPath}/git/blobs/#{sha}", null, 'raw'


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
    postBlob: (content) ->
      if typeof (content) is 'string'
        content =
          content: content
          encoding: 'utf-8'

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


    # Show repository information
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
    read: (branch, path) ->
      @getSha(branch, path)
      .then (sha) =>
        @getBlob(sha)
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
    write: (branch, path, content, message) ->
      @_updateTree(branch)
      .then (latestCommit) =>
        @postBlob(content)
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

  getUser: ->
    new User()

  getGist: (id) ->
    new Gist(id: id)

@Github = Github
