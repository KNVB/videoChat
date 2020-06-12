const User=require("./User");
class ChatRoom
{
	constructor(hostUser,rmId) {
		var host;
		var ioObj;
		var userList={};
		var roomId;
		host=hostUser;
		roomId=rmId;
		this.ioObj=((io)=>{
			ioObj=io;
		});
		this.addUser=((user)=>{
			addUser(user);
		});
		
		this.getHost=(()=>{
			return host;
		});
		this.getOffer=((req)=>{
			//req={"isHost":<%=isHost%>,"roomId":"<%=roomId%>","senderEmail":"<%=user.email%>","receiverEmail":newMember.email};
			var targetMember=userList[req.receiverEmail];
			ioObj.to(targetMember.socketId).emit("getOffer",req);
		});
		this.getUserCount=(()=>{
			return Object.keys(userList).length;
		});
		this.getUserList=(()=>{
			return userList;
		});
		this.isHost=((user)=> {
			if (host.email==user.email) {
				return true;
			} else {
				return false;
			}				
		});
		this.removeUser=((user)=>{
			delete userList[user.email];
			var data={"memberCount":this.getUserCount(),"member":user}; 
			broadCastToAllAnotherMember("memberLeaveTheMeeting",user,data);
		});
		this.sendAnswer=((req)=>{
			var channelInfo=req.channelInfo;
			var targetMember=userList[channelInfo.receiverEmail];
			var res={};

			res["answer"]=req.answer;
			res["channelInfo"]=channelInfo;
			ioObj.to(targetMember.socketId).emit("receiveAnswer",res);
			console.log("ChatRoom:"+channelInfo.senderEmail+" sent answer to "+ channelInfo.receiverEmail);
		});	
		this.sendICECandidate=((req)=>{
			var channelInfo=req.channelInfo;
			var targetMember=userList[channelInfo.receiverEmail];
			var res={};
			res["iceCandidate"]=req.iceCandidate;
			res["channelInfo"]=channelInfo;
			ioObj.to(targetMember.socketId).emit("receiveICECandidate",res);
			console.log("ChatRoom:"+channelInfo.senderEmail+" sent ICE Candidate to "+ channelInfo.receiverEmail);
		});
		this.sendOffer=((req)=>{
			
			var channelInfo=req.channelInfo;
			var targetMember=userList[channelInfo.receiverEmail];
			var res={};
			
			res["offer"]=req.offer;
			res["channelInfo"]=channelInfo;
			ioObj.to(targetMember.socketId).emit("receiveOffer",res);
			console.log("ChatRoom:"+channelInfo.senderEmail+" sent offer to "+ channelInfo.receiverEmail);
		});
		/*
		this.updateSocketId=((user,socketId)=>{
			user.socketId=socketId;
			userList[user.email]=user;
			var data={"memberCount":this.getUserCount(),"newMember":user}; 
			data["newUserIsHost"]=this.isHost(user); 
			broadCastToAllAnotherMember("newMemberJoinTheMeeting",user,data);
		});
		*/
		function broadCastToAllAnotherMember(eventName,user,data) {
			Object.keys(userList).forEach((email)=>{
				if (email!=user.email){
					var existingUser=userList[email];
					ioObj.to(existingUser.socketId).emit(eventName,data);
				}
			});		
		}
		function addUser(user){
			userList[user.email]=user;	
		}
	}
}
module.exports = ChatRoom;