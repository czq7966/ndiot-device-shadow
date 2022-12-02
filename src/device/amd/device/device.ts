import { Debuger, DeviceBase } from "../../device-base";
import { IDeviceBase, IDeviceBusEventData } from "../../device.dts";

export type IDevice = IDeviceBase

export class Device extends DeviceBase implements IDevice {

    //初始化
    init() {
        Debuger.Debuger.log("Device init");
    }
     
    //反初始化
    uninit() {
        Debuger.Debuger.log("Device uninit");
     }

    //南向输入
    on_south_input(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("Device  on_south_input ");

        //父设备 todo...
        //父设备输出给子设备，msg.id = child.id
        //msg.id = child.id
        //this.events.parent.output.emit(msg); 

        //正常 todo...
        super.on_south_input(msg);
    }

    //北向输入
    on_north_input(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("Device  on_north_input");
        //todo ...
        super.on_north_input(msg);
    }    

    //子设备输入
    on_child_input(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("Device  on_child_input");
        //todo...
        super.on_child_input(msg);       
    }  
}