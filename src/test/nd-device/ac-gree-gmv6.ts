import { ACGREEGMV6 } from "../../device/amd/modbus/ac-gree-gmv6";
import { Modbus } from "../../device/amd/modbus/base/device";
import { IDeviceBusDataPayload, IDeviceBusEventData } from "../../device/device.dts";


let device = new ACGREEGMV6({
    "id" : "ndiot485519666fc5",
    "app_id" : "ndiot",
    "desc" : "武汉云启/485透传/ndiot485519666fc5",
    "dom_id" : "yunqi",
    "model" : "COM-PENET-HALF",
    "pid" : null,
    "type" : "",
    "vendor" : "ND"    
});

let payload : IDeviceBusDataPayload = {
    hd: {
        entry: {
            type: "svc",
            id: "get"
        }        
    },
    pld: {}
}
let msg: IDeviceBusEventData = {
    id: device.attrs.id,
    payload:  payload
}

device.on_north_input(msg);


