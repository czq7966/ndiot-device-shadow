import { EModbusPLCType, EModbusType, IModbusRTUTable, ModbusRTUTable } from "../../coders/modbus/modbus";
import { Debuger } from "../../../device-base";
import { IDeviceBusDataPayload, IDeviceBusEventData } from "../../../device.dts";
import { IModbus, Modbus } from "../base/device";

export interface IPointTables {
    states: {
        system: {[address: number]: number},
        internal: {[address: number]: number},
    },
    analogs: {
        system: {[id: number]: {[address: number]: number}} ,
        internal: {[id: number]: {[address: number]: number}} ,
    }
}

export interface IPSISE101R5 extends IModbus {
    pointTables: IPointTables

}

export class PSISE101R5 extends Modbus implements IPSISE101R5 {
    pointTables: IPointTables;

    //初始化
    init() {
        super.init();
        Debuger.Debuger.log("PSISE101R5 init");


        this.slave = 0x01;
        this.tables.plcbase = 10000;

        const regPlcbase = EModbusPLCType.EReadInputRegisters * this.tables.plcbase + 1;
        this.tables.names = {
            state: regPlcbase + 0,
            peoples: regPlcbase + 1,
            lumen: regPlcbase + 2,
            lumenMax: regPlcbase + 3,
            pldHoldTime: regPlcbase + 4,
            pldHoldRevert: regPlcbase + 5,
            led: regPlcbase + 6,
            hold8: regPlcbase + 7,
            hold9: regPlcbase + 8,
            hold10: regPlcbase + 9,
            distanceMax: regPlcbase + 10,
            distanceMin: regPlcbase + 11,
            sensitivityMax: regPlcbase + 12,
            sensitivityMin: regPlcbase + 13,
            emitHoldTime: regPlcbase + 14,
            channel: regPlcbase + 15,
        }        

        this.tables.initAddressFromNames();
    }
     

    //获取查询点表
    on_svc_get_tables(msg: IDeviceBusEventData): IModbusRTUTable[] {
        Debuger.Debuger.log("PSISE101R5  on_svc_get_tables");
        const tables = [];

        const table: IModbusRTUTable = new ModbusRTUTable(this.tables.plcbase);
        table.slave = this.slave;
        table.address = 0;
        table.func = EModbusType.EReadInputRegisters;
        table.quantity = 0x10;
        tables.push(table); 
             
        return tables;
    }

}