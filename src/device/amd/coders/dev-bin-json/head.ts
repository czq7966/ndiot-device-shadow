export interface IHead {
    pro_logo?: number;        
    pro_ver?: number;
    dev_id?: number;
    cmd_id?: number;
    cmd_stp?: number;
    err_no?: number;
    cmd_sid?: number;                
    pld_sum?: number;
    pld_len?: number;
}

export class Head implements IHead {

}