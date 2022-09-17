

import { GModeBusRTU, IModbusCmd, IModbusCmds, IModbusRTU, IModbusRTUTable, ModbusCmd, ModbusCmds, ModbusRTU, ModbusRTUTable } from "../../../../common/modbus";
import { Debuger, DeviceBase } from "../../../device-base";
import { IDeviceBase, IDeviceBusDataPayload, IDeviceBusDataPayloadHd, IDeviceBusEventData } from "../../../device.dts";

export interface IModbus extends IDeviceBase {
    mode: "alone" | "bus"   
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
    tables: IModbusPLCTables
    slave: number


    //初始化
    init() {
        Debuger.Debuger.log("Modbus init");
        this.tables = new ModbusPLCTables();
        this.cmds = new ModbusCmds();
        this.mode = "bus";
        if (this.attrs.pid) {
            this.mode = "alone";
            let slave = this.attrs.id.substring(this.attrs.id.lastIndexOf("_") + 1);
            this.slave = parseInt(slave) || 0;
        }
        this.cmds.events.req.on(data => {
            this.on_cmds_events_req_penet(data);
        })
    }
     
    //反初始化
    uninit() {
        this.cmds.destroy();
        delete this.tables;
        delete this.cmds;
        Debuger.Debuger.log("Modbus uninit");
     }

    //南向输入
    on_south_input(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("Modbus  on_south_input ");

        let payload = msg.payload as IDeviceBusDataPayload
        let hd = payload.hd;
        if (hd.entry.type == "evt") {
            if (hd.entry.id == "penet") {
                //透传事件
                return this.on_south_input_evt_penet(msg);                
            } 
        }
        super.on_south_input(msg);
    }

    //北向输入
    on_north_input(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("Modbus  on_north_input");
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

    //子设备输入
    on_child_input(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("Modbus  on_child_input");
        //todo...
        super.on_child_input(msg);       
    }  

//业务逻辑
    //南向透传输入
    on_south_input_evt_penet(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("Modbus  on_south_input_evt_penet ", msg);
        if (this.mode == "alone") {
            return this.on_south_input_evt_penet_alone(msg);
        } else {
            return this.on_south_input_evt_penet_bus(msg);  
        }
    }

    //南向透传输入_独立
    on_south_input_evt_penet_alone(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("Modbus  on_south_input_evt_penet_alone ");
        let payload = msg.payload as IDeviceBusDataPayload
        let pld = payload.pld;
        let rawStr = pld.raw;
        if (rawStr) {
            let raw = Buffer.from(rawStr,'base64');
            if (raw.length > 5) {
                this.cmds.events.res.emit(raw);
                return;
            }
        }        

        super.on_south_input(msg);
    }

    //南向透传输入_总线 -> 子设备
    on_south_input_evt_penet_bus(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("Modbus  on_south_input_evt_penet_bus ");
        let payload = msg.payload as IDeviceBusDataPayload
        let pld = payload.pld;
        let rawStr = pld.raw;
        if (rawStr) {
            let raw = Buffer.from(rawStr,'base64');
            if (raw.length > 5) {
                let table = GModeBusRTU.decoder.decode_common(raw);
                if (table.slave > 0) {
                    let cid = this.attrs.id + "_" + table.slave;
                    let payload: IDeviceBusDataPayload = {
                        hd: {
                            from: {
                                type: "dev",
                                id: cid,
                            },
                            entry: {
                                type: "evt",
                                id: "penet"
                            },
                            sid: "",
                            stp: 0
                        },
                        pld: pld                
                    }
                    let msg: IDeviceBusEventData = {
                        id: cid, 
                        payload: payload
                    }
                    //作为父设备输出给子设备
                    this.events.parent.output.emit(msg);                      
                    return;
                }
            }
        }    
        

        super.on_south_input(msg);
    }

    //指令透传请求
    on_cmds_events_req_penet(data: Buffer) {
        let rawStr = data.toString("base64");
        let hd:IDeviceBusDataPayloadHd  = {
            to: {
                type: "dev",
                id: this.attrs.id
            },
            entry: {
                type: "svc",
                id: "penet"
            }
        };
        let pld = {raw: rawStr};

        let msg: IDeviceBusEventData = {
            payload: {
                hd: hd,
                pld: pld
            }
        };

        super.on_north_input(msg);    
    }

    //北向输入查询空调状态
    on_north_input_svc_get(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("ACPGDTM7000F  on_north_input_svc_get");

        let tables = [];
        Object.values(this.tables.names).forEach(v => {
            let table: IModbusRTUTable = new ModbusRTUTable(this.tables.plcbase);
            table.slave = this.slave;
            table.setPLCAddress(v);
            table.quantity = 1;
            tables.push(table);
        })

        if (tables.length == 0)
            return;

        let payload = msg.payload as IDeviceBusDataPayload
        let hd = payload.hd;
        let pld = payload.pld;

        let cmd = this.cmds.exec(tables);
        cmd.events.then.once(v => {
            console.log("11111111111111111111111111", v);

        })
        cmd.events.catch.once(e => {
            console.log("222222222222222222222222222", e);
        })

        // this.cmd = new ModbusCmd(tables);
        // this.cmd.events.req.on((data: Buffer) => {
        //     let rawStr = data.toString("base64");
        //     let _hd:IDeviceBusDataPayloadHd  = Utils.DeepMerge({}, hd) as any;
        //     let _pld = {raw: rawStr};
        //     _hd.entry.type = "svc";
        //     _hd.entry.id = "penet";
        //     let _msg: IDeviceBusEventData = {
        //         payload: {
        //             hd: _hd,
        //             pld: _pld
        //         }
        //     };
    
        //     super.on_north_input(_msg);

        // })

        // this.cmd.exec()
        // .then(v => {
        //     console.log("11111111111111111111111111", v);
        // })
        // .catch(e => {
        //     console.log("222222222222222222222222222", e);

        // })
        
    }

    //北向输入设备空调状态
    on_north_input_svc_set(msg: IDeviceBusEventData) {        

    }
}