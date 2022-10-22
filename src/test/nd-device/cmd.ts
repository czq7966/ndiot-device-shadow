import { Cmd } from "../../device/amd/nd-device/cmd";
import { RegTable } from "../../device/amd/nd-device/regtable";

let cmd = new Cmd();
let buf = Buffer.from([0x44, 0x4e, 0x00, 0x00, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x10, 0x00, 0x54, 0xec, 0x0c, 0x00, 0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x30, 0x0d, 0x0a]);

cmd.decode(buf);


console.log(cmd);


// let msg = {
//     hd: { cmd_id: 7 },
//     pld: { '60500': { type: 'Buffer', data: [48, 49, 50, 51, 52] } }
//   }

// let cmd = new Cmd();
// let buf = cmd.encode(msg.hd, msg.pld);



// console.log(buf);

// buf = Buffer.from("abc");
// console.log(buf)

