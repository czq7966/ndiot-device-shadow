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
        this.mode = "alone";
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
     
    //反初始化
    uninit() {
        Debuger.Debuger.log("ACPGDTM7000F uninit");
        super.uninit();
     }

    //南向输入
    on_south_input(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("ACPGDTM7000F  on_south_input ", msg);
        super.on_south_input(msg);
    }


    //北向输入
    on_north_input(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("ACPGDTM7000F  on_north_input");
       
        super.on_north_input(msg);
    }    



    //子设备输入
    on_child_input(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("ACPGDTM7000F  on_child_input");
        //todo...
        super.on_child_input(msg);       
    }  

    //查询
    do_svc_get(names: string[]): Promise<{[name: string]: any}> {
        return new Promise((resolve, reject) => {
            super.do_svc_get(names)
            .then(v => {                              
                let result = Utils.DeepMerge({}, v) as any;
                result.power = v.power === 0 ? "off" : v.power === 1 ? "on" : v.power;
                result.mode = v.mode === 0 ? "cool" : v.mode === 1 ? "heat" : v.mode === 2 ? "fan" : v.mode;
                result.temperature = v.mode == "cool" ? v.cooltemperature / 10 : v.heattemperature == "heat" ? v.heattemperature / 10 : v.cooltemperature;
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
            if (values.hasOwnProperty("mode")) tables.mode = (values.mode == "cool" ? 0 : values.mode == "heat" ? 1 : 2);
            if (values.hasOwnProperty("temperature")) {
                if (values.mode == "cool") tables.cooltemperature = values.temperature * 10;
                if (values.mode == "heat") tables.heattemperature = values.temperature * 10;
            }

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