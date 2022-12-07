import { IDeviceBusEvent, IDeviceBusEventData } from "../src/device/device.dts"
import { DeviceManager } from "../src/device/manager"

import "./mocha"
import assert = require('assert');
import { Debuger } from "../src/device";


const manager = new DeviceManager()

Debuger.Debuger = Debuger.Nothing;




describe('边缘组件', function () {
    describe('设备影子', function () {
        const device = {
            id : "ESP8266x00de93f7",
            name : "YT3-F30",
            app_id : "ndiot",
            dom_id : "nd",
            vendor : "ND",
            model : "AC",
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

        it('获取影子', function () {
            if (!manager.shadows.getShadow(device.id))
                assert.fail('获取影子设备失败'); 
        });    

        it('南向输入', function () {
            const shadow = manager.shadows.getShadow(device.id);
            const msg: IDeviceBusEventData = {};
            msg.id = device.id;
            msg.payload = {}
            shadow.events.south.input.emit(msg);
        });    
        it('北向输入', function () {
            const shadow = manager.shadows.getShadow(device.id);
            const msg: IDeviceBusEventData = {};
            msg.id = device.id;
            msg.payload = {hd:{}, pld:{}}
            shadow.events.north.input.emit(msg);
        });    
        it('子影子输入', function () {
            const shadow = manager.shadows.getShadow(device.id);
            const msg: IDeviceBusEventData = {};
            msg.id = device.id;
            msg.payload = {hd:{}, pld:{}}
            shadow.events.child.input.emit(msg);
        });   
        it('父影子输入', function () {
            const shadow = manager.shadows.getShadow(device.id);
            const msg: IDeviceBusEventData = {};
            msg.id = device.id;
            msg.payload = {hd:{}, pld:{}}
            shadow.events.parent.input.emit(msg);
        });   
        it('配置输入', function () {
            const shadow = manager.shadows.getShadow(device.id);
            const msg: IDeviceBusEventData = {};
            msg.id = device.id;
            msg.payload = {hd:{}, pld:{}}
            shadow.events.config.input.emit(msg);
        });  
        it('通知输入', function () {
            const shadow = manager.shadows.getShadow(device.id);
            const msg: IDeviceBusEventData = {};
            msg.id = device.id;
            msg.payload = {hd:{}, pld:{}}
            shadow.events.notify.input.emit(msg);
        }); 


    });
});