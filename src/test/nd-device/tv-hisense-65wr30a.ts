import { ICmdHead, IHead } from "../../device/amd/nd-device/cmd";
import { TV_HISENSE_65WR30A } from "../../device/amd/tv/tv-hisense-65wr30a";

let device = new TV_HISENSE_65WR30A({
    "id" : "ndiot485519614d25",
    "app_id" : "ndiot",
    "desc" : "武汉云启/232透传/ndiot485519614d25",
    "dom_id" : "yunqi",
    "model" : "COM-PENET",
    "pid" : null,
    "type" : "",
    "vendor" : "ND"    
});


let msg = {
    id: "ndiot485519614d25",
    payload: {
        hd: {
            entry: {
                type:"svc",
                id: "set"
            },
        },
        pld: {
            input: "analog"
        }
    }
}

// let hd: IHead = {
//     cmd_id: 7    
// }
// let pld = {
//     "60500": Buffer.from([0xdd, 0xff, 0x00, 0x07, 0xc1, 0x26, 0x00, 0x00, 0x01, 0x00, 0xe1, 0xbb, 0xcc])
// }

// let msg = {
//     payload: {
//         hd: hd, 
//         pld: pld
//     }
// }

device.on_north_input(msg as any);
