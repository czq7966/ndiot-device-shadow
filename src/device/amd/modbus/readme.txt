Modbus网关设备ID：
一、网关设备ID = 模块ID
二、内机设备ID = 模块ID_设备地址


PLC点表配置： 名称 = 地址
1、 先配置PLC地址基数：如：100000，默认：10000    
    this.tables.plcbase = 100000; 

    PLC地址从1开始，实际地址为0
    PLC地址小于基数，表示线圈，大于基数，表示寄存器


2、点表PLC配置：如
    this.tables.names = {
        power: regPlcbase + 40078,
        mode: regPlcbase + 40079,
        fanSpeed: regPlcbase + 40080,
        temperature: regPlcbase + 40082
    }
    this.tables.initAddressFromNames();
    
二、查询：
查询JSON输入：
{
    hd:{
        entry:{
            id: "get"
        }
    },
    pld:{   
        power: ""
        ...
    }

}

查询JSON输出：
{
    hd:{
        entry:{
            id: "get"
        },
        sid: "...",
        stp: 1
    },
    pld:{   
        power: ... ; //为null时代表查询出错
        ...
    }

}

三、设置
设置JSON输入：
{
    hd:{
        entry:{
            id: "set"
        }
    },
    pld:{   
        power: "on"
        ...
    }
}

设置JSON输出：
{
    hd:{
        entry:{
            id: "set"
        },
        sid: "...",
        stp: 1
    },
    pld:{   
        power: 0; //为0时，表示成功，其它为错误码
        ...
    }
}
