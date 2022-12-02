    // struct {
    //   // Byte 0
    //   uint8_t Mode      :3;
    //   uint8_t Power     :1;
    //   uint8_t Fan       :2;
    //   uint8_t SwingAuto :1;
    //   uint8_t Sleep     :1;
    //   // Byte 1
    //   uint8_t Temp        :4;
    //   uint8_t TimerHalfHr :1;
    //   uint8_t TimerTensHr :2;
    //   uint8_t TimerEnabled:1;
    //   // Byte 2
    //   uint8_t TimerHours:4;
    //   uint8_t Turbo     :1;
    //   uint8_t Light     :1;
    //   uint8_t ModelA    :1;  // model==YAW1F
    //   uint8_t Xfan      :1;
    //   // Byte 3
    //   uint8_t :2;
    //   uint8_t TempExtraDegreeF:1;
    //   uint8_t UseFahrenheit   :1;
    //   uint8_t unknown1        :4;  // value=0b0101
    //   // Byte 4
    //   uint8_t SwingV      :4;
    //   uint8_t SwingH      :3;
    //   uint8_t             :1;
    //   // Byte 5
    //   uint8_t DisplayTemp :2;
    //   uint8_t IFeel       :1;
    //   uint8_t unknown2    :3;  // value = 0b100
    //   uint8_t WiFi        :1;
    //   uint8_t             :1;
    //   // Byte 6
    //   uint8_t             :8;
    //   // Byte 7
    //   uint8_t             :2;
    //   uint8_t Econo       :1;
    //   uint8_t             :1;
    //   uint8_t Sum         :4;
    // };


export interface ITable {
    Mode      : number
    Power     : number
    Fan       : number
    SwingAuto : number
    Sleep     : number
    // Byte 1
    Temp        : number
    TimerHalfHr : number
    TimerTensHr : number
    TimerEnabled: number
    // Byte 2
    TimerHours: number;
    Turbo     : number
    Light     : number
    ModelA    : number  // model==YAW1F
    Xfan      : number
    // Byte 3
    Other1 : number
    TempExtraDegreeF: number
    UseFahrenheit   : number
    unknown1        : number  // value=0b0101
    // Byte 4
    SwingV      : number
    SwingH      : number
    Other2             : number
    // Byte 5
    DisplayTemp : number
    IFeel       : number
    unknown2    : number  // value = 0b100
    WiFi        : number
    Other3             : number
    // Byte 6
    Other4             : number
    // Byte 7
    Other5             : number
    Econo       : number
    Other6             : number
    Sum         : number

}
export class TableBits {
    // Byte 0
    static Mode      = 3;
    static Power     = 1;
    static Fan       = 2;
    static SwingAuto = 1;
    static Sleep     = 1;
    // Byte 1
    static Temp        = 4;
    static TimerHalfHr = 1;
    static TimerTensHr = 2;
    static TimerEnabled= 1;
    // Byte 2
    static TimerHours= 4;
    static Turbo     = 1;
    static Light     = 1;
    static ModelA    = 1;  // model==YAW1F
    static Xfan      = 1;
    // Byte 3
    static Other1 = 2;
    static TempExtraDegreeF= 1;
    static UseFahrenheit   = 1;
    static unknown1        = 4;  // value=0b0101
    // Byte 4
    static SwingV      = 4;
    static SwingH      = 3;
    static Other2      = 1;
    // Byte 5
    static DisplayTemp = 2;
    static IFeel       = 1;
    static unknown2    = 3;  // value = 0b100
    static WiFi        = 1;
    static Other3      = 1;
    // Byte 6
    static Other4      = 8;
    // Byte 7
    static Other5      = 2;
    static Econo       = 1;
    static Other6      = 1;
    static Sum         = 4;
}


export class Table implements ITable {
    Mode = 0;
    Power = 0;
    Fan = 0;
    SwingAuto = 0;
    Sleep = 0;
    Temp = 0;
    TimerHalfHr = 0;
    TimerTensHr = 0;
    TimerEnabled = 0;
    TimerHours = 0;
    Turbo = 0;
    Light = 0;
    ModelA = 0;
    Xfan = 0;
    Other1 = 0;
    TempExtraDegreeF = 0;
    UseFahrenheit = 0;
    unknown1 = 0;
    SwingV = 0;
    SwingH = 0;
    Other2 = 0;
    DisplayTemp = 0;
    IFeel = 0;
    unknown2 = 0;
    WiFi = 0;
    Other3 = 0;
    Other4 = 0;
    Other5 = 0;
    Econo = 0;
    Other6 = 0;
    Sum  = 0;

    // _getRaw(): Buffer {
    //     let buf = [];

    //     let byte = 0;
    //     //  Byte 0
    //     //   uint8_t Mode      :3;
    //     //   uint8_t Power     :1;
    //     //   uint8_t Fan       :2;
    //     //   uint8_t SwingAuto :1;
    //     //   uint8_t Sleep     :1;        
    //     byte =     
    //     (this.Mode << 0) &          0b00000111 | 
    //     (this.Power << 3) &         0b00001000 |
    //     (this.Fan << 4) &           0b00110000 |
    //     (this.SwingAuto << 6) &     0b01000000 |
    //     (this.Sleep << 7) &         0b10000000;
    //     buf.push(byte);

    //     //   Byte 1
    //     //   uint8_t Temp        :4;
    //     //   uint8_t TimerHalfHr :1;
    //     //   uint8_t TimerTensHr :2;
    //     //   uint8_t TimerEnabled:1;
    //     byte =     
    //     (this.Temp << 0) &           0b00001111 | 
    //     (this.TimerHalfHr << 4) &    0b00010000 |
    //     (this.TimerTensHr << 5) &    0b01100000 |
    //     (this.TimerEnabled << 7) &   0b10000000;
    //     buf.push(byte);

    //     //   // Byte 2
    //     //   uint8_t TimerHours:4;
    //     //   uint8_t Turbo     :1;
    //     //   uint8_t Light     :1;
    //     //   uint8_t ModelA    :1;  // model==YAW1F
    //     //   uint8_t Xfan      :1;
    //     byte =     
    //     (this.TimerHours << 0) &    0b00001111 | 
    //     (this.Turbo << 4) &         0b00010000 |
    //     (this.Light << 5) &         0b00100000 |
    //     (this.ModelA << 6) &        0b01000000 |
    //     (this.Xfan << 7) &          0b10000000;
    //     buf.push(byte);        

    //     //   // Byte 3
    //     //   uint8_t :2;
    //     //   uint8_t TempExtraDegreeF:1;
    //     //   uint8_t UseFahrenheit   :1;
    //     //   uint8_t unknown1        :4;  // value=0b0101
    //     byte =     
    //     (this.Other1 << 0) &            0b00000011 | 
    //     (this.TempExtraDegreeF << 2) &  0b00000100 |
    //     (this.UseFahrenheit << 3) &     0b00001000 |
    //     (this.unknown1 << 4) &          0b11110000;
    //     buf.push(byte);  

    //     //   // Byte 4
    //     //   uint8_t SwingV      :4;
    //     //   uint8_t SwingH      :3;
    //     //   uint8_t             :1;
    //     byte =     
    //     (this.SwingV << 0) &        0b00001111 |
    //     (this.SwingH << 4) &        0b01110000 |
    //     (this.Other2 << 7) &        0b10000000;
    //     buf.push(byte); 

    //     //   // Byte 5
    //     //   uint8_t DisplayTemp :2;
    //     //   uint8_t IFeel       :1;
    //     //   uint8_t unknown2    :3;  // value = 0b100
    //     //   uint8_t WiFi        :1;
    //     //   uint8_t             :1;
    //     byte =     
    //     (this.DisplayTemp << 0) &   0b00000011 |
    //     (this.IFeel << 2) &         0b00000100 |
    //     (this.unknown2 << 3) &      0b00111000 |
    //     (this.WiFi << 6) &          0b01000000 |
    //     (this.Other3 << 7) &        0b10000000;
    //     buf.push(byte); 

    //     //   // Byte 6
    //     //   uint8_t             :8;
    //     byte =     
    //     (this.Other4 << 0) &         0b11111111;
    //     buf.push(byte); 

    //     //   // Byte 7
    //     //   uint8_t             :2;
    //     //   uint8_t Econo       :1;
    //     //   uint8_t             :1;
    //     //   uint8_t Sum         :4;
    //     byte =     
    //     (this.Other5 << 0) &        0b00000011 |
    //     (this.Econo << 2) &         0b00000100 |
    //     (this.Other6 << 3) &        0b00001000 |
    //     (this.Sum << 4) &           0b11110000;
    //     buf.push(byte); 

    //     return Buffer.from(buf);
    // }


}





