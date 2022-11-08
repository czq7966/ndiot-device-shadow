export interface IProps{
    input?: string
    power?: "on" | "off" | "up",
    mute?: "on" | "off",
    volume?: number
    signal?: boolean
}

export class Props implements IProps {
    
}