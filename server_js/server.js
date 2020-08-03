var bodyParse = require('body-parser')
var express = require('express');
var app = express();
var peerBroker=require("./PeerBroker.js");
var meetingManager=require("./MeetingManager.js");

var http = require('http');
var httpServer= http.createServer(app);
var httpServerPort = 29;
var io = require('socket.io')(httpServer);
app.use(bodyParse.urlencoded({extended:false}));
app.use(bodyParse.json());
app.set('view engine', 'ejs');
app.set('views', './ejs');
app.use(express.static('public'));

peerBroker(io);
meetingManager(app,io);
httpServer.listen(httpServerPort, function() {
  console.log('server up and running at %s port', httpServerPort);
});
