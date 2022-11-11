
import { IDeviceBusDataPayload, IDeviceBusDataPayloadHd } from "../../../device.dts";
import { CmdId } from "../../coders/dev-bin-json/cmd";
import { ICmdHead } from "../../coders/dev-bin-json/cmd-head";
import { IPldTable, PldTable } from "../../coders/dev-bin-json/pld-table";
import { Coder, ICoder } from "../../coders/rfir/ac-media/coder";
import { TableConst } from "../../coders/rfir/ac-media/table";

import { ISegCoderParam, SegCoderParam } from "../../coders/rfir/rfir-coder";
import { Debuger } from "../../nd-device";
import { IRFIRDevice, RFIRDevice } from "../device";

export interface IRFIRDeviceACMedia extends IRFIRDevice {}

export  class RFIRDeviceACMedia extends RFIRDevice implements IRFIRDeviceACMedia {
    media_coder: ICoder

    //初始化
    init() {
        Debuger.Debuger.log("RFIRDeviceACMedia init", this.attrs.id);
        this.media_coder = new Coder();        
        let param1 = new SegCoderParam();
        param1.tolerance = 20;
        param1.excess = 0;
        param1.atleast = true;                              
        param1.MSBfirst = true;
        param1.step = 2;
        
        param1.nbits = TableConst.NBits;
        param1.headermark = TableConst.HeadMark;
        param1.headerspace = TableConst.HeadSpace;
        param1.onemark = TableConst.OneMark;
        param1.onespace = TableConst.OneSpace;
        param1.zeromark = TableConst.ZeroMark;
        param1.zerospace = TableConst.ZeroSpace;
        param1.footermark = TableConst.FooterMark;
        param1.footerspace = TableConst.FooterSpace;
        param1.lastspace = 0;        
        this.rfir_coder.params.push(param1);
        
    }

    on_south_input_decode(p_hd: ICmdHead, p_pld: IPldTable): IDeviceBusDataPayload {
        Debuger.Debuger.log("RFIRDeviceACMedia on_south_input_decode");
        let payload = super.on_south_input_decode(p_hd, p_pld);

        let hd = payload.hd;
        let pld = payload.pld;
        if (hd.cmd_id == CmdId.rfir_sniff) {  
            let data = pld[PldTable.Keys.rfir_sniff_data];
            if (data) {
                if (this.media_coder.pnt_table.decodeBytess(data)) {
                    this.media_coder.plf_props.decode(this.media_coder.pnt_table);
                    pld = this.media_coder.plf_props.props;
                }
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
        let pld = payload.pld || {};

        if (hd.cmd_id == CmdId.set && !pld[PldTable.Keys.rfir_send_data] ) {  
            let pnttable = this.media_coder.plf_props.encode(pld);
            pnttable.checksum()
            
            
            let bytess = pnttable.encodeBytess();
            let buf = this.rfir_coder.encode(bytess);
            
            // buf = Buffer.concat([buf, buf]);

            if (buf && buf.length > 0) {
                //须发两遍才生效
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