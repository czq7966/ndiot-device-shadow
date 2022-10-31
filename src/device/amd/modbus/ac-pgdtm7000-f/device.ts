import { Utils } from "../../../../common/utils";
import { Debuger } from "../../../device-base";
import { IDeviceBusEventData } from "../../../device.dts";
import { IModbus, Modbus } from "../base/device";

export interface IACPGDTM7000F extends IModbus {}

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
    }
    

    //查询
    on_svc_get(msg: IDeviceBusEventData): Promise<{[name: string]: any}> {
        return new Promise((resolve, reject) => {
            super.on_svc_get(msg)
            .then(v => {                              
                let result = Utils.DeepMerge({}, v) as any;
                result.power = v.power === 0 ? "off" : v.power === 1 ? "on" : v.power;
                result.mode = v.mode === 0 ? "cool" : v.mode === 1 ? "heat" : v.mode === 2 ? "fan" : v.mode;
                result.temperature = v.mode === "cool" ? v.cooltemperature / 10 : v.heattemperature === "heat" ? v.heattemperature / 10 : v.cooltemperature;
                resolve(result);
            })
            .catch(e => {
                reject(e);
            })
        })
    }

    //设置
    on_svc_set(msg: IDeviceBusEventData): Promise<{[name: string]: number}> {
        let tables: {[name: string]: any} = Object.assign({}, msg.payload.pld);
        
        if (tables.hasOwnProperty("power")) tables.power = (tables.power == "on" ? 1 : 0);
        if (tables.hasOwnProperty("mode")) tables.mode = (tables.mode == "cool" ? 0 : tables.mode == "heat" ? 1 : 2);
        if (tables.hasOwnProperty("temperature")) {
            if (tables.mode == "cool") tables.cooltemperature = tables.temperature * 10;
            if (tables.mode == "heat") tables.heattemperature = tables.temperature * 10;
        }

        msg.payload.pld = tables;
        return super.on_svc_set(msg);
    }
}