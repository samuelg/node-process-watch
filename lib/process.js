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

  var started = false;
  var healthy = true;

  var startedHandler;
  var restartedHandler;
  var killedHandler;
  var errorHandler;
  var interval;

  var api = {
    /**
     *  Registers a handler to be called when the process starts.
     *
     *  @returns {object} api - the api to manage the process
     */
    started: function(handler) {
      startedHandler = handler;

      return this;
    },

    /**
     *  Registers a handler to be called when the process restarts.
     *
     *  @returns {object} api - the api to manage the process
     */
    restarted: function(handler) {
      restartedHandler = handler;

      return this;
    },

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
      var cmd = util.format(
        'kill $(ps -ef | grep "%s.*%s" | grep -v grep | awk \'{print $2}\')',
        parentId,
        processName
      );

      exec(cmd, function(err) {
        if (err && errorHandler) {
          errorHandler(err);

          return;
        }

        if (started && healthy && killedHandler) {
          killedHandler();
        }

        healthy = false;
      });

      return this;
    },

    /**
     *  Registers a handler to be called when an error occurs.
     *
     *  @returns {object} api - the api to manage the process
     */
    error: function(handler) {
      errorHandler = handler;

      return this;
    },

    /**
     *  No longer watches the process.
     *
     *  @returns {object} api - the api to manage the process
     */
    unwatch: function() {
      clearInterval(interval);

      interval = undefined;
      startedHandler = undefined;
      killedHandler = undefined;
      errorHandler = undefined;

      started = false;
      healthy = true;

      return this;
    },

    /**
     *  Starts watching the process.
     *
     *  @param {number} inter - how often to watch the process in milliseconds
     *  @returns {object} api - the api to manage the process
     */
    start: function(inter) {
      if (interval) {
        return this;
      }

      inter = inter || 100;

      interval = setInterval(function() {
        var cmd = util.format(
          'ps -ef | grep "%s.*%s" | { grep -v grep || true; }',
          parentId,
          processName
        );

        exec(cmd, function(err, result) {
          if (err) {
            if (healthy && errorHandler) {
              errorHandler(err);
            }

            healthy = false;

            return;
          }

          if (!result) {
            // process not found
            if (started && healthy && killedHandler) {
              killedHandler();
            }

            healthy = false;
          } else {
            // process found
            if (!started) {
              if (startedHandler) {
                startedHandler();
              }

              started = true;
            } else if (!healthy && restartedHandler) {
              restartedHandler();
            }

            healthy = true;
          }
        });
      }, inter);

      return this;
    }
  };

  return api;
};
