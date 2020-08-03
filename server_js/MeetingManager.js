module.exports=function(app,io){
	var meetingList={};
	var userList={};
	const { v4: uuidv4 } = require('uuid');
	const User=require("./classes/User");
	app.post("/createMeeting",function(req,res){
		var user=new User();
		try{
			if (userList[req.body.userId]==null){
				user.alias=req.body.alias;
				user.shareMedia={"video":req.body.videoSrc,"audio":req.body.shareAudio};
				userList[req.body.userId]=user;
				res.send("");
				console.log(userList);
			} else {
				res.render("/",{
					errorMessage:"Duplicate user Id";
				});
			}
		} catch(error){
			res.send ("Something Wrong in /createMeeting:"+error);
		}			
	});
	app.post('/login', function(req, res) {
		try{
			var action= req.body.action;
			var userId=uuidv4();
			switch (action){
				case "createMeeting":
					res.render('creatMeeting', { "userId": userId })
					break
				case "joinMeeting":
					res.render('joinMeeting', { "userId": userId })
					break;
			}
		}catch (error) {
			res.send ("Something Wrong in /login:"+error);
		}		
	});
	io.on('connection', (socket) => {
		
	});
}