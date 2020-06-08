const User=require("./User");
class ChatRoom
{
	constructor(hostUser) {
		var host;
		var socketIdList={};
		var userList={};
		this.name="";
		
		host=hostUser;
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
		this.isHost=((user)=> {
			if ((host.email==user.email) && (host.alias==user.alias)) {
				return true;
			} else {
				return false;
			}				
		});
		this.removeUser=((user)=>{
			delete userList[user.email];
		});
		
	}
}
module.exports = ChatRoom;