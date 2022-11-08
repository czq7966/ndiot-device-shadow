import { Debuger } from "../../../device-base";
import { IDeviceBusDataPayload, IDeviceBusDataPayloadHd } from "../../../device.dts";
import { CmdId } from "../../coders/dev-bin-json/cmd";
import { ICmdHead } from "../../coders/dev-bin-json/cmd-head";
import { IPldTable, PldTable } from "../../coders/dev-bin-json/pld-table";
import { Coder } from "../../coders/tv/tv-hisense-65wr30a/coder";
import { NDDevice, INDDevice} from "../../nd-device";

export interface ITV_HISENSE_65WR30A extends INDDevice {
}

export class TV_HISENSE_65WR30A extends NDDevice implements ITV_HISENSE_65WR30A {
    
    coder = new Coder();
    //初始化
    init() {
        Debuger.Debuger.log("TV_HISENSE_65WR30A init");
        
    }
     
    //反初始化
    uninit() {
        Debuger.Debuger.log("TV_HISENSE_65WR30A uninit");
     }


    on_south_input_decode(p_hd: ICmdHead, p_pld: IPldTable): IDeviceBusDataPayload {
        let payload = super.on_south_input_decode(p_hd, p_pld);

        let hd = payload.hd;
        let pld = payload.pld;
        if (hd.cmd_id == CmdId.penet) {  
            let s_hd = this.plf_coder.head.penets.pop(); 
            if (s_hd) {
                hd.entry = s_hd.entry;
                hd.sid = s_hd.sid;
                hd.stp = 1;
            } else {
                hd.entry = {
                    type: "evt",
                    id: "report"
                }
            }
            let data = this.recvcmd.payload.tables[PldTable.Keys.penet_data] as Buffer;
            this.coder.pnt_table.reset();
            if (data && this.coder.pnt_table.decode(data)) {                
                pld = this.coder.plf_props.decode(this.coder.pnt_table)
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
        if ((hd.cmd_id == CmdId.get || hd.cmd_id == CmdId.set) && hd.entry && hd.entry.type == "svc" ) {
            let pnttable = this.coder.plf_props.encode(hd.cmd_id == CmdId.get ? {} : p_pld);

            if (pnttable) {
                hd.cmd_id = CmdId.penet;     
                this.plf_coder.head.penets.push(p_hd);
                pld = {};
                pld[PldTable.Keys.penet_data] = pnttable.encode();
            } 
        }              
        
        return {
            hd: hd,
            pld: pld
        }
    }    

}