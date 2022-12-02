import { IDeviceBusEvent, IDeviceBusEventData } from "../src/device/device.dts"
import { DeviceManager } from "../src/device/manager"

import "./mocha"
import assert = require('assert');
import { Debuger } from "../src/device";


const manager = new DeviceManager()

Debuger.Debuger = Debuger.Nothing;




describe('边缘组件', function () {
    describe('插件管理', function () {
        const attrs = {
            id:"RFIR-AC-GREE",
            url:"http://betacs.101.com/v0.1/static/preproduction_content_nd_iot_edg/ndiot-device-shadow/node-red/amd/rfir/ac-gree/index.js"
        }

            
        it('注册格力空调射频插件', async function () {
            const msg: IDeviceBusEventData = {
                action: "reg",
                payload: attrs
            }

            manager.events.plugins.output.once((data: IDeviceBusEventData) => {
                assert.equal(data.payload.url, msg.payload.url);
            })
            manager.events.plugins.input.emit(msg);      
        });

        it('加载格力空调射频插件（异步）', async function () {
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

        it('获取格力空调射频插件', async function () {
            return new Promise((resolve, reject) => {
                const msg: IDeviceBusEventData = {
                    action: "get",
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


    });
});