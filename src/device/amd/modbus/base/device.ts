

import { EModbusType, GModeBusRTU, IModbusCmd, IModbusCmdResult, IModbusCmds, IModbusRTU, IModbusRTUTable, ModbusCmd, ModbusCmds, ModbusRTU, ModbusRTUTable } from "../../coders/modbus/modbus";
import { Utils } from "../../../../common/utils";
import { Debuger, DeviceBase } from "../../../device-base";
import { IDeviceBase, IDeviceBusDataPayload, IDeviceBusDataPayloadHd, IDeviceBusEventData } from "../../../device.dts";
import { CmdId } from "../../coders/dev-bin-json/cmd";
import { PldTable } from "../../coders/dev-bin-json/pld-table";
import { INDDevice, NDDevice } from "../../nd-device";


export interface IModbus extends INDDevice {

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

export class Modbus extends NDDevice implements IModbus {
    cmds: IModbusCmds;
    tables: IModbusPLCTables;
    slave: number


    //初始化
    init() {
        Debuger.Debuger.log("Modbus init");
        this.cmds = new ModbusCmds();
        this.tables = new ModbusPLCTables();
        if (this.attrs.pid) {
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
        if (!msg.decoded && msg.payload && !this.attrs.pid) {
            if (this.recvcmd.decode(msg.payload)){
                let hd = this.plf_coder.head.decode(this.recvcmd.head);
                let pld = this.plf_coder.payload.decode(this.recvcmd.payload);

                msg.payload = {
                    hd: hd,
                    pld: pld
                }

                msg.decoded = true;            

                // -> 透传输入
                if (hd.cmd_id == CmdId.penet)                      
                    return this.on_south_input_evt_penet(msg);
            } 
        }  
        // -> 父类转北向输出
        super.on_south_input(msg);
    }

    //北向输入
    on_north_input(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("Modbus  on_north_input");
        if (!msg.encoded && msg.payload && !this.attrs.pid) {
            this.plf_coder.head.reset();
            let hd = this.plf_coder.head.encode(msg.payload.hd).head as IDeviceBusDataPayloadHd;

            if (hd.entry && hd.entry.type == "svc" ) {
                if (hd.cmd_id == CmdId.get) {
                    return this.on_north_input_svc_get(msg);                
                } 

                if (hd.cmd_id == CmdId.set) {
                    return this.on_north_input_svc_set(msg);
                }

            }
        }
        super.on_north_input(msg);
    }    

    //子设备输入
    on_child_input(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("Modbus  on_child_input");
        let hd: IDeviceBusDataPayloadHd; 

        if (!msg.encoded && msg.payload ) {
            this.plf_coder.head.reset();
            hd = this.plf_coder.head.encode(msg.payload.hd).head;
        } else 
            hd = msg.payload.hd;

        if (hd && hd.entry && hd.entry.type == "svc" ) {
            if (hd.cmd_id == CmdId.get) {
                return this.on_north_input_svc_get(msg);                
            } 

            if (hd.cmd_id == CmdId.set) {
                return this.on_north_input_svc_set(msg);
            }
        }

        super.on_child_input(msg);        
    }  

//业务逻辑
    //南向透传输入
    on_south_input_evt_penet(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("Modbus  on_south_input_evt_penet ", msg);
        let payload: IDeviceBusDataPayload = msg.payload;
        let data = payload.pld[PldTable.Keys.penet_data];

        if (data) {
            if (data.length > 4) {
                this.cmds.events.res.emit(data);
                return;
            } else {
                Debuger.Debuger.log("on_south_input_evt_penet raw < 5 ,", data);
            }
        }        

        super.on_south_input(msg);
    }

    //南向透传输入_独立
    on_south_input_evt_penet_alone(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("Modbus  on_south_input_evt_penet_alone ", msg);
        let payload: IDeviceBusDataPayload = msg.payload;
        let data = payload.pld[PldTable.Keys.penet_data];

        if (data) {
            if (data.length > 4) {
                this.cmds.events.res.emit(data);
                return;
            } else {
                Debuger.Debuger.log("on_south_input_evt_penet_alone raw < 5 ,", data);
            }
        }        

        super.on_south_input(msg);
    }

    //南向透传输入_总线 -> 子设备
    on_south_input_evt_penet_bus(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("Modbus  on_south_input_evt_penet_bus ");
        let payload: IDeviceBusDataPayload = msg.payload;
        let data = payload.pld[PldTable.Keys.penet_data];


        if (data) {
            if (data.length > 4) {
                let table = GModeBusRTU.decoder.decode_common(data);
                if (table.slave > 0) {
                    let cid = this.attrs.id + "_" + table.slave;
                    let payload: IDeviceBusDataPayload = {
                        hd: {
                            entry: {
                                type: "evt",
                                id: "penet"
                            },
                            sid: "",
                            stp: 0
                        },
                        pld: data                
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
        this.sendcmd.reset();
        this.sendcmd.head.head.cmd_id = CmdId.penet;
        this.sendcmd.payload.tables[PldTable.Keys.penet_data] = data;
        
        let msg: IDeviceBusEventData = {
            payload: this.sendcmd.encode()
        }
        //南向直接输出
        this.events.south.output.emit(msg);   
    }

    //北向输入查询空调状态(alone)
    on_north_input_svc_get(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("Modbus  on_north_input_svc_get");
        let payload = msg.payload as IDeviceBusDataPayload;
        this.on_svc_get(msg)
        .then(v => {
            let _hd:IDeviceBusDataPayloadHd  = Utils.DeepMerge({}, payload.hd) as any;
            _hd.stp = 1;
            let _pld = v;

            let _msg: IDeviceBusEventData = {
                id: msg.id,
                decoded: true,
                payload: {
                    hd: _hd,
                    pld: _pld
                }
            }
            if (_msg.id == this.attrs.id)
                super.on_south_input(_msg);
            else 
                //作为父设备输出给子设备
                this.events.parent.output.emit(_msg);

        })
        .catch(e => {
            Debuger.Debuger.log("Modbus  on_north_input_svc_get error: ", e);
        })

        
    }

    //北向输入设备空调状态
    on_north_input_svc_set(msg: IDeviceBusEventData) {        
        let payload = msg.payload as IDeviceBusDataPayload
        this.on_svc_set(msg)
        .then(v => {
            let _hd:IDeviceBusDataPayloadHd  = Utils.DeepMerge({}, payload.hd) as any;
            _hd.stp = 1;
            let _pld = v;

            let _msg: IDeviceBusEventData = {
                decoded: true,
                id: msg.id,
                payload: {
                    hd: _hd,
                    pld: _pld
                }
            }
            if (_msg.id == this.attrs.id)
                super.on_south_input(_msg);
            else 
                //作为父设备输出给子设备
                this.events.parent.output.emit(_msg);

        })
        .catch(e => {
            Debuger.Debuger.log("Modbus  on_north_input_svc_set error: ", e);
        })
    }

    //查询
    on_svc_get(msg: IDeviceBusEventData): Promise<{[name: string]: any}> {
        return new Promise((resolve, reject) => {
            let result = {};
            let tables = this.on_svc_get_tables(msg);

            let cmd = this.cmds.exec(tables);
            cmd.events.then.once((v: IModbusCmdResult) => {
                let resTables = v.res;
                resTables.forEach((t => {
                   let addrs = Object.keys(t.table);
                   addrs.push(t.address.toString());                    
                   
                   addrs.forEach(addr => {
                       let plcaddr = t.getPLCAddress(parseInt(addr));
                       let name = this.tables.address[plcaddr];
                       result[name] = null;
                       if (!t.error) 
                            result[name] = t.table[addr]; 
                   })                       
                }))
                resolve(result)                        
            })

            cmd.events.catch.once(e => {
                let resTables = cmd.resTables;
                if (resTables.length > 0) {                    
                    resTables.forEach((t => {
                        let addrs = Object.keys(t.table);
                        addrs.push(t.address.toString());
                        addrs.forEach(addr => {
                            let plcaddr = t.getPLCAddress(parseInt(addr));
                            let name = this.tables.address[plcaddr];
                            result[name] = null;
                            if (!t.error) 
                                 result[name] = t.table[addr]; 
                        })                       
                     }))
                    resolve(result)                        
                } else {
                    reject(e)
                }
            })
        })
    }
    //获取查询点表
    on_svc_get_tables(msg: IDeviceBusEventData): IModbusRTUTable[] {
        let tables = [];
        let payload = msg.payload as IDeviceBusDataPayload
        let pld = payload.pld;
        let keys = pld && Object.keys(pld) || [];
        keys.forEach(key => {
            let plcaddr = this.tables.names[key];
            if (plcaddr) {
                let table: IModbusRTUTable = new ModbusRTUTable(this.tables.plcbase);
                table.slave = this.slave;
                table.setPLCAddress(plcaddr);
                table.quantity = 1;
                tables.push(table);                
            }
        })        
        return tables;
    }

    //设置
    on_svc_set(msg: IDeviceBusEventData): Promise<{[name: string]: number}> {
        return new Promise((resolve, reject) => {
            let result = {};
            let tables = this.on_svc_set_tables(msg);

            let cmd = this.cmds.exec(tables);
            cmd.events.then.once((v: IModbusCmdResult) => {
                let resTables = v.res;
                resTables.forEach((t => {
                    let name = this.tables.address[t.getPLCAddress()];
                    result[name] = t.error;
                }))
                resolve(result)                        
            })

            cmd.events.catch.once(e => {
                let resTables = cmd.resTables;
                if (resTables.length > 0) {
                    resTables.forEach((t => {
                        let name = this.tables.address[t.getPLCAddress()];
                        result[name] = t.error;
                    }))
                    resolve(result)                        
                } else {
                    reject(e)
                }
            })
        })
    }

    //获取设置点表
    on_svc_set_tables(msg: IDeviceBusEventData): IModbusRTUTable[] {
        let tables = [];
        let payload = msg.payload as IDeviceBusDataPayload
        let values = payload.pld;
        let names = Object.keys(values);

        names.forEach(name => {
            let value = values[name];
            let plcaddr = this.tables.names[name];
            if (plcaddr) {
                let table: IModbusRTUTable = new ModbusRTUTable(this.tables.plcbase);
                table.slave = this.slave;
                table.setPLCAddress(plcaddr, value);
                table.quantity = 1;
                table.func = plcaddr < table.plcbase ? EModbusType.EWriteSingleCoil : EModbusType.EWriteSingleRegister;
                tables.push(table);          
            }
        })

        return tables;
    }

    //上报
    do_evt_report(): Promise<{[name: string]: number}> {
        let msg: IDeviceBusEventData = {
            id: this.attrs.id,
            payload: {
                hd: {
                    type: "svc",
                    id: "report"
                },
                pld: {}
            }
        }
        let promise = this.on_svc_get(msg);
        promise
        .then(v => {
            let hd:IDeviceBusDataPayloadHd = {
                entry: {type: "evt", id: "report"},
                stp : 0
            }
            let pld = v

            let msg: IDeviceBusEventData = {
                decoded: true,
                id: this.attrs.id,
                payload: {
                    hd: hd,
                    pld: pld
                }
            }
            super.on_south_input(msg);
        })
        .catch(e => {
            Debuger.Debuger.log("Modbus  do_evt_report error: ", e);
        })     
        return promise;   
    }

    //定时上报
    _interval_evt_report_handler: any;
    start_interval_evt_report(timeout: number) {
        this.stop_interval_evt_report();
        this._interval_evt_report_handler = setTimeout(() => {
             this.do_evt_report()
             .then(v => {
                this.start_interval_evt_report(timeout)
             })
             .catch(e => {
                this.start_interval_evt_report(timeout)
             })
            
        }, timeout);
    }

    stop_interval_evt_report() {
        clearTimeout(this._interval_evt_report_handler);
        this._interval_evt_report_handler = 0;
    }
    
}