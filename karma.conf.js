module.exports = function(config) {
  config.set({
    frameworks: ['mocha', 'chai', 'child-process'],
    files: [
      { pattern: 'test/tests/**/*.js', type: 'module' },
      { pattern: 'dist/pax-request.js' }
    ],
    reporters: ['progress'],
    port: 9876,  // karma web server port
    colors: true,
    logLevel: config.LOG_INFO,
    browsers: ['ChromeHeadless'],
    autoWatch: false,
    // singleRun: false, // Karma captures browsers, runs the tests and exits
    concurrency: Infinity,

    client: {
      childProcess: {
        path: 'test/test-server.js',
        args: [],
        options: {}
      }
    }
  })
}
