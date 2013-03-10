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
window.Github = class Github

  # HTTP Request Abstraction
  # =======
  #
  _request = null

  # These are updated whenever a request is made
  listeners = []

  constructor: (options) ->
    # Provide an option to override the default URL
    options.rootURL = options.rootURL or 'https://api.github.com'

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
        data: data
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



      deferred = new jQuery.Deferred()
      xhr.done -> deferred.resolve.apply @, arguments
      xhr.fail (xhr, msg, desc) ->
        if xhr.getResponseHeader('Content-Type') != 'application/json; charset=utf-8'
          return deferred.reject xhr.responseText, xhr.status, xhr

        json = JSON.parse xhr.responseText
        deferred.reject json, xhr.status, xhr
      # Return the promise
      return deferred.promise()

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
    updateTree = (branch) ->
      deferred = new jQuery.Deferred()
      return deferred.resolve(@currentTree.sha) if branch is @currentTree.branch and @currentTree.sha

      @getRef("heads/#{branch}")
      .done (sha) =>
        @currentTree.branch = branch
        @currentTree.sha = sha
        deferred.resolve sha
      .fail => deferred.reject.apply @, arguments
      return deferred.promise()


    # Get a particular reference
    # -------
    getRef: (ref) ->
      deferred = new jQuery.Deferred()

      _request('GET', "#{@repoPath}/git/refs/#{ref}", null)
      .done (res) =>
        deferred.resolve res.object.sha
      .fail => deferred.reject.apply @, arguments
      return deferred.promise()


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
      deferred = new jQuery.Deferred()

      _request('GET', "#{@repoPath}/git/refs/heads", null)
      .done (heads) =>
        deferred.resolve _.map(heads, (head) ->
          _.last head.ref.split("/")
        )
      .fail => deferred.reject.apply @, arguments
      return deferred.promise()


    # Retrieve the contents of a blob
    # -------
    getBlob: (sha) ->
      _request 'GET', "#{@repoPath}/git/blobs/#{sha}", null, 'raw'


    # For a given file path, get the corresponding sha (blob for files, tree for dirs)
    # -------
    getSha: (branch, path) ->

      # Just use head if path is empty
      return @getRef "heads/#{branch}" if path is ''

      deferred = new jQuery.Deferred()

      @getTree("#{branch}?recursive=true")
      .done (tree) =>
        file = _.select(tree, (file) ->
          file.path is path
        )[0]
        deferred.resolve file?.sha or null
      .fail => deferred.reject.apply @, arguments
      return deferred.promise()



    # Retrieve the tree a commit points to
    # -------
    getTree: (tree) ->
      deferred = new jQuery.Deferred()
      _request('GET', "#{@repoPath}/git/trees/#{tree}", null)
      .done (res) =>
        deferred.resolve res.tree
      .fail => deferred.reject.apply @, arguments
      return deferred.promise()


    # Post a new blob object, getting a blob SHA back
    # -------
    postBlob: (content) ->
      if typeof (content) is 'string'
        content =
          content: content
          encoding: 'utf-8'
      deferred = new jQuery.Deferred()

      _request('POST', "#{@repoPath}/git/blobs", content)
      .done (res) =>
        deferred.resolve res.sha
      .fail => deferred.reject.apply @, arguments
      return deferred.promise()


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

      deferred = new jQuery.Deferred()

      _request('POST', "#{@repoPath}/git/trees", data)
      .done (res) =>
        deferred.resolve res.sha
      .fail => deferred.reject.apply @, arguments
      return deferred.promise()


    # Post a new tree object having a file path pointer replaced
    # with a new blob SHA getting a tree SHA back
    # -------
    postTree: (tree) ->
      deferred = new jQuery.Deferred()
      _request('POST', "#{@repoPath}/git/trees", {tree: tree})
      .done (res) =>
        deferred.resolve res.sha
      .fail => deferred.reject.apply @, arguments
      return deferred.promise()


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

      deferred = new jQuery.Deferred()

      _request('POST', "#{@repoPath}/git/commits", data)
      .done (res) =>
        @currentTree.sha = res.sha # update latest commit
        deferred.resolve res.sha
      .fail => deferred.reject.apply @, arguments
      return deferred.promise()


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
      deferred = new jQuery.Deferred()

      @getSha(branch, path)
      .done (sha) =>
        deferred.fail "not found" unless sha
        @getBlob(sha)
        .done (content) =>
          deferred.resolve content, sha
        .fail => deferred.reject.apply @, arguments
      .fail => deferred.reject.apply @, arguments
      return deferred.promise()


    # Remove a file from the tree
    # -------
    remove: (branch, path) ->
      deferred = new jQuery.Deferred()

      updateTree(branch)
      .done (latestCommit) =>
        @getTree("#{latestCommit}?recursive=true")
        .done (tree) =>

          # Update Tree
          newTree = _.reject(tree, (ref) ->
            ref.path is path
          )
          _.each newTree, (ref) ->
            delete ref.sha  if ref.type is 'tree'

          @postTree(newTree)
          .done (rootTree) =>
            @commit(latestCommit, rootTree, "Deleted #{path}")
            .done (commit) =>
              @updateHead(branch, commit)
              .done (res) =>
                deferred.resolve res
              .fail => deferred.reject.apply @, arguments
            .fail => deferred.reject.apply @, arguments
          .fail => deferred.reject.apply @, arguments
        .fail => deferred.reject.apply @, arguments
      .fail => deferred.reject.apply @, arguments

      return deferred.promise()


    # Move a file to a new location
    # -------
    move: (branch, path, newPath) ->
      deferred = new jQuery.Deferred()

      updateTree(branch)
      .done (latestCommit) =>
        @getTree("#{latestCommit}?recursive=true")
        .done (tree) =>

          # Update Tree
          _.each tree, (ref) ->
            ref.path = newPath  if ref.path is path
            delete ref.sha  if ref.type is 'tree'

          @postTree(tree)
          .done (rootTree) =>
            @commit(latestCommit, rootTree, "Deleted #{path}")
            .done (commit) =>
              @updateHead(branch, commit)
              .done (res) =>
                deferred.resolve res
              .fail => deferred.reject.apply @, arguments
            .fail => deferred.reject.apply @, arguments
          .fail => deferred.reject.apply @, arguments
        .fail => deferred.reject.apply @, arguments
      .fail => deferred.reject.apply @, arguments
      return deferred.promise()


    # Write file contents to a given branch and path
    # -------
    write: (branch, path, content, message) ->
      deferred = new jQuery.Deferred()

      updateTree(branch)
      .done (latestCommit) =>
        @postBlob(content)
        .done (blob) =>
          @updateTree(latestCommit, path, blob)
          .done (tree) =>
            @commit(latestCommit, tree, message)
            .done (commit) =>
              @updateHead(branch, commit)
              .done (res) =>
                deferred.resolve res
              .fail => deferred.reject.apply @, arguments
            .fail => deferred.reject.apply @, arguments
          .fail => deferred.reject.apply @, arguments
        .fail => deferred.reject.apply @, arguments
      .fail => deferred.reject.apply @, arguments
      return deferred.promise()


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
