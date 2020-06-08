var bodyParse = require('body-parser')
var cookieParser = require('cookie-parser');
var express = require('express');
var session = require('express-session');
var app = express();
var roomList={};
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
		res.locals.event=req.query.event;
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
app.get("/joinRoom",function(req,res){
	try{
		//console.log("ho:"+req.query.roomId);
		res.locals.roomId=req.query.roomId;
		res.render('index');
	} catch(error){
		console.log(error);	
	}
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
	res.locals.room=roomList[req.session.roomId];
	res.render('room');

});
app.post("/closeTheMeeting",function(req,res){
	var roomId=req.body.roomId;
	var room=roomList[roomId];
	Object.keys(room.getUserList()).forEach((email)=>{
		delete userList[email];
	});
	delete roomList[roomId];
	room=null;
	res.redirect("/");
});
app.post('/leaveTheMeeting', function(req, res) {
	try {
		var email=req.body.userEmail;
		var roomId=req.body.roomId;
		var user = userList[email];
		var room=roomList[roomId];
		room.removeUser(user);
		delete userList[email];
		req.session.user=user;
		res.redirect("/?event=logoutSuccess");

	} catch (error) {
		res.send ("Something Wrong in /leaveTheMeeting:"+error);
	}
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
		user.shareMedia={"videoSrc":req.body.videoSrc,"shareAudio":req.body.shareAudio};
		req.session.user = user;
		//console.log(req.body);
		if (userList[email]==null) {
			userList[email]=user;
			switch (action) {
				case "createRoom":
					req.session.roomId=uuidv4();
					req.session.isHost=true;
					
					roomList[req.session.roomId]=new ChatRoom(user);
					roomList[req.session.roomId].ioObj(io);
					res.redirect('/room');
					break;
				case "joinRoom":
					var room=roomList[roomId];
					//console.log(room);
					room.addUser(user);
					req.session.roomId=roomId;
					req.session.isHost=false;
					//console.log("user:"+user.alias+" has joined the room where room id:"+roomId);
					res.redirect("/room");
					break;
			}
		} else {
			req.session.user=user;
			res.redirect("/?event=duplicateEmail");
		}
	} catch (error) {
		res.send ("Something Wrong in /login:"+error);
	}
});
io.on('connection', (socket) => {
	socket.on("updateSocketId",(req)=>{
		//console.log(data);
		var room=roomList[req.roomId];
		req.user.socketId=socket.id;
		room.updateSocketId(req.user,socket.id);
	});	
	socket.on("getMemberMediaOffer",(req)=>{
		console.log(req);
		var room=roomList[req.roomId];
		var reqMemberEmail=req.reqMemberEmail;
		var targetMemberEmail=req.targetMemberEmail;
		room.getMemberMediaOffer(reqMemberEmail,req.isHost,targetMemberEmail);
	});
});