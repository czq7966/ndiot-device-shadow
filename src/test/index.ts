import EventEmitter = require("events");
import { CRC16 } from "../common/crc16";
import { GModeBusRTU, ModbusCmd, ModbusCmds, ModbusRTU, ModbusRTUTable } from "../common/modbus";
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

let tables = [];
for (let i = 0; i < 1; i++) {
    let table = new ModbusRTUTable();
    table.plcbase = 100000;
    table.slave = 0x32;
    table.address = 40001;
    table.quantity = 1;
    table.setPLCAddress(440002)
    
    tables.push(table);
    
}


// let cmd = new ModbusCmd(tables);
// cmd.events.req.on((data: Buffer) => {
//     console.log(data)
//     let res = [0x32, 0x03, 0x02, 0x00, 0x00, 0xbc, 0x40]
//     cmd.events.res.emit(Buffer.from(res));

// })

// cmd.exec()
// .then(v => {
//     console.log("11111111111111111111111111", v);
// })
// .catch(e => {
//     console.log("222222222222222222222222222", e);

// })

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