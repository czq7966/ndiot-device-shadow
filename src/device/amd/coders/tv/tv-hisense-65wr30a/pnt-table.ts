import { ITable, Table } from "./table"

export interface IPntTable {
    table: ITable

    encode(): Buffer
    decode(buf: Buffer): boolean
    calsum(): number
    callen(): number
    reset();
}



export class PntTable implements IPntTable {
    static PC2TV_head = 0xDDFF;
    static PC2TV_end = 0xBBCC;
    static TV2PC_head = 0xABAB;
    static TV2PC_end = 0xCDCD;
    static CMD_input = 0xC1080000;
    static CMD_mute = 0xC1260000;
    static CMD_power_off = 0xC1150000;
    static CMD_power_on = 0xA1000000;
    static CMD_volume = 0xC1270000;
    static CMD_get = 0xC1280000;

    static DATA_input_PC2TV = {
        analog: [0x01, 0x01],
        digital: [0x01, 0x02],
        pc: [0x01, 0x0C],
        hdmi1: [0x01, 0x0E],
        hdmi2: [0x01, 0x0F],
        video: [0x01, 0x04],
        vector: [0x01, 0x07],
        vga: [0x01, 0x17]
    }

    static DATA_input_TV2PC = {
        analog: [0x01, 0x01],
        digital: [0x02, 0x01],
        pc: [0x05, 0x01],
        hdmi1: [0x05, 0x03],
        hdmi2: [0x05, 0x02],
        video: [0x04, 0x01],
        vector: [0x03, 0x01],
        vga: [0x08, 0x01]
    }

    static DATA_input_name(data: {}, value: number[]): string {
        let result: string;
        Object.keys(data).forEach(key => {
            const val = data[key];
            if (PntTable.DATA_ARRAY_COMP(val, value)) {
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


    table: ITable = new Table();
    encode(): Buffer {
        const buf = [];
        buf.push((this.table.head >> 8) & 0xFF);
        buf.push(this.table.head & 0xFF);        

        const len = this.callen();
        buf.push((len >> 8) & 0xFF);
        buf.push(len & 0xFF);

        buf.push((this.table.cmd >> 24) & 0xFF);
        buf.push((this.table.cmd >> 16) & 0xFF);
        buf.push((this.table.cmd >> 8) & 0xFF);
        buf.push((this.table.cmd >> 0) & 0xFF);
        
        for (let i = 0; i < this.table.data.length; i++) {
            buf.push(this.table.data[i] & 0xFF);            
        }        

        this.table.sum = this.calsum();
        buf.push(this.table.sum);
        buf.push((this.table.end >> 8) & 0xFF);
        buf.push(this.table.end & 0xFF);

        return Buffer.from(buf);
    }

    decode(buf: Buffer): boolean {
        let idx = 0;
        if (buf.length >= 10 ) {
            this.table.head = (buf[idx++] << 8) + buf[idx++];
            this.table.len = (buf[idx++] << 8) + buf[idx++];
            this.table.cmd = Uint32Array.from([buf[idx++] << 24 | (buf[idx++] << 16) | (buf[idx++] << 8) | (buf[idx++] << 0) ] )[0];

            while (idx < buf.length - 3) {
                this.table.data.push(buf[idx++]);
            }
            if (buf.length > 10)
                this.table.sum = buf[idx++];
            this.table.end = (buf[idx++] << 8) + buf[idx++];

            return true;
        }
        return false;
    }

    calsum(): number {
        const len = this.callen()
        let sum =   ((len >> 8) & 0xFF) ^
                    ((len >> 0) & 0xFF) ^
                    ((this.table.cmd >> 24) & 0xFF) ^
                    ((this.table.cmd >> 16) & 0xFF) ^
                    ((this.table.cmd >> 8) & 0xFF) ^
                    ((this.table.cmd >> 0) & 0xFF);

        for (let i = 0; i < this.table.data.length; i++) {
            sum ^= this.table.data[i];                
        }
        return sum;
    }

    callen(): number {
        return this.table.data.length + 5;
    }

    reset(toPC?: number){        
        this.table.head = PntTable.PC2TV_head;
        this.table.len = 0;
        this.table.cmd = 0;
        this.table.data = [];
        this.table.sum = 0;
        this.table.end = PntTable.PC2TV_end;
        if (toPC) {
            this.table.head = PntTable.TV2PC_head;
            this.table.end = PntTable.TV2PC_end;
        }
    }
}