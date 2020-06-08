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
			broadCastMemberList(user);
		});
		this.updateSocketId=((user,socketId)=>{
			socketIdList[user.email]=socketId;
			userList[user.email]=user;	
			broadCastMemberList(user);
		});
		function broadCastMemberList(user) {
			Object.keys(userList).forEach((email)=>{
				if (email!=user.email){
					var existingUser=userList[email];
					ioObj.to(existingUser.socketId).emit('updateMemberList',userList);
					console.log("Email="+email+",socketId="+existingUser.socketId);
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