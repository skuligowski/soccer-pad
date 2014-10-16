var fs = require('fs'),
  path = require('path'),
  _ = require('lodash');

module.exports = function (grunt) {

  var getScriptsFiles = function(cwd, paths) {
    var files = grunt.file.expand({cwd: cwd}, paths),
          filesStrArr = [];

    for (var i = 0; i < files.length; i++)
      filesStrArr[i] = "'"+files[i]+"'"

    return filesStrArr.join(',\n');
  }

  var getConfig = function() {
    var config = {};

    return {
      add: function(taskUid, confObj) {
        var taskUidParts = taskUid.split(':'),
            taskId = taskUidParts[0],
            targetId = taskUidParts[1],
            task = config[taskId];

        if (!task)
          task = config[taskId] = {};

        if (targetId)
          task[targetId] = confObj;
        else
          config[taskId] = confObj;
      },
      get: function() {
        return config;
      }
    }
  }

  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-htmlrender');
  grunt.loadNpmTasks('grunt-nodemon');

  grunt.registerTask('build:app', ['clean:app', 'copy:app', 'less:build', 'htmlrender:build']);
  grunt.registerTask('build', ['clean:all', 'copy:assets', 'build:app']);
  grunt.registerTask('release', ['clean:all', 'copy:assets', 'less:release', 'uglify:app', 'htmlrender:release']);
  grunt.registerTask('watch:build', ['build', 'concurrent:app']);
  grunt.registerTask('default', ['watch:build']);

  grunt.registerTask('help', function() {
    grunt.log.ok('grunt - the same as grunt watch:app');
    grunt.log.ok('grunt build - complete build');
    grunt.log.ok('grunt release - complete build for production');
  });

  var config = getConfig();

  config.add('timestamp', new Date().getTime());

  config.add('htmlrender:build', {
    options: {
      src: ['src/**/*.html'],
      vars: {
        scriptsPath: 'scripts.html',
        scriptsFiles: function() { return getScriptsFiles('dist', ['app/**/*.js']) },
        stylesPath: 'styles.html'
      }
    },
    files: [{
        expand: true,
        cwd: 'src',
        src: ['*.html'],
        dest: 'dist',
        ext: '.html'
    }]
  });

  config.add('htmlrender:release', {
    options: {
      src: ['src/**/*.html'],
      vars: {
        scriptsPath: 'scripts.min.html',
        scriptsFiles: function() { return getScriptsFiles('dist', ['app/**/*.js']) },
        stylesPath: 'styles.min.html',
        timestamp: '<%=timestamp%>'
      }
    },
    files: [{
        expand: true,
        cwd: 'src',
        src: ['*.html'],
        dest: 'dist',
        ext: '.html'
    }]
  });

  config.add('copy:app', {
    files: [{
      dest: 'dist',
      src : ['app/**/*.js'],
      expand: true,
      cwd: 'src'
    }]
  });


  config.add('less:build', {
    options: {
      sourceMap: true,
      sourceMapFilename: 'dist/css/index.css.map',
      sourceMapURL: 'index.css.map',
      sourceMapBasepath: 'src',
      outputSourceFiles: true
    },
    src: 'src/css/index.css',
    dest: 'dist/css/index.css'
  });

  config.add('less:release', {
    options: {
      compress: true,
      yuicompress: true,
      optimization: 2
    },
    src: 'src/css/index.css',
    dest: 'dist/css/app.<%=timestamp%>.css'
  })

  config.add('clean:assets',
    ['dist/img', 'dist/fonts', 'dist/favicon.ico']
  );

  config.add('uglify:app', {
    src: ['src/app/**/*.js'],
    dest: 'dist/app/app.<%=timestamp%>.js'
  });

  config.add('watch:app', {
    options: {
      cwd: 'src',
      interval: 200,
      spawn: false
    },
    files: ['*', 'app/**/*', 'includes/**/*', 'css/**/*'],
    tasks: ['build:app']
  });

  config.add('watch:assets', {
    options: {
      cwd: 'src',
      interval: 1000,
      spawn: false
    },
    files: ['/img/**/*', '/fonts/**/*', '/vendor/**/*'],
    tasks: ['assets:app']
  });

  config.add('concurrent:app', {
    tasks: ['watch:app', 'watch:assets', 'nodemon:express'],
    options: {
      logConcurrentOutput: true
    }
  });

  config.add('copy:assets', {
    files: [{
      dest: 'dist',
      src : ['vendor/**/*', 'img/**/*', 'fonts/**/*', 'favicon.ico'],
      expand: true,
      cwd: 'src'
    }]
  });

  config.add('nodemon:express',{
    script: 'server.js',
    options: {
      cwd: path.join(__dirname, '/server'),
      ignore: ['node_modules/**'],
      delay: 1000
    }
  });

  config.add('clean:app', {
    files: [{
      expand: true,
      cwd: 'dist',
      src: ['app', 'css']
    }]
  });

  config.add('clean:all', {
    src: ['dist']
  });

  grunt.initConfig(config.get())

};
