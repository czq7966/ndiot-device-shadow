import { secureHeapUsed } from "crypto"
import * as iconv from "iconv-lite"

// 控制单元命令字节定义表
export class Desc_DataTable_Control_Cmd {
    static tables = {
        2: "发送数据"
    }
    static get(cmd: number): string {
        const result = this.tables[cmd]
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
        const result = this.tables[cmd]
        return result ? result : "预留"
    }
}

// 应用数据单元->火灾自动报警系统设备类型代码表
export class Desc_DataTable_App_Dev_Type {
    static tables = {
        1: "火灾报警控制器",
        2: "消防控制室图形显示装置",
        10: "可燃气体报警控制器",
        11: "电气火灾监控设备",
        12: "消火栓系统",
        13: "自动喷水灭火系统/水喷雾灭火系统",
        20: "气体灭火控制器",
        21: "泡沫灭火系统",
        22: "干粉灭火系统",
        23: "防烟排烟系统",
        24: "防火卷帘控制器",
        25: "防火门监控器",
        26: "消防水位控制器",
        27: "消防应急广播",
        28: "消防电话",
        29: "消防应急照明疏散系统",
        30: "消防电源",
        31: "消防设备电源监控器",
        32: "消防电气控制装置",
        33: "防火卷帘控制器",
        34: "防火门监控器",
        35: "消防水位控制器",
        46: "可燃气体探测器",
        47: "点型可燃气体探测器",
        48: "独立可燃气体探测器",
        49: "线型可燃气体探测器",
        51: "消防电话分机",
        52: "消防电话插孔",
        53: "剩余电流式电气火灾监控探测器",
        54: "测温式电气火灾监控探测器",
        55: "故障电弧",
        56: "电流监控探测器",
        57: "探测回路",
        58: "火灾显示盘",
        59: "手动火灾报警按钮",
        60: "消火栓按钮",
        61: "火灾探测器",
        66: "感温探测器",
        67: "点型感温火灾探测器",
        68: "点型感温探测器S型",
        69: "点型感温探测器R型",
        70: "线型感温探测器",
        71: "线型感温探测器S型",
        72: "线型感温探测器R型",
        73: "光纤感温探测器",
        76: "感烟探测器",
        77: "点型离子感烟探测器",
        78: "点型光电感烟火灾探测器",
        79: "线型光束感烟探测器",
        80: "吸气感烟探测器",
        86: "复合式探测器",
        87: "复合式感烟感温火灾探测器",
        88: "复合式感光感温探测器",
        89: "复合式感光感烟探测器",
        96: "火焰探测器",
        97: "紫外火焰探测器",
        98: "红外火焰探测器",
        105: "感光火灾探测器",
        107: "防火门门磁开关",
        108: "常开门监控模块",
        109: "常闭门监控模块",
        110: "一氧化碳气体探测器",
        111: "甲烷气体探测器",
        112: "丙烷气体探测器",
        113: "组合式电气火灾监控探测器",
        114: "图像摄像式火灾探测器",
        115: "智能图像式火灾探测器",
        120: "模块",
        121: "输入模块",
        122: "输出模块",
        123: "输入输出模块",
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
        140: "阀驱动装置",
        141: "防火门",
        142: "防火阀",
        143: "通风空调",
        144: "泡沫液泵",
        145: "管网电磁阀",
        150: "防烟排烟风机",
        152: "排烟防火阀",
        153: "常闭送风口",
        154: "排烟口",
        155: "电控挡烟垂壁",
        160: "警报装置",
        161: "声光警报器",
        162: "火警警铃",
        163: "电动闭门器",
        164: "雨淋泵",
        165: "消防水炮",
        166: "电动门",
        167: "70度防火阀",
        168: "280度防火阀",
        177: "电磁释放器",
        181: "输出接口",
        182: "多线盘",
        183: "广播盘",
        184: "总线盘",
        185: "回路卡",
        186: "传输模块",
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
        200: "气体释放警报器",
        201: "应急照明控制器",
        202: "应急照明分配电装置",
        204: "配电箱",
        205: "集中电源",
        209: "左向疏散标志",
        210: "右向疏散标志",
        211: "单向地埋标志",
        212: "双向地埋标志",
        213: "三向地埋标志",
        214: "四向地埋标志",
        215: "双向疏散标志",
        216: "楼层显示标志",
        217: "安全出口标志",
        218: "应急照明灯具",
        219: "应急照明筒灯",
        220: "自带电源左向疏散标志",
        221: "自带电源右向疏散标志",
        222: "自带电源单向地埋标志",
        223: "自带电源双向地埋标志",
        224: "自带电源三向地埋标志",
        225: "自带电源四向地埋标志",
        226: "自带电源双向疏散标志",
        227: "自带电源楼层标志灯",
        228: "自带电源安全出口灯",
        229: "自带电源应急照明灯",
        230: "蓄电池",
        231: "自带电源应急照明筒灯",
        232: "感应开关",
        236: "直流电压传感器",
        237: "直流电压电流传感器",
        238: "交流单相电压传感器",
        239: "交流单相电压电流传感器",
        240: "交流单相双路电压传感器",
        241: "面板手动",
        242: "紧急启停按钮",
        243: "阀门",
        244: "气体喷洒",
        246: "三相三线电压传感器",
        247: "三相四线电压传感器",
        248: "三相三线电压电流传感器",
        249: "三相四线电压电流传感器",
        250: "三相三线双路电压传感器",
        251: "三相四线双路电压传感器",
        252: "交流单相六路电压传感器",
        253: "交流单相双路电压电流传感器",
        254: "三相四线双路电压电流传感器",       

    }
    static get(cmd: number): string {
        const result = this.tables[cmd]
        return result ? result : "预留"
    }
}

// 应用数据单元->火灾自动报警系统部件类型代码表
export class Desc_DataTable_App_Unit_Type extends Desc_DataTable_App_Dev_Type{}

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
        const result = this.tables[cmd]
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
        const result = this.tables[cmd]
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
        return;
    }
    
    static encode(): Buffer {
        throw new Error("Method not implemented.")
    }

    static decode(data: Buffer): IDataTable[] {
        const result: IDataTable[] = [];
        let idx = 0;
        const length = data.length;
        while (length - idx >= 30) {
            const table = new DataTable();    
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
        return;     
    }  
    // "上传部件运行状态",
    static decode_app_type_2(data: Buffer, table: IDataTable) {
        let idx = table.control.apppos + 2;
        const info = new DataTable_App_Info_Status();
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
        const unit_mark = [];
        for (let j = 0; j < 32; j++) {
            const d = data[idx++];
            if (d > 0)
                unit_mark.push(d);
        }        
        info.unit_mark = iconv.decode(Buffer.from(unit_mark), "GB18030")
        const sec = data[idx++], min = data[idx++], hour = data[idx++], day = data[idx++], month = data[idx++], year = 2000 + data[idx++];
        info.time = year + "-" + month + "-" +day + " " + hour + ":" + min + ":" +sec;  
        
        table.app.infos.push(info);
        console.dir(info)
        
    }           
 
    // "上传设备操作信息",
    static decode_app_type_4(data: Buffer, table: IDataTable) {
        let idx = table.control.apppos + 2;
        const info = new DataTable_App_Info_Op();
        info.dev_type = data[idx++];        
        info.dev_type_desc = Desc_DataTable_App_Dev_Type.get(info.dev_type);
        info.dev_addr =  data[idx++];        
        info.op_type = data[idx++];
        info.op_type_desc = Desc_DataTable_App_Op_Type.get(info.op_type);
        info.op_no =  data[idx++];
        const sec = data[idx++], min = data[idx++], hour = data[idx++], day = data[idx++], month = data[idx++], year = data[idx++];
        info.time = year + "-" + month + "-" +day + " " + hour + ":" + min + ":" +sec;        
        table.app.infos.push(info);
        // console.dir(info)
    }   

    // "通信线路上行测试"
    static decode_app_type_9(data: Buffer, table: IDataTable) {
        const idx = table.control.apppos + 2;
        
    }           
}

