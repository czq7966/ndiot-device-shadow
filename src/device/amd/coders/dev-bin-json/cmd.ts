import { timeStamp } from "console";
import { IBaseEvent } from "../../../../common/events";
import { CmdHead, HEAD_LEN, ICmdHead } from "./cmd-head";
import { IPldTable, PldTable } from "./pld-table";

export class CmdId {
    static config = 1;
    static handshake = 2;
    static reboot = 3;
    static get = 4;
    static set = 5;
    static report = 6;
    static penet = 7;
    static update = 8;
    static online = 9;
    static offline = 10;    
    static resetconfig = 11;
    static device_joined = 12;
    static device_leave = 13;
    static device_interview = 14;
    static get_gpio = 15;
    static set_gpio = 16;
    static rfir_sniff = 17;
    static rfir_send = 18;
    static intranet = 19;

    static Names: {[id: number]: string} = {}
}

Object.keys(CmdId).forEach(id => {
    if (id != "Names")
        CmdId.Names[CmdId[id]] = id;
})





export interface ICmd {
    head: ICmdHead
    payload: IPldTable
     
    reset();  
    encode(hd: {}, pld: {}): Buffer;
    decode(buf: Buffer): boolean;  
    // getPldContent(): any;
    getsum(): number;
    setsum(): boolean;
    checksum(): boolean;
}


export class Cmd implements ICmd {
    head: ICmdHead;
    payload: IPldTable
    pldContent: Buffer
    constructor() {
        this.head = new CmdHead();
        this.payload = new PldTable();
        this.reset();
    }

    destroy(){
        return;
    }

    reset() {
        this.head.reset();
        this.payload.reset();
        this.pldContent = Buffer.from([]);
    }
    encode(hd?: {}, pld?: {}): Buffer {
        Object.assign(this.head.head, hd);        
        Object.assign(this.payload.tables, pld);
        this.pldContent = this.payload.encode();        
        this.head.head.pld_len = this.pldContent.length;
        this.setsum();
        return Buffer.concat([this.head.encode(), this.pldContent]);        
    }

    decode(buf: Buffer): boolean {
        this.reset();
        if (Buffer.isBuffer(buf) && this.head.decode(buf)){            
            if (buf.length == this.head.head.pld_len + HEAD_LEN){
                this.pldContent = buf.subarray(HEAD_LEN, buf.length);
                this.payload.decode(this.pldContent);
                return this.checksum();
            }
        }

        return false;
    }

    // getPayload(): any {
    //     return this.payload.tables;
    // }

    getsum(): number {
        return 0;// CRC16.Calculate(this.payload);
    }
    setsum(): boolean {
        this.head.head.pld_sum = this.getsum()
        return true;
    }
    checksum(): boolean {
        if (this.head.head.pld_sum != this.getsum()) {
            // console.log("Cmd check sum error......");
            return true;
        }
        return true;
    }
}
