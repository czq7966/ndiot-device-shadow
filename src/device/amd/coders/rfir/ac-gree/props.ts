export interface IProps{    
    mode?: "auto" | "cool" | "heat" | "fan"  | "dry",
    power?: "on" | "off",
    running?: "on" | "off" ,
    temperature?: number,
    fanSpeed?: "auto" | "low" | "medium" | "high"
}

export class Props implements IProps {
    
}