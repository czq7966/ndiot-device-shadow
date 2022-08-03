import EventEmitter = require("events");
import { DeviceManager } from "../device/manager";

let manager = new DeviceManager();

manager.plugins.regPlugin({id: "device-base", url: "E:/data/ndiot-device-shadow/dist/device/amd/device/index.js"});
manager.plugins.regPlugin({id: "Z3CO2652ESP8266-test", url: "E:/data/ndiot-device-shadow/dist/device/amd/zigbee2mqtt/index.js"});
// manager.plugins.regPlugin("ACGree", "E:/data/ndiot-device-shadow/dist/device/amd/ac-gree/index.js");

let plugins = ["device-base"]

let pdev = {id: "pid", pid: null, model: "device-base"};

for (let i = 0; i < 1; i++) {
    let dev = {id: "id-test-" + i, pid: null, model: "Z3CO2652ESP8266-test"}
    manager.shadows.newShadow(dev)   
    
}


manager.shadows.newShadow(pdev)


// manager.shadows.newShadow(pdev)
// .then(pshadow => {
//     manager.shadows.newShadow(dev)
//     .then(shadow => {
//         shadow.events.south.input.emit({id: shadow.device.id, payload: ""});
//         shadow.events.north.input.emit({id: shadow.device.id, payload: ""});
//     })
//     // console.log(shadow)        
//     // manager.shadows.newShadow(name, name+"1", null);
    
// })


// plugins.forEach(name => {
//     manager.shadows.newShadow(name, name, null)
//     .then(shadow => {
//         // console.log(shadow)        
//         // manager.shadows.newShadow(name, name+"1", null);
//         shadow.events.south.input.emit({id: shadow.device.id, payload: ""});
//         shadow.events.north.input.emit({id: shadow.device.id, payload: ""});
//     })
//     .catch(err => {
//         console.log(err)
//     })
// })


let event = new EventEmitter();
event.on("1", () => {
    console.log("111")
})

event.prependListener ("1", () => {
    console.log("222")
})

event.emit("1")

// setTimeout(() => {
//     manager.shadows.delShadow("id-test")
// }, 3000)
