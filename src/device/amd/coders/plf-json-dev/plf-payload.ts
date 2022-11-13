import { IPldTable, PldTable } from "../dev-bin-json/pld-table";

export interface IPlfPayload {
    encode(pld: {}): IPldTable;
    decode(pld: IPldTable): {};
    reset();
}


export class PlfPayload implements IPlfPayload{
    encode(pld: {}): IPldTable{
        return PlfPayload.encodeDefault(pld);
    };
    decode(pld: IPldTable): {} {
        return PlfPayload.decodeDefault(pld);
    };
    static encodeDefault(pld: {}): IPldTable {
        if (pld) {
            let result = new PldTable();
            let tables = Object.assign({}, pld);
            result.tables = tables;

            let keys = Object.keys(tables);
            keys.forEach(key => {
                let val = tables[key];
                delete tables[key];
                let keyVal = PldTable.Keys[key];
                keyVal = keyVal ? keyVal : key;
                tables[keyVal] = val;
            })
            return result;
        }
        
        return pld as any;
    }
    static decodeDefault(pld: IPldTable): {} {
        if (pld) {
            let result = Object.assign({}, pld.tables); 
            let keys = Object.keys(result);
            keys.forEach(key => {
                let val = result[key];
                // delete result[key];
                let keyVal = PldTable.Names[key];
                keyVal = keyVal ? keyVal : key;
                result[keyVal] = val;
            })
            return result;
        }

        return pld;
    }
    reset() {
    
    }
    
}
