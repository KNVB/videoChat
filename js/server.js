var bodyParse = require('body-parser')
var cookieParser = require('cookie-parser');
var express = require('express');
var session = require('express-session');
var app = express();
var roomList={};
var userList={};

var http = require('http');
var serverPort = 24;
const { v4: uuidv4 } = require('uuid');
const User=require("./classes/User");

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
app.use('/css', express.static('css'));
app.get('/',function (req,res) {
	try{
		res.locals.event=req.query.event;
		switch (res.locals.event) {
			case "logoutSuccess":
				res.locals.alias=req.query.alias;
				break;
			case "duplicateEmail":
				res.locals.email=req.query.email;
				res.locals.user=req.session.user;
				break;	
		}
		req.session.destroy();	
	} catch (error){
		
	}finally {
		res.render('index');
	}
});
app.post("/genRoom",isLoggedIn, function(req, res,next) {
	var ChatRoom=require("./classes/ChatRoom"); 
	var roomId=uuidv4();
	var user=req.session.user;
	var room=new ChatRoom(user);
	room.name=req.body.roomName;
	room.addUser(user);
	roomList[roomId]=room;
	req.session.isHost=true;
	res.redirect("/room?roomId="+roomId);
});	
app.get("/join",function(req, res,next) {
	try {
		var roomId=req.query.roomId;
		if (roomList[roomId]==null) {
			res.send("Invalid Room Id");
		} else {
			res.locals.roomId=roomId;
			res.render('index');
		}
	} catch (error) {
		res.send("Invalid Room Id");
	}
});
app.post('/login', function(req, res) {
	try {
		var alias = req.body.alias;
		var email = req.body.email;
		var roomId=req.body.roomId;
		var user=new User();
		user.alias=alias;
		user.email=email;
		
		req.session.user = user;
		if (userList[email]==null) {
			if (roomId=="") {
				res.redirect('/newRoom/');
			} else {
				var room=roomList[roomId];
				room.addUser(user);
				req.session.isHost=false;
				console.log("user:"+user.alias+" has joined the room:"+room.name);
				res.redirect("/room?roomId="+roomId);
			}				
		} else {
			res.redirect("/?event=duplicateEmail");
		}	
	} catch (error) {
		res.send ("Missing Parameter");
	}
});

app.get('/logout',function(req,res){
	var roomId;
	try{
		roomId=req.query.roomId;
		var room=roomList[roomId];
		room.removeUser(req.session.user);
		if (room.getUserAccount()==0) {
			console.log("Room id="+roomId+",room name="+room.name+" is removed");
			room=null;
			delete roomList[roomId];
		}
	} catch (error) {
	}		
	delete userList[req.session.user.email];
	var alias=req.session.user.alias;
	req.session.destroy();
	res.redirect("/?event=logoutSuccess&alias="+alias);
});
app.get('/newRoom/',isLoggedIn, function(req, res,next) {
	res.locals.user=req.session.user;
	try{
		res.locals.event=req.query.event;
		switch (res.locals.event) {
		
				
		}
	} catch (error){
		
	}
	res.render('new_room');
});
app.get("/room",isLoggedIn, function(req, res,next) {
	var roomId=req.query.roomId;
	if (roomList[roomId]==null) {
		res.redirect("/newRoom?event=invalidRoomId");
	} else {
		res.locals.user=req.session.user;
		res.locals.room=roomList[roomId];
		res.locals.roomId=roomId;
		res.locals.isHost=req.session.isHost;
		res.locals.joinLink=req.protocol+"://"+req.hostname+":"+serverPort+"/join?roomId="+roomId;
		console.log("New Chat Room is created!Room Id="+roomId+",Room Name="+res.locals.room.name);
		console.log("Join Link:"+res.locals.joinLink);
		
		res.render('room.ejs');
	}	
});
io.on('connection', (socket) => {
	socket.on("addUser",(user)=>{
		
		var userObj=new User();
		userObj.alias=user.alias;
		userObj.email=user.email;
		userObj.socketId=socket.id;
		userList[userObj.email]=userObj;
	});
});

/*
app.use(express.static('public'));
app.set('view engine', 'ejs');
*/
function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on 
    if (req.session.user)
		next();	
	else
		res.redirect("/?event=invalidAccess");
}