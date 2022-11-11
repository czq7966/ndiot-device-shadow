// import { RFIRDeviceACGree } from "../../device/amd/rfir/ac-gree";
// import { RfirCoder, ISegCoderParam, SegCoderParam } from "../../device/amd/rfir/coder";

import { RFIRDeviceACMediaND } from "../../device/amd/rfir/ac-media-nd";
import { IDeviceBusDataPayload } from "../../device/device.dts";


let device = new  RFIRDeviceACMediaND({
    "id" : "ndiot485519666fc5",
    "app_id" : "ndiot",
    "desc" : "武汉云启/485透传/ndiot485519666fc5",
    "dom_id" : "yunqi",
    "model" : "RFIR-PENET",
    "pid" : null,
    "type" : "",
    "vendor" : "ND"    
});


let payload: IDeviceBusDataPayload = {
    hd: {
        entry: {
            id: "set"
        }
    },
    pld: {
        power: "on",
        temperature: 27
    }

}

let msg = {
    payload: payload
}

setTimeout(()=>{
 

    device.on_north_input(msg);
    // console.log(device.media_coder.pnt_table.table)

});




