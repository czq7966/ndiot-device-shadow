import { ACGREEGMV6 } from "../../device/amd/modbus/ac-gree-gmv6";
import { ACHisenseHCPCH2M1C } from "../../device/amd/modbus/ac-hisense-hcpc-h2m1c";
import { Modbus } from "../../device/amd/modbus/base/device";
import { IDeviceBusDataPayload, IDeviceBusEventData } from "../../device/device.dts";


const device = new ACHisenseHCPCH2M1C({
    "id" : "ndiot485519666fc5",
    "app_id" : "ndiot",
    "desc" : "武汉云启/485透传/ndiot485519666fc5",
    "dom_id" : "yunqi",
    "model" : "COM-PENET-HALF",
    "pid" : null,
    "type" : "",
    "vendor" : "ND"    
});

const payload : IDeviceBusDataPayload = {
    hd: {
        entry: {
            type: "svc",
            id: "set"
        }        
    },
    pld: {
        power: "on"
    }
    
}
const msg: IDeviceBusEventData = {
    id: device.attrs.id,
    payload:  payload
}

device.on_north_input(msg);


