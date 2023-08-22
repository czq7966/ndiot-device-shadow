// {
//     "avatar": "http://116.205.178.152:28080/resource/img/app/robotqingjie.png",
//     "type": "清洁机器人",
//     "hardware": {
//         "model": "C44P2DV2",
//         "size": "503mm(L)x503mm(W)x629mm(H)",
//         "weight": "40KG",
//         "worktemp": "0°C~40°C",
//         "protect": "IP33",
//         "power": "240W",
//         "battery": "25.6V 36Ah",
//         "charge": "直充(3h充满)"
//     },
//     "software": {
//         "id": "035d02acabe467785967e01747caca90",
//         "sn": "202237CNY002D0013",
//         "name": "亚太1/2/3楼洗地机",
//         "protversion": "",
//         "autoversion": null,
//         "backendversion": null,
//         "frontendversion": null
//     }
// }

export interface IABDeviceModelHardware {
    model?: string,
    size?: string,
    weight?: string,
    worktemp?: string,
    protect?: string,
    power?: string,
    battery?: string,
    charge?: string,    
}

export interface IABDeviceModelSoftware {
    id?: string,
    sn?: string,
    name?: string,
    worktemp?: string,
    protversion?: string,
    autoversion?: string,
    backendversion?: string,
    frontendversion?: string,    
}

export interface IABDeviceModel {
    avatar?: string,
    type?: string,
    hardware?: IABDeviceModelHardware,
    software?: IABDeviceModelSoftware,
}
