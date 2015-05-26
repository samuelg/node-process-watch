'use strict';

module.exports = function(grunt) {

  // threshold for failing coverage
  var coverageThreshold = 80;

  // project configuration.
  grunt.initConfig({
    // task configuration.
    jshint: {
      options: {
        jshintrc: true
      },
      all: ['Gruntfile.js', 'lib/**/*.js', 'test/**/*.js']
    },

    mochaTest: {
      test: {
        options: {
          mocha: require('mocha'),
          reporter: 'spec',
          timeout: 2000
        },
        src: ['test/**/*.js']
      }
    },

    'mocha_istanbul': {
      coverage: {
        src: 'test',
        options: {
          check: {
            lines: coverageThreshold,
            statements: coverageThreshold,
            branches: coverageThreshold,
            functions: coverageThreshold
          }
        }
      }
    }
  });

  // these plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-mocha-istanbul');

  // default task.
  grunt.registerTask('default', ['jshint', 'mochaTest']);

  // custom tasks
  grunt.registerTask('coverage', ['mocha_istanbul:coverage']);
};
