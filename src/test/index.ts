import EventEmitter = require("events");
import { DeviceManager } from "../device/manager";

let manager = new DeviceManager();

manager.models.regModel("device-base", "E:/data/ndiot-device-shadow/dist/device/amd/device/index.js");
// manager.models.regModel("ACGree", "E:/data/ndiot-device-shadow/dist/device/amd/ac-gree/index.js");
manager.models.regModel("ACGree", "device-base");

let models = ["device-base"]


models.forEach(name => {
    manager.shadows.newShadow(name, name, null)
    .then(shadow => {
        // console.log(shadow)        
        // manager.shadows.newShadow(name, name+"1", null);
        shadow.events.south.input.emit({id: shadow.device.id, payload: ""})
    })
    .catch(err => {
        console.log(err)
    })
})


let event = new EventEmitter();
event.on("1", () => {
    console.log("111")
})

event.prependListener ("1", () => {
    console.log("222")
})

event.emit("1")
