const User=require("./User");
class ChatRoom
{
	constructor(hostUser) {
		var host;
		var ioObj;
		var socketIdList={};
		var userList={};
		
		host=hostUser;
		addUser(host);
		this.ioObj=((io)=>{
			ioObj=io;
		});
		this.addUser=((user)=>{
			addUser(user);
		});
		
		this.getHost=(()=>{
			return host;
		});
		this.getMemberMediaOffer=((req)=>{
			//req={"isHost":<%=isHost%>,"roomId":"<%=roomId%>","senderEmail":"<%=user.email%>","receiverEmail":newMember.email};
			var targetMember=userList[req.receiverEmail];
			ioObj.to(targetMember.socketId).emit("getMediaOffer",req);
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
			//req={"isHost":<%=isHost%>,"roomId":"<%=roomId%>","senderEmail":"<%=user.email%>","receiverEmail":newMember.email,"roomId":roomId};
			var targetMember=userList[req.receiverEmail];
			var res={};
			res["receiverEmail"]=req.receiverEmail;
			req["senderIsHost"]=this.isHost(req.senderEmail);
			res["senderEmail"]=req.senderEmail;
			res["answer"]=req.answer;
			res["roomId"]=req.roomId;
			ioObj.to(targetMember.socketId).emit("receiveAnswer",res);
		});	
		this.sendOffer=((req)=>{
			//req={"isHost":<%=isHost%>,"roomId":"<%=roomId%>","senderEmail":"<%=user.email%>","receiverEmail":newMember.email,"roomId":roomId};
			var targetMember=userList[req.receiverEmail];
			var res={};
			res["receiverEmail"]=req.receiverEmail;
			req["senderIsHost"]=this.isHost(req.senderEmail);
			res["senderEmail"]=req.senderEmail;
			res["offer"]=req.offer;
			res["roomId"]=req.roomId;
			
			ioObj.to(targetMember.socketId).emit("receiveOffer",res);
		});
		this.updateSocketId=((user,socketId)=>{
			socketIdList[user.email]=socketId;
			userList[user.email]=user;
			var data={"memberCount":this.getUserCount(),"newMember":user}; 
			data["isHost"]=this.isHost(user); 
			broadCastToAllAnotherMember("newMemberJoinTheMeeting",user,data);
		});
		function broadCastToAllAnotherMember(eventName,user,data) {
			Object.keys(userList).forEach((email)=>{
				if (email!=user.email){
					var existingUser=userList[email];
					ioObj.to(existingUser.socketId).emit(eventName,data);
				}
			});		
		}
		function addUser(user){
			socketIdList[user.email]=user.socketId;	
			userList[user.email]=user;	
		}
	}
}
module.exports = ChatRoom;