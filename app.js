const http = require('http');
var fs = require('fs');
var path = require('path');
const port = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
    var filePath = './public' + req.url;
 
    if (filePath == './public/') {
        filePath = './public/index.htm';
    }
    var extname = path.extname(filePath);
    var contentType = 'text/html';
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
    }
    fs.access(filePath, fs.F_OK ,function (err) {
        if (!err) {
            fs.readFile(filePath, function (error, content) {
                if (error) {
                    res.writeHead(500);
                    res.end();
                }
                else {
                    res.writeHead(200, { 'Content-Type': contentType });
                    res.end(content, 'utf-8');
                }
            });
        }
        else {
            res.writeHead(404);
            res.end();
        }
    });
});

var devices = {};
var testframe = new Uint8Array( [255,0,0,0,0,0,0,0,
                                 0,0,0,0,0,0,0,0,
                                 0,0,0,0,0,0,0,0,
                                 0,0,0,0,0,0,0,0,
                                 0,0,0,0,0,0,0,0,
                                 0,0,0,0,0,0,0,0,
                                 0,0,0,0,0,0,0,0,
                                 0,0,0,0,0,0,0,0,
                                 0,0,0,0,0,0,0,0,
                                 0,0,0,0,0,0,0,0,
                                 0,0,0,0,0,0,0,0,
                                 0,0,0,0,0,0,0,0,
                                 0,0,0,0,0,0,0,0,
                                 0,0,0,0,0,0,0,0,
                                 0,0,0,0,0,0,0,0,
                                 0,0,0,0,0,0,0,0,
                                 0,0,0,0,0,0,0,0,
                                 0,0,0,0,0,0,0,0,                        
                                 0,0,0,0,0,0,0,0,
                                 0,0,0,0,0,0,0,0,
                                 0,0,0,0,0,0,0,0,
                                 0,0,0,0,0,0,0,0,
                                 0,0,0,0,0,0,0,0,
                                 0,0,0,0,0,0,0,255
                                 ]);
var WebSocketServer = require('ws').Server
var wss = new WebSocketServer({ server: server });

wss.on('connection', function connection(ws) { 
  switch(ws.protocol) {
    case "browser":
      console.log("connection from browser")
      ws.send("ws connected from browser");
      ws.on('message', function incoming(message, flags) {
        //console.log('received: %s', message);
        //ws.send("message received");
        devices['deviceid'].framebuffer.push(new Uint8Array(message));
      });
      break;
    case "device":
      console.log("connection from device");
      devices["deviceid"] = { "name": "name", "size": "8x8", "ws": ws, "framebuffer": []};

      ws.on('message', function (message, flags) {
        deviceMessage(message, flags, devices["deviceid"]);
        console.log('received: %s', message);
        //ws.send("message received");
      });

      ws.on('close', function() {
        deviceClose("deviceid")
      });
      break;
  }

  ws.send('connected');
});

function deviceMessage(message, flags, device) {
  console.log("received message: "+ message);
  device.ws.send("received message"+message);
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
    if(device.framebuffer.length>0) {
      device.ws.send(device.framebuffer.shift(), {"binary": true});
      //delete device.framebuffer[0];
    } else {
      //device.ws.send(testframe,{"binary": true});
    }
  }
}, 30);