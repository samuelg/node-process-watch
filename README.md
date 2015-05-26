# About

A simple fluent API for watching and managing OS processes.

# Usage

```JavaScript
var pw = require('process-watch');

// optional parentPid to ensure process uniqueness
var process = pw.watch('node app.js', parentPid)
  .error(function(err) {
    // an error occurred
  })
  .started(function() {
    // process started
  })
  .killed(function() {
    // process was killed
  })
  .restarted(function() {
    // process has been restarted
  })
  .start(100);  // watch every 100 milliseconds (default)

process.kill();
process.unwatch();
```

Note that the process being watched may not exist at the time the watcher is initialized.

# License

MIT

Copyright (c) 2015 Samuel Fortier-Galarneau <samuel.galarneau@gmail.com>
