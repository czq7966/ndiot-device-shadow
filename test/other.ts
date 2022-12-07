import "./mocha"
import assert = require('assert');
import { UUID } from "../src/common/uuid";
import { requirejs } from "../src/common/amd";
import { BaseEvent } from "../src/common/events";

UUID.Guid();
const file = "../../../dist/node-red/amd/nd-device/indes.js"
requirejs(file, [])
.catch();

const event = new BaseEvent();
event.on(()=>{return;});
event.once(()=>{return;});
event.emit(()=>{return;});
event.off(()=>{return;});

// describe('其他', function () {
//     describe('UUID操作', function () {
//         it('生成GUID', function () {
//             assert.equal(UUID.Guid(16).length, 16, "GUID指定长度生成失败");
//         });
//     });
//     describe('脚本加载', function () {
//         it('异步加载脚本', async function () {
//             const file = "../../../dist/node-red/amd/nd-device/indes.js"
//             requirejs(file, [])
//             .catch();
//         });
//     });    
// })