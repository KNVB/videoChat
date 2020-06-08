class LocalMedia{
	constructor() {
		
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
			stream = await navigator.mediaDevices.getDisplayMedia({"audio":true,"video":true});
			return stream;
			
		}
		async function getWebCamVideo() {
			let stream = null;
			stream = await navigator.mediaDevices.getUserMedia(getConstraints());
			return stream;
		}		
	}
}