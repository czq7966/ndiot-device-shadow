import { IPntTable, PntTable } from "./pnt-table";
import { IPlfProps, PlfProps } from "./plf-props";
import { IRfirCoder, ISegCoderParam, RfirCoder, SegCoderParam } from "../rfir-coder";

export interface ICoder {
    pnt_table: IPntTable
    plf_props: IPlfProps
    rfir_coder: IRfirCoder;
}


export class Coder implements ICoder {
    pnt_table: IPntTable;
    plf_props: IPlfProps;  
    rfir_coder: IRfirCoder;  

    constructor(){
        this.pnt_table = new PntTable();
        this.plf_props = new PlfProps();
        this.rfir_coder = new RfirCoder();

        const param1 = new SegCoderParam();
        param1.tolerance = 20;
        param1.excess = 0;
        param1.atleast = true;                              
        param1.MSBfirst = false;
        param1.step = 2;
        
        param1.nbits = 4 * 8;
        param1.headermark = 9000;
        param1.headerspace = 4500;
        param1.onemark = 620;
        param1.onespace = 1600;
        param1.zeromark = 620;
        param1.zerospace = 540;
        param1.footermark = 0;
        param1.footerspace = 0;
        param1.lastspace = 0;        
        this.rfir_coder.params.push(param1);

        const param2 = Object.assign({}, param1) as ISegCoderParam;
        param2.headermark = 0;
        param2.headerspace = 0;
        param2.footermark = 620;
        param2.footerspace = 19980;
        param2.nbits = 3;        
        this.rfir_coder.params.push(param2);
        
        const param3 = Object.assign({}, param1) as ISegCoderParam;
        param3.headermark = 0;
        param3.headerspace = 0;
        param3.footermark = 620;
        param3.footerspace = 19980;
        this.rfir_coder.params.push(param3);
    }
}