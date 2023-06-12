import { IPntTable, PntTable } from "./pnt-table"
import { IProps, Props } from "./props"
import { Table, TableConst } from "./table"

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
            
        /// 不同模式的特殊处理

        // 送风时温度为：0b1110
        if (props.mode == "fan")
            pnttable.setTemp(TableConst.TempNone);
        else if (pnttable.getTemp() == TableConst.TempNone) {
            pnttable.setTemp(TableConst.TempDef);
        } 
        // 除湿、自动模式下，风速为固定风
        if (props.mode == "dry" || props.mode == "auto") {
            pnttable.table.Fan = TableConst.FanFixed;                 
        }      

        return pnttable;
    }

    decode(pnttable: IPntTable, props?: IProps): IProps {
        if (!props) 
            props = this.props;

        // Power
        if (pnttable.table.Power == TableConst.PowerOn)
            props.power = "on";
        else if (pnttable.table.Power == TableConst.PowerOff) {
            props.power = "off";
            return props;
        }

        //Mode
        if (pnttable.table.Mode == TableConst.ModeAuto)
            props.mode = "auto";
        else if (pnttable.table.Mode == TableConst.ModeCool)
            props.mode = "cool";
        else if (pnttable.table.Mode == TableConst.ModeFan && pnttable.table.Temp == TableConst.TempNone)
            props.mode = "fan";
        else if (pnttable.table.Mode == TableConst.ModeDry)
            props.mode = "dry";
        else if (pnttable.table.Mode == TableConst.ModeHeat)
            props.mode = "heat";

        // Temp
        props.temperature = pnttable.getTemp();
        if (props.mode == "fan")
            delete props.temperature;

        //Mode
        if (pnttable.table.Fan == TableConst.FanMax)
            props.fanSpeed = "high";
        else if (pnttable.table.Fan == TableConst.FanMin)
            props.fanSpeed = "low";
        else if (pnttable.table.Fan == TableConst.FanMed)
            props.fanSpeed = "medium";
        else 
            props.fanSpeed = "auto";
        return props; 
    }

}