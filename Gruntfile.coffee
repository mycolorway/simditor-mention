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
      spec:
        options:
          bare: true
        files:
          'spec/mention-spec.js': 'spec/mention-spec.coffee'

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

    jasmine:
      test:
        src: ['lib/**/*.js']
        options:
          outfile: 'spec/index.html'
          styles: [
            'styles/simditor-mention.css'
            'vendor/bower/fontawesome/css/font-awesome.css'
            'vendor/bower/simditor/styles/simditor.css'
          ]
          specs: 'spec/mention-spec.js'
          vendor: [
            'vendor/bower/jquery/dist/jquery.min.js'
            'vendor/bower/simple-module/lib/module.js'
            'vendor/bower/simple-hotkeys/lib/hotkeys.js'
            'vendor/bower/simditor/lib/simditor.js'
            'vendor/bower/bililiteRange/bililiteRange.js'
            'vendor/bower/bililiteRange/jquery.sendkeys.js'
            'vendor/bower/jasmine-jquery/lib/jasmine-jquery.js'
          ]


    watch:
      styles:
        files: ['styles/*.scss']
        tasks: ['sass']
      src:
        files: ['src/*.coffee']
        tasks: ['coffee:src', 'umd']
      spec:
        files: ['spec/**/*.coffee']
        tasks: ['coffee:spec']
#      jasmine:
#        files: ['lib/**/*.js', 'spec/**/*.js']
#        tasks: 'jasmine'

  grunt.loadNpmTasks 'grunt-contrib-sass'
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-umd'
  grunt.loadNpmTasks 'grunt-contrib-jasmine'

  grunt.registerTask 'default', ['sass', 'coffee', 'umd', 'jasmine', 'watch']
  grunt.registerTask 'test', ['sass', 'coffee', 'umd', 'watch']