import { Debuger, DeviceBase } from "../../device-base";
import { IDeviceBase, IDeviceBusEventData } from "../../device.dts";
import { Cmd } from "./cmd";

export interface INDDevice extends IDeviceBase {
    recvcmd: Cmd;
}

export class NDDevice extends DeviceBase implements INDDevice {
    recvcmd: Cmd;

    //初始化
    init() {
        Debuger.Debuger.log("NDDevice init");
        this.recvcmd = new Cmd();
    }
     
    //反初始化
    uninit() {
        Debuger.Debuger.log("NDDevice uninit");
     }

    //南向输入
    on_south_input(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("NDDevice  on_south_input ");
        this.recvcmd = this.recvcmd || new Cmd();
        if (this.recvcmd.decode(msg.payload)){
            msg.payload = {
                hd: this.recvcmd.head,
                pld: this.recvcmd.regtable
            }
        };

        //父设备 todo...
        //父设备输出给子设备，msg.id = child.id
        //msg.id = child.id
        //this.events.parent.output.emit(msg); 

        //正常 todo...
        super.on_south_input(msg);
    }

    //北向输入
    on_north_input(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("NDDevice  on_north_input");
        //todo ...
        super.on_north_input(msg);
    }    

    //子设备输入
    on_child_input(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("NDDevice  on_child_input");
        //todo...
        super.on_child_input(msg);       
    }  
}