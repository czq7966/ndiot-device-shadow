import { IDeviceBusEvent, IDeviceBusEventData } from "../src/device/device.dts"
import { DeviceManager } from "../src/device/manager"

import "./mocha"
import assert = require('assert');
import { Debuger } from "../src/device";
import path = require("path");
import * as QtlTx3016aDatatable from "../src/device/amd/fire/qtl-tx3016a/datatable"
import { resolve } from "path";

const manager = new DeviceManager()

Debuger.Debuger = Debuger.Nothing;





describe('振华大厦消防系统', function () {
    describe('插件管理', function () {
        const url = path.resolve(__dirname, "../../dist/node-red/amd/fire/qtl-tx3016a/index.js");
        console.log(url)
        const attrs = {
            id:"QTL-TX3016A",
            url: url
        }

            
        it('注册插件', function () {
            const msg: IDeviceBusEventData = {
                action: "reg",
                payload: attrs
            }

            manager.events.plugins.output.once((data: IDeviceBusEventData) => {
                assert.equal(data.payload.url, msg.payload.url);
            })
            manager.events.plugins.input.emit(msg);      
        });

        it('加载插件（异步）', async function () {
            return new Promise((resolve, reject) => {
                const msg: IDeviceBusEventData = {
                    action: "load",
                    payload: attrs
                }
                manager.events.plugins.output.once((data: IDeviceBusEventData) => {
                    if (data.payload)
                        resolve()
                    else
                        reject()
                })
    
                manager.events.plugins.input.emit(msg);    
            })  
        });    

        const device = {
            id : "ndiot58bf25c04040",
            name : "振华大厦消防系统",
            app_id : "ndiot",
            dom_id : "dev",
            vendor : "ND",
            model : "QTL-TX3016A",
            type: "FIRE",
            sub_pref: "zhds"
        }

            
        it('添加影子', function () {
            return new Promise((resolve, reject)=>{
                const msg: IDeviceBusEventData = {
                    action: "create",
                    payload: device
                }
    
                manager.events.shadows.output.once((data: IDeviceBusEventData) => {
                    if (data.payload.shadow){
                        // assert.ok(true);
                        resolve("创建成功");
                    }
                    else {
                        // assert.fail("创建失败");
                        reject("创建失败")
                    }
                })
    
                manager.events.shadows.input.emit(msg)    
            })
  
        });        

        // it('直接解码', function () {
        //     const datas = [];
        //     // datas.push([0x40,0x40,0xDD,0x81,0x02,0x01,0x00,0x00,0x00,0x00,0x00,0x00,0x01,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x34,0x00,0x02,0x02,0x01,0x01,0x01,0xB5,0x30,0x30,0x31,0x32,0x35,0x33,0x30,0x32,0x53,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x02,0x14,0x0F,0x06,0x09,0x16,0x7C,0x23,0x23]);
        //     // datas.push([0x40,0x40,0xE1,0x81,0x02,0x01,0x00,0x00,0x00,0x00,0x00,0x00,0x01,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x98,0x00,0x02,0x02,0x03,0x01,0x01,0x88,0x31,0x30,0x31,0x30,0x31,0x30,0x39,0x32,0x50,0xD2,0xBB,0xB2,0xE3,0xD3,0xEA,0xC1,0xDC,0xB7,0xA7,0xBC,0xE4,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x31,0x1A,0x0F,0x06,0x09,0x16,0x01,0x01,0x79,0x30,0x30,0x31,0x30,0x32,0x31,0x34,0x39,0x50,0xB1,0xC3,0xB7,0xBF,0xCF,0xFB,0xB7,0xC0,0xB1,0xC3,0xB5,0xCD,0xD1,0xB9,0xBF,0xAA,0xB9,0xD8,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x32,0x1A,0x0F,0x06,0x09,0x16,0x01,0x01,0x79,0x30,0x30,0x31,0x30,0x32,0x31,0x36,0x39,0x50,0xB1,0xC3,0xB7,0xBF,0xC5,0xE7,0xC1,0xDC,0xB1,0xC3,0xB5,0xCD,0xD1,0xB9,0xBF,0xAA,0xB9,0xD8,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x32,0x1A,0x0F,0x06,0x09,0x16,0x72,0x23,0x23]);
        //     // datas.push([64,64,41,176,2,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,15,0,2,10,1,0,0,0,0,28,0,0,0,0,0,0,0,0,21,35,35]);
        //     datas.push([
        //         64,
		// 	64,
		// 	176,
		// 	176,
		// 	2,
		// 	1,
		// 	0,
		// 	0,
		// 	0,
		// 	0,
		// 	0,
		// 	0,
		// 	1,
		// 	0,
		// 	0,
		// 	0,
		// 	0,
		// 	0,
		// 	0,
		// 	0,
		// 	0,
		// 	0,
		// 	0,
		// 	0,
		// 	102,
		// 	0,
		// 	2,
		// 	2,
		// 	2,
		// 	1,
		// 	1,
		// 	136,
		// 	49,
		// 	48,
		// 	49,
		// 	48,
		// 	49,
		// 	48,
		// 	57,
		// 	50,
		// 	80,
		// 	210,
		// 	187,
		// 	178,
		// 	227,
		// 	211,
		// 	234,
		// 	193,
		// 	220,
		// 	183,
		// 	167,
		// 	188,
		// 	228,
		// 	0,
		// 	0,
		// 	0,
		// 	0,
		// 	0,
		// 	0,
		// 	0,
		// 	0,
		// 	0,
		// 	0,
		// 	0,
		// 	0,
		// 	0,
		// 	0,
		// 	0,
		// 	0,
		// 	0,
		// 	0,
		// 	0,
		// 	0,
		// 	57,
		// 	58,
		// 	14,
		// 	21,
		// 	2,
		// 	23,
		// 	1,
		// 	1,
		// 	121,
		// 	48,
		// 	48,
		// 	49,
		// 	48,
		// 	50,
		// 	49,
		// 	54,
		// 	57,
		// 	80,
		// 	177,
		// 	195,
		// 	183,
		// 	191,
		// 	197,
		// 	231,
		// 	193,
		// 	220,
		// 	177,
		// 	195,
		// 	181,
		// 	205,
		// 	209,
		// 	185,
		// 	191,
		// 	170,
		// 	185,
		// 	216,
		// 	0,
		// 	0,
		// 	0,
		// 	0,
		// 	0,
		// 	0,
		// 	0,
		// 	0,
		// 	0,
		// 	0,
		// 	0,
		// 	0,
		// 	0,
		// 	0,
		// 	58,
		// 	58,
		// 	14,
		// 	21,
		// 	2,
		// 	23,
		// 	28,
		// 	35,
		// 	35
        //     ]);
        //     datas.forEach(data => {
        //         const result = QtlTx3016aDatatable.DataTable.decode(Buffer.from(data));
        //         console.log("aaaaaaaaaaaaaaaaaa");
        //         console.log(result, result[0].app.infos);

        //     });
        // });  
        

        it('南向输入',function(){
            return new Promise((resolve, reject)=>{
                const msg = {
                    "topic" : "0/0/dev/ndiot58bf25c04040/0/0/0/0",
                    "payload" : Buffer.from([
                            68,
                            78,
                            0,
                            0,
                            7,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            224,
                            0,
                            136,
                            0,
                            84,
                            236,
                            132,
                            0,
                            64,
                            64,
                            176,
                            176,
                            2,
                            1,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            1,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            102,
                            0,
                            2,
                            2,
                            2,
                            1,
                            1,
                            136,
                            49,
                            48,
                            49,
                            48,
                            49,
                            48,
                            57,
                            50,
                            80,
                            210,
                            187,
                            178,
                            227,
                            211,
                            234,
                            193,
                            220,
                            183,
                            167,
                            188,
                            228,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            57,
                            58,
                            14,
                            21,
                            2,
                            23,
                            1,
                            1,
                            121,
                            48,
                            48,
                            49,
                            48,
                            50,
                            49,
                            54,
                            57,
                            80,
                            177,
                            195,
                            183,
                            191,
                            197,
                            231,
                            193,
                            220,
                            177,
                            195,
                            181,
                            205,
                            209,
                            185,
                            191,
                            170,
                            185,
                            216,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            58,
                            58,
                            14,
                            21,
                            2,
                            23,
                            28,
                            35,
                            35
                        ]
                    ),
                    "qos" : 0,
                    "retain" : false,
                    "_msgid" : "7518d5e5d2c79ccd",
                    "id" : "ndiot58bf25c04040",
                    "tms" : 1676961708535,
                    "tm" : "2/21/2023, 2:41:48 PM",
                    "from" : "south"
                }
                manager.events.north.output.on(data => {
                    console.log("1111111111111111",data);
                    resolve("OK");
                })
                manager.events.south.input.emit(msg);                
            })


        });  

    });
});

