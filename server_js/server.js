var bodyParse = require('body-parser')
var cookieParser = require('cookie-parser');
var express = require('express');
var session = require('express-session');
var app = express();
var userList={};

const { v4: uuidv4 } = require('uuid');
const ChatRoom=require("./classes/ChatRoom");
const User=require("./classes/User");

var http = require('http');
var serverPort = 24;
server = http.createServer(app);


/*
var fs = require('fs');
var https = require('https');
var options = {
  key: fs.readFileSync('.well-known\\acme-challenge\\private.key'),
  ca: [fs.readFileSync('.well-known\\acme-challenge\\ca_bundle.crt')],
  cert: fs.readFileSync('.well-known\\acme-challenge\\certificate.crt')
};
var serverPort = 443;
var server = https.createServer(options, app);
*/

server.listen(serverPort, function() {
  console.log('server up and running at %s port', serverPort);
});

var io = require('socket.io')(server);
app.use(bodyParse.urlencoded({extended:false}));
app.use(bodyParse.json());
app.use(cookieParser());
app.use(session({
	secret: '中engポ털usเปลี่ دبي',
	resave: true,
	saveUninitialized: true
}));
app.set('views', './ejs');
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.get('/',function (req,res) {
	try{
		res.locals.action="createRoom";
		res.locals.event=req.session.event;
		switch (res.locals.event) {
			case "logoutSuccess":
				res.locals.alias=req.session.user.alias;
				break;
			case "duplicateEmail":
				res.locals.user=req.session.user;
				break;	
		}
		req.session.destroy();	
	} catch (error){
		
	}finally {
		res.render('index');
	}
});
app.get("/joinRoom/:roomId",(req,res)=>{
	var roomId = req.params.roomId;
	res.locals.action="joinRoom";
	res.locals.roomId=roomId;
	res.locals.event=req.session.event;
	res.locals.user=req.session.user;
	res.render('index');
	req.session.destroy();
});
app.get('/room',function(req,res){
	/*
	console.log("user="+req.session.user);
	console.log("roomId="+req.session.roomId);
	console.log("isHost="+req.session.isHost);
	*/
	res.locals.user=req.session.user;
	res.locals.roomId=req.session.roomId;
	res.locals.isHost=req.session.isHost;
	
	res.render('room');

});
//------------------------------------------------------------------------
app.post("/leaveRoom/:roomId",(req,res)=>{ 
	var roomId = req.params.roomId;
	var userEmail=req.body.userEmail;
	var user=userList[userEmail];
	
	
	req.session.user = user;
	req.session.event="logoutSuccess";
	delete userList[userEmail];
	res.redirect("/");
});
app.post('/login', function(req, res) {
	try {
		var action= req.body.action;
		var alias = req.body.alias;
		var email = req.body.email;
		var roomId=req.body.roomId;
		var user=new User();
		user.alias=alias;
		user.email=email;
		req.session.user = user;

		if (userList[email]==null) {
			userList[user.email]=user;
			switch (action) {
				case "createRoom":
					req.session.roomId=uuidv4();
					req.session.isHost=true;
					res.redirect('/room');
					break;
				case "joinRoom":
					req.session.isHost=false;
					req.session.roomId=roomId
					res.redirect('/room');
					break;
			}
		} else {
			req.session.event="duplicateEmail";	
			switch (action) {
				case "createRoom":
					res.redirect("/");
					break;
				case "joinRoom":
					res.redirect("/joinRoom/"+roomId);
					break	
			}	
			
		}			
	} catch (error) {
		res.send ("Something Wrong in /login:"+error);
	}		
});
//------------------------------------------------------------------------	
io.on('connection', (socket) => {
	socket.on("joinRoom",(req)=>{
		var user=userList[req.userEmail];
		var res={}
		console.log(req.userEmail +" join room "+req.roomId);
		
		user.socketId=socket.id;
		userList[req.userEmail]=user;
		socket.join(req.roomId);
		res["user"]=user;
		res["userCount"]=io.sockets.adapter.rooms[req.roomId].length;
		socket.in(req.roomId).emit("userJoin",res);
	});
	socket.on("sendMessage",(req)=>{
		var res={};
		res["alias"]=req.userAlias;
		res["msg"]=req.msg;
		socket.in(req.roomId).emit("receiveMsg",res);
	});
	socket.on("userLeave",(req)=>{
		var user=userList[req.userEmail];
		var res={}
		socket.leave(req.roomId);			
		res["user"]=user;
		if (io.sockets.adapter.rooms[req.roomId]){
			res["userCount"]=io.sockets.adapter.rooms[req.roomId].length;
			socket.in(req.roomId).emit("userLeave",res);
		}
	});
	
});