import { EModbusPLCType, EModbusType, IModbusRTUTable, ModbusRTUTable } from "../../coders/modbus/modbus";
import { Debuger } from "../../../device-base";
import { IDeviceBusDataPayload, IDeviceBusEventData } from "../../../device.dts";
import { IModbus, Modbus } from "../base/device";
import { CmdId } from "../../coders/dev-bin-json/cmd";
import { PldTable } from "../../coders/dev-bin-json/pld-table";

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
    //开灯HS：01 06 00 00 00 12 09 c7
    //关灯LS：01 06 00 00 00 11 49 c6

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

       //南向输入
            //上线
            // this.events.south.input.eventEmitter.on(CmdId.online.toString(), (msg: IDeviceBusEventData) => {
            //     this.on_south_cmd_online(msg);
            //     return;
            // })    

            // //上报
            // this.events.south.input.eventEmitter.on(CmdId.report.toString(), (msg: IDeviceBusEventData) => {
            //     this.on_south_cmd_report(msg);
            //     return;
            // })    
            
            // //查询响应
            // this.events.south.input.eventEmitter.on(CmdId.get.toString(), (msg: IDeviceBusEventData) => {
            //     this.on_south_cmd_get(msg);
            //     return;
            // })   

            // //设置响应
            // this.events.south.input.eventEmitter.on(CmdId.set.toString(), (msg: IDeviceBusEventData) => {
            //     this.on_south_cmd_set(msg);
            //     return;
            // })  

        // //北向输入
        //     //查询请求
        //     this.events.north.input.eventEmitter.on(CmdId.Names[CmdId.get], (msg: IDeviceBusEventData) => {
        //         this.on_north_cmd_get(msg);
        //         return;
        //     })

        //     //设置请求
        //     this.events.north.input.eventEmitter.on(CmdId.Names[CmdId.set], (msg: IDeviceBusEventData) => {
        //         this.on_north_cmd_set(msg);
        //         return;
        //     })

        // //1秒后
        // setTimeout(() => {
        //     //配置定时上报
        //     this.do_south_cmd_report_reg();     
        //     //北向查询
        //     this.on_north_input({payload:{hd:{entry:{id:"get"}}}});       
        // }, 1000);            
    }
     
    //获取查询点表
    do_svc_get_tables(pld: {}): IModbusRTUTable[] {
        Debuger.Debuger.log("PSISE101R5  do_svc_get_tables");
        const tables = [];

        const table: IModbusRTUTable = new ModbusRTUTable(this.tables.plcbase);
        table.slave = this.slave;
        table.address = 0;
        table.func = EModbusType.EReadInputRegisters;
        table.quantity = 0x10;
        tables.push(table); 
             
        return tables;
    }    

    //南向处理
        //设备上线
        // on_south_cmd_online(msg: IDeviceBusEventData) {
        //     //配置定时上报(透传)
        //     this.do_south_cmd_report_reg()
        //     return;
        // }   

        // //配置定时上报(透传)
        // do_south_cmd_report_reg() {
        //     //todo...            
            
        //     return;
        // }
            
    //北向处理
         //北向查询
        // on_north_cmd_get(msg: IDeviceBusEventData) {
        //     //todo


        //     return;
        // }
        
        // //北向设置
        // on_north_cmd_set(msg: IDeviceBusEventData) {
        //     //todo
        //     return;
        // }

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