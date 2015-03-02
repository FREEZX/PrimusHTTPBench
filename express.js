var cluster = require('cluster');
var request = require('request');

if (cluster.isMaster) {
  var express = require('express');
  var app = express();
  app.get('/', function(req, res){
    res.send('Hello world');
  });

  app.listen(3000);

  var running = 0;
  console.time('express');
  cluster.on('exit', function(worker, code, signal) {
    --running;
    if(running === 0){
      console.timeEnd('express');
      process.exit();
    }
  });

  var concurrent = 4;
  running = concurrent;

  for(var i=0; i<concurrent; ++i){
    cluster.fork();
  }
} else if (cluster.isWorker) {
  var completed = 0;
  var numMsgs = 1000;
  var handleResponse = function(error, response, body){
    ++completed;
    if(completed === numMsgs){
      process.exit();
    }
  };
  for(var i=0; i<numMsgs; ++i){
    request('http://127.0.0.1:3000/', handleResponse);
  }
}
