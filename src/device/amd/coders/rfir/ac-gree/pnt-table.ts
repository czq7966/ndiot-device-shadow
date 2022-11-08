import { Sum } from "../../../../../common/sum"
import { ITable, Table, TableBits } from "./table"

export interface IPntTable {
    table: ITable
    model: number

    encode(): Buffer
    decode(buf: Buffer): boolean
    reset();

    on();
    off();
    setModel(model: number);
    getModel(): number;
    setPower(on: boolean);
    getPower(): boolean;
    setTemp(temp: number, fahrenheit?: boolean);
    getTemp(): number;
    // void setUseFahrenheit(const bool on);
    // bool getUseFahrenheit(void) const;
    // void setFan(const uint8_t speed);
    // uint8_t getFan(void) const;
    setMode(new_mode: number);
    getMode(vod): number;
    // void setLight(const bool on);
    // bool getLight(void) const;
    // void setXFan(const bool on);
    // bool getXFan(void) const;
    // void setSleep(const bool on);
    // bool getSleep(void) const;
    // void setTurbo(const bool on);
    // bool getTurbo(void) const;
    // void setEcono(const bool on);
    // bool getEcono(void) const;
    // void setIFeel(const bool on);
    // bool getIFeel(void) const;
    // void setWiFi(const bool on);
    // bool getWiFi(void) const;
    // void setSwingVertical(const bool automatic, const uint8_t position);
    // bool getSwingVerticalAuto(void) const;
    // uint8_t getSwingVerticalPosition(void) const;
    // void setSwingHorizontal(const uint8_t position);
    // uint8_t getSwingHorizontal(void) const;
    // uint16_t getTimer(void) const;
    // void setTimer(const uint16_t minutes);
    // void setDisplayTempSource(const uint8_t mode);
    // uint8_t getDisplayTempSource(void) const;
     // setTimerEnabled(on: boolean);
    // getTimerEnabled(): boolean;




    getRaw(notFixup?: boolean ): Buffer;
    setRaw(code: Buffer);
    checksum();
    fixup();

}

export class PntTable implements IPntTable {
    static Model_YAW1F = 1;
    static Model_YBOFB = 2;
    
    static ModeAuto = 0;
    static ModeCool = 1;
    static ModeDry  = 2;
    static ModeFan  = 3;
    static ModeHeat = 4;

    static FanAuto = 0;
    static FanMin  = 1;
    static FanMed  = 2;
    static FanMax  = 3;

    static TempMinTempC = 16;  // Celsius
    static TempMaxTempC = 30;  // Celsius
    static TempMinTempF = 61;  // Fahrenheit
    static TempMaxTempF = 86;  // Fahrenheit
    static TimerMax = 24 * 60;

    static SwingLastPos    = 0b0000;  // 0
    static SwingAuto       = 0b0001;  // 1
    static SwingUp         = 0b0010;  // 2
    static SwingMiddleUp   = 0b0011;  // 3
    static SwingMiddle     = 0b0100;  // 4
    static SwingMiddleDown = 0b0101;  // 5
    static SwingDown       = 0b0110;  // 6
    static SwingDownAuto   = 0b0111;  // 7
    static SwingMiddleAuto = 0b1001;  // 9
    static SwingUpAuto     = 0b1011;  // 11

    static SwingHOff        = 0b000;  // 0
    static SwingHAuto       = 0b001;  // 1
    static SwingHMaxLeft    = 0b010;  // 2
    static SwingHLeft       = 0b011;  // 3
    static SwingHMiddle     = 0b100;  // 4
    static SwingHRight      = 0b101;  // 5
    static SwingHMaxRight   = 0b110;  // 6

    static DisplayTempOff     = 0b00;  // 0
    static DisplayTempSet     = 0b01;  // 1
    static DisplayTempInside  = 0b10;  // 2
    static DisplayTempOutside = 0b11;  // 3


    table: ITable = new Table();
    model: number = PntTable.Model_YAW1F;
    constructor(){
        this.reset();
    }
    encode(): Buffer {
        throw new Error("Method not implemented.");
    }
    decode(buf: Buffer): boolean {
        throw new Error("Method not implemented.");
    }
    reset() {
        Object.keys(this.table).forEach(key => {
            this.table[key] = 0;
        })

        this.table.Temp = 9;  
        this.table.Light = 1;  
        this.table.unknown1 = 5; 
        this.table.unknown2 = 4;        
    }

    on() {
        this.setPower(true);
    }
    off() {
        this.setPower(false);
    }
    setModel(model: number) {
        this.model = model;
    }
    getModel(): number {
        return this.model
    }
    setPower(on: boolean) {
        this.table.Power = on as any;
        this.table.ModelA = (on && this.model == PntTable.Model_YAW1F) as any;
    }
    getPower(): boolean {
        return  !!this.table.Power;
    }

    setTemp(temp: number, fahrenheit?: boolean) {
        this.table.UseFahrenheit = fahrenheit as any;
        temp = Math.min(PntTable.TempMaxTempC, temp);
        temp = Math.max(PntTable.TempMinTempC, temp);
        this.table.Temp = temp;
    }
    getTemp(): number {
        let temp = this.table.Temp;        
        temp = Math.min(PntTable.TempMaxTempC, temp);
        temp = Math.max(PntTable.TempMinTempC, temp);
        return temp;
    }

    setMode(new_mode: number){
        let mode = new_mode;
        switch (mode) {
          // AUTO is locked to 25C
          case PntTable.ModeAuto: this.setTemp(25); break;
          // DRY always sets the fan to 1.
        //   case PntTable.ModeDry: this.setFan(1); break;
          case PntTable.ModeCool:
          case PntTable.ModeFan:
          case PntTable.ModeHeat: break;
          // If we get an unexpected mode, default to AUTO.
          default: mode = PntTable.ModeAuto;
        }
        this.table.Mode = mode;
    };
    getMode(): number{
        return this.table.Mode;

    };

    getRaw(notFixup?: boolean): Buffer {
        if(!notFixup)
            this.fixup();

        let buf = [];
        let nbits = 0;
        let byte = 0;
        Object.keys(TableBits).forEach(key => {
            let pos = nbits % 8;
            let val = this.table[key] << pos;            
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
        this.table.Sum = Sum.AC_Kelvinator(this.getRaw(true));
    }
    fixup() {
        this.setPower(this.getPower());  
        this.checksum(); 
    }

}