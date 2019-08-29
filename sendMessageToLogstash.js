'use strict';

var net = require('net');

var logHost = 'bender0.onofood.co'
  , logPort = 1515
  , sender = require('os').hostname();

var conn = net.createConnection({host: logHost, port: logPort}, function() {
  var message = {
foo: 'bar',
check:12,
    '@tags': ['nodejs', 'test']
  , '@message': 'tcp test ' + Math.floor(Math.random() * 10000)
  , '@fields': {'sender': sender}
  }
  conn.write(JSON.stringify(message));
  process.exit(0);
})
.on('error', function(err) {
  console.error(err);
  process.exit(1);
});
