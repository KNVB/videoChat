class Channel{
	constructor(){
		var webRTCConfiguration = {iceServers: 
			[{urls: "stun:stun.stunprotocol.org"},
			 {urls: "stun:stun.l.google.com:19302"},
			 {urls: "turn:numb.viagenie.ca", credential: "turnserver", username: "sj0016092@gmail.com"}		
			]};
		var offerParam={
			offerToReceiveAudio: true,
			offerToReceiveVideo: true,
			iceRestart: true
		};
		var dataChannel,logger,pc,socket;
		this.setLogger=((wl)=>{
			logger=wl;
		});
	}		
}