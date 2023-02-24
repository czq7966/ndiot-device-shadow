这是振华大厦消防系统485网关，单向接收上行数据，不下行（因为设备协议不支持）
此网关的子设备，即部件，以下简称部件
部件入网时，disable属性需为1，表示部件不激活，因为有约2000个，太多，怕系统性能撑不住，且所有部件物模型均一样。
部件物模型：
{
    dev_type: number        //设备类型编码
    dev_type_desc: string   //设备类型描述
    dev_addr: number        //设备地址编码
    dev_addr_desc: string   //设备地址描述
    unit_type: number       //部件类型编码
    unit_type_desc: string  //部件类型描述
    unit_addr: string       //部件地址ID
    unit_addr_desc: string  //部件地址描述
    unit_status: number     //部件状态编码
    unit_status_desc: string//部件状态描述
    unit_mark: string       //部件上报信息描述
    time: string            //上报时间
}

网关物模型：因网关接收的数据结构比较复杂，平台层物模型不便定义，所以只定义一个属性，包含所有解析后的所有数据
{
    data: object
}