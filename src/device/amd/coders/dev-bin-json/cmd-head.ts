import { Head, IHead } from "./head";

export var PRO_LOGO: number = 0x4E44;
export var HEAD_LEN: number = 4 * 4;


export interface ICmdHead {
    head: IHead
    encode(): Buffer;
    decode(buf: Buffer);
    reset();
}


export class CmdHead implements ICmdHead {
    head: IHead;
    constructor(){
        this.head = new Head();
    }

    encode(): Buffer {
        let buf = [];
        buf.push(this.head.pro_logo & 0xff);
        buf.push((this.head.pro_logo >> 8) & 0xff);

        buf.push(this.head.pro_ver & 0xff);
        buf.push(this.head.dev_id & 0xff);
        buf.push(this.head.cmd_id & 0xff);
        buf.push(this.head.cmd_stp & 0xff);

        buf.push(this.head.err_no & 0xff);
        buf.push((this.head.err_no >> 8) & 0xff);

        buf.push((this.head.cmd_sid >> 0) & 0xff);
        buf.push((this.head.cmd_sid >> 8) & 0xff);
        buf.push((this.head.cmd_sid >> 16) & 0xff);
        buf.push((this.head.cmd_sid >> 24) & 0xff);

        buf.push((this.head.pld_sum >> 0) & 0xff);
        buf.push((this.head.pld_sum >> 8) & 0xff);
        buf.push((this.head.pld_len >> 0) & 0xff);
        buf.push((this.head.pld_len >> 8) & 0xff);

        return  Buffer.from(buf);
    }
    decode(buf: Buffer): boolean {
        let idx = 0;
        if (buf.length >= HEAD_LEN) {
            this.head.pro_logo =  buf[idx++] + (buf[idx++] << 8);
            this.head.pro_ver =  buf[idx++];
            this.head.dev_id =  buf[idx++];
            this.head.cmd_id =  buf[idx++];
            this.head.cmd_stp =  buf[idx++];
            this.head.err_no = buf[idx++] + (buf[idx++] << 8);
            let sid = [buf[idx++], buf[idx++], buf[idx++], buf[idx++]];
            // this.head.cmd_sid = buf[idx++] + (buf[idx++] << 8) + (buf[idx++] << 16) + (buf[idx++] << 24);
            this.head.cmd_sid = Buffer.from(sid).readUint32LE();
            this.head.pld_sum = buf[idx++] + (buf[idx++] << 8);
            this.head.pld_len = buf[idx++] + (buf[idx++] << 8);

            return this.head.pro_logo == PRO_LOGO;
        }
        return false;        
    }
    reset() {
        this.head.pro_logo = PRO_LOGO;
        this.head.pro_ver = 0;
        this.head.dev_id = 0;
        this.head.cmd_id = 0;
        this.head.cmd_stp = 0;
        this.head.err_no = 0;
        this.head.cmd_sid = 0;
        this.head.pld_sum = 0;
        this.head.pld_len = 0;
    }

}
