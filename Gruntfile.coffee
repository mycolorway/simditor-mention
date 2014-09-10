module.exports = (grunt) ->

  grunt.initConfig

    pkg: grunt.file.readJSON 'package.json'

    coffee:
      mention:
        files:
          'lib/simditor-mention.js': 'src/simditor-mention.coffee'
          'vendor/bower/simple-util/lib/util.js': 'vendor/bower/simple-util/src/util.coffee'
    sass:
      mention:
        options:
          style: 'expanded'
          bundleExec: true
        files:
          'styles/simditor-mention.css': 'styles/simditor-mention.scss'
    watch:
      scripts:
        files: ['src/*.coffee']
        tasks: ['coffee']
      styles:
        files: ['styles/*.scss']
        tasks: ['sass']

  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-sass'
  grunt.loadNpmTasks 'grunt-contrib-watch'

  grunt.registerTask 'default', ['coffee','sass','watch']
