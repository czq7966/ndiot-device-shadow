import { IDeviceBusDataPayloadHd } from "../../device.dts";
import { Cmd, CmdId, Head, ICmdHead } from "./cmd";
import { RegTable } from "./regtable";

export interface IPLFCoder_head {
    sids: {[name: number]: IDeviceBusDataPayloadHd};
    encode(hd: IDeviceBusDataPayloadHd): ICmdHead;
    decode(hd: ICmdHead): IDeviceBusDataPayloadHd;
    encode_sid(sid: string): number
    decode_sid(sid: number): string
    clear_sids();
    reset();
}

export interface IPLFCoder_payload {
    encode(pld: any): any;
    decode(pld: any): any;
    reset();
}

export interface IPLFCoder {
    head: IPLFCoder_head
    payload: IPLFCoder_payload
}

export class PLFCoder_Head implements IPLFCoder_head{
    sids: {[name: number]: IDeviceBusDataPayloadHd} = {};
    penets: IDeviceBusDataPayloadHd[] = [];
    encode(hd: IDeviceBusDataPayloadHd): ICmdHead {
        let cmdHd = new Head()
        cmdHd.reset();
        cmdHd.cmd_stp = hd.stp ? hd.stp : 0;
        cmdHd.cmd_sid = this.encode_sid(hd.sid);
        
        if (cmdHd.cmd_sid) this.sids[cmdHd.cmd_sid] = hd;
        if (hd.entry && hd.entry.id) cmdHd.cmd_id = CmdId[hd.entry.id];  
        Object.assign(cmdHd, hd);      
        return cmdHd;
    }
    decode(cmdHd: ICmdHead): IDeviceBusDataPayloadHd {
        let hd: IDeviceBusDataPayloadHd  = {};
        let _hd = this.sids[cmdHd.cmd_sid];
        if (_hd) 
            hd = _hd;
        else {             
            hd.entry = {
                type: "evt",
                id: CmdId.Keys[cmdHd.cmd_id]
            };
            hd.sid = this.decode_sid(cmdHd.cmd_sid);
        }
        hd.stp = cmdHd.cmd_stp as any;
        delete this.sids[cmdHd.cmd_sid];
        Object.assign(hd, cmdHd);
        return hd;        
    }

    encode_sid(sid: string): number {    
        sid = sid ? sid : "";
        let result = parseInt(sid);
        if (result >= 0 || result <= 0) {
            
        } else {
            result = 0;
            for (let i = 0; i < sid.length; i++) {
                let j = i % 4;
                result = result + (sid.charCodeAt(i) << (j * 8));
            }
        }

        return result;
    };

    decode_sid(sid: number): string {        
        if (sid) {
            let hd = this.sids[sid];
            if (!hd) return hd.sid;       
            else return sid.toString();
        }         
        return;
    }

    clear_sids(){
        this.sids = {};
    };

    reset(){        
        this.clear_sids();
        this.penets = [];
    }

}

export class PLFCoder_payload implements IPLFCoder_payload{
    encode(pld: any): any{
        return PLFCoder_payload.encodeDefault(pld);
    };
    decode(pld: any): any{
        return PLFCoder_payload.decodeDefault(pld);
    };
    static encodeDefault(pld: any): {} {
        if (pld) {
            let result = Object.assign({}, pld);
            let keys = Object.keys(result);
            keys.forEach(key => {
                let val = result[key];
                delete result[key];
                let _key = RegTable.Keys[key];
                _key = _key ? _key : key;
                 result[_key] = val;
            })
            return result;
        }
        
        return pld;
    }
    static decodeDefault(pld: any):{} {
        if (pld) {
            let result = Object.assign({}, pld);
            let keys = Object.keys(result);
            keys.forEach(key => {
                let val = result[key];
                // delete result[key];
                let _key = RegTable.Values[key];
                _key = _key ? _key : key;
                 result[_key] = val;
            })
            return result;
        }

        return pld;
    }
    reset() {
    
    }
    
}

export class PLFCoder implements IPLFCoder {
    head: IPLFCoder_head = new PLFCoder_Head();
    payload: IPLFCoder_payload = new PLFCoder_payload();
}