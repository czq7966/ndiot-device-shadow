import { IDeviceBusDataPayloadHd } from "../../../device.dts";
import { CmdId, ICmdHead } from "../../nd-device/cmd";
import { IPLFCoder, IPLFCoder_head, IPLFCoder_payload, PLFCoder, PLFCoder_Head, PLFCoder_payload } from "../../nd-device/plf-coder";

export interface IPLFHead extends IPLFCoder_head {

}

export interface IDEVProtocal {
    head: number
    len: number
    cmd: number
    data: Array<number>
    sum: number
    end: number

    encode(): Buffer
    decode(buf: Buffer): boolean
    calsum(): number
    reset();
}

export interface IPLFProps{
    input?: string
    power?: "on" | "off",
    mute?: "on" | "off",
    volume?: number
    signal?: boolean
}

export interface IPLFProtocal extends IPLFCoder_payload {
    encode(pld?: IPLFProps): IDEVProtocal
    decode(dev: IDEVProtocal): IPLFProps
}



export interface ICoder extends IPLFCoder {

}

export class PLFHead extends PLFCoder_Head implements IPLFHead {

    
}

export class DEVProtocal implements IDEVProtocal {
    static PC2TV_head = 0xDDFF;
    static PC2TV_end = 0xBBCC;
    static TV2PC_head = 0xABAB;
    static TV2PC_end = 0xCDCD;
    static CMD_input = 0xC1080000;
    static CMD_mute = 0xC1260000;
    static CMD_power_off = 0xC1150000;
    static CMD_power_on = 0xA10000;
    static CMD_volume = 0xC12700;
    static CMD_get = 0xC12800;

    static DATA_input = {
        analog: [0x01, 0x01],
        digital: [0x01, 0x02],
        pc: [0x01, 0x0C],
        hdmi1: [0x01, 0x0E],
        hdmi2: [0x01, 0x0F],
        video: [0x01, 0x04],
        vector: [0x01, 0x07],
        vga: [0x01, 0x17]
    }
    static DATA_input_name(value: number[]): string {
        let result: string;
        Object.keys(DEVProtocal.DATA_input).forEach(key => {
            let val = DEVProtocal.DATA_input[key];
            if (DEVProtocal.DATA_ARRAY_COMP(val, value)) {
                result = key;
            }
        });

        return result;
    }

    static DATA_ARRAY_COMP(arr1: number[], arr2: number[]): boolean {
        if (arr1 && arr2 && arr1.length === arr2.length) {
            for (let i = 0; i < arr1.length; i++) {
                if (arr1[i] != arr2[i]) {
                    return false;
                }                                           
            }
            return true;
        }  
        return false;
    }

    static DATA_mute_off = [0x01, 0x00];
    static DATA_mute_on = [0x01, 0x01];
    static DATA_power_off = [0x01, 0xAA, 0xAA];
    static DATA_power_on = [];
    static DATA_volume = [0x01];
    static DATA_get = [0x01];

    static DATA_get_input = {
        analog: 0x0101,
        digital: 0x0201,
        pc: 0x0501,
        hdmi1: 0x0503,
        hdmi2: 0x0502,
        video: 0x0401,
        vector: 0x0301,
        vga: 0x0801,          
    }


    head: number = 0
    len: number = 0
    cmd: number = 0
    data: Array<number> = []
    sum: number = 0
    end: number = 0
    encode(): Buffer {
        let buf = [];
        buf.push((this.head >> 8) & 0xFF);
        buf.push(this.head & 0xFF);        

        let len = this.data.length + 5;
        buf.push((len >> 8) & 0xFF);
        buf.push(len & 0xFF);

        buf.push((this.cmd >> 24) & 0xFF);
        buf.push((this.cmd >> 16) & 0xFF);
        buf.push((this.cmd >> 8) & 0xFF);
        buf.push((this.cmd >> 0) & 0xFF);
        
        for (let i = 0; i < this.data.length; i++) {
            buf.push(this.data[i] & 0xFF);            
        }        

        this.sum = this.calsum();
        buf.push(this.sum);
        buf.push((this.end >> 8) & 0xFF);
        buf.push(this.end & 0xFF);
       
        console.log(this.calsum());

        return Buffer.from(buf);
    }

    decode(buf: Buffer): boolean {
        let idx = 0;
        if (buf.length > 10 ) {
            this.head = (buf[idx++] << 8) + buf[idx++];
            this.len = (buf[idx++] << 8) + buf[idx++];
            this.cmd = Uint32Array.from([buf[idx++] << 24 | (buf[idx++] << 16) | (buf[idx++] << 8) | (buf[idx++] << 0) ] )[0];

            while (idx < buf.length - 3) {
                this.data.push(buf[idx++]);
            }
            this.sum = buf[idx++];
            this.end = (buf[idx++] << 8) + buf[idx++];

            return true;
        }
        return false;
    }

    calsum(): number {
        let sum =   ((this.len >> 8) & 0xFF) ^
                    ((this.len >> 0) & 0xFF) ^
                    ((this.cmd >> 24) & 0xFF) ^
                    ((this.cmd >> 16) & 0xFF) ^
                    ((this.cmd >> 8) & 0xFF) ^
                    ((this.cmd >> 0) & 0xFF);

        for (let i = 0; i < this.data.length; i++) {
            sum ^= this.data[i];                
        }
        return sum;
    }

    reset(toPC?: number){        
        this.head = DEVProtocal.PC2TV_head;
        this.len = 0;
        this.cmd = 0;
        this.data = [];
        this.sum = 0;
        this.end = DEVProtocal.PC2TV_end;
        if (toPC) {
            this.head = DEVProtocal.TV2PC_head;
            this.end = DEVProtocal.TV2PC_end;
        }
    };
}

export class PLFProtocal extends PLFCoder_payload implements IPLFProtocal {
    encode(pld: IPLFProps): IDEVProtocal {
        let pro = new DEVProtocal();
        pro.reset();
        if (!pld && Object.keys(pld).length == 0) {
            pro.cmd = DEVProtocal.CMD_get;
            return pro;
        } else  {
            if (pld.power === "on")
                pro.cmd = DEVProtocal.CMD_power_on;
            else if (pld.power === "off")
                pro.cmd = DEVProtocal.CMD_power_off;
            else if (pld.input) {
                pro.cmd = DEVProtocal.CMD_input;
                pro.data = DEVProtocal.DATA_input[pld.input];
            } else if (pld.mute === "on") {
                pro.cmd = DEVProtocal.CMD_mute;
                pro.data = DEVProtocal.DATA_mute_on;
            } else if (pld.mute === "off") {
                pro.cmd = DEVProtocal.CMD_mute;
                pro.data = DEVProtocal.DATA_mute_off;
            } else if (pld.volume === 0 || pld.volume) {
                pro.cmd = DEVProtocal.CMD_mute;
                pro.data = DEVProtocal.DATA_volume.concat([pld.volume]);
            }             
        }
            
        return pro.cmd ? pro : null;
    }
    decode(dev: IDEVProtocal): IPLFProps {
        let pro: IPLFProps = {}
        this.reset();
        if (dev.cmd == DEVProtocal.CMD_power_on) {
            pro.power = "on";
            return pro;
        }
        else if (dev.cmd == DEVProtocal.CMD_power_off){
            pro.power = "off";
            return pro;
        }
        else if (dev.cmd == DEVProtocal.CMD_input){
            pro.input = DEVProtocal.DATA_input_name(dev.data );
            return pro;
        }
        else if (dev.cmd == DEVProtocal.CMD_mute){
            pro.mute = DEVProtocal.DATA_ARRAY_COMP(dev.data , DEVProtocal.DATA_mute_on) ? "on" : "off";
            return pro;
        }
        else if (dev.cmd == DEVProtocal.CMD_volume){
            pro.volume = dev.data[2]
            return pro;
        }
        else if (dev.cmd == DEVProtocal.CMD_get) {
            if (dev.data.length >= 7) {
                let idx = 1;
                pro.volume = dev.data[idx++];
                pro.input = DEVProtocal.DATA_input_name([dev.data[idx++], dev.data[idx++]]);
                pro.power = dev.data[idx++] == 0x00 ? "on" : "off";
                pro.signal = !!dev.data[idx++];
                return pro;
            }
        }

        return ;        

    }

}



export class Coder extends PLFCoder implements ICoder {
    constructor() {
        super();
        this.head = new PLFHead()
        this.payload = new PLFProtocal();
    }
}