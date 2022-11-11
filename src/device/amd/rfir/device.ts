
import { IDeviceBusDataPayload, IDeviceBusDataPayloadHd } from "../../device.dts";
import { CmdId } from "../coders/dev-bin-json/cmd";
import { ICmdHead } from "../coders/dev-bin-json/cmd-head";
import { IPldTable, PldTable } from "../coders/dev-bin-json/pld-table";
import { IRfirCoder, RfirCoder } from "../coders/rfir/rfir-coder";
import { Debuger, INDDevice, NDDevice } from "../nd-device";


export interface IRFIRDevice extends INDDevice {
    rfir_coder: IRfirCoder
}

export  class RFIRDevice extends NDDevice implements IRFIRDevice {
    rfir_coder: IRfirCoder = new RfirCoder();

    //初始化
    init() {
        Debuger.Debuger.log("RFIRDEvice init");
    }
    
    on_south_input_decode(p_hd: ICmdHead, p_pld: IPldTable): IDeviceBusDataPayload {
        Debuger.Debuger.log("RFIRDEvice on_south_input_decode");
        let payload = super.on_south_input_decode(p_hd, p_pld);

        let hd = payload.hd;
        let pld = payload.pld;
        if (hd.cmd_id == CmdId.rfir_sniff) {  
            let data = this.recvcmd.payload.tables[PldTable.Keys.rfir_sniff_data] as Buffer;    
            if (data) {
                pld[PldTable.Keys.rfir_sniff_data] = this.rfir_coder.decode(data);
            }
        } 

        return {
            hd: hd,
            pld: pld
        };
    }

    on_north_input_encode(p_hd: IDeviceBusDataPayloadHd, p_pld: {}): IDeviceBusDataPayload {
        let payload = super.on_north_input_encode(p_hd, p_pld);
        let hd = payload.hd;
        let pld = payload.pld;


        let bytess = pld && pld[PldTable.Keys.rfir_send_data];
        if (bytess) {            
            let buf = this.rfir_coder.encode(bytess);

            if (buf && buf.length > 0) {
                pld = {};
                pld[PldTable.Keys.rfir_send_data] = buf;   
            } 
        }             
        
        return {
            hd: hd,
            pld: pld
        }
    }    
}