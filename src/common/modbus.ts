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
    events: IModbusRTUDecoderEvents
    decode(data: Buffer, reqRtu: IModbusRTUTable): IModbusRTUTable;
    decode_common(data: Buffer): IModbusRTUTable
    decode_read_coils(data: Buffer, rtu: IModbusRTUTable): IModbusRTUTable
    decode_read_discrete_inputs(data: Buffer, rtu: IModbusRTUTable): IModbusRTUTable
    decode_read_holding_registers(data: Buffer, rtu: IModbusRTUTable): IModbusRTUTable
    decode_read_input_registers(data: Buffer, rtu: IModbusRTUTable): IModbusRTUTable
    decode_write_single_coil(data: Buffer, rtu: IModbusRTUTable): IModbusRTUTable
    decode_write_single_register(data: Buffer, rtu: IModbusRTUTable): IModbusRTUTable 
    decode_write_multiple_coils(data: Buffer, rtu: IModbusRTUTable): IModbusRTUTable
    decode_write_multiple_registers(data: Buffer, rtu: IModbusRTUTable): IModbusRTUTable
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

    compare_result(table: IModbusRTUTable, result: IModbusRTUTable ): IModbusRTUTable {
        if (!table || 
            !(table.slave == result.slave && table.func == result.func && 
                table.address == result.address && table.quantity == result.quantity) 
            ) 

            return;        

        return result;
    }

    decode(data: Buffer, table: IModbusRTUTable): IModbusRTUTable {
        let result = this.decode_common(data);
        switch (result.func) {
            case EModbusType.EReadCoils:
                result = this.decode_read_coils(data, table);
                break;
            case EModbusType.EReadDiscreteInputs:
                result = this.decode_read_discrete_inputs(data, table);
                break;  
            case EModbusType.EReadHoldingRegisters:
                result = this.decode_read_holding_registers(data, table);
                break;
            case EModbusType.EReadInputRegisters:
                result = this.decode_read_input_registers(data, table);
                break;
            case EModbusType.EWriteSingleCoil:
                result = this.decode_write_single_coil(data, table);
                break;
            case EModbusType.EWriteSingleRegister:
                result = this.decode_write_single_register(data, table);
                break;
            case EModbusType.EWriteMultipleCoils:
                result = this.decode_write_multiple_coils(data, table);
                break;
            case EModbusType.EWriteMultipleRegisters:
                result = this.decode_write_multiple_registers(data, table);
                break;
            default:
                break;
        }

        if (result) {
            switch (result.func) {
                case EModbusType.EReadCoils:
                    this.events.onReadCoils.emit(result, table, data, this);
                    break;
                case EModbusType.EReadDiscreteInputs:
                    this.events.onReadDiscreteInputs.emit(result, table, data, this);
                    break;  
                case EModbusType.EReadHoldingRegisters:
                    this.events.onReadHoldingRegisters.emit(result, table, data, this);
                    break;
                case EModbusType.EReadInputRegisters:
                    this.events.onReadInputRegisters.emit(result, table, data, this);
                    break;
                case EModbusType.EWriteSingleCoil:
                    this.events.onWriteSingleCoil.emit(result, table, data, this);
                    break;
                case EModbusType.EWriteSingleRegister:
                    this.events.onWriteSingleRegister.emit(result, table, data, this);
                    break;
                case EModbusType.EWriteMultipleCoils:
                    this.events.onWriteMultipleCoils.emit(result, table, data, this);
                    break;
                case EModbusType.EWriteMultipleRegisters:
                    this.events.onWriteMultipleRegisters.emit(result, table, data, this);
                    break;
                default:
                    break;
            }            
        }
        
        return result;
    }

    decode_common(data: Buffer): IModbusRTUTable {
        let result: IModbusRTUTable = new ModbusRTUTable();
        result.slave = data[0];
        result.func = data[1] & 0x0F;
        result.error = (data[1] & 0xF0) == 0x80 ? data[2] : 0;
        return result;
    }


    decode_read_coils(data: Buffer, table: IModbusRTUTable): IModbusRTUTable {        
        let result = this.decode_common(data);
        if (!result.error) {
            let bytes = data[2];
            result.quantity = table && table.quantity || bytes * 8;            
            result.address = table && table.address || 0;
            for (let i = 0; i < bytes; i++) {
                let byte = data[3 + i];
                for (let j = 0; j < 8; j++) {
                    let idx = i * 8 + j;
                    if (idx < result.quantity) {
                        let v = (byte >> j) & 0x01;
                        result.table[result.address + idx] = v;
                    }
                }                
            }
        }        

        return this.compare_result(table, result);
    }

    decode_read_discrete_inputs(data: Buffer, table: IModbusRTUTable): IModbusRTUTable {
        return this.decode_read_coils(data, table);
    }

    decode_read_holding_registers(data: Buffer, table: IModbusRTUTable): IModbusRTUTable {
        let result = this.decode_common(data);
        if (!result.error) {
            let bytes = data[2];
            result.quantity = bytes / 2;
            result.address = table.address || 0;
            for (let i = 0; i < result.quantity; i++) {
                let byteH = data[3 + i * 2];
                let byteL = data[3 + i * 2 + 1];
                result.table[result.address + i] = byteH << 8 + byteL;        
            }
        }
        return this.compare_result(table, result);
    }

    decode_read_input_registers(data: Buffer, table: IModbusRTUTable): IModbusRTUTable {
        return this.decode_read_holding_registers(data, table);
    }

    decode_write_single_coil(data: Buffer, table: IModbusRTUTable): IModbusRTUTable {
        let result = this.decode_common(data);
        if (!result.error) {
            result.quantity = 1;
            result.address = (data[2] << 8) + data[3];
            result.table[result.address] = (data[4] == 0xFF ? 1: 0);   
        }
        return this.compare_result(table, result);
    }

    decode_write_single_register(data: Buffer, table: IModbusRTUTable): IModbusRTUTable {
        let result = this.decode_common(data);
        if (!result.error) {
            result.quantity = 1;
            result.address = (data[2] << 8) + data[3];
            result.table[result.address] = (data[4] << 8) + data[5];     
        }
        return this.compare_result(table, result);
    }

    decode_write_multiple_coils(data: Buffer, table: IModbusRTUTable): IModbusRTUTable {
        let result = this.decode_common(data);
        if (!result.error) {            
            result.address = (data[2] << 8) + data[3];
            result.quantity = (data[4] << 8) + data[5];
        }
        return this.compare_result(table, result);
    }

    decode_write_multiple_registers(data: Buffer, table: IModbusRTUTable): IModbusRTUTable {
        let result = this.decode_common(data);
        if (!result.error) {            
            result.address = (data[2] << 8) + data[3];
            result.quantity = (data[4] << 8) + data[5];
        }
        return this.compare_result(table, result);
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

export interface IModbusCmdEvents extends IBase {
    req: IBaseEvent
    res: IBaseEvent
}

export interface IModbusCmd extends IBase {
    events: IModbusCmdEvents
}

export class ModbusCmdEvents extends Base implements IModbusCmdEvents {
    req: IBaseEvent;
    res: IBaseEvent;
    constructor() {
        super();
        this.req = new BaseEvent();
        this.res = new BaseEvent();
    }
    destroy(): void {
        this.req.destroy();
        this.res.destroy();
        delete this.req;
        delete this.res;
        super.destroy();
    }

}

export interface IModbusCmdResult {
    tables: IModbusRTUTable[], 
    results: IModbusRTUTable[]
}

export class ModbusCmd extends Base implements IModbusCmd {
    events: IModbusCmdEvents;
    tables: IModbusRTUTable[];

    constructor(tables: IModbusRTUTable[]) {
        super();
        this.tables = tables;
        this.events = new ModbusCmdEvents();
        this.events.res.on(data => {this.onResponse(data)})
    }


    destroy(): void {
        this.events.destroy();
        delete this.events;
        super.destroy();
    }

    onResponse(data: Buffer) {

    }

    exec(): Promise<IModbusCmdResult> {
        return;
    }
}