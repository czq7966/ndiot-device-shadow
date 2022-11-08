import { NDDevice } from "../../device/amd/nd-device/device";
import { IDeviceBusDataPayload, IDeviceBusEventData } from "../../device/device.dts";

let device = new NDDevice({
    "id" : "ndiot485519666fc5",
    "app_id" : "ndiot",
    "desc" : "武汉云启/485透传/ndiot485519666fc5",
    "dom_id" : "yunqi",
    "model" : "COM-PENET-HALF",
    "pid" : null,
    "type" : "",
    "vendor" : "ND"    
});

// let payload : IDeviceBusDataPayload = {
//     hd: {
//         entry: {
//             type: "svc",
//             id: "reboot"
//         }        
//     },
//     pld: {}
// }

let payload : IDeviceBusDataPayload = { hd: { entry: { id: 'get' } }, pld: { ota_update_url: '' } }

let msg: IDeviceBusEventData = {
    id: device.attrs.id,
    payload:  payload
}

device.on_north_input(msg);


