import { Coder, SegCoderParam } from "../../device/amd/rfir/coder";

let coder = new  Coder();
let param = new SegCoderParam();


param.tolerance = 20;
param.excess = 0;
param.atleast = true;                              
param.MSBfirst = true;
param.step = 2;

param.nbits = 6 * 8;
param.headermark = 4390;
param.headerspace = 4420;
param.onemark = 570;
param.onespace = 1620;
param.zeromark = 570;
param.zerospace = 520;
param.footermark = 570;
param.footerspace = 5300;
param.lastspace = 0;

let bytes = [0x11, 0x2, 0x3, 0x4, 0x5, 0x6];

coder.params.push(param);

let codess = coder.encodeBytes([bytes]);

console.log(codess);

let bytess = coder.decodeBytes(codess)

console.log(bytess)

