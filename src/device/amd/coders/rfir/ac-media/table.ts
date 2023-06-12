    // struct {
    // // Byte 0
    // uint8_t BT0;             // =0b10110010
    // // Byte 1
    // uint8_t BT1;             // ~BT0
    // // Byte 2 
    // uint8_t BT2_1   :2;     // =0b11
    // uint8_t Power   :1;     // on=0b1; off=0b0, temp=0b1110,
    // uint8_t BT2_2   :2;     // =0b11
    // uint8_t Fan     :3;     // auto=0b101, low=0b100, med=0b010,high=0b001                            
    
    // // Byte 3
    // uint8_t BT3;             //~B2
    // // Byte 4
    // uint8_t BT4_1   :2;     // =0b00;                            
    // uint8_t Mode    :2;     // auto=0b10; cool=0b00; dry=0b01; heat=0b11; fan=0b01+Temp=none;
    // uint8_t Temp    :4;     // none=0b1110;
    
    // // Byte 5
    // uint8_t BT5;             //~B4   
    // };


export interface ITable {
    // Byte 0
    BT0     : number             // =0b10110010
    // Byte 1
    BT1     : number;             // ~BT0
    // Byte 2 
    BT2_1   : number;     // =0b11
    Power   : number;     // on=0b1; off=0b0, temp=0b1110,
    BT2_2   : number;     // =0b11
    Fan     : number;     // auto=0b101, low=0b100, med=0b010,high=0b001                            
    
    // Byte 3
    BT3     : number;             //~B2
    // Byte 4
    BT4_1   : number;     // =0b00;                            
    Mode    : number;     // auto=0b10; cool=0b00; dry=0b01; heat=0b11; fan=0b01+Temp=none;
    Temp    : number;     // none=0b1110;
    
    // Byte 5
    BT5     : number;             //~B4   

}
export class TableBits {
    // Byte 0
    static BT0     = 8;            // =0b10110010
    // Byte 1
    static BT1     = 8;             // ~BT0
    // Byte 2 
    static BT2_1   = 2;     // =0b11
    static Power   = 1;     // on=0b1; off=0b0, temp=0b1110,
    static BT2_2   = 2;     // =0b11
    static Fan     = 3;     // auto=0b101, low=0b100, med=0b010,high=0b001                            
    
    // Byte 3
    static BT3     = 8;             //~B2
    // Byte 4
    static BT4_1   = 2;     // =0b00;                            
    static Mode    = 2;     // auto=0b10; cool=0b00; dry=0b01; heat=0b11; fan=0b01+Temp=none;
    static Temp    = 4;     // none=0b1110;
    
    // Byte 5
    static BT5     = 8;             //~B4   
}

export class TableConst {
    static NBits = 6 * 8;
    static HeadMark = 4400;
    static HeadSpace = 4400;
    static OneMark = 540;
    static OneSpace = 1620;
    static ZeroMark = 540;
    static ZeroSpace = 540;
    static FooterMark = 540;
    static FooterSpace = 5220;

    static  P_BT0         = 0b10110010;                    

    static  P_BT2_1       = 0b11;
    static  P_BT2_2       = 0b11;
    static  P_BT4_1       = 0b00;

    static  FanFixed   = 0b000;
    static  FanAuto    = 0b101;
    static  FanMin     = 0b100;
    static  FanMed     = 0b010;
    static  FanMax     = 0b001;

    static  PowerOn         = 0b1;
    static  PowerOff        = 0b0;
    static  PowerClose      = [0xb2, 0x4d, 0x7b, 0x84, 0xe0, 0x1f]; 

    static  Temp        = [0b0000, 0b0001, 0b0011, 0b0010, 0b0110, 0b0111, 0b0101, 0b0100, 0b1100, 0b1101, 0b1001, 0b1000, 0b1010, 0b1011];
    static  TempMin    = 17;
    static  TempMax    = 30;
    static  TempDef    = 25;
    static  TempNone   = 0b1110;

    static  ModeAuto   = 0b10;
    static  ModeCool   = 0b00;
    static  ModeDry    = 0b01;
    static  ModeHeat   = 0b11;
    static  ModeFan    = 0b01;


}

export class Table implements ITable {
    BT0 = 0;
    BT1 = 0;
    BT2_1 = 0;
    Power = 0;
    BT2_2 = 0;
    Fan = 0;
    BT3 = 0;
    BT4_1 = 0;
    Mode = 0;
    Temp = 0;
    BT5 = 0;
}





