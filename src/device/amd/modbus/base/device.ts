

import { IModbusRTU, IModbusRTUTable, ModbusRTU } from "../../../../common/modbus";
import { Debuger, DeviceBase } from "../../../device-base";
import { IDeviceBase, IDeviceBusEventData } from "../../../device.dts";

export interface IModbus extends IDeviceBase {
    mode: "alone" | "bus"   
    rtu: IModbusRTU
    readCoils(slave: number, address: number, quantity?: number): Promise<IModbusRTUTable>
}

export interface IModbusCmds {
    [id: string]: Array<IModbusRTUTable>
}

export class Modbus extends DeviceBase implements IModbus {
    mode: "alone" | "bus";
    rtu: IModbusRTU
    cmds: IModbusCmds

    readCoils(slave: number, address: number, quantity?: number): Promise<IModbusRTUTable> {
        return new Promise((resolve, reject) => {
            let buffer = this.rtu.encoder.readCoils(slave, address, quantity);

        })
    }


    //初始化
    init() {
        Debuger.Debuger.log("Device init");
        this.rtu = new ModbusRTU();
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