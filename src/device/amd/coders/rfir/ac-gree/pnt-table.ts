import { Sum } from "../../../../../common/sum"
import { ITable, Table, TableBits } from "./table"

export interface IPntTable {
    table: ITable
    model: number

    encode(B?: boolean): Buffer
    decode(buf: Buffer): boolean
    encodeBytess(B?: boolean): number[][]
    decodeBytess(bytess: number[][]): boolean
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
    setFan(speed: number);
    getFan(): number;
    setMode(new_mode: number);
    getMode(vod): number;
    setLight(on: number);
    getLight(): number;
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
    setWiFi(on: number);
    getWiFi(): number;
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




    getRaw(notFixup?: boolean, B?: boolean): Buffer;
    setRaw(code: Buffer);
    checksum(B?: boolean);
    getsum(B?: boolean): number;    

}

export class PntTable implements IPntTable {
    static Model_YAW1F = 1;
    static Model_YBOFB = 2;
    
    static PowerOff = 0;
    static PowerOn  = 1;

    static LightOff = 0;
    static LightOn  = 1;

    static WifiOff = 0;
    static WifiOn  = 1;

    static ModeAuto = 0;
    static ModeCool = 1;
    static ModeDry  = 2;
    static ModeFan  = 3;
    static ModeHeat = 4;

    static FanAuto = 0;
    static FanMin  = 1;
    static FanMed  = 2;
    static FanMax  = 3;

    static TempMinTempC = 17;  // Celsius
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
    model: number = PntTable.Model_YBOFB;
    constructor(){
        this.reset();
    }
    encodeBytess(B?: boolean): number[][] {
        const bytess = [];
        const buf = this.encode(B);
        //前4字节
        let bytes = [];
        for (let i = 0; i < 4; i++) {
            bytes.push(buf[i]);            
        }
        bytess.push(bytes);

        // 0b010
        bytes = [false, true, false];
        bytess.push(bytes);

        //后4字节
        bytes = [];
        for (let i = 4; i < 8; i++) {
            bytes.push(buf[i]);            
        }
        bytess.push(bytes);

        return bytess;
    }
    decodeBytess(bytess: number[][]): boolean {
        if (bytess && bytess.length == 3) {
            const buf = bytess[0].concat(bytess[2]);
            return this.decode(Buffer.from(buf))
        }
        return false;
    }
    encode(B?: boolean): Buffer {
        return this.getRaw(false, B);
    }
    decode(buf: Buffer): boolean {
        if (buf.length == 8) {
            this.setRaw(buf);
            return true;
        }
        
        return false;
    }
    
    reset() {
        Object.keys(this.table).forEach(key => {
            this.table[key] = 0;
        })

        this.table.Temp = 9;  
        this.table.Light = 1;  
        this.table.unknown1 = 5; 
        if(this.model == PntTable.Model_YAW1F) {
            this.table.unknown2 = 4;
        }
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
        const minTemp = this.model == PntTable.Model_YAW1F ? PntTable.TempMinTempC - 1 : PntTable.TempMinTempC;
        temp = Math.max(minTemp, temp);       
        this.table.Temp = temp - minTemp;
    }
    getTemp(): number {
        const minTemp = this.model == PntTable.Model_YAW1F ? PntTable.TempMinTempC - 1 : PntTable.TempMinTempC;
        let temp = this.table.Temp + minTemp;        
        temp = Math.min(PntTable.TempMaxTempC, temp);
        temp = Math.max(minTemp, temp);
        return temp;
    }
    setFan(speed: number){
        let fan = Math.min(PntTable.FanMax, speed);  
        if (this.getMode() == PntTable.ModeDry) fan = 1;  // DRY mode is always locked to fan 1.
        this.table.Fan = fan;
    }
    getFan(): number{
        return this.table.Fan;
    }

    setMode(new_mode: number){
        let mode = new_mode;
        switch (mode) {
          // AUTO is locked to 25C
          case PntTable.ModeAuto: this.setTemp(25); break;
          // DRY always sets the fan to 1.
          case PntTable.ModeDry: this.setFan(1); break;
          case PntTable.ModeCool:
          case PntTable.ModeFan:
          case PntTable.ModeHeat: break;
          // If we get an unexpected mode, default to AUTO.
          default: mode = PntTable.ModeAuto;
        }
        this.table.Mode = mode;
    }
    getMode(): number{
        return this.table.Mode;

    }
    setLight(on: number){
        this.table.Light = on;
    }
    getLight(): number{
        return this.table.Light;
    }

    setWiFi(on: number){
        this.table.WiFi = on;
    }
    getWiFi(): number{
        return this.table.WiFi;
    }

    getRaw(notFixup?: boolean, B?: boolean): Buffer {
        if(!notFixup)
            this.fixup(B);

        const table = Object.assign({}, this.table);
        if (B) {
            table.unknown1 = 7;
            table.WiFi = 0;
            table.Other4 = 128;
        }

        const buf = [];
        let nbits = 0;
        let byte = 0;
        Object.keys(TableBits).forEach(key => {
            const pos = nbits % 8;
            const val = table[key] << pos;            
            byte = byte | val;
            const nbit = TableBits[key];
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
            const nbit = TableBits[key];
            nbits = nbits + nbit;
            const idx = Math.floor((nbits - 1) / 8);
            let byte = buf[idx];   
            let pos = nbits % 8;
            pos = !pos ? 8 : pos;
            byte = (byte << (8 - pos)) & 0xFF;
            byte = (byte >> (8 - nbit)) & 0xFF;
            this.table[key] = byte;
            
        })
    }
    checksum(B?: boolean) {
        this.table.Sum = this.getsum(B);
    }
    getsum(B?: boolean): number{
        return Sum.AC_Kelvinator(this.getRaw(true, B));
    }
    fixup(B?: boolean) {
        this.setPower(this.getPower());  
        this.checksum(B); 
    }

}