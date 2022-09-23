import { secureHeapUsed } from "crypto"
import * as iconv from "iconv-lite"

// 控制单元命令字节定义表
export class Desc_DataTable_Control_Cmd {
    static tables = {
        2: "发送数据"
    }
    static get(cmd: number): string {
        let result = this.tables[cmd]
        return result ? result : "其他"
    }
}

// 应用数据单元->类型标志定义表
export class Desc_DataTable_App_Type {
    static tables = {
        2: "上传部件运行状态",
        4: "上传设备操作信息",
        9: "通信线路上行测试"
    }
    static get(cmd: number): string {
        let result = this.tables[cmd]
        return result ? result : "预留"
    }
}

// 应用数据单元->火灾自动报警系统设备类型代码表
export class Desc_DataTable_App_Dev_Type {
    static tables = {
        1: "火灾报警控制器/消防联动控制器",
        2: "消防控制室图形显示装置",
        10: "可燃气体报警控制器",
        11: "电气火灾监控设备",
        20: "消火栓系统",
        21: "自动喷水灭火系统设备、水喷雾灭火系统设备",
        22: "气体灭火控制器",
        23: "泡沫灭火系统设备",
        24: "干粉灭火系统设备",
        25: "防烟排烟系统设备",
        26: "防火门及卷帘系统设备",
        27: "消防应急广播",
        28: "消防电话",
        29: "消防应急照明和疏散指示系统设备",
        30: "消防电源",

    }
    static get(cmd: number): string {
        let result = this.tables[cmd]
        return result ? result : "预留"
    }
}

// 应用数据单元->火灾自动报警系统部件类型代码表
export class Desc_DataTable_App_Unit_Type {
    static tables = {
        0: "预留",
        1: "火灾报警控制器/消防联动控制器",
        2: "消防控制室图形显示装置",
        10: "可燃气体报警控制器",
        11: "电气火灾监控设备",
        20: "消火栓系统",
        21: "自动喷水灭火系统、水喷雾灭火系统",
        22: "气体灭火控制器",
        23: "泡沫灭火系统",
        24: "干粉灭火系统",
        25: "防烟排烟系统",
        26: "防火门及卷帘系统",
        27: "消防应急广播",
        28: "消防电话",
        29: "消防应急照明和疏散指示系统",
        30: "消防电源",       
        46: "可燃气体探测器",
        47: "点型可燃气体探测器",
        48: "独立式可燃气体探测器",
        49: "线型可燃气体探测器",
        52: "电气火灾监控设备",
        53: "剩余电流式电气火灾监控探测器",
        54: "测温式电气火灾监控探测器",
        57: "探测回路",
        58: "火灾显示盘",
        59: "手动火灾报警按钮",
        60: "消火栓按钮",
        61: "火灾探测器",
        66: "感温火灾探测器",
        67: "点型感温火灾探测器",
        68: "点型感温火灾探测器（S 型）",
        69: "点型感温火灾探测器（R 型）",
        70: "线型感温火灾探测器",
        71: "线型感温火灾探测器（S 型）",
        72: "线型感温火灾探测器（R 型）",
        73: "光纤感温火灾探测器",
        76: "感烟火灾探测器",
        77: "点型离子感烟火灾探测器",
        78: "点型光电感烟火灾探测器",
        79: "线型光束感烟火灾探测器",
        80: "吸气式感烟火灾探测器",
        86: "复合式火灾探测器",
        87: "复合式感烟感温火灾探测器",
        88: "复合式感光感温火灾探测器",
        89: "复合式感光感烟火灾探测器",
        96: "火焰探测器",
        97: "紫外火焰探测器",
        98: "红外火焰探测器",
        105: "感光火灾探测器",
        110: "一氧化碳气体探测器",
        114: "图像摄像方式火灾探测器",
        115: "智能图像型火灾探测器",
        116: "预留",
        117: "气体灭火控制器",
        118: "消防电气控制装置",
        119: "预留",
        120: "模块",
        121: "输入模块",
        122: "输出模块",
        123: "输入/输出模块",
        124: "中继模块",
        127: "消防栓泵",
        128: "水喷雾泵",
        129: "细水雾泵",
        130: "稳压泵",
        131: "消防水箱",
        134: "喷淋泵",
        135: "水流指示器",
        136: "信号阀",
        137: "报警阀",
        138: "压力开关",
        139: "预留",
        140: "阀驱动装置",
        141: "防火门",
        142: "防火阀",
        143: "通风空调",
        144: "泡沫液泵",
        145: "管网电磁阀",
        150: "防烟排烟风机",
        151: "预留",
        152: "排烟防火阀",
        153: "常闭送风口",
        154: "排烟口",
        155: "电控挡烟垂壁",
        156: "防火卷帘控制器",
        157: "防火门监控器",
        158: "消防水位控制器",
        159: "预留",
        160: "警报装置",
        161: "声和/或光警报器",
        162: "警铃",
        181: "输出接口",
        182: "多线盘",
        183: "广播盘",
        184: "总线盘",
        185: "回路卡",
        186: "用户自定义",
        187: "用户自定义",
        188: "用户自定义",
        189: "排烟机",
        190: "送风机",
        191: "电梯迫降",
        192: "卷帘半降",
        193: "卷帘全降",
        194: "电磁阀",
        195: "紧急照明",
        196: "喷洒指示",
        197: "照明配电",
        198: "动力配电",
        199: "空压机",
        200: "放气指示灯",
        201: "面板手动(TX3042B)",
        202: "紧急启停按钮(TX3042B)",
        203: "阀门(TX3042B)",
        204: "气体喷洒(TX3042B)",

    }
    static get(cmd: number): string {
        let result = this.tables[cmd]
        return result ? result : "预留"
    }
}

// 应用数据单元->火灾自动报警系统设备状态/部件状态代码表
export class Desc_DataTable_App_Unit_Status {
    static tables = {
        1: "火警（可燃气体、电气火灾报警）",
        2: "低限报警",
        3: "高限报警",
        4: "超量程报警",
        5: "剩余电流报警",
        6: "温度报警",
        7: "电弧报警",
        8: "感烟探测器报警",
        9: "感温探测器报警",
        10: "手动报警按钮报警",
        11: "火焰探测器报警",
        12: "预警",
        20: "故障",
        21: "通讯故障",
        22: "主电故障",
        23: "备电故障",
        24: "回路故障",
        25: "部件故障",
        26: "启动线路故障",
        27: "喷洒线路故障",
        28: "反馈线路故障",
        29: "喷洒反馈线路故障",
        30: "灯具故障",
        31: "自检",
        32: "自检失败",
        33: "通讯失败",
        40: "故障恢复",
        41: "通讯故障恢复",
        42: "主电故障恢复",
        43: "备电故障恢复",
        44: "回路故障恢复",
        45: "部件故障恢复",
        46: "启动线路故障恢复",
        47: "喷洒线路故障恢复",
        48: "反馈线路故障恢复",
        49: "喷洒反馈线路故障恢复",
        50: "灯具故障恢复",
        60: "启动",
        61: "自动启动",
        62: "手动启动",
        63: "气体喷洒",
        64: "现场急启",
        70: "停止",
        71: "自动停止",
        72: "手动停止",
        73: "现场急停",
        80: "反馈",
        81: "喷洒反馈",
        82: "反馈撤销",
        83: "屏蔽",
        84: "屏蔽撤销",
        85: "监管",
        86: "监管撤销",
        90: "引导",
        91: "应急",
        92: "月检",
        93: "年检",
        100: "呼叫",
        101: "通话",
        128: "输出线故障",
        129: "输出线故障恢复",
        130: "输入线故障",
        131: "输入线故障恢复",
        132: "总线短路",
        133: "总线短路恢复",
        134: "新注册",
        135: "声光警报器故障",
        136: "声光警报器故障恢复",
        137: "火警传输设备故障",
        138: "火警传输设备故障恢复",
        139: "延时启动",
    }
    static get(cmd: number): string {
        let result = this.tables[cmd]
        return result ? result : "预留"
    }
}

// 应用数据单元->火灾自动报警系统设备操作/部件操作类型代码表
export class Desc_DataTable_App_Op_Type {
    static tables = {
        0: "无操作",
        1: "复位",
        2: "消音",
        3: "手动报警",
        4: "屏蔽",
        5: "屏蔽解除",
        6: "隔离",
        7: "隔离解除",
        8: "测试",
        9: "巡检",
        10: "确认",
        11: "自检",
        12: "启动",
        13: "延时启动",
    }
    static get(cmd: number): string {
        let result = this.tables[cmd]
        return result ? result : "预留"
    }
}

// 
export interface IDataTable_Control {
    sid: number,
    version: {major?: number, custom?: number}
    time: string
    saddr: number
    daddr: number
    apppos: number
    applen: number    
    cmd: number
    cmd_desc: string
}

export interface IDataTable_App_Info_Op {
    dev_type: number
    dev_type_desc: string
    dev_addr: number
    dev_addr_desc: string
    op_type: number
    op_no: number
    time: string
}

export interface IDataTable_App_Info_Status {
    dev_type: number
    dev_type_desc: string
    dev_addr: number
    dev_addr_desc: string
    unit_type: number
    unit_type_desc: string
    unit_addr: string
    unit_addr_desc: string
    unit_status: number
    unit_mark: string
    time: string
}


export interface IDataTable_App {
    type: number,
    count: number
    desc: string
    infos: (IDataTable_App_Info_Op | IDataTable_App_Info_Status)[]
}

export interface IDataTable {
    start: number
    control: IDataTable_Control
    app: IDataTable_App
    checksum: number
    end: number
}

export interface IEncoder {
    encode(data: Buffer): IDataTable;
}

export class DataTable_Control implements IDataTable_Control {
    sid: number 
    version: {} 
    time: string 
    saddr: number
    daddr: number
    apppos: number
    applen: number
    cmd: number
    cmd_desc: string    
}


export class DataTable_App implements IDataTable_App {
    type: number
    count: number
    desc: string
    infos: (IDataTable_App_Info_Op | IDataTable_App_Info_Status)[] = []
}
export class DataTable_App_Info_Status implements IDataTable_App_Info_Status {
    dev_type: number
    dev_type_desc: string
    dev_addr: number
    dev_addr_desc: string
    unit_type: number
    unit_type_desc: string
    unit_addr: string
    unit_addr_desc: string
    unit_status: number
    unit_status_desc: string
    unit_mark: string
    time: string    
}
export class DataTable_App_Info_Op implements IDataTable_App_Info_Op {
    dev_type: number
    dev_type_desc: string
    dev_addr: number
    dev_addr_desc: string
    op_type: number
    op_type_desc: string
    op_no: number
    time: string 
}

export class DataTable implements IDataTable {
    start: number
    control: IDataTable_Control
    app: IDataTable_App
    checksum: number
    end: number
    constructor() {
        this.start = 0x4040;
        this.end = 0x2323;
        this.control = new DataTable_Control();      
        this.app = new DataTable_App();  
    }
    
    destroy() {

    }
    
    static encode(): Buffer {
        throw new Error("Method not implemented.")
    }

    static decode(data: Buffer): IDataTable[] {
        let result: IDataTable[] = [];
        let idx = 0;
        let length = data.length;
        while (length - idx >= 30) {
            let table = new DataTable();    
            if (data[idx++] + (data[idx++] << 8) != table.start) continue;
    
            table.control.sid = data[idx++] + (data[idx++] << 8);
            table.control.version = {major: data[idx++], custom: data[idx++]}
            table.control.time = data[idx++] + "-" + data[idx++] + "-" + data[idx++] + "-" + data[idx++] + "-" + data[idx++] + "-" + data[idx++];
            table.control.saddr = data[idx++] + (data[idx++] << 8) + (data[idx++] << 16) + (data[idx++] << 24) + (data[idx++] << 32) + (data[idx++] << 40);
            table.control.daddr = data[idx++] + (data[idx++] << 8) + (data[idx++] << 16) + (data[idx++] << 24) + (data[idx++] << 32) + (data[idx++] << 40);
            table.control.applen =  data[idx++] + (data[idx++] << 8);            
            table.control.cmd = data[idx++];
            table.control.cmd_desc = Desc_DataTable_Control_Cmd.get(table.control.cmd);            
            table.control.apppos =  idx;
            idx = idx + table.control.applen;            
            table.checksum = data[idx++]
            this.decode_app(data, table);

            if (data[idx++] + (data[idx++] << 8) != table.end) continue;
            result.push(table)    
        }
        console.log(result);

        return result;
    }

    static decode_app(data: Buffer, table: IDataTable) {
        switch(table.control.cmd){
            case 2: // 发送火灾自动报警系统火灾报警、运行状态等信息
                this.decode_app_cmd_2(data, table);
                break;
            case 3:
                this.decode_app_cmd_3(data, table);
                break;

        }
    }

    static decode_app_cmd_2(data: Buffer, table: IDataTable) {
        let idx = table.control.apppos;
        table.app.type = data[idx++];
        table.app.desc = Desc_DataTable_App_Type.get(table.app.type);
        table.app.count = data[idx++];
        if (table.app.count > 0) {
            switch(table.app.type) {
                case 2: // "上传部件运行状态",
                    return this.decode_app_type_2(data, table);
                    break;
                case 4: // "上传设备操作信息",
                    return this.decode_app_type_4(data, table);
                    break;
                case 9: // "通信线路上行测试"
                    return this.decode_app_type_9(data, table);
                    break;
            }
        }        
    }    
   
    static decode_app_cmd_3(data: Buffer, table: IDataTable) {
     
    }  
    // "上传部件运行状态",
    static decode_app_type_2(data: Buffer, table: IDataTable) {
        let idx = table.control.apppos + 2;
        let info = new DataTable_App_Info_Status();
        info.dev_type = data[idx++];        
        info.dev_type_desc = Desc_DataTable_App_Dev_Type.get(info.dev_type);
        info.dev_addr =  data[idx++];        
        info.unit_type = data[idx++];
        info.unit_type_desc = Desc_DataTable_App_Unit_Type.get(info.unit_type);
        info.unit_addr = ""
        for (let j = 0; j < 8; j++) {
            info.unit_addr = info.unit_addr + String.fromCharCode(data[idx++]);
        }
        info.unit_status = data[idx++];
        info.unit_status_desc = Desc_DataTable_App_Unit_Status.get(info.unit_status);
        
        info.unit_mark = "";
        let unit_mark = [];
        for (let j = 0; j < 32; j++) {
            let d = data[idx++];
            if (d > 0)
                unit_mark.push(d);
        }        
        info.unit_mark = iconv.decode(Buffer.from(unit_mark), "GB18030")
        let sec = data[idx++], min = data[idx++], hour = data[idx++], day = data[idx++], month = data[idx++], year = 2000 + data[idx++];
        info.time = year + "-" + month + "-" +day + " " + hour + ":" + min + ":" +sec;  
        
        table.app.infos.push(info);
        console.dir(info)
        
    }           
 
    // "上传设备操作信息",
    static decode_app_type_4(data: Buffer, table: IDataTable) {
        let idx = table.control.apppos + 2;
        let info = new DataTable_App_Info_Op();
        info.dev_type = data[idx++];        
        info.dev_type_desc = Desc_DataTable_App_Dev_Type.get(info.dev_type);
        info.dev_addr =  data[idx++];        
        info.op_type = data[idx++];
        info.op_type_desc = Desc_DataTable_App_Op_Type.get(info.op_type);
        info.op_no =  data[idx++];
        let sec = data[idx++], min = data[idx++], hour = data[idx++], day = data[idx++], month = data[idx++], year = data[idx++];
        info.time = year + "-" + month + "-" +day + " " + hour + ":" + min + ":" +sec;        
        table.app.infos.push(info);
        // console.dir(info)
    }   

    // "通信线路上行测试"
    static decode_app_type_9(data: Buffer, table: IDataTable) {
        let idx = table.control.apppos + 2;
        
    }           
}

