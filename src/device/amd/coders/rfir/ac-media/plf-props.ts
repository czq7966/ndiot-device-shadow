import { IPntTable, PntTable } from "./pnt-table"
import { IProps, Props } from "./props"
import { TableConst } from "./table"

export interface IPlfProps  {
    props: IProps
    encode(props?: IProps, pnttable?: IPntTable): IPntTable
    decode(pnttable: IPntTable, props?: IProps): IProps
}



export class PlfProps implements IPlfProps {
    props: IProps = new Props();

    encode(props?: IProps, pnttable?: IPntTable): IPntTable {
        Object.assign(this.props, props);
        props = this.props;
        
        if (!pnttable) {
            pnttable = new PntTable();
            pnttable.reset();
        }
        //Mode
        if (props.mode == "auto")
            pnttable.table.Mode = TableConst.ModeAuto;
        else if (props.mode == "cool")
            pnttable.table.Mode = TableConst.ModeCool;
        else if (props.mode == "dry")
            pnttable.table.Mode = TableConst.ModeDry;
        else if (props.mode == "fan")
            pnttable.table.Mode = TableConst.ModeFan;
        else if (props.mode == "heat")
            pnttable.table.Mode = TableConst.ModeHeat;

        // Power
        if (props.power == "on")
            pnttable.table.Power = TableConst.PowerOn;
        else if (props.power == "off")
            pnttable.table.Power = TableConst.PowerOff;

        // Temp
        if (props.temperature)
            pnttable.setTemp(props.temperature);

        //Mode
        if (props.fanSpeed == "auto")
            pnttable.table.Fan = TableConst.FanAuto;
        else if (props.fanSpeed == "low")
            pnttable.table.Fan = TableConst.FanMin;
        else if (props.fanSpeed == "medium")
            pnttable.table.Fan = TableConst.FanMed;
        else if (props.fanSpeed == "high")
            pnttable.table.Fan = TableConst.FanMax;
            

        return pnttable;
    }

    decode(pnttable: IPntTable, props?: IProps): IProps {
        if (!props) 
            props = this.props;

        //Mode
        if (pnttable.table.Mode == TableConst.ModeAuto)
            props.mode = "auto";
        else if (pnttable.table.Mode == TableConst.ModeCool)
            props.mode = "cool";
        else if (pnttable.table.Mode == TableConst.ModeDry)
            props.mode = "dry";
        else if (pnttable.table.Mode == TableConst.ModeFan)
            props.mode = "fan";
        else if (pnttable.table.Mode == TableConst.ModeHeat)
            props.mode = "heat";

        // Power
        if (pnttable.table.Power == TableConst.PowerOn)
            props.power = "on";
        else if (pnttable.table.Power == TableConst.PowerOff)
            props.power = "off";

        // Temp
        props.temperature = pnttable.getTemp();

        //Mode
        if (pnttable.table.Fan == TableConst.FanAuto)
            props.fanSpeed = "auto";
        else if (pnttable.table.Fan == TableConst.FanMin)
            props.fanSpeed = "low";
        else if (pnttable.table.Fan == TableConst.FanMed)
            props.fanSpeed = "medium";
        else 
            props.fanSpeed = "high";
 
        return props; 
    }

}