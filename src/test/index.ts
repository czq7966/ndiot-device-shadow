import EventEmitter = require("events");
import { DeviceManager } from "../device/manager";

let manager = new DeviceManager();

manager.plugins.regPlugin("device-base", "E:/data/ndiot-device-shadow/dist/device/amd/device/index.js");
// manager.plugins.regPlugin("ACGree", "E:/data/ndiot-device-shadow/dist/device/amd/ac-gree/index.js");

let plugins = ["device-base"]

let pdev = {id: "pid", pid: null, model: "device-base"};
let dev = {id: "id", pid: "pid", model: "device-base"}

manager.shadows.newShadow(pdev)
.then(pshadow => {
    manager.shadows.newShadow(dev)
    .then(shadow => {
        shadow.events.south.input.emit({id: shadow.device.id, payload: ""});
        shadow.events.north.input.emit({id: shadow.device.id, payload: ""});
    })
    // console.log(shadow)        
    // manager.shadows.newShadow(name, name+"1", null);
    
})


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
