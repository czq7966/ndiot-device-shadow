
export class Sum {
    static AC_Kelvinator(buf: Buffer): number {
        let sum = 10;
        // Sum the lower half of the first 4 bytes of this block.
        for (let i = 0; i < 4 && i < buf.length - 1; i++)
          sum += (buf[i] & 0b1111);
        // then sum the upper half of the next 3 bytes.
        for (let i = 4; i < buf.length - 1; i++) 
            sum += (buf[i] >> 4);
        // Trim it down to fit into the 4 bits allowed. i.e. Mod 16.
        return sum & 0b1111;
    }

}