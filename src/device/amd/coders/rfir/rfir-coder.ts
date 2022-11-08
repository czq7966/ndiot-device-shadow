
export interface ISegCoderParam {
    headermark: number,
    headerspace: number,
    onemark: number,
    onespace: number,
    zeromark: number,
    zerospace: number,
    footermark: number,
    footerspace: number,

    MSBfirst: boolean,
    step: number,
    lastspace: number,
    nbits: number,
    tolerance: number,
    excess: number
    atleast: boolean 

    expectlastspace: boolean
}

export interface ISegCoder {
    param: ISegCoderParam
    encode(bits: Array<boolean>): Array<number>;
    decode(codes: Array<number>): Array<boolean>;
}


export class SegCoderParam implements ISegCoderParam {
    
    headermark: number = 0;
    headerspace: number = 0;
    onemark: number = 0;
    onespace: number = 0;
    zeromark: number = 0;
    zerospace: number = 0;
    footermark: number = 0;
    footerspace: number = 0;

    nbits: number = 0;
    MSBfirst: boolean = false;
    step: number = 2;
    lastspace: number = 0;
    tolerance: number = 30;
    excess: number = 0;
    atleast: boolean = false;

    expectlastspace: boolean = false;
}

export class SegEncoder {
    static encode(bits: boolean[], param: ISegCoderParam, result: number[]): boolean {
        if (param.headermark) result.push(param.headermark);
        if (param.headerspace) result.push(param.headerspace);
        bits.forEach(bit => {
            if (bit) {
                if (param.onemark) result.push(param.onemark);
                if (param.onespace) result.push(param.onespace);
            } else {
                if (param.zeromark) result.push(param.zeromark);
                if (param.zerospace) result.push(param.zerospace);
            }
        })
        if (param.footermark) result.push(param.footermark);
        if (param.footerspace) result.push(param.footerspace);

        return true;
    }
}
export class SegDecoder {
    static ticksLow(usecs: number, tolerance: number, delta: any): number {
        return Math.floor(Math.max(usecs * (1.0 - (tolerance) / 100.0) - delta, 0));
    }
    static ticksHigh(usecs: number, tolerance: number, delta: any): number {
        return Math.ceil(Math.max(usecs * (1.0 + (tolerance) / 100.0) - delta, 0));
    }
    static match(measured: number, desired: number, tolerance: number, delta: number): boolean {
        return (measured >= this.ticksLow(desired, tolerance, delta) &&
            measured <= this.ticksHigh(desired, tolerance, delta));
    }
    static matchAtLeast(measured: number, desired: number, tolerance: number, delta: number): boolean {
        if (measured == 0) return true;
        return measured >= this.ticksLow(desired, tolerance, delta);
    }
    static  matchMark(measured: number, desired: number, tolerance: number, excess: number): boolean {
        return this.match(measured, desired + excess, tolerance, 0);
    }
    static matchMarkRange(measured: number, desired: number, range: number, excess: number): boolean {
        return this.match(measured, desired + excess, 0, range);
    }
    static matchSpace(measured: number, desired: number, tolerance: number, excess: number): boolean {
        return this.match(measured, desired - excess, tolerance, 0);
    }
    static matchSpaceRange(measured: number, desired: number, range: number, excess: number): boolean {
        return this.match(measured, desired - excess, 0, range);
    }

    static matchData(codes: number[], offset: number, param: ISegCoderParam, bits: boolean[]): boolean {
        let nbits = param.expectlastspace ? param.nbits : param.nbits - 1;

        let i = 0;  
        while(true) {         
            
            let mark = codes[offset++];
            let space = codes[offset++];
            
            if (this.matchMark(mark, param.onemark, param.tolerance, param.excess) &&
                this.matchSpace(space, param.onespace, param.tolerance, param.excess)) {
                bits.push(true);
            } else if (this.matchMark(mark, param.zeromark, param.tolerance, param.excess) &&
                        this.matchSpace(space, param.zerospace, param.tolerance, param.excess)) {
                bits.push(false);
            } else {     
                console.log("5555", bits, mark, space)
                if (nbits > 0)         
                    return false;  
                else break;
            }
            i++;

            if (nbits > 0 && i >= nbits) {
                break;
            }
        }



        if (!param.expectlastspace) {
            if (this.matchMark(codes[offset++], param.onemark, param.tolerance, param.excess))
                bits.push(true);
            else if (this.matchMark(codes[offset++], param.zeromark, param.tolerance, param.excess))
                bits.push(false);
            else
                return false;            
        }

        return true;
    }


    static decode(codes: number[], param: ISegCoderParam, result: boolean[]): number {
        param.expectlastspace = !!(param.lastspace ? 0 : (param.footermark || (param.onespace != param.zerospace)));
        let min_remaining = param.nbits * param.step - (param.expectlastspace ? 0 : 1);

        if (param.headermark) min_remaining++;
        if (param.headerspace) min_remaining++;
        if (param.footermark) min_remaining++;

        if (codes.length < min_remaining) return 0;  
        let offset = 0;

        // Header
        if (param.headermark && !this.matchMark(codes[offset++], param.headermark, param.tolerance, param.excess))
            return 0;
        if (param.headerspace && !this.matchSpace(codes[offset++], param.headerspace, param.tolerance, param.excess))
            return 0;

        // Data
        let bits = [];
        if (!this.matchData(codes, offset, param, bits))
            return 0;
         
        offset = offset + bits.length * param.step;

        // Footer
        if (param.footermark && !this.matchMark(codes[offset++], param.footermark, param.tolerance, param.excess))
            return 0;

        if (param.footerspace) {      
            let code = codes[offset]       
            if (offset >= codes.length)
                return 0;
            if (param.atleast) {
                if (!this.matchAtLeast(codes[offset++], param.footerspace, param.tolerance, param.excess))
                    return 0;
            } else {
                if (!this.matchSpace(codes[offset++], param.footerspace, param.tolerance, param.excess))
                    return 0;
            }
        }  
        bits.forEach(bit => {
            result.push(bit)
        })

        return offset;
    }
    
}


export interface ISegsCoder{
    params: ISegCoderParam[]
    encodeBits(bitss: boolean[][]): number[]
    decodeBits(codes: number[]): boolean[][]

    encodeBytes(bytes: number[][]): number[]
    decodeBytes(codes: number[]): number[][]

    encode(bytes: number[][]): Buffer
    decode(buf: Buffer): number[][]
}

export class SegsCoder implements ISegsCoder {
    params: ISegCoderParam[] = [];
    encodeBits(bitss: boolean[][]): number[] {
        let result = [];
        if (bitss.length == this.params.length) {
            for (let i = 0; i < bitss.length; i++) {
                let bits = bitss[i];
                let param = this.params[i];
                let codes = [];
                SegEncoder.encode(bits, param, codes);
                result = result.concat(codes);                
            }
        }
        return result;        
    }
    decodeBits(codes: number[]): boolean[][] {
        let result = [];
        let offset = 0;
        for (let i = 0; i < this.params.length; i++) {
            let param = this.params[i];
            while (codes.length - offset >= param.nbits * param.step) {
                let segCodes = codes.slice(offset);
                let bits = [];
                let count = SegDecoder.decode(segCodes, param, bits);

                if (count) {
                    offset = offset + count;
                    result.push(bits);
                    break;
                } else {
                    if (result.length > 0 ) 
                        return [];
                    else
                        offset = offset + param.step;
                }
            }            
        }

        return result;

        // let result = [];
        // let offset = 0;
        // this.params.forEach(param => {
        //     let segCodes = codes.slice(offset);
        //     let bits = [];
        //     let count = SegDecoder.decode(segCodes, param, bits);

        //     if (count) {
        //         offset = offset + count;
        //         result.push(bits);
        //     }
        // })

        // return result;
    }

    encodeBytes(bytess: number[][]): number[] {
        let bitss = [];        
        if (bytess.length == this.params.length) {
            for (let i = 0; i < bytess.length; i++) {
                let bits: boolean[] = [];
                let bytes = bytess[i];                
                let param = this.params[i]; 
                let mask = param.MSBfirst ? 0b10000000 : 0b00000001;      

                if (param.nbits % 8 != 0) {
                    bits = bytes as any;
                } else {                
                    bytes.forEach(byte => {                
                        for (let k = 0; k < 8; k++) {
                            let bitmask = param.MSBfirst ? mask >> k : mask << k;
                            bits.push(!!(byte & bitmask));                    
                        }
                    });
                }
                bitss.push(bits);            
            }
        }
        return this.encodeBits(bitss);
    }

    decodeBytes(codes: number[]): number[][] {
        let bytess = [];
        let bitss = this.decodeBits(codes);
        if (bitss.length == this.params.length) {
            for (let i = 0; i < bitss.length; i++) {
                let bytes = [];
                let param = this.params[i]; 
                let bits = bitss[i];
                let byte = 0;

                if (bits.length % 8 == 0) {
                    for (let j = 0; j < bits.length; j++) {
                        let bit = bits[j] as any as number;                    
                        let idx = j % 8;
                        let bitmask = param.MSBfirst ? bit << (7 - idx) : bit << idx;
                        byte = byte | bitmask;
                        if (idx == 7) {
                            bytes.push(byte);
                            byte = 0;
                        } 
                    }
                } else {
                    bytes = bits;
                }
                bytess.push(bytes);
            }
            
        }
        return bytess;
    }
    
    encode(bytes: number[][]): Buffer {
        let codes = this.encodeBytes(bytes);
        let buf: number[] = [];
        codes.forEach(code => {
            buf.push(code & 0xFF);
            buf.push((code >> 8) & 0xFF);
        })

        return Buffer.from(buf);
    }

    decode(buf: Buffer): number[][] {
        let codes: number[] = [];
        let idx = 0;
        while(idx < buf.length) {
            let code = buf[idx++] + (buf[idx++] << 8);
            codes.push(code);
        }
        return this.decodeBytes(codes);
    }
    reset() {

        
    }

}


export interface IRfirCoder extends ISegsCoder {}
export class RfirCoder extends SegsCoder implements IRfirCoder {}
