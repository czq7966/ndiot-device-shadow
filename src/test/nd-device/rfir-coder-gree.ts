// import { RFIRDeviceACGree } from "../../device/amd/rfir/ac-gree";
// import { RfirCoder, ISegCoderParam, SegCoderParam } from "../../device/amd/rfir/coder";

import { PntTable } from "../../device/amd/coders/rfir/ac-gree/pnt-table";
import { Table, TableBits } from "../../device/amd/coders/rfir/ac-gree/table";
import { RFIRDeviceACGree } from "../../device/amd/rfir/ac-gree";
import { IDeviceBusDataPayload, IDeviceBusEventData } from "../../device/device.dts";

let device = new  RFIRDeviceACGree({
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
        power: "on"
    }

}

let codesOpen1 = [8846,4494,651,1654,652,553,651,553,651,1657,652,553,
    652,555,654,551,654,552,652,1656,652,554,652,553,654,1654,654,551,655,554,653,553,652,553,655,553,651,554,651,555,653,554,651,554,654,1655,653,551,655,551,656,552,653,554,652,553,653,554,652,1656,652,554,653,1654,653,553,652
    ,555,661,1646,653,552,654,19992,651,552,652,553,654,553,657,549,651,555,653,553,629,577,653,555,651,554,653,553,653,553,655,553,652,553,653,565,647,1652,652,554,652,555,652,553,629,576,654,554,652,554,652,555,653,553,651,555,653,553,654,553,653,552,655,552,653,552,658,548,654,555,652,554,654,40011];
    
let codesOpen2 = [8975,4496,651,1654,653,554,654,551,655,1655,652,554,651,553,654,552,654,553,654,1656,652,551,654,552,653,1661,626,577,652,553,653,553,654,553,654,553,668,539,651,554,653,553,653,555,650,1659,651,552,651,556,654,552,653,553,652,554,654,554,651,1657,651,1656,653,1655,652,553,653,553,653,1655,655,552,654,19990,649,552,653,552,655,554,653,553,654,552,653,554,651,555,653,562,
    645,554,652,552,655,554,652,552,655,552,654,553,650,555,653,554,652,555,653,553,652,553,654,552,
    653,554,654,554,652,554,652,1656,652,553,654,553,652,554,653,552,653,555,654,552,653,1656,654,552,654,65535];



let codesClose1 = [8845,4493,651,1656,651,553,652,553,652,554,654,553,652,554,653,553,654,554,652,1653,655,553,654,552,655,1655,653,552,650,555,653,554,653,552,655,553,653,551,652,556,653,554,653,552
,655,1655,651,553,653,556,650,554,653,552,654,553,654,553,652,1660,648,555,651,1657,650,553,630,576,654,1655,653,551,655,20004,635,552,654,553,652,554,652,552,631,577,629,575,655,553,654,561,644,554,653,553,653,553,655,552,651,555,654,551,653,1656,653,552,653,553,653,553,630,577,652,555,
653,553,655,551,652,555,654,552,654,552,654,552,655,552,654,553,653,553,653,553,653,552,653,1657,652,40002];

let codesClose2 = [8990,4475,653,1666,643,553,653,552,651,555,654,553,652,552,655,553,654,553,652,1656,653,554,660,547,651,1655,653,552,652,552,655,553,653,553,653,553,655,551,654,554,651,553,654,554,
653,1656,654,551,654,552,654,553,655,552,653,552,652,554,655,1654,654,1654,654,1653,598,635,653,553,655,1658,
650,552,652,19993,651,552,653,553,657,550,652,554,652,553,655,551,655,552,653,557,651,551,654,552,656,553,653,552,653,553,654,553,654,552,653,554,653,553,653,554,653,553,653,575,641,545,652,554,654,551,653,1657,652,553,653,553,655,552,628,577,654,554,653,553,653,1655,654,1655,651,65535]



setTimeout(()=>{
    // device.on_north_input({payload: payload})
    let bytess = device.rfir_coder.decodeBytes(codesOpen1);
    device.gree_coder.pnt_table.decodeBytess(bytess);
    console.log("1111", device.gree_coder.pnt_table.table, device.gree_coder.pnt_table.getsum(), 
    device.gree_coder.pnt_table.encodeBytess(), device.gree_coder.pnt_table.encodeBytess(true));

    bytess = device.rfir_coder.decodeBytes(codesOpen2);
    device.gree_coder.pnt_table.decodeBytess(bytess);
    console.log("2222", device.gree_coder.pnt_table.table, device.gree_coder.pnt_table.getsum(), 
    device.gree_coder.pnt_table.encodeBytess(), device.gree_coder.pnt_table.encodeBytess(true));

    bytess = device.rfir_coder.decodeBytes(codesClose1);
    device.gree_coder.pnt_table.decodeBytess(bytess);
    console.log("3333", device.gree_coder.pnt_table.table, device.gree_coder.pnt_table.getsum(), 
    device.gree_coder.pnt_table.encodeBytess(), device.gree_coder.pnt_table.encodeBytess(true));

    bytess = device.rfir_coder.decodeBytes(codesClose2);
    device.gree_coder.pnt_table.decodeBytess(bytess);
    console.log("4444", device.gree_coder.pnt_table.table, device.gree_coder.pnt_table.getsum(), 
    device.gree_coder.pnt_table.encodeBytess(), device.gree_coder.pnt_table.encodeBytess(true));

    // device.gree_coder.pnt_table.checksum()
    // console.log("2222", device.gree_coder.pnt_table)




    // bytess = device.rfir_coder.decodeBytes(codes1);
    // device.gree_coder.pnt_table.decodeBytess(bytess);
    // console.log(device.gree_coder.pnt_table)

});
// device.on_north_input({payload: payload})
// let buf = device.rfir_coder.encodeBytes([ [ 8, 9, 96, 80 ], [ false, true, false ], [ 0, 32, 0, 208 ] ] as any)
// console.log(buf)

// let bytes1 = [0x1, 0x2, 0x3, 0x4];
// let bits2 = [false, true, false];
// let bytes3 = [0x5, 0x6, 0x7, 0x8];
// setTimeout(()=>{

//     let codess = device.rfir_coder.encodeBytes([bytes1, bits2 as any, bytes3 ]);

//     console.log(codess, codess.length, device.rfir_coder.params);
// });


// // let bytess = coder.decodeBytes(codess)

// // console.log(bytess)

// // let buf =  [143,34,118,17,149,2,110,6,149,2,32,2,149,2,34,2,149,2,33,2,150,2,113,6,147,2,110,6,150,2,32,2,151,2,31,2,149,2,120,6,141,2,33,2,150,2,32,2,148,2,128,6,134,2,34,2,149,2,33,2,147,2,33,2,151,2,33,2,150,2,30,2,150,2,34,2,149,2,32,2,151,2,32,2,149,2,34,2,147,2,114,6,148,2,34,2,147,2,35,2,148,2,34,2,150,2,32,2,149,2,34,2,151,2,31,2,150,2,112,6,148,2,33,2,151,2,117,6,143,2,31,2,151,2,32,2,149,2,112,6,148,2,34,2,150,2,43,78,116,2,34,2,149,2,34,2,148,2,32,2,151,2,34,2,148,2,33,2,149,2,33,2,150,2,32,2,150,2,34,2,148,2,34,2,149,2,34,2,148,2,32,2,149,2,33,2,150,2,33,2,148,2,34,2,149,2,111,6,148,2,34,2,148,2,34,2,169,2,14,2,149,2,33,2,150,2,33,2,147,2,36,2,147,2,34,2,149,2,33,2,150,2,32,2,150,2,34,2,147,2,35,2,149,2,33,2,149,2,32,2,151,2,33,2,148,2,33,2,149,2,34,2,125,2,136,6,149,2,68,156,46,35,106,17,147,2,123,6,137,2,33,2,150,2,32,2,149,2,34,2,148,2,113,6,147,2,112,6,149,2,31,2,151,2,34,2,148,2,112,6,150,2,32,2,149,2,34,2,147,2,113,6,147,2,32,2,149,2,32,2,149,2,36,2,148,2,35,2,148,2,33,2,147,2,55,2,137,2,26,2,148,2,33,2,150,2,33,2,149,2,111,6,150,2,32,2,149,2,33,2,150,2,32,2,151,2,32,2,148,2,34,2,149,2,32,2,150,2,113,6,149,2,111,6,148,2,111,6,156,2,26,2,149,2,33,2,149,2,110,6,157,2,25,2,150,2,13,78,147,2,33,2,150,2,32,2,148,2,41,2,143,2,33,2,149,2,32,2,149,2,33,2,151,2,33,2,147,2,34,2,150,2,31,2,151,2,33,2,149,2,34,2,148,2,35,2,148,2,33,2,149,2,33,2,151,2,32,2,149,2,33,2,157,2,53,2,134,2,21,2,149,2,38,2,143,2,42,2,159,2,104,6				]

// // console.log("111", buf.length);

// // let bytes = device.coder.payload.decode(Buffer.from(buf));
// console.log("222", bytes)


// let table = new PntTable()
// let table1 = new PntTable()
// table.setMode(PntTable.ModeCool)
// table.setPower(true)
// table.table.Light = 0;
// table1.setRaw(table.getRaw());

// console.log(table.table, table.getRaw())
// console.log(table1.table, table1.getRaw())



