import { PldTable } from "../../device/amd/coders/dev-bin-json/pld-table";

const entable = new PldTable();
const detable = new PldTable();
entable.tables[60000] = "abc";
entable.tables[60100] = "345";
const buf = entable.encode();
detable.decode(buf);



console.log(buf, entable.tables, detable.tables);
