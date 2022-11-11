import { IDeviceBusDataPayload, IDeviceBusDataPayloadHd } from "../../../device.dts";
import { CmdId } from "../../coders/dev-bin-json/cmd";
import { ICmdHead } from "../../coders/dev-bin-json/cmd-head";
import { IPldTable, PldTable } from "../../coders/dev-bin-json/pld-table";
import { ICoder } from "../../coders/rfir/ac-gree/coder";
import { PntTable } from "../../coders/rfir/ac-gree/pnt-table";
import { Debuger } from "../ac-gree";
import { IRFIRDeviceACGree, RFIRDeviceACGree } from "../ac-gree/device";


export interface IRFIRDeviceACGreeND extends IRFIRDeviceACGree {}

export  class RFIRDeviceACGreeND extends RFIRDeviceACGree implements IRFIRDeviceACGreeND {
    gree_coder: ICoder

    //初始化
    init() {
        super.init();
        Debuger.Debuger.log("RFIRDeviceACGreeND init", this.attrs.id); 
        this.gree_coder.pnt_table.model = PntTable.Model_YAW1F;
        this.gree_coder.pnt_table.reset();
    }

    on_south_input_decode(p_hd: ICmdHead, p_pld: IPldTable): IDeviceBusDataPayload {
        return super.on_south_input_decode(p_hd, p_pld);
 
    }
  
    on_north_input_encode(p_hd: IDeviceBusDataPayloadHd, p_pld: {}): IDeviceBusDataPayload {
        let payload = super.on_north_input_encode(p_hd, p_pld);
        let hd = payload.hd;
        let pld = payload.pld || {};

        if (hd.cmd_id == CmdId.set && pld[PldTable.Keys.rfir_send_data]) {  
            let pnttable = this.gree_coder.plf_props.encode(pld, this.gree_coder.pnt_table);

            let bytessA = pnttable.encodeBytess();
            let bufA = this.rfir_coder.encode(bytessA);
            let buf = bufA;
            if (buf && buf.length > 0) {
                pld[PldTable.Keys.rfir_send_repeat] = 1;   
                pld[PldTable.Keys.rfir_send_data] = buf;   
            }
        }    
        
        return {
            hd: hd,
            pld: pld
        }
    }  
}