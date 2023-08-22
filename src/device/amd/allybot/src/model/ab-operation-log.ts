// {
//     "type": 2,
//     "msg": "请检查清水箱是否正确安装", //报警信息
//     "id": "be127d370040f8398faa6bcc28c77c9f", //信息ID
//     "timestamp": "1684166074", //时间戳
//     "icon": "warnmsgicon2.png" //图标http链接
// }

export interface IABOperationLog {
    type?: number,
    msg?: string,
    id?: string,
    timestamp?: number,
    icon?: string,
}

