class MediaChannel{
	constructor(ci){
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
		var channelInfo=ci,dataChannel,logger,pc,self=this,socket;
		var onTrackEventHandler=null,onMessageEventHandler=null;
//-----------------------------------------------------------------------------------------------				
		this.addTrack=((track)=>{
			pc.addTrack(track);
		});
		this.addICECandidate=(async (iceCandidate)=>{
			await pc.addIceCandidate(iceCandidate)
		});
		
		this.createAnswer=(async (offer)=>{
			await self.setRemoteDescription(offer);
			var answer=await pc.createAnswer();
			await pc.setLocalDescription(answer);
			return answer;
		});
		this.createConnection=(()=>{
			pc = new RTCPeerConnection(webRTCConfiguration);
			pc.onclose =handleClose; 
			pc.onconnectionstatechange = handleConnectionStateChange;
			pc.ondatachannel = handleDataChannelEvent;
			pc.onicecandidate = handleICECandidate;
			pc.oniceconnectionstatechange = handleICEConnectionStateChange;
			pc.onicegatheringstatechange =handleICEGatheringStateChange;
			pc.onnegotiationneeded = handleNegotiation;
			pc.ontrack=handleRemoteTrack;
			pc.onsignalingstatechange=handleSignalingStateChange;
			dataChannel = pc.createDataChannel('chat');
		})
		
		this.createOffer=(async ()=>{
			var offer=await pc.createOffer(offerParam);
			await pc.setLocalDescription(offer);
			return offer;
		});
		this.getChannelInfo=(()=>{
			return channelInfo;
		});
		this.hangUp=(()=>{
			hangUp();
		});
		this.removeAllMediaTrack=(()=>{
			var senders=pc.getSenders();
			senders.forEach((sender)=>{
				pc.removeTrack(sender);
			});			
		});
		this.sendMsg=((msg)=>{
			dataChannel.send(msg);
		});
		this.setLogger=((wl)=>{
			logger=wl;
		});
		this.setOnMessageEventHandler=((handler)=>{
			onMessageEventHandler=handler;
		});
		this.setOnTrackEventHandler=((handler)=>{
			onTrackEventHandler=handler;
		});
		this.setRemoteDescription=(async (answer)=>{
			await pc.setRemoteDescription(answer);
		});
		this.setSocket=((s)=>{
			socket=s;
		});

//-----------------------------------------------------------------------------------------------		
		function dataChannelClose() {
			logger('Data channel closed');
			dataChannel.onopen = null;
			dataChannel.onmessage = null;
			dataChannel.onclose = null;
			dataChannel.onerror = null;
			dataChannel = null;
		}
		function dataChannelError(event) {
			logger('Data channel error:'+event.message);
		}
		function dataChannelOpen() {
		  logger('data channel is opened');
		}
		function dataChannelMessage(message) {
			logger('Received Message from Data Channel:'+message.data);
			//chatlog(text);
			onMessageEventHandler(message,channelInfo);
		}
		function handleClose() {
			logger("pc.connection is closed");
			pc.onclose = null;
			pc.onconnectionstatechange = null;
			pc.ondatachannel = null;
			pc.onicecandidate = null;
			pc.oniceconnectionstatechange = null;
			pc.onicegatheringstatechange =null;
			pc.onnegotiationneeded = null;
			pc.ontrack=null;
			pc.onsignalingstatechange=null;
			pc=null;			
		}
		function handleConnectionStateChange(event) {
		  logger("pc.connectionState="+pc.connectionState);
		  switch(pc.connectionState) {
			case "disconnected":
			case "failed":
				// One or more transports has terminated unexpectedly or in an error
				hangUp();
				break;
			case "closed":
				hangUp();
				break;
		  }
		}
		function handleDataChannelEvent(event){
			logger('Data channel is created!');
			event.channel.onopen = dataChannelOpen;
			event.channel.onmessage = dataChannelMessage;
			event.channel.onclose = dataChannelClose;
			event.channel.onerror = dataChannelError;
		}
		function handleICECandidate(event) {
			if (event.candidate==null){
				logger("All ICE Candidates are sent");
			} else {
				logger(channelInfo.sender.email + " send ICE Candidate to "+channelInfo.receiver.email);
				var req={};
				req["channelInfo"]=channelInfo;
				req["iceCandidate"]=event.candidate;
				socket.emit('sendICECandidate',req);
			}
		}
		function handleICEConnectionStateChange(event) {
			logger('ice connection state: ' + pc.iceConnectionState);
			if (pc.iceConnectionState=="failed"){
				logger('Restart ICE');
				pc.restartIce();
			}
			if (pc.iceConnectionState=="disconnected") {
				hangUp();
			}				
			/*
			if ((pc.iceConnectionState=="disconnected") || (pc.iceConnectionState=="failed")){
				logger('Restart ICE');
				pc.restartIce();
			}
			*/
		}
		function handleICEGatheringStateChange() {
			logger("ICE Gathering State ="+pc.iceGatheringState);
		}	
		function handleNegotiation(event) {
			logger('Handle Negotitation');
			socket.emit("requestMediaOffer",channelInfo);
			/* 
			if (isCaller==2) {
				createOffer();
			}
			*/
		}	
		function handleRemoteTrack(event) {
			logger("Track event:"+event.track.kind);
			onTrackEventHandler(event.track,channelInfo);			
			/*
			var remoteStream;
			if (remoteVideo.srcObject==null){
				remoteView.srcObject=new MediaStream();
			}
			remoteStream=remoteVideo.srcObject;
			remoteStream.addTrack(event.track, remoteStream);
			*/
			
		}
		function handleSignalingStateChange(event) {
			logger("pc.signalingState="+pc.signalingState);
			if(pc.signalingState=="stable"){
				logger("ICE negotiation complete");
			}
		}
		function hangUp(){
			logger("MediaChannel:Hang Up");
			if (dataChannel) {
				dataChannel.close();
			}
			if (pc) {
				pc.close();
			}
		}		
	}		
}