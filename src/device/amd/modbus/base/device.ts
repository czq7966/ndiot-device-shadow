

import { IModbusCmd, IModbusRTU, IModbusRTUTable, ModbusCmd, ModbusRTU } from "../../../../common/modbus";
import { Debuger, DeviceBase } from "../../../device-base";
import { IDeviceBase, IDeviceBusEventData } from "../../../device.dts";

export interface IModbus extends IDeviceBase {
    mode: "alone" | "bus"   
}

export interface IModbusCmds {
    [id: string]: Array<IModbusRTUTable>
}

export interface IModbusTableNames {
    [name: string]: number
}

export interface IModbusPLCTableAddress {
    [address: number]: string
}

export interface IModbusPLCTables {
    plcbase: number
    names: IModbusTableNames,
    address: IModbusPLCTableAddress
    initAddressFromNames();
    initNamesFromAddress();
}

export class ModbusPLCTables implements IModbusPLCTables {
    plcbase: number = 10000;
    names: IModbusTableNames = {};
    address: IModbusPLCTableAddress = {};    
    initAddressFromNames() {
        this.address = {};
        Object.keys(this.names).forEach(key => {
            this.address[this.names[key]] = key;
        })

    };
    initNamesFromAddress() {
        this.names = {};
        Object.keys(this.address).forEach(key => {
            this.names[this.address[key]] = parseInt(key);
        })
    };    
}

export class Modbus extends DeviceBase implements IModbus {
    mode: "alone" | "bus";
    cmds: IModbusCmds
    cmd: IModbusCmd
    tables: IModbusPLCTables
    slave: number


    //初始化
    init() {
        Debuger.Debuger.log("Modbus init");
        this.tables = new ModbusPLCTables();
    }
     
    //反初始化
    uninit() {
        Debuger.Debuger.log("Modbus uninit");
     }

    //南向输入
    on_south_input(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("Modbus  on_south_input ");

        //父设备 todo...
        //父设备输出给子设备，msg.id = child.id
        //msg.id = child.id
        //this.events.parent.output.emit(msg); 

        //正常 todo...
        super.on_south_input(msg);
    }

    //北向输入
    on_north_input(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("Modbus  on_north_input");
        
        super.on_north_input(msg);
    }    

    //子设备输入
    on_child_input(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("Device  on_child_input");
        //todo...
        super.on_child_input(msg);       
    }  



}