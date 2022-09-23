import EventEmitter = require("events");
import { CRC16 } from "../common/crc16";
import { GModeBusRTU, ModbusCmd, ModbusCmds, ModbusRTU, ModbusRTUTable } from "../common/modbus";
import { DataTable } from "../device/amd/fire/qtl-tx3016a/datatable";
import { ACPGDTM7000F } from "../device/amd/modbus/ac-pgdtm7000-f";
import { DeviceManager } from "../device/manager";

let manager = new DeviceManager();

// manager.plugins.regPlugin({id: "device-base", url: "E:/data/ndiot-device-shadow/dist/device/amd/device/index.js"});
// manager.plugins.regPlugin({id: "Z3CO2652ESP8266-test", url: "E:/data/ndiot-device-shadow/dist/device/amd/zigbee2mqtt/index.js"});
// // manager.plugins.regPlugin("ACGree", "E:/data/ndiot-device-shadow/dist/device/amd/ac-gree/index.js");

// let plugins = ["device-base"]

// let pdev = {id: "pid", pid: null, model: "device-base"};

// for (let i = 0; i < 1; i++) {
//     let dev = {id: "id-test-" + i, pid: null, model: "Z3CO2652ESP8266-test"}
//     manager.shadows.newShadow(dev)   
    
// }


// manager.shadows.newShadow(pdev)




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



// setTimeout(() => {
//     manager.shadows.delShadow("id-test")
// }, 3000)


// let buf = CRC16.Modbus("55FEFE010010", "hex");
// console.log(buf[0], buf[1])

// let modbus = new ACPGDTM7000F({} as any)

// ************Modbus
if (false) {
    let tables = [];
    for (let i = 0; i < 1; i++) {
        let table = new ModbusRTUTable(100000);
        table.slave = 0x32;
        table.address = 40001;
        table.quantity = 1;
        table.setPLCAddress(440002)
        
        tables.push(table);
        
    }


    let cmds = new ModbusCmds();

    cmds.events.req.on((data: Buffer) => {
        console.log(data)
        let res = [0x32, 0x03, 0x02, 0x01, 0x01]
        let crc = CRC16.Modbus(Buffer.from(res));
        res.push(crc[0], crc[1]);
        cmds.events.res.emit(Buffer.from(res));
    })

    let cmd = cmds.exec(tables)
    cmd.events.then.once(v => {
        console.log("555555555555555", v);

    })
    cmd.events.catch.once(e => {
        console.log("44444444444444", e);
    })
}


// 消防

let str = 
`40 40 DD 81 02 01 00 00 00 00 00 00 01 00 00 00 00 00 00 00 00 00 00 00 34 00 02 02 01 01 01 B5 30 30 31 32 35 33 30 32 53 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 02 14 0F 06 09 16 7C 23 23
40 40 DE 81 02 01 00 00 00 00 00 00 01 00 00 00 00 00 00 00 00 00 00 00 02 00 02 0A 00 71 23 23 40 40 DE 81 02 01 00 00 00 00 00 00 01 00 00 00 00 00 00 00 00 00 00 00 0F 00 02 0A 01 00 00 00 00 1A 00 00 00 00 00 00 00 00 99 23 23
40 40 DF 81 02 01 00 00 00 00 00 00 01 00 00 00 00 00 00 00 00 00 00 00 34 00 02 02 01 01 01 4E 31 30 31 30 31 30 31 33 01 D2 BB B2 E3 D3 D2 CC DD BF DA 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 2C 1A 0F 06 09 16 F8 23 23
40 40 E0 81 02 01 00 00 00 00 00 00 01 00 00 00 00 00 00 00 00 00 00 00 02 00 02 09 00 72 23 23 40 40 E0 81 02 01 00 00 00 00 00 00 01 00 00 00 00 00 00 00 00 00 00 00 00 00 03 68 23 23
40 40 E1 81 02 01 00 00 00 00 00 00 01 00 00 00 00 00 00 00 00 00 00 00 98 00 02 02 03 01 01 88 31 30 31 30 31 30 39 32 50 D2 BB B2 E3 D3 EA C1 DC B7 A7 BC E4 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 31 1A 0F 06 09 16 01 01 79 30 30 31 30 32 31 34 39 50 B1 C3 B7 BF CF FB B7 C0 B1 C3 B5 CD D1 B9 BF AA B9 D8 00 00 00 00 00 00 00 00 00 00 00 00 00 00 32 1A 0F 06 09 16 01 01 79 30 30 31 30 32 31 36 39 50 B1 C3 B7 BF C5 E7 C1 DC B1 C3 B5 CD D1 B9 BF AA B9 D8 00 00 00 00 00 00 00 00 00 00 00 00 00 00 32 1A 0F 06 09 16 72 23 23
40 40 E2 81 02 01 00 00 00 00 00 00 01 00 00 00 00 00 00 00 00 00 00 00 02 00 02 09 00 74 23 23 40 40 E2 81 02 01 00 00 00 00 00 00 01 00 00 00 00 00 00 00 00 00 00 00 00 00 03 6A 23 23
40 40 E3 81 02 01 00 00 00 00 00 00 01 00 00 00 00 00 00 00 00 00 00 00 02 00 02 09 00 75 23 23 40 40 E3 81 02 01 00 00 00 00 00 00 01 00 00 00 00 00 00 00 00 00 00 00 00 00 03 6B 23 23
40 40 E4 81 02 01 00 00 00 00 00 00 01 00 00 00 00 00 00 00 00 00 00 00 02 00 02 09 00 76 23 23 40 40 E4 81 02 01 00 00 00 00 00 00 01 00 00 00 00 00 00 00 00 00 00 00 00 00 03 6C 23 23
40 40 E5 81 02 01 00 00 00 00 00 00 01 00 00 00 00 00 00 00 00 00 00 00 02 00 02 0A 00 78 23 23 40 40 E5 81 02 01 00 00 00 00 00 00 01 00 00 00 00 00 00 00 00 00 00 00 0F 00 02 0A 01 00 00 00 00 1B 00 00 00 00 00 00 00 00 A1 23 23
40 40 E6 81 02 01 00 00 00 00 00 00 01 00 00 00 00 00 00 00 00 00 00 00 02 00 02 09 00 78 23 23 40 40 E6 81 02 01 00 00 00 00 00 00 01 00 00 00 00 00 00 00 00 00 00 00 02 00 04 46 01 B8 23 23
40 40 E6 81 02 01 00 00 00 00 00 00 01 00 00 00 00 00 00 00 00 00 00 00 0C 00 05 46 01 21 03 05 02 00 00 00 00 30 01 1F 23 23
40 40 E7 81 02 01 00 00 00 00 00 00 01 00 00 00 00 00 00 00 00 00 00 00 34 00 02 02 01 01 01 4E 30 30 31 30 34 30 34 31 15 B8 BA B6 FE B2 E3 43 34 C7 F8 B3 B5 BF E2 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 14 1B 0F 06 09 16 F1 23 23
40 40 E8 81 02 01 00 00 00 00 00 00 01 00 00 00 00 00 00 00 00 00 00 00 02 00 02 09 00 7A 23 23 40 40 E8 81 02 01 00 00 00 00 00 00 01 00 00 00 00 00 00 00 00 00 00 00 00 00 03 70 23 23
40 40 E9 81 02 01 00 00 00 00 00 00 01 00 00 00 00 00 00 00 00 00 00 00 02 00 02 09 00 7B 23 23 40 40 E9 81 02 01 00 00 00 00 00 00 01 00 00 00 00 00 00 00 00 00 00 00 00 00 03 71 23 23
40 40 EA 81 02 01 00 00 00 00 00 00 01 00 00 00 00 00 00 00 00 00 00 00 02 00 02 09 00 7C 23 23 40 40 EA 81 02 01 00 00 00 00 00 00 01 00 00 00 00 00 00 00 00 00 00 00 00 00 03 72 23 23
40 40 EB 81 02 01 00 00 00 00 00 00 01 00 00 00 00 00 00 00 00 00 00 00 02 00 02 09 00 7D 23 23 40 40 EB 81 02 01 00 00 00 00 00 00 01 00 00 00 00 00 00 00 00 00 00 00 00 00 03 73 23 23
40 40 EC 81 02 01 00 00 00 00 00 00 01 00 00 00 00 00 00 00 00 00 00 00 34 00 02 02 01 01 02 6C 31 31 34 31 34 35 36 33 00 31 34 B2 E3 B6 AB C7 B0 CA D2 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 29 1B 0F 06 09 16 98 23 23
40 40 ED 81 02 01 00 00 00 00 00 00 01 00 00 00 00 00 00 00 00 00 00 00 02 00 02 0A 00 80 23 23 40 40 ED 81 02 01 00 00 00 00 00 00 01 00 00 00 00 00 00 00 00 00 00 00 0F 00 02 0A 01 00 00 00 00 1A 00 00 00 00 00 00 00 00 A8 23 23`

str = str.replace(/\n/g, " ");

let strs = [str]
console.log(strs)

strs.forEach(str => {
    let bytes = str.split(" ");
    let data = [];
    bytes.forEach(byte => {
        data.push(parseInt("0x" + byte, 16));
    })

    DataTable.decode(Buffer.from(data));
})