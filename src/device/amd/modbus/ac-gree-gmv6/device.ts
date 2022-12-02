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

export interface IACGREEGMV6 extends IModbus {
    pointTables: IPointTables

}

export class ACGREEGMV6 extends Modbus implements IACGREEGMV6 {
    pointTables: IPointTables;

    //初始化
    init() {
        super.init();
        Debuger.Debuger.log("ACGREEGMV6 init");

        this.pointTables = {
            states: {
                system: {},
                internal: {}
            },
            analogs: {
                system: {},
                internal: {}
            }
        };


        this.slave = 0x0A;
        this.tables.plcbase = 100000;
        this.tables.names = {};

        //系统1-16有无状态
        for (let i = 88; i <= 103; i++) {
            this.pointTables.states.system[i] = null;      
        }

        //内机1-128有无
        for (let i = 120; i <= 247; i++) {
            this.pointTables.states.internal[i] = null;            
        }

        //内机1模拟量
        for (let i = 102; i <= 125; i++) {
            this.pointTables.analogs.internal[i] = null;            
        }


        let regPlcbase = 0;
        //状态量点表名称
        regPlcbase = EModbusPLCType.EReadCoils * this.tables.plcbase + 1;
        Object.values(this.pointTables.states).forEach(state => {
            Object.keys(state).forEach(key => {
                this.tables.names[key] = regPlcbase +  parseInt(key);
            })
        })

        //模拟量点表名称
        regPlcbase = EModbusPLCType.EReadHoldingRegisters * this.tables.plcbase + 1;
        Object.values(this.pointTables.analogs).forEach(analog => {
            Object.keys(analog).forEach(key => {
                this.tables.names[key] = regPlcbase +  parseInt(key);
            })
        })
        

        this.tables.initAddressFromNames();
    }
     

    //获取查询点表
    on_svc_get_tables(msg: IDeviceBusEventData): IModbusRTUTable[] {
        Debuger.Debuger.log("ACGREEGMV6  on_child_input");
        const tables = [];
        const payload = msg.payload as IDeviceBusDataPayload
        const pld = payload.pld;

        if (msg.id == this.attrs.id) {//网关查询
            //16系统状态, 128内机状态
            [this.pointTables.states.system, this.pointTables.states.internal]
            .forEach(state => {
                const keys = Object.keys(state);
                const addr = parseInt(keys[0]);
                const table: IModbusRTUTable = new ModbusRTUTable(this.tables.plcbase);
                table.slave = this.slave;
                table.address = addr;
                table.func = EModbusType.EReadCoils;
                table.quantity = keys.length;
                tables.push(table); 
            })

        } else {    //内机模拟量查询
            const siid = msg.id.substring(this.attrs.id.lastIndexOf("_") + 1);
            const iid = parseInt(siid) || 0;
            if (iid) {
                const keys = Object.keys(this.pointTables.analogs.internal);
                const addr = parseInt(keys[0]);
                const table: IModbusRTUTable = new ModbusRTUTable(this.tables.plcbase);
                table.slave = this.slave;
                table.address = addr + 25 * (iid - 1);
                table.func = EModbusType.EReadHoldingRegisters;
                table.quantity = keys.length;
                tables.push(table);
            }
        }
             
        return tables;
    }

    //获取设置点表
    on_svc_set_tables(msg: IDeviceBusEventData): IModbusRTUTable[] {
        const tables = [];

        if (msg.id == this.attrs.id) {//网关设置

        } else {    //内机模拟量设置
            const payload = msg.payload as IDeviceBusDataPayload
            const values = payload.pld;
            const names = Object.keys(values);
            const siid = msg.id.substring(this.attrs.id.lastIndexOf("_") + 1);
            const iid = parseInt(siid) || 0;
            if (iid) {
                names.forEach(name => {
                    const value = values[name];
                    let plcaddr = this.tables.names[name];
                    if (plcaddr) {                        
                        const table: IModbusRTUTable = new ModbusRTUTable(this.tables.plcbase);
                        table.slave = this.slave;
                        table.setPLCAddress(plcaddr);
                        table.address = table.address + 25 * (iid - 1);
                        table.table[table.address] = value;
                        table.quantity = 1;

                        plcaddr = table.getPLCAddress(table.address);
                        this.tables.address[plcaddr] = name;                        
                        
                        table.func = plcaddr < table.plcbase ? EModbusType.EWriteSingleCoil : EModbusType.EWriteSingleRegister;
                        tables.push(table);          
                    }
                })

            }
        }

        return tables;
    }
}