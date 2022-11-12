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
        temperature: 22,
        mode: "cool"
    }

}

let msg = {
    payload: payload
}

setTimeout(()=>{
 

    device.on_north_input(msg);
    let raw = device.ac_coder.pnt_table.getRaw();
    device.ac_coder.pnt_table.setRaw(raw);

    console.log(device.ac_coder.pnt_table.table, 
        device.ac_coder.pnt_table.getTemp(),
        device.ac_coder.pnt_table.getMode())



});

let buf = [0x84, 0x03, 0x02, 0x81 ]

let v = 0x81020384;

console.log(v)
let idx = 0
// v = buf[idx++] + (buf[idx++] << 8) + (buf[idx++] << 16) + (buf[idx++] << 24);
let sid = [buf[idx++], buf[idx++], buf[idx++], buf[idx++]];

console.log(v, Buffer.from(sid).readUint32BE(), Buffer.from(sid).readUint32LE())




