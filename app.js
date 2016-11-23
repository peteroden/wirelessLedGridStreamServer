const http = require('http')

const port = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World\n');
});

var WebSocketServer = require('ws').Server
var wss = new WebSocketServer({ server: server });

wss.on('connection', function connection(ws) {
 
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });
 
  ws.send('something');
});

server.listen(port);