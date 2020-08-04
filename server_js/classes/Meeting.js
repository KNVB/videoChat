class Meeting{
	constructor(){
		var hostUser;
		var meetingId;
		var memberList={};
		var meetingPwd;
		
		this.broadcastMessage=((message)=>{
			
		});
		this.close=(()=>{
			
		});
		this.isHost=((user)=>{
			
		});
		this.join=((user)=>{
			
		});
		this.leave=((user)=>{
			
		});
		this.setHostMember=((user)=>{
			hostUser=user;
			memberList[user.id]=user;
		});
		this.setMeetingId=((id)=>{
			meetingId=id;
		});
		this.setPassword=((pwd)=>{
			meetingPwd=pwd;
		});
//===============================================================		

	}
}
module.exports = Meeting;