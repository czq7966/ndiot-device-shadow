import { IDeviceBusEvent, IDeviceBusEventData } from "../src/device/device.dts"
import { DeviceManager } from "../src/device/manager"

import "./mocha"
import assert = require('assert');
import { Debuger } from "../src/device";
import path = require("path");


const manager = new DeviceManager()

Debuger.Debuger = Debuger.Nothing;




describe('爱希ISE人体存在感应器', function () {
    describe('插件管理', function () {
        const url = path.resolve(__dirname, "../../dist/node-red/amd/modbus/ps-ise101r5/index.js");
        console.log(url)
        const attrs = {
            id:"PS-ISE101R5",
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
            id : "ndiotac0bfbc1cd77",
            name : "爱希ISE人体存在感应器",
            app_id : "ndiot",
            dom_id : "dev",
            vendor : "ND",
            model : "PS-ISE101R5",
            type: "PS"
        }

            
        it('添加影子', function () {
            const msg: IDeviceBusEventData = {
                action: "create",
                payload: device
            }

            manager.events.shadows.output.once((data: IDeviceBusEventData) => {
                if (data.payload.shadow)
                    assert.ok(true);
                else
                    assert.fail("创建失败")
            })

            manager.events.shadows.input.emit(msg)      
        });        

        it('北向查询', function () {
            const msg: IDeviceBusEventData = {
                id: device.id,
                payload: {
                    hd:{entry:{id:"get"}}
                }
            }

            manager.on_north_input(msg)      
        });   

    });
});