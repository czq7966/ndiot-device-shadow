import { Debuger } from "../../../device-base";
import { IDeviceBusDataPayload, IDeviceBusDataPayloadHd, IDeviceBusEventData } from "../../../device.dts";
import { NDDevice, INDDevice} from "../../nd-device";
import { CmdId, ICmdHead } from "../../nd-device/cmd";
import { RegTable } from "../../nd-device/regtable";
import { Coder, DEVProtocal, ICoder, IDEVProtocal, IPLFProtocal } from "./coder";

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


    on_south_input_decode(p_hd: ICmdHead, p_pld: any): IDeviceBusDataPayload {
        let payload = super.on_south_input_decode(p_hd, p_pld);

        let hd = payload.hd;
        let pld = payload.pld;
        if (hd.cmd_id == CmdId.penet) {  
            pld = null;            
            let s_hd = this.coder.head.penets.pop(); 
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
            let data = this.recvcmd.regtable.tables[RegTable.Keys.penet_data] as Buffer;
            let devPro = new DEVProtocal();
            if (data && devPro.decode(data)) {
                pld = (this.coder.payload as IPLFProtocal).decode(devPro);
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
        if ((hd.cmd_id == CmdId.get || hd.cmd_id == CmdId.set) && hd.entry && hd.entry.type == "svc" ) {
            let devPro = this.coder.payload.encode(hd.cmd_id == CmdId.get ? {} : p_pld) as IDEVProtocal;
            if (devPro) {
                hd.cmd_id = CmdId.penet;     
                this.coder.head.penets.push(p_hd);
                pld = {};
                pld[RegTable.Keys.penet_data] = devPro.encode();   
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