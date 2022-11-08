import { PldTable } from "../../device/amd/coders/dev-bin-json/pld-table";

let entable = new PldTable();
let detable = new PldTable();
entable.tables[60000] = "abc";
entable.tables[60100] = "345";
let buf = entable.encode();
detable.decode(buf);



console.log(buf, entable.tables, detable.tables);
