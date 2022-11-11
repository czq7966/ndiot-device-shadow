import { IPntTable, PntTable } from "./pnt-table"
import { IProps, Props } from "./props"

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
            pnttable.table.Mode = PntTable.ModeAuto;
        else if (props.mode == "cool")
            pnttable.table.Mode = PntTable.ModeCool;
        else if (props.mode == "dry")
            pnttable.table.Mode = PntTable.ModeDry;
        else if (props.mode == "fan")
            pnttable.table.Mode = PntTable.ModeFan;
        else if (props.mode == "heat")
            pnttable.table.Mode = PntTable.ModeHeat;

        // Power
        if (props.power == "on")
            pnttable.table.Power = PntTable.PowerOn;
        else if (props.power == "off")
            pnttable.table.Power = PntTable.PowerOff;

        // Temp
        if (props.temperature)
            pnttable.setTemp(props.temperature);

        //Mode
        if (props.fanSpeed == "auto")
            pnttable.table.Fan = PntTable.FanAuto;
        else if (props.fanSpeed == "low")
            pnttable.table.Fan = PntTable.FanMin;
        else if (props.fanSpeed == "medium")
            pnttable.table.Fan = PntTable.FanMed;
        else if (props.fanSpeed == "high")
            pnttable.table.Fan = PntTable.FanMax;
            
         // Light
        if (props.light == "on")
            pnttable.table.Light = PntTable.LightOn;
        else if (props.light == "off")
            pnttable.table.Light = PntTable.LightOff;
         
          // Wifi
        if (props.wifi == "on")
            pnttable.table.WiFi = PntTable.WifiOn;
        else if (props.wifi == "off")
            pnttable.table.WiFi = PntTable.WifiOff;

        return pnttable;
    }

    decode(pnttable: IPntTable, props?: IProps): IProps {
        if (!props) 
            props = this.props;

        //Mode
        if (pnttable.table.Mode == PntTable.ModeAuto)
            props.mode = "auto";
        else if (pnttable.table.Mode == PntTable.ModeCool)
            props.mode = "cool";
        else if (pnttable.table.Mode == PntTable.ModeDry)
            props.mode = "dry";
        else if (pnttable.table.Mode == PntTable.ModeFan)
            props.mode = "fan";
        else if (pnttable.table.Mode == PntTable.ModeHeat)
            props.mode = "heat";

        // Power
        if (pnttable.table.Power == PntTable.PowerOn)
            props.power = "on";
        else if (pnttable.table.Power == PntTable.PowerOff)
            props.power = "off";

        // Temp
        props.temperature = pnttable.getTemp();

        //Mode
        if (pnttable.table.Fan == PntTable.FanAuto)
            props.fanSpeed = "auto";
        else if (pnttable.table.Fan == PntTable.FanMin)
            props.fanSpeed = "low";
        else if (pnttable.table.Fan == PntTable.FanMed)
            props.fanSpeed = "medium";
        else 
            props.fanSpeed = "high";
 
         // Light
        if (pnttable.table.Light == PntTable.LightOn)
            props.light = "on";
        else if (pnttable.table.Light == PntTable.LightOff)
            props.light = "off";
        
        // Wifi
        if (pnttable.table.WiFi == PntTable.WifiOn)
            props.wifi = "on";
        else if (pnttable.table.WiFi == PntTable.WifiOff)
            props.wifi = "off";


        return props; 
    }

}