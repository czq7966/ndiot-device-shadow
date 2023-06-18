import { Utils } from "../../../../common/utils";
import { Debuger } from "../../../device-base";
import { IDeviceBusDataPayload, IDeviceBusDataPayloadHd, IDeviceBusEventData } from "../../../device.dts";
import { EModbusPLCType, IModbusRTUTable } from "../../coders/modbus/modbus";
import { IModbus, Modbus } from "../base/device";

export interface IGH1220SK_SubDevice_Props {}

export interface IGH1220SK extends IModbus{

}

export class  SubDeviceProps {
    devProps: {[id: string]: {[prop: string]: string}} = {}
    getPropsById(id: string): {} {
        return this.devProps[id];
    }

    getDevPropsByTableName(tableName: string): {[id: string]: {[prop: string]: string}} {
        let result = {};
        Object.keys(this.devProps).forEach(id => {
            let props = this.devProps[id];
            Object.keys(props).forEach(propName => {
                if (props[propName] == tableName) {
                    result[id] = props;
                }
            })

        })
        return result;
    }

    getDevPropsByTableNames(tableNames: string[]): {[id: string]: {[prop: string]: string}} {
        let result = {};
        tableNames.forEach(tableName => {
            this.getDevPropsByTableName(tableName)
            Object.assign(result, this.getDevPropsByTableName(tableName));
        })

        return result;
    }

}

export class GH1220SK extends Modbus implements IGH1220SK {
    subDeviceProps: SubDeviceProps = new SubDeviceProps();

    //初始化
    init() {
        super.init();
        Debuger.Debuger.log("GH1220SK init：12路照明控制模块", this.attrs.id);
        this.slave = 0x3;
        this.tables.plcbase = 10000;
        const regPlcbase = EModbusPLCType.EReadHoldingRegisters * this.tables.plcbase + 1;
        this.tables.names = {
            switch1: regPlcbase + 0x03,
            switch2: regPlcbase + 0x04,
            switch3: regPlcbase + 0x05,
            switch4: regPlcbase + 0x06,
            switch5: regPlcbase + 0x07,
            switch6: regPlcbase + 0x08,
            switch7: regPlcbase + 0x09,
            switch8: regPlcbase + 0x0a,
            switch9: regPlcbase + 0x0b,
            switch10: regPlcbase + 0x0c,
            switch11: regPlcbase + 0x0d,
            switch12: regPlcbase + 0x0e,
        }

        this.tables.initAddressFromNames();

        //初始化子设备ID及对应属性名和点表名
        for (let i = 1; i <= 12; i++){            
            let id = this.attrs.id + "_" + i.toString();
            let props = {
                state: "switch" + i.toString()
            };

            this.subDeviceProps.devProps[id] = props;
        }

        
    }
    

    //获取查询点表
    do_svc_get_tables(pld: {}, msg?: IDeviceBusEventData): IModbusRTUTable[] {
        Debuger.Debuger.log("GH1220SK do_svc_get_tables");
        if (pld && (Object.keys(pld).length > 0)) {
            pld = pld;            
        } else {
            if (msg && msg.cid) {
                //获取子设备对应的点表
               let props = this.subDeviceProps.getPropsById(msg.cid);
               Object.keys(props).forEach(key =>{
                    let tableName = props[key];
                    pld = pld || {};
                    pld[tableName] =  this.tables.names[tableName];
               })
            } else {
                pld = Object.assign({}, this.tables.names);
            }
        }
        Debuger.Debuger.log("GH1220SK do_svc_get_tables", pld);
        return super.do_svc_get_tables(pld);
    }


    //查询：数值与字符的转换
    do_svc_get(tables: IModbusRTUTable[], msg?: IDeviceBusEventData): Promise<{[name: string]: any}> {
        return new Promise((resolve, reject) => {
            super.do_svc_get(tables)
            .then(v => {                              
                const result = Utils.DeepMerge({}, v) as any;
                Object.keys(this.tables.names).forEach(key => {
                    if (v[key] !== undefined) {
                        result[key] = v[key] === 0 ? "off" : v[key] === 1 ? "on" : v[key];
                    }
                })
                resolve(result);
            })
            .catch(e => {
                reject(e);
            })
        })
    }    

    //获取设置点表
    do_svc_set_tables(pld: {}, msg?: IDeviceBusEventData): IModbusRTUTable[] {  
        if (msg && msg.cid) {
            //获取子设备属性 和 点表属性 对应名：子设备属性=点表属性
            let props = this.subDeviceProps.getPropsById(msg.cid);
            Object.keys(props).forEach(key => {
                let tableName = props[key];
                let value = pld[key];
                if (value !== undefined) {
                    pld[tableName] = value === "off" ? 0 : value === "on" ? 1 : value;
                }
            })
         } else {
            Object.keys(pld).forEach(key => {
                if (pld[key] !== undefined) {
                    pld[key] = pld[key] === "off" ? 0 : pld[key] === "on" ? 1 : pld[key];
                }
            })
         }
    
        return super.do_svc_set_tables(pld);
    }


    //北向处理
         //北向查询
         on_north_cmd_get(msg: IDeviceBusEventData) {
            console.log("GH1220SK on_north_cmd_get")
            //获取查询点表
            const payload = msg.payload as IDeviceBusDataPayload;
            const tables = this.do_svc_get_tables(payload.pld, msg);
            //执行查询
            this.do_svc_get(tables)
            .then(v => {
                console.log("2222222222", v)
                const _hd:IDeviceBusDataPayloadHd  = Utils.DeepMerge({}, payload.hd) as any;
                _hd.stp = 1;
                //根据点表获取子设备及属性
                let devProps = this.subDeviceProps.getDevPropsByTableNames(Object.keys(v));
                Object.keys(devProps).forEach(id => {
                    let props = devProps[id];
                    let _pld = {};
                    Object.keys(props).forEach(prop => {
                        let tableName = props[prop];
                        _pld[prop] = v[tableName];
                    })

                    const _msg: IDeviceBusEventData = {
                        id: id,
                        decoded: true,
                        payload: {
                            hd: _hd,
                            pld: _pld
                        }
                    }

                    console.log('111111111', _msg);

                     //作为父设备输出给子设备
                    this.events.parent.output.emit(_msg);
                })
            })
            .catch(e => {
                Debuger.Debuger.log("GH1220SK  do_svc_get error: ", e);
            })


            return;
        }
        

    //子设备输入
    on_child_input(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("GH1220SK  on_child_input ", this.attrs.id, msg.id);
        msg.cid = msg.id;
        msg.id = this.attrs.id;

        if (!msg.decoded && msg.payload && !this.attrs.pid) {
            if (this.recvcmd.decode(msg.payload)){
                const payload = this.on_south_input_decode(this.recvcmd.head, this.recvcmd.payload);
                if (!payload) return;

                msg.payload = {
                    hd: payload.hd,
                    pld: payload.pld
                }
                msg.decoded = true;
                this.events.south.input.eventEmitter.emit(payload.hd.cmd_id.toString(), msg);
            }
        }

        //父设备 todo...
        //父设备输出给子设备，msg.id = msg.cid
        msg.id = msg.cid
        delete msg.cid;
        this.events.parent.output.emit(msg); 
     
    }  
}