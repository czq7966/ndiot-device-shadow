
import { IDeviceBusEventData } from "../../device.dts";
import { Debuger, INDDevice, NDDevice } from "../nd-device";

export interface IRFIRDEvice extends INDDevice {}

export  class RFIRDEvice extends NDDevice implements IRFIRDEvice {

    //初始化
    init() {
        Debuger.Debuger.log("RFIRDEvice init");
    }
     
    //反初始化
    uninit() {
        Debuger.Debuger.log("RFIRDEvice uninit");
     }

    //南向输入
    on_south_input(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("RFIRDEvice  on_south_input ");

        //父设备 todo...
        //父设备输出给子设备，msg.id = child.id
        //msg.id = child.id
        //this.events.parent.output.emit(msg); 

        //正常 todo...
        super.on_south_input(msg);
    }

    //北向输入
    on_north_input(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("RFIRDEvice  on_north_input");
        //todo ...
        super.on_north_input(msg);
    }    

    //子设备输入
    on_child_input(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("RFIRDEvice  on_child_input");
        //todo...
        super.on_child_input(msg);       
    }  
}