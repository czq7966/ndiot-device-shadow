import { IDeviceBusEvent, IDeviceBusEventData } from "../src/device/device.dts"
import { DeviceManager } from "../src/device/manager"

import "./mocha"
import assert = require('assert');
import { Debuger } from "../src/device";


const manager = new DeviceManager()

Debuger.Debuger = Debuger.Nothing;




describe('边缘组件', function () {
    describe('影子设备管理', function () {
        const device = {
            id : "ESP8266x00de93f7",
            name : "YT3-F30",
            app_id : "ndiot",
            dom_id : "nd",
            vendor : "ND",
            model : "RFIR-AC-GREE-ND",
        }

            
        it('添加影子设备', function () {
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

        it('获取影子设备', function () {
            if (!manager.shadows.getShadow(device.id))
                assert.fail('获取影子设备失败');
 
        });    

        it('移除影子设备', function () {
            if (!manager.shadows.delShadow(device.id))
                assert.fail('获取影子设备失败');
            return;  
        });

    


    });
});