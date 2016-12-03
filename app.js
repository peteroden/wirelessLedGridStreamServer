const http = require('http')

const port = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World\n');
});

var devices = {};
var WebSocketServer = require('ws').Server
var wss = new WebSocketServer({ server: server });

wss.on('connection', function connection(ws) { 
  switch(ws.protocol) {
    case "browser":
      console.log("connection from browser")
      ws.send("ws connected from browser");
      ws.on('message', function incoming(message, flags) {
        console.log('received: %s', message);
        ws.send("message received");
      });
      break;
    case "device":
      console.log("connection from device");
      devices["deviceid"] = { "name": "name", "size": "8x8", "ws": ws};

      ws.on('message', function (message, flags) {
        deviceMessage(message, flags, ws);
        console.log('received: %s', message);
        ws.send("message received");
      });

      ws.on('close', function() {
        deviceClose("deviceid")
      });
      break;
  }

  ws.send('connected');
});

function deviceMessage(message, flags, ws) {
  console.log("received message: "+ message + " from " + ws.);
  ws.send("received message"+message);
}

function deviceClose(deviceid) {
  console.log("closed connection for "+deviceid);
  delete devices[deviceid];
}


function browserMessage(message, flags, ws) {
  ws.send("received message"+message);
}

server.listen(port);

var timer = setInterval(function() { 
  for (var deviceid in devices) {
    var device = devices[deviceid]
    device.ws.send("ding");
  }
}, 2000);