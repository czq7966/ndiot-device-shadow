import { RegTable } from "../device/amd/nd-device/regtable";

let entable = new RegTable();
let detable = new RegTable();
entable.tables[60000] = "abc";
entable.tables[60100] = "345";
let buf = entable.encode();
detable.decode(buf);



console.log(buf, entable.tables, detable.tables);
