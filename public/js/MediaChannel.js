class MediaChannel{
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
		this.createAnswer=(async (offer)=>{
			await pc.setRemoteDescription(offer);
			var answer=await pc.createAnswer();
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
		
		this.setLogger=((wl)=>{
			logger=wl;
		});
		this.setSocket=((s)=>{
			socket=s;
		});

		
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
			text = message.data;
			//chatlog(text);
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
				logger("Send ICE Candidate");
				socket.emit('send_ice',event.candidate);
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
			/* 
			if (isCaller==2) {
				createOffer();
			}
			*/
		}	
		function handleRemoteTrack(event) {
			logger("Track event:"+event.track.kind); 
			var remoteStream;
			if (remoteVideo.srcObject==null){
				remoteView.srcObject=new MediaStream();
			}
			remoteStream=remoteVideo.srcObject;
			remoteStream.addTrack(event.track, remoteStream);
		}
		function handleSignalingStateChange(event) {
			logger("pc.signalingState="+pc.signalingState);
			if(pc.signalingState=="stable"){
				logger("ICE negotiation complete");
			}
		}
		function receiveAnswer(answer) {
			pc.setRemoteDescription(answer)
			.then(()=>
				{
					logger("1 Set Remote Description Success");
				})
			.catch((error)=>
				{
					logger("1 Set Remote Description Failure:"+error);
				});
		}
	}		
}