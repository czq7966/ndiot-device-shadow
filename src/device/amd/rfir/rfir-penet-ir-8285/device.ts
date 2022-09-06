import { Debuger, DeviceBase } from "../../../device-base";
import { IDeviceBase, IDeviceBusEventData, IDeviceShadow } from "../../../device.dts";

export interface IDevice extends IDeviceBase {}

export  class RfirPenetIr8285 extends DeviceBase implements IDevice {

    //初始化
    init() {
        Debuger.Debuger.log("RfirPenetIr8285 init");
    }
     
    //反初始化
    uninit() {
        Debuger.Debuger.log("RfirPenetIr8285 uninit");
     }

    //南向输入
    on_south_input(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("RfirPenetIr8285  on_south_input ");

        //父设备 todo...
        //父设备输出给子设备，msg.id = child.id
        //msg.id = child.id
        //this.events.parent.output.emit(msg); 

        //正常 todo...
        super.on_south_input(msg);
    }

    //北向输入
    on_north_input(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("RfirPenetIr8285  on_north_input");
        //todo ...
        super.on_north_input(msg);
    }    

    //子设备输入
    on_child_input(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("RfirPenetIr8285  on_child_input");
        //todo...
        super.on_child_input(msg);       
    }  
}