import { Utils } from "../../../../common/utils";
import { Debuger } from "../../../device-base";
import { IDeviceBusEventData } from "../../../device.dts";
import { IModbus, Modbus } from "./device";

export interface IACDevice extends IModbus {}

export class ACDevice extends Modbus implements IACDevice {


    //查询
    do_svc_get(names: string[]): Promise<{[name: string]: any}> {
        return new Promise((resolve, reject) => {
            super.do_svc_get(names)
            .then(v => {                              
                let result = Utils.DeepMerge({}, v) as any;
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
    do_svc_set(values: {[name: string]: any}): Promise<{[name: string]: number}> {
        return new Promise((resolve, reject) => {
            let tables:{[name: string]: any} = {};
            
            if (values.hasOwnProperty("power")) tables.power = (values.power == "on" ? 1 : 0);
            if (values.hasOwnProperty("mode")) tables.mode = (values.mode == "cool" ? 0 : values.mode == "heat" ? 1 : values.mode == "fan" ? 2 : 3);
            super.do_svc_set(tables)
            .then(v => {          
                resolve(v);
            })
            .catch(e => {
                reject(e);
            })
        })

    }
}