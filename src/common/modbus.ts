import { Base, IBase } from "./base";
import { CRC16 } from "./crc16";
import { BaseEvent, IBaseEvent } from "./events";

export class EModbusType {
    static EReadCoils: number = 1;
    static EReadDiscreteInputs: number = 2;
    static EReadHoldingRegisters: number = 3;
    static EReadInputRegisters: number = 4;
    static EWriteSingleCoil: number = 5;
    static EWriteSingleRegister: number = 6;
    static EWriteMultipleCoils: number = 15;
    static EWriteMultipleRegisters: number = 16;
}

export interface IModbusRTUTable {
    slave: number,
    func: number,
    address: number
    quantity: number
    table:{[address: number]: number}
    error?: number 
}

export interface IModbusRTUDecoderEvents extends IBase {
    onReadCoils: IBaseEvent
    onReadDiscreteInputs: IBaseEvent
    onReadHoldingRegisters: IBaseEvent
    onReadInputRegisters: IBaseEvent
    onWriteSingleCoil: IBaseEvent
    onWriteSingleRegister: IBaseEvent
    onWriteMultipleCoils: IBaseEvent
    onWriteMultipleRegisters: IBaseEvent
    onError: IBaseEvent
    removeAllListeners();
}

export interface IModbusRTUEncoder extends IBase {
    modbus: IModbusRTU
    lastFuncRtu: {[func: number]: IModbusRTUTable} 
    encode(rtu: IModbusRTUTable): Buffer;
    readCoils(slave: number, address: number, quantity?: number): Buffer
    readDiscreteInputs(slave: number, address: number, quantity?: number): Buffer
    readHoldingRegisters(slave: number, address: number, quantity?: number): Buffer
    readInputRegisters(slave: number, address: number, quantity?: number): Buffer
    writeSingleCoil(slave: number, address: number, value: boolean): Buffer
    writeSingleRegister(slave: number, address: number, value: number): Buffer
    writeMultipleCoils(slave: number, address: number, values: boolean[]): Buffer
    writeMultipleRegisters(slave: number, address: number, values: number[]): Buffer
}

export interface IModbusRTUDecoder extends IBase {
    modbus: IModbusRTU
    decode(data: Buffer, reqRtu: IModbusRTUTable): IModbusRTUTable;
    events: IModbusRTUDecoderEvents
}

export interface IModbusRTU extends IBase {
    encoder: IModbusRTUEncoder
    decoder: IModbusRTUDecoder
}

export class ModbusRTUTable  implements IModbusRTUTable{
    slave: number = 0;
    func: number = 0;
    address: number = 0;
    quantity: number = 0;
    table: { [address: number]: number; } = {};
    error: number = 0;
}

export class ModbusRTUDecoderEvents extends Base  implements IModbusRTUDecoderEvents {
    onReadCoils: IBaseEvent;
    onReadDiscreteInputs: IBaseEvent;
    onReadHoldingRegisters: IBaseEvent;
    onReadInputRegisters: IBaseEvent;
    onWriteSingleCoil: IBaseEvent;
    onWriteSingleRegister: IBaseEvent;
    onWriteMultipleCoils: IBaseEvent;
    onWriteMultipleRegisters: IBaseEvent;
    onError: IBaseEvent;
    constructor() {
        super();
        this.onReadCoils = new BaseEvent();
        this.onReadDiscreteInputs = new BaseEvent();
        this.onReadHoldingRegisters = new BaseEvent();
        this.onReadInputRegisters = new BaseEvent();
        this.onWriteSingleCoil = new BaseEvent();
        this.onWriteSingleRegister = new BaseEvent();
        this.onWriteMultipleCoils = new BaseEvent();
        this.onWriteMultipleRegisters = new BaseEvent();
        this.onError = new BaseEvent();
    }

    destroy() {
        this.onReadCoils.destroy();
        this.onReadDiscreteInputs.destroy();
        this.onReadHoldingRegisters.destroy();
        this.onReadInputRegisters.destroy();
        this.onWriteSingleCoil.destroy();
        this.onWriteSingleRegister.destroy();
        this.onWriteMultipleCoils.destroy();
        this.onWriteMultipleRegisters.destroy();
        this.onError.destroy();
        super.destroy();
    }

    removeAllListeners() {
        this.onReadCoils.eventEmitter.removeAllListeners();
        this.onReadDiscreteInputs.eventEmitter.removeAllListeners();
        this.onReadHoldingRegisters.eventEmitter.removeAllListeners();
        this.onReadInputRegisters.eventEmitter.removeAllListeners();
        this.onWriteSingleCoil.eventEmitter.removeAllListeners();
        this.onWriteSingleRegister.eventEmitter.removeAllListeners();
        this.onWriteMultipleCoils.eventEmitter.removeAllListeners();
        this.onWriteMultipleRegisters.eventEmitter.removeAllListeners();
        this.onError.eventEmitter.removeAllListeners();       
    }

}

export class ModbusRTUEncoder extends Base implements IModbusRTUEncoder {
    modbus: IModbusRTU;
    lastFuncRtu: { [func: number]: IModbusRTUTable; };
    constructor(modbus: IModbusRTU) {
        super();
        this.modbus = modbus;
        this.lastFuncRtu = {};
    }
    encode(rtu: IModbusRTUTable): Buffer {
        this.lastFuncRtu[rtu.func] = rtu;
        switch (rtu.func) {
           case EModbusType.EReadCoils:
               return this.readCoils(rtu.slave, rtu.address, rtu.quantity);               
               break;
            case EModbusType.EReadDiscreteInputs:
                return this.readDiscreteInputs(rtu.slave, rtu.address, rtu.quantity);
                break;
            case EModbusType.EReadHoldingRegisters:
                return this.readHoldingRegisters(rtu.slave, rtu.address, rtu.quantity);
                break;
            case EModbusType.EWriteSingleCoil:
                return this.writeSingleCoil(rtu.slave, rtu.address, !!rtu.table[rtu.address]);
                break;
            case EModbusType.EWriteSingleRegister:
                return this.writeSingleRegister(rtu.slave, rtu.address, rtu.table[rtu.address]);
                break;
            case EModbusType.EWriteMultipleCoils:
                let coiles: boolean[] = [];
                for (let i = 0; i < rtu.quantity; i++) {
                    coiles.push(!!rtu.table[rtu.address + i]);                    
                }
                return this.writeMultipleCoils(rtu.slave, rtu.address, coiles);
                break;
            case EModbusType.EWriteMultipleRegisters:
                let regs: number[] = [];
                for (let i = 0; i < rtu.quantity; i++) {
                    regs.push(rtu.table[rtu.address + i]);                    
                }
                return this.writeMultipleRegisters(rtu.slave, rtu.address, regs);
                break;       
           default:
               break;
       }
    }

    destroy(): void {
        this.modbus = null;
        delete this.lastFuncRtu;
        super.destroy();
    }

    readCoils(slave: number, address: number, quantity?: number): Buffer {
        quantity = quantity || 1;
        let data = [slave & 0xFF, EModbusType.EReadCoils, address >> 8 & 0xFF, address & 0xFF, quantity >> 8 & 0xFF, quantity & 0xFF];
        let crc = CRC16.Modbus(Buffer.from(data));
        data.push(crc[0], crc[1]);
        return Buffer.from(data)
    }

    readDiscreteInputs(slave: number, address: number, quantity?: number): Buffer {
        quantity = quantity || 1;
        let data = [slave & 0xFF, EModbusType.EReadDiscreteInputs, address >> 8 & 0xFF, address & 0xFF, quantity >> 8 & 0xFF, quantity & 0xFF];
        let crc = CRC16.Modbus(Buffer.from(data));
        data.push(crc[0], crc[1]);
        return Buffer.from(data)
    }    

    readHoldingRegisters(slave: number, address: number, quantity?: number): Buffer {
        quantity = quantity || 1;
        let data = [slave & 0xFF, EModbusType.EReadHoldingRegisters, address >> 8 & 0xFF, address & 0xFF, quantity >> 8 & 0xFF, quantity & 0xFF];
        let crc = CRC16.Modbus(Buffer.from(data));
        data.push(crc[0], crc[1]);
        return Buffer.from(data)
    }    

    readInputRegisters(slave: number, address: number, quantity?: number): Buffer {
        quantity = quantity || 1;
        let data = [slave & 0xFF, EModbusType.EReadInputRegisters, address >> 8 & 0xFF, address & 0xFF, quantity >> 8 & 0xFF, quantity & 0xFF];
        let crc = CRC16.Modbus(Buffer.from(data));
        data.push(crc[0], crc[1]);
        return Buffer.from(data)        
    }

    writeSingleCoil(slave: number, address: number, value: boolean): Buffer {        
        let data = [slave & 0xFF, EModbusType.EWriteSingleCoil, address >> 8 & 0xFF, address & 0xFF, value ? 0xFF: 0x00, 0x00];
        let crc = CRC16.Modbus(Buffer.from(data));
        data.push(crc[0], crc[1]);
        return Buffer.from(data)          
    }
    writeSingleRegister(slave: number, address: number, value: number): Buffer {
        let data = [slave & 0xFF, EModbusType.EWriteSingleRegister, address >> 8 & 0xFF, address & 0xFF, value >> 8 & 0xFF, value & 0xFF];
        let crc = CRC16.Modbus(Buffer.from(data));
        data.push(crc[0], crc[1]);
        return Buffer.from(data)            
    }
    writeMultipleCoils(slave: number, address: number, values: boolean[]): Buffer {
        let count = values.length;
        let bytes = Math.ceil(count / 8);
        let data = [slave & 0xFF, EModbusType.EWriteMultipleCoils, address >> 8 & 0xFF, address & 0xFF, count >> 8 & 0xFF, count & 0xFF];
        data.push(bytes & 0xFF);
        for (let i = 0; i < bytes; i++) {
            let byte = 0;
            for (let j = 0; j < 8; j++) {
                let idx = i * 8 + j;
                let v = 0;
                if (idx < count)
                    v = values[idx] ? 1 : 0;

                byte = byte | (v << j);
            }
            data.push(byte && 0xFF);            
        }

        let crc = CRC16.Modbus(Buffer.from(data));
        data.push(crc[0], crc[1]);
        return Buffer.from(data);    
    }
    writeMultipleRegisters(slave: number, address: number, values: number[]): Buffer {
        let count = values.length;
        let bytes = count * 2;
        let data = [slave & 0xFF, EModbusType.EWriteMultipleRegisters, address >> 8 & 0xFF, address & 0xFF, count >> 8 & 0xFF, count & 0xFF];
        data.push(bytes & 0xFF);
        for (let i = 0; i < count; i++) {
            let value = values[i];
            data.push(value >> 8 & 0xFF, value & 0xFF);            
        }
        let crc = CRC16.Modbus(Buffer.from(data));
        data.push(crc[0], crc[1]);
        return Buffer.from(data);  
    }

}

export class ModbusRTUDecoder extends Base implements IModbusRTUDecoder {
    modbus: IModbusRTU;
    events: IModbusRTUDecoderEvents;
    constructor(modbus: IModbusRTU) {
        super();
        this.modbus = modbus;
        this.events = new ModbusRTUDecoderEvents();
    }

    destroy(): void {
        this.modbus = null;
        this.events.destroy();
        delete this.events;
        super.destroy();
    }

    decode(data: Buffer, reqRtu: IModbusRTUTable): IModbusRTUTable {
        let slave = data[0];
        let func = data[1] & 0x0F;
        let error = (data[1] & 0xF0) == 0x80 ? data[2] : 0;
        if (slave == reqRtu.slave && func == reqRtu.func) {
            if (!error) {
                switch (func) {
                    case EModbusType.EReadCoils:
                        return this.decode_read_coils(data, reqRtu);
                        break;
                
                    default:
                        break;
                }
                    
            }

        } else {
            error = 2;
        }
        reqRtu.error = error;
        return reqRtu;
    }

    decode_read_coils(data: Buffer, rtu: IModbusRTUTable): IModbusRTUTable {
        rtu.slave = data[0];
        rtu.func = data[1] & 0x0F;
        rtu.error = (data[1] & 0xF0) == 0x80 ? data[2] : 0;
        if (!rtu.error) {
            let bytes = data[2];
            let quantity = rtu.quantity || bytes * 8;
            let address = rtu.address || 0;
            for (let i = 0; i < bytes; i++) {
                let byte = data[3 + i];
                for (let j = 0; j < 8; j++) {
                    let idx = i * 8 + j;
                    if (idx < quantity) {
                        let v = (byte >> j) & 0x01;
                        rtu.table[address + idx] = v;
                    }
                }                
            }
        }
        return rtu;
    }
}

export class ModbusRTU extends Base implements IModbusRTU {
    encoder: IModbusRTUEncoder;
    decoder: IModbusRTUDecoder;
    constructor() {
        super();
        this.encoder = new ModbusRTUEncoder(this);
        this.decoder = new ModbusRTUDecoder(this);
    }

    destroy(): void {
        this.encoder.destroy();
        this.decoder.destroy();
        delete this.encoder;
        delete this.decoder;
        super.destroy();
    }
}