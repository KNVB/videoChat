const User=require("./User");
class ChatRoom
{
	constructor(hostUser) {
		var host;
		var socketIdList={};
		var userList={};
		
		host=hostUser;
		addUser(host);
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
		});
		function addUser(user){
			socketIdList[user.email]=user.socketId;	
			userList[user.email]=user;	
		}
	}
}
module.exports = ChatRoom;