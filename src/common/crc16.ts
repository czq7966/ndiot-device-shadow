
export class CRC16 {
    static Modbus(str: string | Buffer, type?: "hex" | "asc", length?: number ): Buffer {
        const crc = this.Calculate(str, type, length);
        return Buffer.from([crc & 0xFF, crc >> 8 & 0xFF]);
    } 

    static Calculate(str: string | Buffer, type?: "hex" | "asc", length?: number ): number {
        let buf: Buffer;        
        if (Buffer.isBuffer(str))
            buf = str;
        else if (type === "hex") 
                buf = Buffer.from(str, "hex")
        else buf = Buffer.from(str);

        let crc = 0xFFFF;
        length = length ? Math.min(length, buf.length) : buf.length;
        for (let pos = 0; pos < length; pos++) {
            crc ^= buf[pos];
            for (let i = 8; i !== 0; i--) {
                if ((crc & 0x0001) !== 0) {
                    crc >>= 1;
                    crc ^= 0xA001;
                } else
                    crc >>= 1;
            }
        }
        return crc;
    } 
}