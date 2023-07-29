const Media = require("../../../../../dist/node-red/amd/rfir/ac-media-nd/index");

console.log(Media.RFIRDeviceACMediaND);

const device = new Media.RFIRDeviceACMediaND( {
				"_id" : "6377cd3b356efad8068490ea",
				"id" : "ESP8266x00901e97",
				"app_id" : "ndiot",
				"dom_id" : "dev",
				"model" : "RFIR-AC-MEDIA-ND",
				"name" : "DM3-F05",
				"pid" : null,
				"type" : "AC",
				"vendor" : "ND",
				"desc" : "DM3-F05"
			});

setTimeout(() => {
    console.log("111111", device.ac_coder);    
    // "0" : 178,
	// 		"1" : 77,
	// 		"2" : 191,
	// 		"3" : 64,
	// 		"4" : 192,
	// 		"5" : 63,
    device.ac_coder.pnt_table.decodeBytess([[178, 77, 191, 64, 192, 63]])
    console.log("2222222", device.ac_coder.pnt_table);
}, 1000);            


// Allybot.Api.login();
// Allybot.User.login();


// const WebSocket = require('ws');

// const ws = new WebSocket('ws://www.host.com/path');

// ws.on('open', function open() {
//   ws.send('something');
// });

// ws.on('message', function incoming(data) {
//   console.log(data);
// });

// Allybot.Main.start();
// console.log(Allybot)
