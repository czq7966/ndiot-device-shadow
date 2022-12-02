import { Base, IBase } from "../../../../common/base";
import { CRC16 } from "../../../../common/crc16";
import { BaseEvent, IBaseEvent } from "../../../../common/events";
import { Utils } from "../../../../common/utils";

export class EModbusType {
    static EReadCoils = 1;
    static EReadDiscreteInputs = 2;
    static EReadHoldingRegisters = 3;
    static EReadInputRegisters = 4;
    static EWriteSingleCoil = 5;
    static EWriteSingleRegister = 6;
    static EWriteMultipleCoils = 15;
    static EWriteMultipleRegisters = 16;
}

export class EModbusPLCType {
    static EReadCoils = 0;
    static EReadDiscreteInputs = 1;
    static EReadHoldingRegisters = 4;
    static EReadInputRegisters = 3;
    static EWriteSingleCoil = 0;
    static EWriteSingleRegister = 4;
    static EWriteMultipleCoils = 0;
    static EWriteMultipleRegisters = 4;    
}


export interface IModbusRTUTable {
    slave: number,
    func: number,
    address: number
    quantity: number
    table:{[address: number]: number}
    error?: number 
    plcbase?: number
    setPLCAddress(address: number, value?: number);
    getPLCAddress(address?: number): number
    clone(): IModbusRTUTable
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
    encode(table: IModbusRTUTable): Buffer;
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
    events: IModbusRTUDecoderEvents
    decode(rtu: Buffer, table: IModbusRTUTable): IModbusRTUTable;
    decode_common(rtu: Buffer): IModbusRTUTable
    decode_read_coils(rtu: Buffer, table: IModbusRTUTable): IModbusRTUTable
    decode_read_discrete_inputs(rtu: Buffer, table: IModbusRTUTable): IModbusRTUTable
    decode_read_holding_registers(rtu: Buffer, table: IModbusRTUTable): IModbusRTUTable
    decode_read_input_registers(rtu: Buffer, table: IModbusRTUTable): IModbusRTUTable
    decode_write_single_coil(rtu: Buffer, table: IModbusRTUTable): IModbusRTUTable
    decode_write_single_register(rtu: Buffer, table: IModbusRTUTable): IModbusRTUTable 
    decode_write_multiple_coils(rtu: Buffer, table: IModbusRTUTable): IModbusRTUTable
    decode_write_multiple_registers(rtu: Buffer, table: IModbusRTUTable): IModbusRTUTable
}

export interface IModbusRTU extends IBase {
    encoder: IModbusRTUEncoder
    decoder: IModbusRTUDecoder
}

export class ModbusRTUTable  implements IModbusRTUTable{
    slave = 0;
    func = 0;
    address = 0;
    quantity = 1;
    table: { [address: number]: number; } = {};
    error = 0;
    plcbase = 10000
    constructor(pldbase?: number) {
        this.plcbase = pldbase || this.plcbase;
    }

    setPLCAddress(plcAddr: number, value?: number) {
        plcAddr = plcAddr || 0;
        const address = plcAddr % this.plcbase - 1;
        if (address < 0)
            return;    
        this.address = address;

        if (this.func < EModbusType.EWriteSingleCoil ) {
            const plctype = Math.floor(plcAddr / this.plcbase);
            switch(plctype) {
                case EModbusPLCType.EReadCoils :
                    this.func = EModbusType.EReadCoils;
                    break;
                case EModbusPLCType.EReadDiscreteInputs :
                    this.func = EModbusType.EReadDiscreteInputs;
                    break;     
                case EModbusPLCType.EReadInputRegisters :
                    this.func = EModbusType.EReadInputRegisters;
                    break;
                case EModbusPLCType.EReadHoldingRegisters :
                    this.func = EModbusType.EReadHoldingRegisters;
                    break;                                     
            }
        }    
        
        if (value || value === 0) {
            this.table[address] = value;
        }
    }

    getPLCAddress(address?: number): number {
        address = (address || address === 0) ? address : this.address;
        switch(this.func) {
            case EModbusType.EReadCoils :
            case EModbusType.EWriteSingleCoil:
            case EModbusType.EWriteMultipleCoils:            
                return  this.plcbase * EModbusPLCType.EReadCoils + address + 1;
            case EModbusType.EReadDiscreteInputs :
                return  this.plcbase * EModbusPLCType.EReadDiscreteInputs + address + 1;  
            case EModbusType.EReadInputRegisters :
                return  this.plcbase * EModbusPLCType.EReadInputRegisters + address + 1;                                
            
            case EModbusType.EReadHoldingRegisters:
            case EModbusType.EWriteSingleRegister:
            case EModbusType.EWriteMultipleRegisters:     
                return  this.plcbase * EModbusPLCType.EReadHoldingRegisters + address + 1;   

        }
    }

    clone(): IModbusRTUTable {
        const table = new ModbusRTUTable();
        return Utils.DeepMerge(table, this) as any;        
    }
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
    constructor() {
        super();
    }
    encode(table: IModbusRTUTable): Buffer {
        const coiles: boolean[] = [];
        const regs: number[] = [];
        switch (table.func) {
           case EModbusType.EReadCoils:
               return this.readCoils(table.slave, table.address, table.quantity);               
               break;
            case EModbusType.EReadDiscreteInputs:
                return this.readDiscreteInputs(table.slave, table.address, table.quantity);
                break;
            case EModbusType.EReadHoldingRegisters:
                return this.readHoldingRegisters(table.slave, table.address, table.quantity);
                break;
            case EModbusType.EWriteSingleCoil:
                return this.writeSingleCoil(table.slave, table.address, !!table.table[table.address]);
                break;
            case EModbusType.EWriteSingleRegister:
                return this.writeSingleRegister(table.slave, table.address, table.table[table.address]);
                break;
            case EModbusType.EWriteMultipleCoils:                
                for (let i = 0; i < table.quantity; i++) {
                    coiles.push(!!table.table[table.address + i]);                    
                }
                return this.writeMultipleCoils(table.slave, table.address, coiles);
                break;
            case EModbusType.EWriteMultipleRegisters:                
                for (let i = 0; i < table.quantity; i++) {
                    regs.push(table.table[table.address + i]);                    
                }
                return this.writeMultipleRegisters(table.slave, table.address, regs);
                break;       
           default:
               break;
       }
    }

    destroy(): void {
        super.destroy();
    }

    readCoils(slave: number, address: number, quantity?: number): Buffer {
        quantity = quantity || 1;
        const data = [slave & 0xFF, EModbusType.EReadCoils, (address >> 8) & 0xFF, address & 0xFF, (quantity >> 8) & 0xFF, quantity & 0xFF];
        const crc = CRC16.Modbus(Buffer.from(data));
        data.push(crc[0], crc[1]);
        return Buffer.from(data)
    }

    readDiscreteInputs(slave: number, address: number, quantity?: number): Buffer {
        quantity = quantity || 1;
        const data = [slave & 0xFF, EModbusType.EReadDiscreteInputs, (address >> 8) & 0xFF, address & 0xFF, (quantity >> 8) & 0xFF, quantity & 0xFF];
        const crc = CRC16.Modbus(Buffer.from(data));
        data.push(crc[0], crc[1]);
        return Buffer.from(data)
    }    

    readHoldingRegisters(slave: number, address: number, quantity?: number): Buffer {
        quantity = quantity || 1;
        const data = [slave & 0xFF, EModbusType.EReadHoldingRegisters, (address >> 8) & 0xFF, address & 0xFF, (quantity >> 8) & 0xFF, quantity & 0xFF];
        const crc = CRC16.Modbus(Buffer.from(data));
        data.push(crc[0], crc[1]);
        return Buffer.from(data)
    }    

    readInputRegisters(slave: number, address: number, quantity?: number): Buffer {
        quantity = quantity || 1;
        const data = [slave & 0xFF, EModbusType.EReadInputRegisters, (address >> 8) & 0xFF, address & 0xFF, (quantity >> 8) & 0xFF, quantity & 0xFF];
        const crc = CRC16.Modbus(Buffer.from(data));
        data.push(crc[0], crc[1]);
        return Buffer.from(data)        
    }

    writeSingleCoil(slave: number, address: number, value: boolean): Buffer {        
        const data = [slave & 0xFF, EModbusType.EWriteSingleCoil, (address >> 8) & 0xFF, address & 0xFF, value ? 0xFF: 0x00, 0x00];
        const crc = CRC16.Modbus(Buffer.from(data));
        data.push(crc[0], crc[1]);
        return Buffer.from(data)          
    }
    writeSingleRegister(slave: number, address: number, value: number): Buffer {
        const data = [slave & 0xFF, EModbusType.EWriteSingleRegister, (address >> 8) & 0xFF, address & 0xFF, (value >> 8) & 0xFF, value & 0xFF];
        const crc = CRC16.Modbus(Buffer.from(data));
        data.push(crc[0], crc[1]);
        return Buffer.from(data)            
    }
    writeMultipleCoils(slave: number, address: number, values: boolean[]): Buffer {
        const count = values.length;
        const bytes = Math.ceil(count / 8);
        const data = [slave & 0xFF, EModbusType.EWriteMultipleCoils, (address >> 8) & 0xFF, address & 0xFF, (count >> 8) & 0xFF, count & 0xFF];
        data.push(bytes & 0xFF);
        for (let i = 0; i < bytes; i++) {
            let byte = 0;
            for (let j = 0; j < 8; j++) {
                const idx = i * 8 + j;
                let v = 0;
                if (idx < count)
                    v = values[idx] ? 1 : 0;

                byte = byte | (v << j);
            }
            data.push(byte && 0xFF);            
        }

        const crc = CRC16.Modbus(Buffer.from(data));
        data.push(crc[0], crc[1]);
        return Buffer.from(data);    
    }
    writeMultipleRegisters(slave: number, address: number, values: number[]): Buffer {
        const count = values.length;
        const bytes = count * 2;
        const data = [slave & 0xFF, EModbusType.EWriteMultipleRegisters, (address >> 8) & 0xFF, address & 0xFF, (count >> 8) & 0xFF, count & 0xFF];
        data.push(bytes & 0xFF);
        for (let i = 0; i < count; i++) {
            const value = values[i];
            data.push((value >> 8) & 0xFF, value & 0xFF);            
        }
        const crc = CRC16.Modbus(Buffer.from(data));
        data.push(crc[0], crc[1]);
        return Buffer.from(data);  
    }

}

export class ModbusRTUDecoder extends Base implements IModbusRTUDecoder {
    events: IModbusRTUDecoderEvents;
    constructor() {
        super();
        this.events = new ModbusRTUDecoderEvents();
    }

    destroy(): void {
        this.events.destroy();
        delete this.events;
        super.destroy();
    }

    compare_tables(reqTable: IModbusRTUTable, resTable: IModbusRTUTable ): IModbusRTUTable {
        if (!reqTable || 
            !(reqTable.slave == resTable.slave && reqTable.func == resTable.func && 
                reqTable.address == resTable.address && reqTable.quantity == resTable.quantity) 
            ) 

            return;        

        resTable.plcbase = reqTable && reqTable.plcbase;
        return resTable;
    }

    decode_common(rtu: Buffer): IModbusRTUTable {
        const table: IModbusRTUTable = new ModbusRTUTable();
        table.slave = rtu[0];
        table.func = rtu[1] & 0x0F;
        table.error = (rtu[1] & 0xF0) == 0x80 ? rtu[2] : 0;
        return table;
    }    

    decode(rtu: Buffer, table: IModbusRTUTable): IModbusRTUTable {
        let result = this.decode_common(rtu);
        result.plcbase = table.plcbase;
        switch (result.func) {
            case EModbusType.EReadCoils:
                result = this.decode_read_coils(rtu, table);
                break;
            case EModbusType.EReadDiscreteInputs:
                result = this.decode_read_discrete_inputs(rtu, table);
                break;  
            case EModbusType.EReadHoldingRegisters:
                result = this.decode_read_holding_registers(rtu, table);
                break;
            case EModbusType.EReadInputRegisters:
                result = this.decode_read_input_registers(rtu, table);
                break;
            case EModbusType.EWriteSingleCoil:
                result = this.decode_write_single_coil(rtu, table);
                break;
            case EModbusType.EWriteSingleRegister:
                result = this.decode_write_single_register(rtu, table);
                break;
            case EModbusType.EWriteMultipleCoils:
                result = this.decode_write_multiple_coils(rtu, table);
                break;
            case EModbusType.EWriteMultipleRegisters:
                result = this.decode_write_multiple_registers(rtu, table);
                break;
            default:
                break;
        }

        if (result) {
            switch (result.func) {
                case EModbusType.EReadCoils:
                    this.events.onReadCoils.emit(result, table, rtu, this);
                    break;
                case EModbusType.EReadDiscreteInputs:
                    this.events.onReadDiscreteInputs.emit(result, table, rtu, this);
                    break;  
                case EModbusType.EReadHoldingRegisters:
                    this.events.onReadHoldingRegisters.emit(result, table, rtu, this);
                    break;
                case EModbusType.EReadInputRegisters:
                    this.events.onReadInputRegisters.emit(result, table, rtu, this);
                    break;
                case EModbusType.EWriteSingleCoil:
                    this.events.onWriteSingleCoil.emit(result, table, rtu, this);
                    break;
                case EModbusType.EWriteSingleRegister:
                    this.events.onWriteSingleRegister.emit(result, table, rtu, this);
                    break;
                case EModbusType.EWriteMultipleCoils:
                    this.events.onWriteMultipleCoils.emit(result, table, rtu, this);
                    break;
                case EModbusType.EWriteMultipleRegisters:
                    this.events.onWriteMultipleRegisters.emit(result, table, rtu, this);
                    break;
                default:
                    break;
            }            
        }
        
        return result;
    }




    decode_read_coils(rtu: Buffer, table: IModbusRTUTable): IModbusRTUTable {        
        const result = this.decode_common(rtu);
        if (!result.error) {
            const bytes = rtu[2];
            result.quantity = table && table.quantity || (bytes * 8);            
            result.address = table && table.address || 0;
            for (let i = 0; i < bytes; i++) {
                const byte = rtu[3 + i];
                for (let j = 0; j < 8; j++) {
                    const idx = i * 8 + j;
                    if (idx < result.quantity) {
                        const v = (byte >> j) & 0x01;
                        result.table[result.address + idx] = v;
                    }
                }                
            }
        }        

        return this.compare_tables(table, result);
    }

    decode_read_discrete_inputs(rtu: Buffer, table: IModbusRTUTable): IModbusRTUTable {
        return this.decode_read_coils(rtu, table);
    }

    decode_read_holding_registers(rtu: Buffer, table: IModbusRTUTable): IModbusRTUTable {
        const result = this.decode_common(rtu);
        if (!result.error) {
            const bytes = rtu[2];
            result.quantity = bytes / 2;
            result.address = table.address || 0;
            for (let i = 0; i < result.quantity; i++) {
                const byteH = rtu[3 + i * 2];
                const byteL = rtu[3 + i * 2 + 1];
                result.table[result.address + i] =  (byteH << 8) + byteL;        
            }
        }
        return this.compare_tables(table, result);
    }

    decode_read_input_registers(rtu: Buffer, table: IModbusRTUTable): IModbusRTUTable {
        return this.decode_read_holding_registers(rtu, table);
    }

    decode_write_single_coil(rtu: Buffer, table: IModbusRTUTable): IModbusRTUTable {
        const result = this.decode_common(rtu);
        if (!result.error) {
            result.quantity = 1;
            result.address = (rtu[2] << 8) + rtu[3];
            result.table[result.address] = (rtu[4] == 0xFF ? 1: 0);   
        }
        return this.compare_tables(table, result);
    }

    decode_write_single_register(rtu: Buffer, table: IModbusRTUTable): IModbusRTUTable {
        const result = this.decode_common(rtu);
        if (!result.error) {
            result.quantity = 1;
            result.address = (rtu[2] << 8) + rtu[3];
            result.table[result.address] = (rtu[4] << 8) + rtu[5];     
        }
        return this.compare_tables(table, result);
    }

    decode_write_multiple_coils(rtu: Buffer, table: IModbusRTUTable): IModbusRTUTable {
        const result = this.decode_common(rtu);
        if (!result.error) {            
            result.address = (rtu[2] << 8) + rtu[3];
            result.quantity = (rtu[4] << 8) + rtu[5];
        }
        return this.compare_tables(table, result);
    }

    decode_write_multiple_registers(rtu: Buffer, table: IModbusRTUTable): IModbusRTUTable {
        const result = this.decode_common(rtu);
        if (!result.error) {            
            result.address = (rtu[2] << 8) + rtu[3];
            result.quantity = (rtu[4] << 8) + rtu[5];
        }
        return this.compare_tables(table, result);
    }
}

export class ModbusRTU extends Base implements IModbusRTU {
    encoder: IModbusRTUEncoder;
    decoder: IModbusRTUDecoder;
    constructor() {
        super();
        this.encoder = new ModbusRTUEncoder();
        this.decoder = new ModbusRTUDecoder();
    }

    destroy(): void {
        this.encoder.destroy();
        this.decoder.destroy();
        delete this.encoder;
        delete this.decoder;
        super.destroy();
    }
}

const GModeBusRTU = new ModbusRTU();
export { GModeBusRTU }

export interface IModbusCmdEvents extends IBase {
    req: IBaseEvent
    res: IBaseEvent
    then: IBaseEvent
    catch: IBaseEvent
}

export interface IModbusCmd extends IBase {
    events: IModbusCmdEvents
    reqTables: IModbusRTUTable[];
    resTables: IModbusRTUTable[];
    exec(): Promise<IModbusCmdResult>
}

export interface IModbusCmds extends IBase {
    events: IModbusCmdEvents
    exec(tables: IModbusRTUTable[]): IModbusCmd
}

export class ModbusCmdEvents extends Base implements IModbusCmdEvents {
    req: IBaseEvent;
    res: IBaseEvent;
    then: IBaseEvent;
    catch: IBaseEvent;
    constructor() {
        super();
        this.req = new BaseEvent();
        this.res = new BaseEvent();
        this.then = new BaseEvent();
        this.catch = new BaseEvent();
    }
    destroy(): void {
        this.req.destroy();
        this.res.destroy();
        this.then.destroy();
        this.catch.destroy();
        delete this.req;
        delete this.res;
        delete this.then;
        delete this.catch;
        super.destroy();
    }

}

export interface IModbusCmdResult {
    req: IModbusRTUTable[], 
    res: IModbusRTUTable[]
}

export class ModbusCmd extends Base implements IModbusCmd {
    events: IModbusCmdEvents;
    reqTables: IModbusRTUTable[];
    resTables: IModbusRTUTable[];
    execPromise: Promise<IModbusCmdResult>

    constructor(tables: IModbusRTUTable[]) {
        super();
        this.execPromise = null;
        this.reqTables = [].concat(tables);
        this.resTables = [];
        this.events = new ModbusCmdEvents();
    }


    destroy(): void {
        this.events.destroy();
        delete this.events;
        delete this.reqTables;
        delete this.resTables;
        super.destroy();
    }

    exec(): Promise<IModbusCmdResult> {
        if (this.execPromise)
            return this.execPromise;
        
        this.execPromise = new Promise((resolve, reject) => {
            const reqTables = [].concat(this.reqTables);
            let reqTable: IModbusRTUTable;
            let timeoutHandler: any;
            const execReqTable = () => {
                reqTable = reqTables.pop();
                if (reqTable) {
                    const reqRtu = GModeBusRTU.encoder.encode(reqTable);
                    this.events.req.emit(reqRtu);
                    timeoutHandler = setTimeout(() => {                        
                        const resTable = reqTable.clone();
                        resTable.error = -1;
                        this.resTables.push(resTable);                 
                        reject(-1);                        
                    }, 5000);
                }

                if (reqTable) {
                    return reqTable;
                } else {
                    this.events.res.eventEmitter.removeAllListeners();
                    resolve({req: this.reqTables,  res: this.resTables});
                }                    
            }


            this.events.res.on((resRtu: Buffer) => {
                clearTimeout(timeoutHandler);
                const resTable = GModeBusRTU.decoder.decode(resRtu, reqTable);
                this.resTables.push(resTable);
                execReqTable();
            })

            execReqTable();   
        })

        return this.execPromise;
    }
}


export class ModbusCmds extends Base implements IModbusCmds {
    events: IModbusCmdEvents;
    cmds: IModbusCmd[];
    cmd: IModbusCmd;


    constructor() {
        super();
        this.cmds = [];
        this.events = new ModbusCmdEvents();
        this.events.res.on(data => {
            if (this.cmd)
                this.cmd.events.res.emit(data);
        })
    }


    destroy(): void {
        this.clear();
        this.events.destroy();
        delete this.events;
        delete this.cmds;
        super.destroy();
    }

    exec(tables: IModbusRTUTable[]): IModbusCmd {
        const cmd = new ModbusCmd(tables);
        cmd.events.req.on(data => {
            this.events.req.emit(data);
        })
        this.cmds.push(cmd);
        this.execCmd()
        return cmd;  
    }

    execCmd(): IModbusCmd {
        if (!this.cmd) {
            const promise = this.execNextCmd();
            if (promise) {
                promise
                .then(v => {
                    this.cmd.events.then.emit(v, this.cmd);
                    this.cmd.destroy();   
                    delete this.cmd;                 
                    this.execCmd();
                })
                .catch(e => {
                    this.cmd.events.catch.emit(e, this.cmd);
                    this.cmd.destroy();
                    delete this.cmd; 
                    this.execCmd();
                })
            }
        }

        return this.cmd;
    }

    execNextCmd(): Promise<IModbusCmdResult> {
        this.cmd = this.cmds.pop();
        if (this.cmd) {
            return this.cmd.exec();
        } else {
            this.events.then.emit(this);
        }

        return;
    }

    clear() {
        while(this.cmds.length > 0) {
            const cmd = this.cmds.pop();
            cmd.destroy();
        }
    }
}