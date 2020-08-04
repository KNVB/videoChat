module.exports=function(app,io){
	var meetingList={};
	var userList={};
	const { v4: uuidv4 } = require('uuid');
	const Meeting=require("./classes/Meeting");
	const User=require("./classes/User");
	var shareAudioDropDown=require("./ShareAudioDropDown");
	var videoSrcDropDown=require("./VideoSrcDropDown");
	app.get("/",function(req,res){
		var errorMessage="";
		switch (req.query.errorId){
			case "1":
				errorMessage="Duplicate Meeting Id";
				break;
		}
		res.render("index",{"errorMessage":errorMessage});
	});
	app.post("/createMeeting",function(req,res){
		var user=new User();
		
		try{
			if (userList[req.body.userId]==null){
				var meeting=new Meeting();
				var meetingId=uuidv4();
				user.id=req.body.userId;
				user.alias=req.body.alias;
				user.shareMedia={"video":req.body.videoSrc,"audio":req.body.shareAudio};
				userList[req.body.userId]=user;
				meeting.setMeetingId(meetingId);
				meeting.setPassword(req.body.meetingPwd);
				meetingList[meetingId]=meeting;
				res.render("forwardToMeeting",
							{
								"meetingId":meetingId,
								"userId":req.body.userId,
							});
					
			} else {
				res.redirect("/?errorId=1");
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
					res.render('creatMeeting', { "userId": userId,"shareAudioDropDown":shareAudioDropDown,"videoSrcDropDown":videoSrcDropDown })
					break
				case "joinMeeting":
					res.render('joinMeeting', { "userId": userId })
					break;
			}
		}catch (error) {
			res.send ("Something Wrong in /login:"+error);
		}		
	});
	app.post("/meeting/:meetingId",function(req,res){
		res.render('meeting', 
					{ meetingId: req.params.meetingId,
					  userId:req.body.userId,
					  "shareAudioDropDown":shareAudioDropDown,
					  "videoSrcDropDown":videoSrcDropDown
					})
	});
	io.on('connection', (socket) => {
		
	});
}