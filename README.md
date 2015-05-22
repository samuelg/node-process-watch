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
  .killed(function() {
    // process was killed
  });

process.kill();
process.unwatch();
```

# License

MIT

Copyright (c) 2015 Samuel Fortier-Galarneau <samuel.galarneau@gmail.com>
