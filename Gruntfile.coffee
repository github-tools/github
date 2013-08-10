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
    'coffee'
  ]

  # Default
  # -----
  grunt.registerTask 'default', [
    'coffeelint'
    'clean'
    'coffee'
  ]
