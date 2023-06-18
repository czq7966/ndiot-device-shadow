import { Utils } from "../../../../common/utils";
import { Debuger } from "../../../device-base";
import { IDeviceBusDataPayload, IDeviceBusDataPayloadHd, IDeviceBusEventData } from "../../../device.dts";
import { IModbusRTUTable } from "../../coders/modbus/modbus";
import { IModbus, Modbus } from "../base/device";

export type IACPGDTM7000F = IModbus

export class ACPGDTM7000F extends Modbus implements IACPGDTM7000F {

    //初始化
    init() {
        super.init();
        Debuger.Debuger.log("ACPGDTM7000F init");
        this.slave = 0x2;
        this.tables.plcbase = 10000;
        this.tables.names = {
            power: 2,
            mode: 45002,
            cooltemperature: 40004,
            heattemperature: 40005
        }

        this.tables.initAddressFromNames();
        setInterval(()=>{
            let payload: IDeviceBusDataPayload = {
                hd: {
                    entry:{
                        id: "get",
                        type: "svc"
                    }
                }
            };
            let msg: IDeviceBusEventData = {
                id: this.attrs.id,
                payload: payload
                

            };
            this.on_north_input(msg);
        }, 1000 * 60);
    }

    //获取查询点表
    do_svc_get_tables(pld: {}, msg?: IDeviceBusEventData): IModbusRTUTable[] {
        Debuger.Debuger.log("ACPGDTM7000F do_svc_get_tables");

        pld =  Object.assign(pld || {}, this.tables.names);
        return super.do_svc_get_tables(pld);
    }

    
    //查询：数值与字符的转换
    do_svc_get(tables: IModbusRTUTable[], msg?: IDeviceBusEventData): Promise<{[name: string]: any}> {
        return new Promise((resolve, reject) => {
            super.do_svc_get(tables)
            .then(v => {                        
                console.log("1111111111111", v);
                if (this.tables.isGetError(v)) {
                    reject("查询出错: "+ msg.id + " , " + JSON.stringify(v));
                } else {
                    const result = Utils.DeepMerge({}, v) as any;
                    result.power = v.power === 0 ? "off" : v.power === 1 ? "on" : v.power;
                    result.mode = v.mode === 0 ? "cool" : v.mode === 1 ? "heat" : v.mode === 2 ? "fan" : v.mode;
                    result.temperature = result.mode === "cool" ? v.cooltemperature / 10 : result.heattemperature === "heat" ? v.heattemperature / 10 : v.cooltemperature;
                    this.do_north_report(result);
                    resolve(result);
                }

            })
            .catch(e => {
                reject(e);
            })
        })
    }  

    //获取设置点表
    do_svc_set_tables(pld: {}, msg?: IDeviceBusEventData): IModbusRTUTable[] {  
    
         if (Object.prototype.hasOwnProperty.call(pld, "power")) pld["power"] = (pld["power"] == "on" ? 1 : 0);
         if (Object.prototype.hasOwnProperty.call(pld, "mode")) pld["mode"] = (pld["mode"] == "cool" ? 0 : pld["mode"] == "heat" ? 1 : 2);
         if (Object.prototype.hasOwnProperty.call(pld, "temperature")) {
             if (pld["mode"] == "cool") pld["cooltemperature"] = pld["temperature"] * 10;
             if (pld["mode"] == "heat") pld["heattemperature"] = pld["temperature"] * 10;
         }

         
        return super.do_svc_set_tables(pld);
    }

    //执行点表设置
    do_svc_set(tables: IModbusRTUTable[], msg?: IDeviceBusEventData): Promise<{[name: string]: any}> {
        return new Promise((resolve, reject) => {
            super.do_svc_set(tables, msg)
            .then(v => {
                if (this.tables.isSetError(v)){
                    reject("设置出错：" + msg.id + " , " + JSON.stringify(v));
                } else {
                    if (msg) {
                        resolve(msg.payload.pld);
                    } else {
                        resolve(v);
                    }
                }
            })
            .catch(e => {
                reject(e);
            })
        })
    }


    //北向处理
        //北向上报状态
        do_north_report(pld: {}) {
            let hd: IDeviceBusDataPayloadHd;
            hd = { entry: { type: "evt", id: "report" }};

            const payload: IDeviceBusDataPayload = {
                hd: hd,
                pld: pld
            }
            const msg: IDeviceBusEventData = {
                decoded: true,
                payload: payload
            }
            console.log("2222222", msg);
            this.events.north.output.emit(msg);  
        }

        
    // //查询
    // on_svc_get(msg: IDeviceBusEventData): Promise<{[name: string]: any}> {
    //     return new Promise((resolve, reject) => {
    //         super.on_svc_get(msg)
    //         .then(v => {                              
    //             const result = Utils.DeepMerge({}, v) as any;
    //             result.power = v.power === 0 ? "off" : v.power === 1 ? "on" : v.power;
    //             result.mode = v.mode === 0 ? "cool" : v.mode === 1 ? "heat" : v.mode === 2 ? "fan" : v.mode;
    //             result.temperature = v.mode === "cool" ? v.cooltemperature / 10 : v.heattemperature === "heat" ? v.heattemperature / 10 : v.cooltemperature;
    //             resolve(result);
    //         })
    //         .catch(e => {
    //             reject(e);
    //         })
    //     })
    // }

    // //设置
    // on_svc_set(msg: IDeviceBusEventData): Promise<{[name: string]: number}> {
    //     const tables: {[name: string]: any} = Object.assign({}, msg.payload.pld);
        
    //     if (Object.prototype.hasOwnProperty.call(tables, "power")) tables.power = (tables.power == "on" ? 1 : 0);
    //     if (Object.prototype.hasOwnProperty.call(tables, "mode")) tables.mode = (tables.mode == "cool" ? 0 : tables.mode == "heat" ? 1 : 2);
    //     if (Object.prototype.hasOwnProperty.call(tables, "temperature")) {
    //         if (tables.mode == "cool") tables.cooltemperature = tables.temperature * 10;
    //         if (tables.mode == "heat") tables.heattemperature = tables.temperature * 10;
    //     }

    //     msg.payload.pld = tables;
    //     return super.on_svc_set(msg);
    // }

    // //查询点表
    // on_svc_get_tables(msg: IDeviceBusEventData): IModbusRTUTable[] {
    //     Debuger.Debuger.log("ACPGDTM7000F on_svc_get_tables");
        
    //     let pld = msg.payload.pld;
    //     pld = pld && (Object.keys(pld).length > 0) && pld || Object.assign({}, this.tables.names);
    //     msg.payload.pld = pld;
    //     return super.on_svc_get_tables(msg);
    // }
}