import { Utils } from "../../../../common/utils";
import { Debuger } from "../../../device-base";
import { IDeviceBusEventData } from "../../../device.dts";
import { IModbus, Modbus } from "./device";

export type IACDevice = IModbus

export class ACDevice extends Modbus implements IACDevice {


    //查询
    on_svc_get(msg: IDeviceBusEventData): Promise<{[name: string]: any}> {
        return new Promise((resolve, reject) => {
            super.on_svc_get(msg)
            .then(v => {                              
                const result = Utils.DeepMerge({}, v) as any;
                result.power = v.power === 0 ? "off" : v.power === 1 ? "on" : v.power;
                result.mode = v.mode === 0 ? "cool" : v.mode === 1 ? "heat" : v.mode === 2 ? "fan" : v.mode === 3 ? "dry" : v.mode;
                resolve(result);
            })
            .catch(e => {
                reject(e);
            })
        })
    }

    //设置
    on_svc_set(msg: IDeviceBusEventData): Promise<{[name: string]: number}> {
        const tables:{[name: string]: any} = Object.assign({}, msg.payload.pld);            
        if (Object.prototype.hasOwnProperty.call(tables, "power")) tables.power = (tables.power == "on" ? 1 : 0);
        if (Object.prototype.hasOwnProperty.call(tables, "mode")) tables.mode = (tables.mode == "cool" ? 0 : tables.mode == "heat" ? 1 : tables.mode == "fan" ? 2 : 3);
        msg.payload.pld = tables;
        
        return super.on_svc_set(msg);

    }
}