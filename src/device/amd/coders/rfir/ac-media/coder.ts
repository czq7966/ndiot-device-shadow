import { IPntTable, PntTable } from "./pnt-table";
import { IPlfProps, PlfProps } from "./plf-props";
import { IRfirCoder, ISegCoderParam, RfirCoder, SegCoderParam } from "../rfir-coder";
import { TableConst } from "./table";

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
        const param = new SegCoderParam();
        param.tolerance = 20;
        param.excess = 0;
        param.atleast = true;                              
        param.MSBfirst = true;
        param.step = 2;
        
        param.nbits = TableConst.NBits;
        param.headermark = TableConst.HeadMark;
        param.headerspace = TableConst.HeadSpace;
        param.onemark = TableConst.OneMark;
        param.onespace = TableConst.OneSpace;
        param.zeromark = TableConst.ZeroMark;
        param.zerospace = TableConst.ZeroSpace;
        param.footermark = TableConst.FooterMark;
        param.footerspace = TableConst.FooterSpace;
        param.lastspace = 0; 
        this.rfir_coder.params.push(param);        
        return;
    }
    
}