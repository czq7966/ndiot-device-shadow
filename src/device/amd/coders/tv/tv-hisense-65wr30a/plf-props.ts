import { IPntTable, PntTable } from "./pnt-table"
import { IProps, Props } from "./props"

export interface IPlfProps  {
    props: IProps
    encode(props?: IProps): IPntTable
    decode(pnttable: IPntTable): IProps
}



export class PlfProps implements IPlfProps {
    props: IProps = new Props();

    encode(props?: IProps): IPntTable {
        const pnttable = new PntTable();
        pnttable.reset();
        if (!props || Object.keys(props).length == 0) {
            pnttable.table.cmd = PntTable.CMD_get;
            pnttable.table.data = PntTable.DATA_get;
            return pnttable;
        } else  {
            if (props.power === "on") {
                pnttable.table.cmd = PntTable.CMD_power_on;                
                pnttable.table.data = PntTable.DATA_power_on;
            }
            else if (props.power === "off") {
                pnttable.table.cmd = PntTable.CMD_power_off;
                pnttable.table.data = PntTable.DATA_power_off;
            }
            else if (props.input) {
                pnttable.table.cmd = PntTable.CMD_input;
                pnttable.table.data = PntTable.DATA_input_PC2TV[props.input];
            } else if (props.mute === "on") {
                pnttable.table.cmd = PntTable.CMD_mute;
                pnttable.table.data = PntTable.DATA_mute_on;
            } else if (props.mute === "off") {
                pnttable.table.cmd = PntTable.CMD_mute;
                pnttable.table.data = PntTable.DATA_mute_off;
            } else if (props.volume === 0 || props.volume) {
                pnttable.table.cmd = PntTable.CMD_volume;
                pnttable.table.data = PntTable.DATA_volume.concat([props.volume]);
            }             
        }
        return pnttable.table.cmd ? pnttable : null;
    }
    decode(pnttable: IPntTable): IProps {
        const props: IProps = {}
        if (pnttable.table.cmd == PntTable.CMD_power_on) {            
            props.power = pnttable.table.len == 0x0104 ? "up" : "on";
            return props;
        }
        else if (pnttable.table.cmd == PntTable.CMD_power_off){
            props.power = "off";
            return props;
        }
        else if (pnttable.table.cmd == PntTable.CMD_input){
            props.input = PntTable.DATA_input_name(PntTable.DATA_input_PC2TV, pnttable.table.data);
            return props;
        }
        else if (pnttable.table.cmd == PntTable.CMD_mute){
            props.mute = PntTable.DATA_ARRAY_COMP(pnttable.table.data , PntTable.DATA_mute_on) ? "on" : "off";
            return props;
        }
        else if (pnttable.table.cmd == PntTable.CMD_volume){
            props.volume = pnttable.table.data[1]
            return props;
        }
        else if (pnttable.table.cmd == PntTable.CMD_get) {
            if (pnttable.table.data.length >= 7) {
                let idx = 1;
                props.volume = pnttable.table.data[idx++];
                props.input = PntTable.DATA_input_name(PntTable.DATA_input_TV2PC, [pnttable.table.data[idx++], pnttable.table.data[idx++]]);
                props.power = pnttable.table.data[idx++] == 0x00 ? "on" : "off";
                props.signal = !!pnttable.table.data[idx++];
                return props;
            }
        }

        return ;        

    }

}