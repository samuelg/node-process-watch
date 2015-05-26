'use strict';

var spawn = require('child_process').spawn;
var expect = require('chai').expect;

var pw = require('../lib/process.js');

describe('process-watch', function () {

  var watchedProcess;
  var child;

  var asyncDelay = 100;

  beforeEach(function() {
    watchedProcess = pw.watch('watch ls -l', process.pid);
    child = spawn('watch', ['ls', '-l']);
  });

  afterEach(function() {
    try {
      process.kill(child.pid, 'SIGKILL');
    } catch (err) {
      // some tests kill the child as part of the test
    }

    watchedProcess.unwatch();
    watchedProcess = undefined;
  });

  it('should call started handler when started', function (done) {
    watchedProcess
      .error(function(err) {
        throw new Error('should not have been called');
      })
      .started(done)
      .start();
  });

  it('should call killed handler when killed', function (done) {
    watchedProcess
      .error(function(err) {
        throw new Error('should not have been called');
      })
      .started(function() {
        process.kill(child.pid);
      })
      .killed(done)
      .start();

  });

  it('should allow killing the process', function (done) {
    watchedProcess
      .error(function(err) {
        throw new Error('should not have been called');
      })
      .started(function() {
        watchedProcess.kill();
      })
      .killed(done)
      .start();
  });

  it('should allow unwatching', function (done) {
    watchedProcess
      .error(function(err) {
        throw new Error('should not have been called');
        })
      .started(function() {
        watchedProcess.unwatch();

        process.kill(child.pid);
        setTimeout(done, 1000);
      })
      .killed(function() {
        throw new Error('should not have been called');
      })
      .start();
  });

  it('should not call handlers if start not called', function (done) {
    watchedProcess
      .error(function(err) {
        throw new Error('should not have been called');
      })
      .started(function() {
        throw new Error('should not have been called');
      })
      .killed(function() {
        throw new Error('should not have been called');
      });

    setTimeout(function() {
      process.kill(child.pid);
    }, 500);

    setTimeout(done, 1000);
  });

  it('should call error handler on error', function (done) {
    watchedProcess
      .error(function(err) {
        done();
      })
      .killed(function() {
        throw new Error('should not have been called');
      })
      .start();

    process.kill(child.pid);

    watchedProcess.kill();
  });

  it('should call killed handler more than once if killed more than once',
     function(done) {

    var killed = 0;

    watchedProcess
      .error(function(err) {
        throw new Error('should not have been called');
      })
      .started(function() {
        process.kill(child.pid);
      })
      .killed(function() {
        killed += 1;

        if (killed === 2) {
          done();
        } else {
          child = spawn('watch', ['ls', '-l']);
          
          setTimeout(function() {
            process.kill(child.pid);
          }, 500);
        }
      })
      .start();
  });

});
