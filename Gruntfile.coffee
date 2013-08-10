module.exports = (grunt) ->

  fs = require('fs')
  pkg = require('./package.json')

  # Project configuration.
  grunt.initConfig
    pkg: pkg

    # Lint
    # ----

    # CoffeeLint
    coffeelint:
      options:
        arrow_spacing:
          level: 'error'
        line_endings:
          level: 'error'
          value: 'unix'
        max_line_length:
          level: 'error'
          value: 150

      source: ['octokit.coffee']
      grunt: 'Gruntfile.coffee'


    # Dist
    # ----


    # Clean
    clean:
      files:
        src: [
          'octokit.js'
          'octokit.js.map'
        ]
        filter: 'isFile'


    # Compile CoffeeScript to JavaScript
    coffee:
      compile:
        options:
          sourceMap: true
        files:
          'octokit.js': ['octokit.coffee']

    # Release a new version and push upstream
    bump:
      options:
        # Safety
        commit: false
        push: false

        commitFiles: ['package.json', 'octokit.js', 'octokit.js.map']


  # Dependencies
  # ============
  for name of pkg.dependencies when name.substring(0, 6) is 'grunt-'
    grunt.loadNpmTasks(name)
  for name of pkg.devDependencies when name.substring(0, 6) is 'grunt-'
    if grunt.file.exists("./node_modules/#{name}")
      grunt.loadNpmTasks(name)

  # Tasks
  # =====

  # Travis CI
  # -----
  grunt.registerTask 'test', [
    'coffeelint'
  ]

  # Dist
  # -----
  grunt.registerTask 'dist', [
    'clean'
    'coffeelint'
    'coffee'
    'bump'
  ]

  # Default
  # -----
  grunt.registerTask 'default', [
    'coffeelint'
    'clean'
    'coffee'
  ]
