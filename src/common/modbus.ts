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
    type: number,
    address: number
    quantity: number
    table:{[address: number]: number}
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
}

export interface IModbusRTUEncoder extends IBase {
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
    decode(data: Buffer): IModbusRTUTable;
    events: IModbusRTUDecoderEvents
}

export interface IModbusRTU extends IBase {
    encoder: IModbusRTUEncoder
    decoder: IModbusRTUDecoder
}

export class ModbusRTUTable implements IModbusRTUTable{
    slave: number = 0;
    type: number = 0;
    address: number = 0;
    quantity: number = 0;
    table: { [address: number]: number; } = {};
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
        super.destroy();
    }

}

export class ModbusRTUEncoder extends Base implements IModbusRTUEncoder {

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
    events: IModbusRTUDecoderEvents = new ModbusRTUDecoderEvents();

    destroy(): void {
        this.events.destroy();
        super.destroy();
    }

    decode(data: Buffer): IModbusRTUTable {
        throw new Error("Method not implemented.");
    }
}