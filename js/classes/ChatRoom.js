const User=require("./User");
class ChatRoom
{
	constructor() {
		var host;
		var socketIdList={};
		var userList={};
		this.name="";
		
		this.addUser=((user)=>{
			socketIdList[user.email]=user.socketId;	
			userList[user.email]=user;		
		});
		this.getHost=(()=>{
			return host;
		});
		this.getUserAccount=(()=>{
			return Object.keys(userList).length;
		});
		this.getUserList=(()=>{
			return userList;
		});
		this.removeUser=((user)=>{
			delete userList[user.email];
		});
		this.setHost=((user)=>{
		  host=user;
		});
		
		
	}
}
module.exports = ChatRoom;