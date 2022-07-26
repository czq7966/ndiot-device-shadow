import { CRC16 } from "../../../common/crc16";
import { IBaseEvent } from "../../../common/events";
import { IRegTable, RegTable } from "./regtable";

export var PRO_LOGO: number = 0x4E44;
export var HEAD_LEN: number = 4 * 4;

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

    static Keys: {[value: number]: string} = {}
}

Object.keys(CmdId).forEach(id => {
    if (id != "Keys")
        CmdId.Keys[CmdId[id]] = id;
})

export interface IHead {
    pro_logo?: number;        
    pro_ver?: number;
    dev_id?: number;
    cmd_id?: number;
    cmd_stp?: number;
    err_no?: number;
    cmd_sid?: number;                
    pld_sum?: number;
    pld_len?: number;
}

export interface ICmdHead extends IHead {
    encode(): Buffer;
    decode(buf: Buffer);
    reset();
}


export interface ICmd {
    head: ICmdHead
    regtable: IRegTable
    payload: Buffer
     
    reset();  
    encode(hd: {}, pld: Buffer | {}): Buffer;
    decode(buf: Buffer): boolean;  
    getPayload(): any;
    getsum(): number;
    setsum(): boolean;
    checksum(): boolean;
}

export class Head implements ICmdHead {
    pro_logo: number;
    pro_ver: number;
    dev_id: number;
    cmd_id: number;
    cmd_stp: number;
    err_no: number;
    cmd_sid: number;
    pld_sum: number;
    pld_len: number;

    encode(): Buffer {
        let buf = [];
        buf.push(this.pro_logo & 0xff);
        buf.push((this.pro_logo >> 8) & 0xff);

        buf.push(this.pro_ver & 0xff);
        buf.push(this.dev_id & 0xff);
        buf.push(this.cmd_id & 0xff);
        buf.push(this.cmd_stp & 0xff);

        buf.push(this.err_no & 0xff);
        buf.push((this.err_no >> 8) & 0xff);

        buf.push((this.cmd_sid >> 0) & 0xff);
        buf.push((this.cmd_sid >> 8) & 0xff);
        buf.push((this.cmd_sid >> 16) & 0xff);
        buf.push((this.cmd_sid >> 24) & 0xff);

        buf.push((this.pld_sum >> 0) & 0xff);
        buf.push((this.pld_sum >> 8) & 0xff);
        buf.push((this.pld_len >> 0) & 0xff);
        buf.push((this.pld_len >> 8) & 0xff);

        return  Buffer.from(buf);
    }
    decode(buf: Buffer): boolean {
        let idx = 0;
        if (buf.length >= HEAD_LEN) {
            this.pro_logo =  buf[idx++] + (buf[idx++] << 8);
            this.pro_ver =  buf[idx++];
            this.dev_id =  buf[idx++];
            this.cmd_id =  buf[idx++];
            this.cmd_stp =  buf[idx++];
            this.err_no = buf[idx++] + (buf[idx++] << 8);
            this.cmd_sid = buf[idx++] + (buf[idx++] << 8) + (buf[idx++] << 16) + (buf[idx++] << 24);
            this.pld_sum = buf[idx++] + (buf[idx++] << 8);
            this.pld_len = buf[idx++] + (buf[idx++] << 8);

            return this.pro_logo == PRO_LOGO;
        }
        return false;        
    }
    reset() {
        this.pro_logo = PRO_LOGO;
        this.pro_ver = 0;
        this.dev_id = 0;
        this.cmd_id = 0;
        this.cmd_stp = 0;
        this.err_no = 0;
        this.cmd_sid = 0;
        this.pld_sum = 0;
        this.pld_len = 0;
    }

}


export class Cmd implements ICmd {
    head: ICmdHead;
    regtable: IRegTable
    payload: Buffer
    constructor() {
        this.head = new Head();
        this.head.reset();
        this.regtable = new RegTable();
        this.payload = Buffer.from([]);
    }

    destroy(){

    }

    reset() {
        this.head.reset();
        this.regtable.tables = {};
        this.payload = Buffer.from([]);
    }
    encode(hd?: {}, pld?: Buffer | {}): Buffer {
        Object.assign(this.head, hd);        
        Object.assign(this.regtable.tables, pld);
        this.payload = this.regtable.encode();        
        this.head.pld_len = this.payload.length;
        this.setsum();
        return Buffer.concat([this.head.encode(), this.payload]);        
    }

    decode(buf: Buffer): boolean {
        this.reset();
        if (Buffer.isBuffer(buf) && this.head.decode(buf)){            
            if (buf.length == this.head.pld_len + HEAD_LEN){
                this.payload = buf.subarray(HEAD_LEN, buf.length);
                this.regtable.decode(this.payload);
                return this.checksum();
            }
        }

        return false;
    }

    getPayload(): any {
        return this.regtable.tables;
    }

    getsum(): number {
        return CRC16.Calculate(this.payload);
    }
    setsum(): boolean {
        this.head.pld_sum = this.getsum()
        return true;
    }
    checksum(): boolean {
        if (this.head.pld_sum != this.getsum()) {
            // console.log("Cmd check sum error......");
            return true;
        }
        return true;
    }
}
