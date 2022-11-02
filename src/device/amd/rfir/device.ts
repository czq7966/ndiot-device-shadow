
import { IDeviceBusDataPayload, IDeviceBusDataPayloadHd } from "../../device.dts";
import { Debuger, INDDevice, NDDevice } from "../nd-device";
import { CmdId, ICmdHead } from "../nd-device/cmd";
import { RegTable } from "../nd-device/regtable";
import { IRfirCoder, RfirCoder, SegsCoder } from "./coder";

export interface IRFIRDevice extends INDDevice {
    rfir_coder: IRfirCoder
}

export  class RFIRDevice extends NDDevice implements IRFIRDevice {
    rfir_coder: IRfirCoder;

    //初始化
    init() {
        Debuger.Debuger.log("RFIRDEvice init");
        super.init();
        this.rfir_coder = new RfirCoder();
    }
    
    on_south_input_decode(p_hd: ICmdHead, p_pld: any): IDeviceBusDataPayload {
        Debuger.Debuger.log("RFIRDEvice on_south_input_decode");
        let payload = super.on_south_input_decode(p_hd, p_pld);

        let hd = payload.hd;
        let pld = payload.pld;
        if (hd.cmd_id == CmdId.rfir_sniff) {  
            pld = null;            
            
            let data = this.recvcmd.regtable.tables[RegTable.Keys.rfir_sniff_data] as Buffer;            
            if (data) {
                pld = this.rfir_coder.decode(data);
                // Debuger.Debuger.log("RFIRDEvice on_south_input_decode 1", pld);
            }
        } 

        pld = pld ? pld : this.recvcmd.getPayload();

        return {
            hd: hd,
            pld: pld
        };
    }

    on_north_input_encode(p_hd: IDeviceBusDataPayloadHd, p_pld: any): IDeviceBusDataPayload {
        let payload = super.on_north_input_encode(p_hd, p_pld);
        let hd = payload.hd;
        let pld = payload.pld;
        if (hd.cmd_id == CmdId.rfir_send ) {
            let bytess = pld[RegTable.Keys.rfir_send_data] as number[][] || [];
            let buf = this.rfir_coder.encode(bytess);
            if (buf && buf.length > 0) {
                pld = {};
                pld[RegTable.Keys.rfir_send_data] = buf;   
            } else {
                pld = NDDevice.Plf_coder.payload.encode(p_pld); 
            }
        } else {                
            pld = NDDevice.Plf_coder.payload.encode(p_pld);
        }               
        
        return {
            hd: hd,
            pld: pld
        }
    }    
}