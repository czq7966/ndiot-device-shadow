import { Debuger, DeviceBase } from "../../../device-base";
import { IDeviceBase, IDeviceBusEventData } from "../../../device.dts";

export interface IQTL_TX3016A extends IDeviceBase {}

export class QTL_TX3016A extends DeviceBase implements IQTL_TX3016A {

    //初始化
    init() {
        Debuger.Debuger.log("QTL_TX3016A init");
    }
     
    //反初始化
    uninit() {
        Debuger.Debuger.log("QTL_TX3016A uninit");
     }

    //南向输入
    on_south_input(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("QTL_TX3016A  on_south_input ");

        //父设备 todo...
        //父设备输出给子设备，msg.id = child.id
        //msg.id = child.id
        //this.events.parent.output.emit(msg); 

        //正常 todo...
        super.on_south_input(msg);
    }

    //北向输入
    on_north_input(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("QTL_TX3016A  on_north_input");
        //todo ...
        super.on_north_input(msg);
    }    

    //子设备输入
    on_child_input(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("QTL_TX3016A  on_child_input");
        //todo...
        super.on_child_input(msg);       
    }  
}