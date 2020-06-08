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
		this.setMemberMediaOffer=((req)=>{
			//req={"isHost":<%=isHost%>,"roomId":"<%=roomId%>","senderEmail":"<%=user.email%>","receiverEmail":newMember.email};
			var targetMember=userList[req.receiverEmail];
			var res={"receiverEmail":req.receiverEmail,"isHost":req.isHost,"senderEmail":req.senderEmail,"offer":req.offer};
			ioObj.to(targetMember.socketId).emit("memberMediaOffer",res);
		});
		this.updateSocketId=((user,socketId)=>{
			socketIdList[user.email]=socketId;
			userList[user.email]=user;
			var data={"memberCount":this.getUserCount(),"newMember":user}; 
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