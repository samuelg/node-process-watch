# About

A simple fluent API for watching and managing OS processes.

# Usage

```JavaScript
var pw = require('process-watch');

// optional parentPid to ensure process uniqueness
var process = pw.watch('node app.js', parentPid)
  .killed(function() {
    // process was killed
  });

process.kill();
```

# License

MIT

Copyright (c) 2015 Samuel Fortier-Galarneau <samuel.galarneau@gmail.com>
