const User=require("./User");
class ChatRoom {
	constructor(hostUser,rmId) {
		var host=hostUser;
		var userList={};
		var roomId=rmId;
		console.log("ChatRoom:"+rmId+" has been created");
		this.broadcastMsg=((socket,req)=>{
			broadcast(socket,"broadcastMessage",req);
		});
		this.getUserCount=(()=>{
			return Object.keys(userList).length;
		});
		this.join=((socket,user)=>{
			var res={}
			res["newUser"]=user;
			
			userList[user.email]=user;
			res["userCount"]=Object.keys(userList).length;
			socket.join(roomId);
			console.log(user.email +" has joined the room "+roomId);
			broadcast(socket,"userJoin",res);
			
		});		
		this.leave=((socket,user)=>{
			delete userList[user.email];
			var data={"userCount":this.getUserCount(),"user":user}; 
			broadcast(socket,"userLeave",data);
			console.log(user.email +" has left the room "+roomId);
		});
		this.requestMediaOffer=((io,req)=>{
			var receiver=userList[req.receiver.email];
			var sender=userList[req.sender.email];
			console.log(sender.email+" request an media offer from "+receiver.email);
			io.to(receiver.socketId).emit('requestMediaOffer', req);
		});
		this.sendAnswer=((io,req)=>{
			var receiver=userList[req.channelInfo.receiver.email];
			var sender=userList[req.channelInfo.sender.email];
			console.log(sender.email+" send an media answer to "+receiver.email);
			io.to(receiver.socketId).emit('receiveMediaAnswer', req);
		});
		this.sendICECandidate=((io,req)=>{
			var receiver=userList[req.channelInfo.receiver.email];
			var sender=userList[req.channelInfo.sender.email];
			console.log(sender.email+" send an ICE Candidate to "+receiver.email);
			io.to(receiver.socketId).emit("receiveICECandidate", req);
		});
		this.sendMediaOffer=((io,req)=>{
			var receiver=userList[req.channelInfo.receiver.email];
			var sender=userList[req.channelInfo.sender.email];
			console.log(sender.email+" send an media offer to "+receiver.email);
			io.to(receiver.socketId).emit('receiveMediaOffer', req);
		});
//----------------------------------------------		
		function broadcast(socket,event,data){
			socket.broadcast.emit(event,data);
		}
		
	}	
}
module.exports = ChatRoom;