'use strict';

var util = require('util');
var exec = require('child_process').exec;

/**
 *  Returns a fluent API for watching and managing the given process.
 *
 *  @param {string} processName - The name of the process to watch
 *  @param {int} [parentId] - the id of the parent process
 */
module.exports.watch = function(processName, parentId) {
  parentId = parentId || '';

  var healthy = true;
  var killedHandler;
  var errorHandler;
  var interval;

  var api = {
    /**
     *  Registers a handler to be called when the process is killed.
     *
     *  @paran {function} handler - the handler to be called when the process
     *                              is killed
     *  @returns {object} api - the api to manage the process
     */
    killed: function(handler) {
      killedHandler = handler;

      return this;
    },

    /**
     *  Kills the process.
     *
     *  @returns {object} api - the api to manage the process
     */
    kill: function() {
      // TODO: kill process
      var cmd = util.format(
        'kill $(ps -ef | grep "%s.*%s" | grep -v grep | awk \'{print $2}\')',
        parentId,
        processName
      );

      exec(cmd, function(err) {
        if (err && errorHandler) {
          errorHandler(err);
        }
      });

      return this;
    },

    error: function(handler) {
      errorHandler = handler;
    },

    /**
     *  No longer watches the process.
     *
     *  @returns {object} api - the api to manage the process
     */
    unwatch: function() {
      clearInterval(interval);
    }
  };

  interval = setInterval(function() {
    var cmd = util.format(
      'ps -ef | grep "%s.*%s" | grep -v grep',
      parentId,
      processName
    );

    exec(cmd, function(err, result) {
      if (err && healthy && errorHandler) {
        errorHandler(err);
        healthy = false;

        return;
      }

      if (!result && healthy && killedHandler) {
        killedHandler();

        healthy = false;
      } else {
        healthy = true;
      }
    });
  }, 100);

  return api;
};
