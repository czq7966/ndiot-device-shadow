import { ITable, Table, TableBits, TableConst } from "./table"

export interface IPntTable {
    table: ITable

    encode(): Buffer
    decode(buf: Buffer): boolean
    encodeBytess(): number[][]
    decodeBytess(bytess: number[][]): boolean
    reset();

    on();
    off();
    setPower(on: boolean);
    getPower(): boolean;
    setTemp(temp: number);
    getTemp(): number;
    setFan(speed: number);
    getFan(): number;
    setMode(new_mode: number);
    getMode(): number;

    getRaw(notFixup?: boolean, notClose?: boolean): Buffer;
    setRaw(code: Buffer);
    checksum();
    fixup()
}

export class PntTable implements IPntTable {
    table: ITable = new Table();
    constructor(){
        this.reset();
    }
    encodeBytess(): number[][] {
        let bytess = [];
        let buf = this.encode();

        let bytes = [];
        for (let i = 0; i < buf.length; i++) {
            bytes.push(buf[i]);            
        }
        bytess.push(bytes);

        return bytess;
    }
    decodeBytess(bytess: number[][]): boolean {
        if (bytess && bytess.length == 1) {
            return this.decode(Buffer.from(bytess[0]))
        }
        return false;
    }
    encode(): Buffer {
        return this.getRaw();
    }
    decode(buf: Buffer): boolean {
        if (buf.length >= 6) {
            this.setRaw(buf);
            return true;
        }
        
        return false;
    }
    
    reset() {
        Object.keys(this.table).forEach(key => {
            this.table[key] = 0;
        })

        this.table.BT0 = TableConst.P_BT0;  
    }

    on() {
        this.setPower(true);
    }
    off() {
        this.setPower(false);
    }

    setPower(on: boolean) {
        this.table.Power = on as any;
    }
    getPower(): boolean {
        return  !!this.table.Power;
    }

    setTemp(temp: number) {
        temp = Math.max(temp, TableConst.TempMin);
        temp = Math.min(temp, TableConst.TempMax);
        temp = temp - TableConst.TempMin;
        temp = TableConst.Temp[temp];
        this.table.Temp = temp;
    }
    getTemp(): number {
        let temp: number = this.table.Temp;
        for (let i = 0; i < TableConst.Temp.length; i++) {
            if (TableConst.Temp[i] == temp) {
                temp = i + TableConst.TempMin;
            }            
        }
        return temp;
    }

    setFan(speed: number){
        this.table.Fan = speed;
    };
    getFan(): number{
        return this.table.Fan;
    };

    setMode(new_mode: number){
        let mode = new_mode;
        switch (mode) {
          // AUTO is locked to 25C
          case TableConst.ModeAuto: this.setTemp(25); break;
          // DRY always sets the fan to 1.
          case TableConst.ModeDry: this.setFan(1); break;
          case TableConst.ModeCool:
          case TableConst.ModeFan:
          case TableConst.ModeHeat: break;
          // If we get an unexpected mode, default to AUTO.
          default: mode = TableConst.ModeAuto;
        }
        this.table.Mode = mode;
    };
    getMode(): number{
        return this.table.Mode;

    };


    getRaw(notFixup?: boolean, notClose?: boolean): Buffer {
        if (!this.table.Power && !notClose)
            return Buffer.from(TableConst.PowerClose);

        if(!notFixup) this.fixup();

        let table = Object.assign({}, this.table);

        let buf = [];
        let nbits = 0;
        let byte = 0;
        Object.keys(TableBits).forEach(key => {
            let pos = nbits % 8;
            let val = table[key] << pos;            
            byte = byte | val;
            let nbit = TableBits[key];
            nbits = nbits + nbit;

            if(nbits % 8 == 0) {
                buf.push(byte);
                byte = 0;
            }
        })
        return Buffer.from(buf);
    }
    setRaw(buf: Buffer) {
        let nbits = 0;
        Object.keys(TableBits).forEach(key => {
            let nbit = TableBits[key];
            nbits = nbits + nbit;
            let idx = Math.floor((nbits - 1) / 8);
            let byte = buf[idx];   
            let pos = nbits % 8;
            pos = !pos ? 8 : pos;
            byte = (byte << (8 - pos)) & 0xFF;
            byte = (byte >> (8 - nbit)) & 0xFF;
            this.table[key] = byte;
            
        })
    }
    checksum() {
        let buf = this.getRaw(true);
        this.table.BT1 = ~buf[0];
        this.table.BT3 = ~buf[2];
        this.table.BT5 = ~buf[4]; 
    }

    fixup() {
        this.table.BT0 = TableConst.P_BT0;
        this.table.BT2_1 = TableConst.P_BT2_1;
        this.table.BT2_2 = TableConst.P_BT2_2;  
        this.table.BT4_1 = TableConst.P_BT4_1;

        this.checksum(); 
    }

}