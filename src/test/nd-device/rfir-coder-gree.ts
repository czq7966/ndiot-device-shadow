import { Coder, ISegCoderParam, SegCoderParam } from "../../device/amd/rfir/coder";

let coder = new  Coder();
let param1 = new SegCoderParam();


param1.tolerance = 20;
param1.excess = 0;
param1.atleast = true;                              
param1.MSBfirst = false;
param1.step = 2;

param1.nbits = 4 * 8;
param1.headermark = 9000;
param1.headerspace = 4500;
param1.onemark = 620;
param1.onespace = 1600;
param1.zeromark = 620;
param1.zerospace = 540;
param1.footermark = 0;
param1.footerspace = 0;
param1.lastspace = 0;

coder.params.push(param1);
let param2 = Object.assign({}, param1) as ISegCoderParam;
param2.nbits = 3;

coder.params.push(param2);

let param3 = Object.assign({}, param1) as ISegCoderParam;
coder.params.push(param3);


let bytes1 = [0x1, 0x2, 0x3, 0x4];
let bits2 = [false, true, false];
let bytes3 = [0x5, 0x6, 0x7, 0x8];

let codess = coder.encodeBytes([bytes1, bits2 as any, bytes3 ]);

console.log(codess, codess.length);

let bytess = coder.decodeBytes(codess)

console.log(bytess)

