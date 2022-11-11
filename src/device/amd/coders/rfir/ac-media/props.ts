export interface IProps{    
    mode?: "auto" | "cool" | "heat" | "fan"  | "dry",
    power?: "on" | "off",
    running?: "on" | "off" ,
    temperature?: number,
    fanSpeed?: "auto" | "low" | "medium" | "high"
    light?: "on" | "off"
    wifi?: "on" | "off"
}

export class Props implements IProps {
    
}