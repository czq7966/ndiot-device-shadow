import { IPntTable, PntTable } from "./pnt-table";
import { IPlfProps, PlfProps } from "./plf-props";

export interface ICoder {
    pnt_table: IPntTable
    plf_props: IPlfProps
}


export class Coder implements ICoder {
    pnt_table: IPntTable = new PntTable();
    plf_props: IPlfProps = new PlfProps();    
}