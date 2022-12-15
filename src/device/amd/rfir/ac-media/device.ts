
import { IDeviceBusDataPayload, IDeviceBusDataPayloadHd, IDeviceBusEventData } from "../../../device.dts";
import { CmdId } from "../../coders/dev-bin-json/cmd";
import { ICmdHead } from "../../coders/dev-bin-json/cmd-head";
import { IPldTable, PldTable } from "../../coders/dev-bin-json/pld-table";
import { Coder, ICoder } from "../../coders/rfir/ac-media/coder";
import { TableConst } from "../../coders/rfir/ac-media/table";

import { ISegCoderParam, SegCoderParam } from "../../coders/rfir/rfir-coder";
import { Debuger } from "../../nd-device";
import { IRFIRDevice, RFIRDevice } from "../device";

export type IRFIRDeviceACMedia = IRFIRDevice

export  class RFIRDeviceACMedia extends RFIRDevice implements IRFIRDeviceACMedia {
    ac_coder: ICoder

    //初始化
    init() {
        Debuger.Debuger.log("RFIRDeviceACMedia init", this.attrs.id);
        this.ac_coder = new Coder();    
        this.rfir_coder = this.ac_coder.rfir_coder;    
        
    }

    // _on_south_input_decode(p_hd: ICmdHead, p_pld: IPldTable): IDeviceBusDataPayload {
    //     Debuger.Debuger.log("RFIRDeviceACMedia on_south_input_decode");
    //     const payload = super.on_south_input_decode(p_hd, p_pld);
    //     if (!payload) return;

    //     const hd = payload.hd;
    //     let pld = payload.pld;
    //     if (hd.cmd_id == CmdId.rfir_sniff) {  
    //         const data = pld[PldTable.Keys.rfir_sniff_data];
    //         if (data) {
    //             if (this.ac_coder.pnt_table.decodeBytess(data)) {
    //                 this.ac_coder.plf_props.decode(this.ac_coder.pnt_table);
    //                 pld = this.ac_coder.plf_props.props;
    //             }
    //         }
    //     } 

    //     return {
    //         hd: hd,
    //         pld: pld
    //     };       
    // }
  
    // _on_north_input_encode(p_hd: IDeviceBusDataPayloadHd, p_pld: {}): IDeviceBusDataPayload {
    //     const payload = super.on_north_input_encode(p_hd, p_pld);
    //     if (!payload) return;
    //     const hd = payload.hd;
    //     const pld = payload.pld || {};

    //     if (hd.cmd_id == CmdId.set && !pld[PldTable.Keys.rfir_send_data] ) {  
    //         const pnttable = this.ac_coder.plf_props.encode(pld, this.ac_coder.pnt_table);
    //         pnttable.checksum()
            
            
    //         const bytess = pnttable.encodeBytess();
    //         const buf = this.rfir_coder.encode(bytess);
            
    //         // buf = Buffer.concat([buf, buf]);

    //         if (buf && buf.length > 0) {
    //             //须发两遍才生效
    //             pld[PldTable.Keys.rfir_send_repeat] = 1;
    //             pld[PldTable.Keys.rfir_send_data] = buf;   
    //         }
    //     }    
        
    //     return {
    //         hd: hd,
    //         pld: pld
    //     }

    // }  
}