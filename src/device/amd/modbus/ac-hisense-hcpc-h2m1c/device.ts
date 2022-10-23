import { EModbusPLCType } from "../../../../common/modbus";
import { Debuger } from "../../../device-base";
import { IDeviceBusEventData } from "../../../device.dts";
import { ACDevice } from "../base/ac-device";
import { IModbus, Modbus } from "../base/device";

export interface IACHisenseHCPCH2M1C extends IModbus {}

export class ACHisenseHCPCH2M1C extends ACDevice implements IACHisenseHCPCH2M1C {

    //初始化
    init() {
        super.init();
        Debuger.Debuger.log("ACHisenseHCPCH2M1C init");
        this.mode = "alone";
        this.slave = 0x32;
        this.tables.plcbase = 100000;
        let regPlcbase = EModbusPLCType.EReadHoldingRegisters * this.tables.plcbase + 1;
        this.tables.names = {
            power: regPlcbase + 40078,
            mode: regPlcbase + 40079,
            fanSpeed: regPlcbase + 40080,
            temperature: regPlcbase + 40082
        }

        this.tables.initAddressFromNames();

    }
     
    //反初始化
    uninit() {
        Debuger.Debuger.log("ACHisenseHCPCH2M1C uninit");
        super.uninit();
     }

    //南向输入
    on_south_input(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("ACHisenseHCPCH2M1C  on_south_input ", msg);
        super.on_south_input(msg);
    }


    //北向输入
    on_north_input(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("ACHisenseHCPCH2M1C  on_north_input");
       
        super.on_north_input(msg);
    }    



    //子设备输入
    on_child_input(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("ACHisenseHCPCH2M1C  on_child_input");
        //todo...
        super.on_child_input(msg);       
    }  


}