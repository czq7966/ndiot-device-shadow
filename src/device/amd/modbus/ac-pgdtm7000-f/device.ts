import { timeStamp } from "console";
import { CRC16 } from "../../../../common/crc16";
import { EModbusPLCType, EModbusType, IModbusRTUTable, ModbusCmd, ModbusRTUTable } from "../../../../common/modbus";
import { Utils } from "../../../../common/utils";
import { Debuger } from "../../../device-base";
import { IDeviceBusDataPayload, IDeviceBusDataPayloadHd, IDeviceBusEventData } from "../../../device.dts";
import { IModbus, Modbus } from "../base/device";

export interface IACPGDTM7000F extends IModbus {}
export interface IACPGDTM7000F_plc_table {
    power: 440000,
    mode: 440001,
    fanSpeed: 440002,
    temperature: 440003
}

export class ACPGDTM7000F extends Modbus implements IACPGDTM7000F {

    //初始化
    init() {
        super.init();
        Debuger.Debuger.log("ACPGDTM7000F init");
        this.mode = "alone";
        this.slave = 0x32;
        this.tables.plcbase = 100000;
        this.tables.names = {
            power: EModbusPLCType.EReadHoldingRegisters * this.tables.plcbase + 40001,
            mode: EModbusPLCType.EReadHoldingRegisters * this.tables.plcbase + 40002,
            fanSpeed: EModbusPLCType.EReadHoldingRegisters * this.tables.plcbase + 40003,
            temperature: EModbusPLCType.EReadHoldingRegisters * this.tables.plcbase + 40004
        }
        this.tables.initAddressFromNames();

    }
     
    //反初始化
    uninit() {
        Debuger.Debuger.log("ACPGDTM7000F uninit");
     }

    //南向输入
    on_south_input(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("ACPGDTM7000F  on_south_input ", msg);
        let payload = msg.payload as IDeviceBusDataPayload
        let hd = payload.hd;
        if (hd.entry.type == "evt") {
            if (hd.entry.id == "penet") {
                return this.on_south_input_evt_penet(msg);                
            } 
        }
        


        super.on_south_input(msg);
    }

    //南向输入
    on_south_input_evt_penet(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("ACPGDTM7000F  on_south_input_evt_penet ", msg);
        if (this.cmd) {
            let payload = msg.payload as IDeviceBusDataPayload
            let pld = payload.pld;
            let rawStr = pld.raw;
            if (rawStr) {
                let raw = Buffer.from(rawStr,'base64');
                if (raw.length > 5) {
                    this.cmd.events.res.emit(raw);
                    return;
                }
            }
        }

        super.on_south_input(msg);
    }

    //北向输入
    on_north_input(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("ACPGDTM7000F  on_north_input");
        let payload = msg.payload as IDeviceBusDataPayload
        let hd = payload.hd;
        if (hd.entry.type == "svc") {
            if (hd.entry.id == "get") {
                return this.on_north_input_svc_get(msg);                
            } 

            if (hd.entry.id == "set") {
                return this.on_north_input_svc_set(msg);
            }
        }
        
        super.on_north_input(msg);
    }    

    //北向输入查询空调状态
    on_north_input_svc_get(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("ACPGDTM7000F  on_north_input_svc_get");
        let payload = msg.payload as IDeviceBusDataPayload
        let hd = payload.hd;
        let pld = payload.pld;

        let tables = [];
        Object.values(this.tables.names).forEach(v => {
            let table: IModbusRTUTable = new ModbusRTUTable(this.tables.plcbase);
            table.slave = this.slave;
            table.setPLCAddress(v);
            table.quantity = 1;
            tables.push(table);
        })

        this.cmd = new ModbusCmd(tables);
        this.cmd.events.req.on((data: Buffer) => {
            let rawStr = data.toString("base64");
            let _hd:IDeviceBusDataPayloadHd  = Utils.DeepMerge({}, hd) as any;
            let _pld = {raw: rawStr};
            _hd.entry.type = "svc";
            _hd.entry.id = "penet";
            let _msg: IDeviceBusEventData = {
                payload: {
                    hd: _hd,
                    pld: _pld
                }
            };
    
            super.on_north_input(_msg);

        })

        this.cmd.exec()
        .then(v => {
            console.log("11111111111111111111111111", v);
        })
        .catch(e => {
            console.log("222222222222222222222222222", e);

        })
        
    }

    //北向输入设备空调状态
    on_north_input_svc_set(msg: IDeviceBusEventData) {        

    }

    //子设备输入
    on_child_input(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("ACPGDTM7000F  on_child_input");
        //todo...
        super.on_child_input(msg);       
    }  


}