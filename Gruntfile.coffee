module.exports = (grunt) ->

  grunt.initConfig

    pkg: grunt.file.readJSON 'package.json'
    name: 'simditor-mention'

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
      spec:
        files:
          'spec/<%= name %>-spec.js': 'spec/<%= name %>-spec.coffee'

    umd:
      all:
        src: 'lib/simditor-mention.js'
        template: 'umd'
        amdModuleId: 'simditor-mention'
        objectToExport: 'SimditorMention'
        globalAlias: 'SimditorMention'
        deps:
          'default': ['$', 'Simditor', 'SimpleModule']
          amd: ['jquery', 'simditor', 'simple-module']
          cjs: ['jquery', 'simditor', 'simple-module']
          global:
            items: ['jQuery', 'Simditor', 'SimpleModule']
            prefix: ''

    watch:
      styles:
        files: ['styles/*.scss']
        tasks: ['sass']
      src:
        files: ['src/*.coffee']
        tasks: ['coffee:src', 'umd', 'jasmine']

    jasmine:
      test:
        src: ['lib/**/*.js']
        options:
          outfile: 'spec/index.html'
          styles: 'styles/<%= name %>.css'
          specs: 'spec/<%= name %>-spec.js'
          vendor: [
            'vendor/bower/jquery/dist/jquery.min.js'
            'vendor/bower/jasmine-jquery/lib/jasmine-jquery.js'
            'vendor/bower/simple-module/lib/module.js'
            'vendor/bower/simple-uploader/lib/uploader.js'
            'vendor/bower/simple-hotkeys/lib/hotkeys.js'
            'vendor/bower/simditor/lib/simditor.js'
          ]
          helpers: [
            'spec/mock-ajax.js'
          ]

  grunt.loadNpmTasks 'grunt-contrib-sass'
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-contrib-jasmine'
  grunt.loadNpmTasks 'grunt-umd'

  grunt.registerTask 'default', ['sass', 'coffee', 'umd', 'jasmine', 'watch']
  grunt.registerTask 'test', ['sass', 'coffee', 'umd', 'jasmine']
