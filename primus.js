var cluster = require('cluster');
var Primus = require('primus');
var transformer = 'websockets';

if (cluster.isMaster) {
  var http = require('http');

  var server = http.createServer();
  var primus = new Primus(server, { transformer: transformer, iknowclusterwillbreakconnections: true });

  primus.on('connection', function(socket){
    socket.on('data', function(message){
      socket.write('Hello world');
    });
  });

  server.listen(3000);

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
} else {
  var completed = 0;
  var numMsgs = 1000;
  Socket = Primus.createSocket({ transformer: transformer, iknowclusterwillbreakconnections: true });
  client = new Socket('http://127.0.0.1:3000/');

  client.on('open', function(){
    for(var i=0; i<numMsgs; ++i){
      client.write('a');
    }
  });

  client.on('data', function(){
    if(++completed === numMsgs){
      client.end();
    }
  });

  client.on('end', function(){
    if(completed === numMsgs){
      process.exit();
    }
  });
}

