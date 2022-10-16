// let crc = require("../common/crc16")
// let cmd = Buffer.from([1,2]);
// let head = Buffer.from([0x55, 0xFE, 0xFE]);
// let data = Buffer.alloc(3 + cmd.length + 2);
// head.copy(data);
// cmd.copy(data, head.length);
// console.log(data)

// let abc = new ACPGDTM7000F()
// let arr = [];
// let abc="abc";
// arr.push('a'.charCodeAt());
// arr.push('b'.charCodeAt());
// arr.push('c'.charCodeAt());
// arr.push(0);
// arr.push('d'.charCodeAt());
// let buf = Buffer.from(arr);

let abc="60000";
let buf=Buffer.from([48,49,50,0]);

let b =  buf.subarray(1, 3);




console.log(buf.toString(),b.toString());
