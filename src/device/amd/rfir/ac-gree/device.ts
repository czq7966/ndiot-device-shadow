
import { IDeviceBusDataPayload, IDeviceBusDataPayloadHd } from "../../../device.dts";
import { CmdId } from "../../coders/dev-bin-json/cmd";
import { ICmdHead } from "../../coders/dev-bin-json/cmd-head";
import { IPldTable, PldTable } from "../../coders/dev-bin-json/pld-table";
import { Coder, ICoder } from "../../coders/rfir/ac-gree/coder";
import { ISegCoderParam, SegCoderParam } from "../../coders/rfir/rfir-coder";
import { Debuger } from "../../nd-device";
import { IRFIRDevice, RFIRDevice } from "../device";

export interface IRFIRDeviceACGree extends IRFIRDevice {}

export  class RFIRDeviceACGree extends RFIRDevice implements IRFIRDeviceACGree {
    ac_coder: ICoder

    //初始化
    init() {
        Debuger.Debuger.log("RFIRDeviceACGree init", this.attrs.id);
        this.ac_coder = new Coder();        
        let param1 = new SegCoderParam();
        param1.tolerance = 20;
        param1.excess = 0;
        param1.atleast = true;                              
        param1.MSBfirst = false;
        param1.step = 2;
        
        param1.nbits = 4 * 8;
        param1.headermark = 9000;
        param1.headerspace = 4500;
        param1.onemark = 620;
        param1.onespace = 1600;
        param1.zeromark = 620;
        param1.zerospace = 540;
        param1.footermark = 0;
        param1.footerspace = 0;
        param1.lastspace = 0;        
        this.rfir_coder.params.push(param1);

        let param2 = Object.assign({}, param1) as ISegCoderParam;
        param2.headermark = 0;
        param2.headerspace = 0;
        param2.footermark = 620;
        param2.footerspace = 19980;
        param2.nbits = 3;        
        this.rfir_coder.params.push(param2);
        
        let param3 = Object.assign({}, param1) as ISegCoderParam;
        param3.headermark = 0;
        param3.headerspace = 0;
        param3.footermark = 620;
        param3.footerspace = 19980;
        this.rfir_coder.params.push(param3);
        
    }

    on_south_input_decode(p_hd: ICmdHead, p_pld: IPldTable): IDeviceBusDataPayload {
        let payload = super.on_south_input_decode(p_hd, p_pld);
        if (!payload) return;

        let hd = payload.hd;
        let pld = payload.pld;
        if (hd.cmd_id == CmdId.rfir_sniff) {  
            let data = pld[PldTable.Keys.rfir_sniff_data];
            if (data && Array.isArray(data) && data.length == 3) {
                if (this.ac_coder.pnt_table.decodeBytess(data)) {
                    this.ac_coder.plf_props.decode(this.ac_coder.pnt_table);
                    pld = this.ac_coder.plf_props.props;
                    console.log(this.ac_coder.pnt_table, pld)
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
        if (!payload) return;
        
        let hd = payload.hd;
        let pld = payload.pld || {};

        if (hd.cmd_id == CmdId.set && !pld[PldTable.Keys.rfir_send_data] ) {  
            let pnttable = this.ac_coder.plf_props.encode(pld, this.ac_coder.pnt_table);
            
            let bytessA = pnttable.encodeBytess();
            let bytessB = pnttable.encodeBytess(true);
            let bufA = this.rfir_coder.encode(bytessA);
            let bufB = this.rfir_coder.encode(bytessB);
            let buf = Buffer.concat([bufA, bufB]);

            if (buf && buf.length > 0) {
                pld[PldTable.Keys.rfir_send_data] = buf;   
            }
        }    
        
        return {
            hd: hd,
            pld: pld
        }

    }  
}