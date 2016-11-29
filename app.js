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
    ws.send("ws connected: "+ws);
  ws.on('message', function incoming(message) {
    ws.send("ws message: "+ws);
    console.log('received: %s', message);
  });
 
  ws.send('connected');
});

server.listen(port);