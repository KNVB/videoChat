class WebRTC{
	constructor() {
		var configuration = {iceServers: 
			[{urls: "stun:stun.stunprotocol.org"},
			 {urls: "stun:stun.l.google.com:19302"},
			 {urls: "turn:numb.viagenie.ca", credential: "turnserver", username: "sj0016092@gmail.com"}		
			]};
		var offerParam={
			offerToReceiveAudio: true,
			offerToReceiveVideo: true,
			iceRestart: true
		};
		var logger;
		this.getShareDesktopVideo=(async ()=>{
			return await getShareDesktopVideo();
		});
		this.getWebCamVideo=(async ()=>{
			return await getWebCamVideo(); 
		});
		this.setLogger=((wl)=>{
			logger=wl;
		});
		function getConstraints() {
			/*
			return {"audio":true,
			"video":true}
			*/
			return {
					"audio":{
								channelCount: 2,
								echoCancellation:true,
								sampleSize: 16
							},
					"video":{
								width:{ min: 640, ideal: 1280, max: 1920 },
								height:{ min: 480, ideal: 720, max: 1080 }
							}
					}; 
		}				
		async function getShareDesktopVideo(){
			let stream = null;
			try {
				stream = await navigator.mediaDevices.getDisplayMedia({"audio":true,"video":true});
				/* use the stream */
			} catch(err) {
				logger("get Share Desktop Video failure:"+err);
			}
			finally {
				logger("getShareDesktopVideo() complete");
				return stream
			}
		}
		async function getWebCamVideo() {
			let stream = null;
			try {
				stream = await navigator.mediaDevices.getUserMedia(getConstraints());
				/* use the stream */
			} catch(err) {
				writeLog("get Web Cam Video failure:"+err);
			}
			finally {
				writeLog("getWebCamVideo() complete");
				return stream
			}
		}		
	}
}