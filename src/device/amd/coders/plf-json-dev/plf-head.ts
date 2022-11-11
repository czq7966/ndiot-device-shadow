import { IDeviceBusDataPayloadHd } from "../../../device.dts";
import { CmdId } from "../dev-bin-json/cmd";
import { CmdHead, ICmdHead } from "../dev-bin-json/cmd-head";

export interface IPlfHead {
    sids: {[name: number]: IDeviceBusDataPayloadHd};
    penets: IDeviceBusDataPayloadHd[]
    encode(hd: IDeviceBusDataPayloadHd): ICmdHead;
    decode(hd: ICmdHead): IDeviceBusDataPayloadHd;
    encode_sid(sid: string): number
    decode_sid(sid: number): string
    clear_sids();
    reset();
}

export class PlfHead implements IPlfHead{
    sids: {[name: number]: IDeviceBusDataPayloadHd} = {};
    penets: IDeviceBusDataPayloadHd[] = [];
    encode(hd: IDeviceBusDataPayloadHd): ICmdHead {
        let cmdHd = new CmdHead()
        cmdHd.reset();
        cmdHd.head.cmd_stp = hd.stp ? hd.stp : 0;
        cmdHd.head.cmd_sid = this.encode_sid(hd.sid);
        
        if (cmdHd.head.cmd_sid) this.sids[cmdHd.head.cmd_sid] = hd;
        if (hd.entry && hd.entry.id) cmdHd.head.cmd_id = CmdId[hd.entry.id];  
        Object.assign(cmdHd.head, hd);      
        return cmdHd;
    }
    decode(cmdHd: ICmdHead): IDeviceBusDataPayloadHd {
        let hd: IDeviceBusDataPayloadHd  = {};
        let _hd = this.sids[cmdHd.head.cmd_sid];
        if (_hd) {
            hd = _hd;
        }
        else {             
            hd.entry = {
                type: "evt",
                id: CmdId.Names[cmdHd.head.cmd_id]
            };
            hd.sid = this.decode_sid(cmdHd.head.cmd_sid);
        }
        hd.stp = cmdHd.head.cmd_stp as any;
        delete this.sids[cmdHd.head.cmd_sid];        
        Object.assign(hd, cmdHd.head);
        return hd;        
    }

    encode_sid(sid: string): number {    
        sid = sid ? sid : "";
        let result = parseInt(sid);
        if (result >= 0 || result <= 0) {
            
        } else {
            result = 0;
            for (let i = 0; i < sid.length; i++) {
                // let j = i % 4;
                result = result + sid.charCodeAt(i);// << (j * 8));
            }
        }

        return result;
    };

    decode_sid(sid: number): string {        
        if (sid) {
            let hd = this.sids[sid];
            if (hd) { 
                return hd.sid;  
            }     
            else return sid.toString();
        }         
        return;
    }

    clear_sids(){
        this.sids = {};
    };

    reset(){        
        // this.clear_sids();
        this.penets = [];
    }

}


