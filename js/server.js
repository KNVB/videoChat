var bodyParse = require('body-parser')
var cookieParser = require('cookie-parser');
var express = require('express');
var session = require('express-session');
var app = express();
var userList={};

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
app.set('view engine', 'ejs');
app.get('/',function (req,res) {
	res.render('../ejs/index.ejs');
});
app.post('/login', function(req, res) {
	
	var alias = req.body.alias;
	var email = req.body.email;
	var user=require("./classes/user.js");
	user.alias=alias;
	user.email=email;

	if (userList[email]==null) {
		req.session.user = user;
		res.redirect('/home/');
	} else {
		res.locals.errorField="email";
		res.locals.user=user;
		res.render('../ejs/index.ejs');
	}	
});
app.get('/home/',isLoggedIn, function(req, res,next) {
	res.locals.user=req.session.user;
	res.render('../ejs/home_index');
});
app.get('/logout',function(req,res){
	delete userList[req.session.user.email];
	res.locals.errorField="logoutSuccess";
	res.locals.alias=req.session.user.alias;
	req.session.destroy();
	res.render('../ejs/index.ejs');
});
io.on('connection', (socket) => {
	socket.on("addUser",(user)=>{
		var userObj=require("./classes/user.js");
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
		res.send("<script>alert('You have to login to use the service.');location.href='/';</script>");		
}