import { EModbusPLCType, IModbusRTUTable } from "../../../../common/modbus";
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

    on_svc_get_tables(msg: IDeviceBusEventData): IModbusRTUTable[] {
        Debuger.Debuger.log("ACHisenseHCPCH2M1C on_svc_get_tables", msg);
        
        let pld = msg.payload.pld;
        pld = pld && (Object.keys(pld).length > 0) && pld || Object.assign({}, this.tables.names);
        msg.payload.pld = pld;
        return super.on_svc_get_tables(msg);
    }

}