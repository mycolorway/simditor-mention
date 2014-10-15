module.exports = (grunt) ->

  grunt.initConfig

    pkg: grunt.file.readJSON 'package.json'

    sass:
      styles:
        options:
          style: 'expanded'
          bundleExec: true
          sourcemap: 'none'
        files:
          'styles/simditor-mention.css': 'styles/simditor-mention.scss'
    coffee:
      src:
        options:
          bare: true
        files:
          'lib/simditor-mention.js': 'src/simditor-mention.coffee'
    watch:
      styles:
        files: ['styles/*.scss']
        tasks: ['sass']
      src:
        files: ['src/*.coffee']
        tasks: ['coffee:src']

    umd:
      all:
        src: 'lib/simditor-mention.js'
        template: 'umd'
        amdModuleId: 'Simditor'
        objectToExport: 'Simditor'
        globalAlias: 'Simditor'
        deps:
          'default': ['$', 'SimpleModule']
          amd: ['jquery', 'simple-module', 'simditor']
          cjs: ['jquery', 'simple-module', 'simditor']
          global:
            items: ['jQuery', 'SimpleModule']
            prefix: ''

  grunt.loadNpmTasks 'grunt-contrib-sass'
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-umd'

  grunt.registerTask 'default', ['sass', 'coffee', 'umd', 'watch']
